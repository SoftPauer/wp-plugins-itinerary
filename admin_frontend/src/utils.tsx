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
export const getValueFromExcelImport = (excelRow: any, field: IField) => {
  if (field.field_type === FieldTypes.date) {
    return format(excelDateToJSDate(excelRow[field.field_name]), "yyyy-MM-dd");
  }
  return excelRow[field.field_name];
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

