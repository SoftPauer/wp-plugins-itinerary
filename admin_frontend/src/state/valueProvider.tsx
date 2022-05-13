import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { IField, Value } from "../api/api";
import { FieldTypes } from "../fieldTypes";
import { getJsonKeyFromField, LooseObject } from "../utils";
import { getFieldByIdFromFields, useFieldContext } from "./fieldProvider";
import { useItineraryContext } from "./itineraryProvider";
import { useSectionContext } from "./sectionProvider";

interface IValueContext {
  values: any;
  copyValuesFromLastItin: (section: number) => void;
  fetchData: () => void;
  updateValues: (value: IUpdateValue) => void;
  getValue: (field: IField, index?: string) => any;
  getListFieldLength: (field: IField, index?: string) => number;
  deleteItem: (field: IField, index?: string) => void;
}
interface IUpdateValue {
  field: IField;
  value: string;
  index?: string;
}

const ValueContext = createContext<IValueContext>({
  getListFieldLength: (field: IField, index) => 0,
  updateValues: (value: IUpdateValue) => {},
  values: {},
  copyValuesFromLastItin: (section) => {},
  fetchData: () => {},
  getValue: (field, index) => {},
  deleteItem: (field, index) => {},
});

export const ValueProvider = (props: { children: React.ReactNode }) => {
  const [values, setValues] = useState<LooseObject>({});

  const sectionContext = useSectionContext();
  const itineraryContext = useItineraryContext();
  const fieldContext = useFieldContext();
  const fetchData = useCallback(async () => {
    if (sectionContext.selectedSection && itineraryContext.selected.id !== -1) {
      const values = await Value.getValues(
        sectionContext.selectedSection.id,
        itineraryContext.selected.id
      );
      setValues(JSON.parse(values?.value ?? "{}"));
    }
  }, [itineraryContext.selected.id, sectionContext.selectedSection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyValuesFromLastItin = (section: number) => {
    Value.copyLastItin(itineraryContext.selected.id, section).then((res) => {
      fetchData();
    });
  };

  const deleteItemFromList = async (field: IField, index?: string) => {
    const key = getJsonKeyFromField(field);
    const indexes = index?.split(".").slice(1) ?? [];
    let newValue: LooseObject = values;
    if (field.parent === null) {
      newValue[key].splice(indexes[0], 1);
    } else {
      let parent = fieldContext.getFieldById(field.parent);
      //this holds list of parent keys
      let parentKeysFields = [];
      while (parent) {
        if (parent) {
          parentKeysFields.push(parent);
          parent = fieldContext.getFieldById(parent.parent);
        }
      }
      parentKeysFields = parentKeysFields.reverse();
      parentKeysFields.push(field);
      newValue = deleteItemRecursive(
        parentKeysFields,
        0,
        newValue,
        indexes,
        key
      );
    }
    if (sectionContext.selectedSection) {
      await Value.createValueOrUpdate({
        itinerary: itineraryContext.selected.id,
        section: sectionContext.selectedSection.id,
        value: newValue,
      });
    }
    setValues(newValue);
  };

  const updateValues = async (value: IUpdateValue) => {
    const key = getJsonKeyFromField(value.field);
    let newValue: LooseObject = values;
    if (value.field.parent === null) {
      // top level field just update the value
      let finalValue;
      try {
        finalValue = JSON.parse(value.value);
      } catch (error) {
        finalValue = value.value;
      }
      newValue = { ...values, [key]: finalValue };
    } else {
      // find parent
      let parent = fieldContext.getFieldById(value.field.parent);
      //this holds list of parent keys
      let parentKeysFields = [];
      while (parent) {
        if (parent) {
          parentKeysFields.push(parent);
          parent = fieldContext.getFieldById(parent.parent);
        }
      }
      parentKeysFields = parentKeysFields.reverse();
      //indexes for the list elements
      const indexes = value.index?.split(".").slice(1) ?? [];
      newValue = addMissingPropIfNotExist(parentKeysFields[0], newValue);
      newValue = assignValueRecursive(
        parentKeysFields,
        0,
        newValue,
        indexes,
        key,
        value.value
      );
    }

    if (sectionContext.selectedSection) {
      await Value.createValueOrUpdate({
        itinerary: itineraryContext.selected.id,
        section: sectionContext.selectedSection.id,
        value: newValue,
      });
    }
    setValues(newValue);
  };

  const assignValueRecursive = (
    parentKeysFields: IField[],
    i: number,
    newValue: LooseObject,
    indexes: string[],
    key: string,
    value: string
  ) => {
    if (parentKeysFields[i].field_type === FieldTypes.group) {
      // if group, we need to add the missing prop if we don't have it
      if (i !== parentKeysFields.length - 1) {
        //this will add a missing prop if it doesn't exist
        newValue[getJsonKeyFromField(parentKeysFields[i])] =
          addMissingPropIfNotExist(
            parentKeysFields[i + 1],
            newValue[getJsonKeyFromField(parentKeysFields[i])]
          );
        //recursively call the function
        newValue[getJsonKeyFromField(parentKeysFields[i])] =
          assignValueRecursive(
            parentKeysFields,
            i + 1,
            newValue[getJsonKeyFromField(parentKeysFields[i])],
            indexes,
            key,
            value
          );
      } else {
        // we are at the last field, so we just assign the value
        let finalValue;
        // parse the value to make sure it is a valid json if fails it means it is a string
        try {
          finalValue = JSON.parse(value);
        } catch (error) {
          finalValue = value;
        }

        newValue[getJsonKeyFromField(parentKeysFields[i])] = {
          ...newValue[getJsonKeyFromField(parentKeysFields[i])],
          [key]: finalValue,
        };
      }
    }
    if (parentKeysFields[i].field_type === FieldTypes.list) {
      console.log(newValue[getJsonKeyFromField(parentKeysFields[i])]);
      if (
        typeof newValue[getJsonKeyFromField(parentKeysFields[i])] === "string"
      )
        newValue[getJsonKeyFromField(parentKeysFields[i])] = JSON.parse(
          newValue[getJsonKeyFromField(parentKeysFields[i])]
        );

      if (i !== parentKeysFields.length - 1) {
        newValue[getJsonKeyFromField(parentKeysFields[i])][indexes[i]] =
          assignValueRecursive(
            parentKeysFields,
            i + 1,
            newValue[getJsonKeyFromField(parentKeysFields[i])][indexes[i]],
            indexes,
            key,
            value
          );
      } else {
        let finalValue;
        try {
          finalValue = JSON.parse(value);
        } catch (error) {
          finalValue = value;
        }

        newValue[getJsonKeyFromField(parentKeysFields[i])][indexes[i]] = {
          ...newValue[getJsonKeyFromField(parentKeysFields[i])][indexes[i]],
          [key]: finalValue,
        };
      }
    }
    console.log(newValue);

    return newValue;
  };
  const deleteItemRecursive = (
    parentKeysFields: IField[],
    i: number,
    newValue: LooseObject,
    indexes: string[],
    key: string
  ) => {
    if (parentKeysFields[i].field_type === FieldTypes.group) {
      if (i !== parentKeysFields.length - 1) {
        newValue[getJsonKeyFromField(parentKeysFields[i])] =
          deleteItemRecursive(
            parentKeysFields,
            i + 1,
            newValue[getJsonKeyFromField(parentKeysFields[i])],
            indexes,
            key
          );
      }
    }
    if (parentKeysFields[i].field_type === FieldTypes.list) {
      console.log(newValue[getJsonKeyFromField(parentKeysFields[i])]);
      if (
        typeof newValue[getJsonKeyFromField(parentKeysFields[i])] === "string"
      )
        newValue[getJsonKeyFromField(parentKeysFields[i])] = JSON.parse(
          newValue[getJsonKeyFromField(parentKeysFields[i])]
        );

      if (i !== parentKeysFields.length - 1) {
        newValue[getJsonKeyFromField(parentKeysFields[i])][indexes[i]] =
          deleteItemRecursive(
            parentKeysFields,
            i + 1,
            newValue[getJsonKeyFromField(parentKeysFields[i])][indexes[i]],
            indexes,
            key
          );
      } else {
        newValue[getJsonKeyFromField(parentKeysFields[i])].splice(
          indexes[i],
          1
        );
      }
    }
    return newValue;
  };

  const addMissingPropIfNotExist = (field: IField, value: LooseObject) => {
    const key = getJsonKeyFromField(field);

    if (!value.hasOwnProperty(getJsonKeyFromField(field))) {
      if (field.field_type === FieldTypes.group) {
        value = { ...values, [key]: {} };
        return value;
      }
      if (field.field_type === FieldTypes.list) {
        value = { ...values, [key]: [] };
        return value;
      }
    }
    return value;
  };

  const getValue = (field: IField, index?: string) => {
    if (sectionContext.selectedSection === undefined) {
      return "";
    }

    const key = getJsonKeyFromField(field);

    if (field.parent === null) {
      if (values.hasOwnProperty(key)) return values[key];
      return "";
    }
    let parent = fieldContext.getFieldById(field.parent);
    const parentKeys = [];
    while (parent) {
      if (parent) {
        const key = getJsonKeyFromField(parent);
        parentKeys.push(key);
        parent = fieldContext.getFieldById(parent.parent);
      }
    }
    const indexes = index?.split(".").slice(1) ?? [];
    let value = values;

    parentKeys.reverse().forEach((key, i) => {
      if (value?.hasOwnProperty(key)) {
        if (Array.isArray(value[key])) {
          value = value[key][indexes[i]];
        } else {
          value = value[key];
        }
      }
    });

    if (value?.hasOwnProperty(key)) return value[key];
    return "";
  };

  const getListFieldLength = (field: IField, index?: string) => {
    const key = getJsonKeyFromField(field);

    if (field.parent === null) {
      if (values?.hasOwnProperty(key)) {
        try {
          console.log(typeof values[key]);
          if (typeof values[key] === "string") {
            const value = JSON.parse(values[key]);
            return value.length;
          }
          return values[key].length;
        } catch (error) {
          console.log(error);

          return 0;
        }
      }
      return 0;
    }

    let parent = fieldContext.getFieldById(field.parent);
    const parentKeys = [];
    while (parent) {
      if (parent) {
        const key = getJsonKeyFromField(parent);
        parentKeys.push(key);
        parent = fieldContext.getFieldById(parent.parent);
      }
    }
    let value = values;
    const indexes = index?.split(".").slice(1) ?? [];
    parentKeys.reverse().forEach((key, i) => {
      if (value?.hasOwnProperty(key)) {
        if (Array.isArray(value[key])) {
          value = value[key][indexes[i]];
        } else {
          value = value[key];
        }
      }
    });
    if (value?.hasOwnProperty(key)) {
      try {
        if (typeof value[key] === "string") {
          const ret = JSON.parse(value[key]);
          return ret.length;
        }
        return value[key].length;
      } catch (error) {
        console.log(error);
        return 0;
      }
    }
    return 0;
  };

  return (
    <ValueContext.Provider
      value={{
        deleteItem: deleteItemFromList,
        getListFieldLength: getListFieldLength,
        getValue: getValue,
        updateValues: updateValues,
        values: values,
        copyValuesFromLastItin: copyValuesFromLastItin,
        fetchData: fetchData,
      }}
    >
      {props.children}
    </ValueContext.Provider>
  );
};

export const useValueContext = () => {
  return useContext(ValueContext);
};

export const getValue = (
  field: IField,
  fields: IField[],
  sectionValues: LooseObject,
  index?: string
) => {
  const key = getJsonKeyFromField(field);

  if (field.parent === null) {
    if (sectionValues.hasOwnProperty(key)) return sectionValues[key];
    return "";
  }
  let parent = getFieldByIdFromFields(fields, field.parent);
  const parentKeys = [];
  while (parent) {
    if (parent) {
      const key = getJsonKeyFromField(parent);
      parentKeys.push(key);
      parent = getFieldByIdFromFields(fields, parent.parent);
    }
  }
  const indexes = index?.split(".").slice(1) ?? [];
  let value = sectionValues;

  parentKeys.reverse().forEach((key, i) => {
    if (value?.hasOwnProperty(key)) {
      if (Array.isArray(value[key])) {
        value = value[key][indexes[i]];
      } else {
        value = value[key];
      }
    }
  });

  if (value?.hasOwnProperty(key)) return value[key];
  return "";
};
