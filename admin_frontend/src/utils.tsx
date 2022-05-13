import { IField, ISection, IValues } from "./api/api";
import { DataTransformTypes, resolveDataTransform } from "./dataTransforms";
import { FieldTypes, sortFields } from "./fieldTypes";
import { ISortedField } from "./pages/sectionValues";
import { format } from "date-fns";
import { getValue } from "./state/valueProvider";
export interface LooseObject {
  [key: string]: any;
}
type LooseobjString = LooseObject | string;
export const stringToJsonSafeKey = (s: string) => {
  return s.toLowerCase().replaceAll(" ", "_");
};
export const findValue = (field: IField, values: IValues, index?: string) => {
  return { value: "" };
};

export const buildJsonForSection = (
  section: ISection,
  fields: IField[],
  values: IValues | null
) => {
  const json: LooseObject = {};
  const sortedFields = sortFields(fields, false);
  const sectJsonName =
    section.properties?.jsonName === undefined
      ? section.name
      : section.properties?.jsonName;
  json[sectJsonName] = {};
  if (values) {
    if (
      fields.length === 1 &&
      sortedFields[0].field.field_type === FieldTypes.list
    ) {
      const fv = buildJsonForField(sortedFields[0], fields, values, "0");

      if (!(typeof fv === "string") && !(typeof fv === "undefined")) {
        json[sectJsonName] = fv.value;
      }
    } else {
      sortedFields.forEach((f) => {
        const fv = buildJsonForField(f, fields, values, "0");
        if (!(typeof fv === "string") && !(typeof fv === "undefined")) {
          json[sectJsonName][fv.key] = fv.value;
        }
      });
    }
  }
  return json;
};

export const buildJsonForField = (
  field: ISortedField,
  fields: IField[],
  values: IValues,
  indexValue: string
) => {
  let key;
  let value;
  const parsedValues = JSON.parse(values.value);
  switch (field.field.field_type) {
    case FieldTypes.text:
    case FieldTypes.date:
    case FieldTypes.time:
      value = getValue(field.field, fields, parsedValues, indexValue);
      if (field.field.type_properties?.keyless) return value;

      key = field.field.field_name;
      if (field.field.type_properties?.json_key) {
        key = field.field.type_properties?.json_key;
      }

      return { key, value };
    case FieldTypes.group: //does not have value, we need to go
      key = field.field.field_name;
      if (field.field.type_properties?.json_key) {
        key = field.field.type_properties?.json_key;
      }
      let grValue: LooseObject = {};
      field.children.forEach((f) => {
        const fv = buildJsonForField(f, fields, values, indexValue);
        if (!(typeof fv === "string") && !(typeof fv === "undefined")) {
          grValue[fv.key] = fv.value;
        }
      });
      return { key, value: grValue };
    case FieldTypes.select:
      key = field.field.field_name;
      if (field.field.type_properties?.json_key) {
        key = field.field.type_properties?.json_key;
      }
      let slValue: LooseObject = [];
      value = getValue(field.field, fields, parsedValues, indexValue);
      if (value) {
        if (
          field.field.type_properties?.data_transform ===
          DataTransformTypes.selectWithKey
        ) {
          slValue = resolveDataTransform(
            field.field.type_properties?.data_transform_properties,
            DataTransformTypes.selectWithKey,
            value
          );
        }
      }
      return { key, value: slValue };
    case FieldTypes.list: //value is the length of the list
      key = field.field.field_name;
      if (field.field.type_properties?.json_key) {
        key = field.field.type_properties?.json_key;
      }

      let lsValue: LooseobjString[] = [];
      const val = getValue(field.field, fields, parsedValues, indexValue);

      if (val) {
        for (let i = 0; i < val.length; i++) {
          let lsElValue: LooseObject = {};
          field.children.forEach((f) => {
            const fv = buildJsonForField(
              f,
              fields,
              values,
              indexValue + "." + i.toString()
            );
            if (!(typeof fv === "undefined"))
              if (!(typeof fv === "string")) {
                lsElValue[fv.key] = fv.value;
                lsElValue["id"] = i + 1;
              } else {
                lsValue.push(fv);
              }
          });
          if (Object.keys(lsElValue).length > 0) {
            lsValue.push(lsElValue);
          }
        }
      }
      return { key, value: lsValue };
    default:
      return { key: "not_Found", value: "not Found" };
  }
};

export const unNeighborSortedFields = (fields: ISortedField[]) => {
  const ret: ISortedField[] = [];
  fields.forEach((f) => {
    ret.push({ ...f, neighbors: undefined });
    if (f.neighbors) ret.push(...f.neighbors);
  });
  ret.forEach((f) => {
    f.children = unNeighborSortedFields(f.children);
  });
  return ret;
};
export const excelDateToJSDate = (date: number) => {
  return new Date(Math.round((date - 25569) * 86400 * 1000));
};
export const getValueFromExcelImport = (excelRow: any, field: IField) => {
  if (field.field_type === FieldTypes.date) {
    return format(excelDateToJSDate(excelRow[field.field_name]), "yyyy-MM-dd");
  }
  return excelRow[field.field_name];
};

export const getJsonKeyFromField = (field: IField) => {
  if (field.type_properties?.json_key) {
    return field.type_properties?.json_key + "^" + field.id;
  }
  return field.field_name.replaceAll(" ", "_") + "^" + field.id;
};
