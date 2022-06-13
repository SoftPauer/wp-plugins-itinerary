import { IField, ISection, IValues } from "./api/api";
import { FieldTypes, } from "./fieldTypes";
import { ISortedField } from "./pages/sectionValues";
import { format } from "date-fns";
import { getFieldByIdFromFields } from "./state/fieldProvider";
export interface LooseObject {
  [key: string]: any;
}
export const stringToJsonSafeKey = (s: string) => {
  return s.toLowerCase().replaceAll(" ", "_");
};
export const findValue = (field: IField, values: IValues, index?: string) => {
  return { value: "" };
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
export const getValueFromExcelImport = (field: IField ,value: any) => {
  
  if (field.field_type === FieldTypes.date) {
    if(typeof value === "string") return value;
    return format(excelDateToJSDate(value), "yyyy-MM-dd");
  }
  return value;
};

export const getJsonKeyFromField = (field: IField) => {
  if (field.type_properties?.json_key) {
    return field.type_properties?.json_key ;
  }
  return field.field_name.replaceAll(" ", "_") ;
};

export const getJsonKeyFromSection = (section: ISection) => {

  return section.name.replaceAll(" ", "_").toLocaleLowerCase() ;
};

export const getValueNoContext = (
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

export const sortFields = (fields: IField[], neighborIt: boolean = true) => {
  let sortedFields: ISortedField[] = [];
  // sort parent - children
  let childFields = fields
    .sort((a, b) => a.position - b.position)
    .filter((f) => {
      if (f.parent === null) {
        sortedFields.push({ field: f, children: [] });
      }
      return f.parent !== null;
    });

  sortedFields.forEach((s) => {
    s.children = findChildren(s.field, childFields);
  });

  //find neighbors
  if (neighborIt) {
    sortedFields = sortNeighbors(sortedFields);
  }

  return sortedFields;
};

export const findNeighbors = (parent: IField, sortedFields: ISortedField[]) => {
  const neighbors = sortedFields.filter(
    (s) => s.field.position === parent.position && s.field.id !== parent.id
  );
  return neighbors;
};
export const sortNeighbors = (sortedFields: ISortedField[]) => {
  for (let i = 0; i < sortedFields.length; i++) {
    const neighbors = findNeighbors(sortedFields[i].field, sortedFields);
    sortedFields[i].neighbors = sortNeighbors(neighbors);
    sortedFields = sortedFields.filter(
      (s) => !neighbors.map((n) => n.field.id).includes(s.field.id)
    );
    sortedFields[i].children = sortNeighbors(sortedFields[i].children);
  }
  return sortedFields;
};

export const findChildren = (parent: IField, fields: IField[]) => {
  const sortedFields: ISortedField[] = [];
  fields.filter((f) => {
    if (parent.id === f.parent) {
      sortedFields.push({ field: f, children: [] });
      return true;
    }
    return false;
  });
  sortedFields.forEach((s) => {
    s.children = findChildren(s.field, fields);
  });
  return sortedFields;
};
