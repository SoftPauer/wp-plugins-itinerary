import { IField, ISection, IValue } from "./api/api";
import { DataTransformTypes, resolveDataTransform } from "./dataTransforms";
import { FieldTypes } from "./fieldTypes";
import { ISortedField } from "./pages/sectionValues";
import {  format } from 'date-fns'
export interface LooseObject {
  [key: string]: any;
}
type LooseobjString = LooseObject | string;
export const stringToJsonSafeKey = (s: string) => {
  return s.toLowerCase().replaceAll(" ", "_");
};
export const findValue = (field: IField, values: IValue[], index?: string) => {
  return values.find(
    (v) =>
      v.field === field.id &&
      (index !== undefined ? v.list_index === index : true)
  );
};

export const buildJsonForSection = (
  section: ISection,
  fields: ISortedField[],
  values: IValue[]
) => {
  const json: LooseObject = {};
  const sectJsonName =
    section.properties?.jsonName === undefined
      ? section.name
      : section.properties?.jsonName;
  json[sectJsonName] = {};

  if (fields.length === 1 && fields[0].field.field_type === FieldTypes.list) {
    const fv = buildJsonForField(fields[0], values, "0");

    if (!(typeof fv === "string") && !(typeof fv === "undefined")) {
      json[sectJsonName] = fv.value;
    }
  } else {
    fields.forEach((f) => {
      const fv = buildJsonForField(f, values, "0");
      if (!(typeof fv === "string") && !(typeof fv === "undefined")) {
        json[sectJsonName][fv.key] = fv.value;
      }
    });
  }
  return json;
};

export const buildJsonForField = (
  field: ISortedField,
  values: IValue[],
  indexValue: string
) => {
  let key;
  let value;

  switch (field.field.field_type) {
    case FieldTypes.text:
    case FieldTypes.date:
    case FieldTypes.time:
      value = values.find(
        (v) => v.field === field.field.id && indexValue === v.list_index
      );
      if (field.field.type_properties?.keyless) return value?.value;

      key = field.field.field_name;
      if (field.field.type_properties?.json_key) {
        key = field.field.type_properties?.json_key;
      }

      return { key, value: value?.value };
    case FieldTypes.group: //does not have value, we need to go
      key = field.field.field_name;
      if (field.field.type_properties?.json_key) {
        key = field.field.type_properties?.json_key;
      }
      let grValue: LooseObject = {};
      field.children.forEach((f) => {
        const fv = buildJsonForField(f, values, indexValue);
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
      value = values.find(
        (v) => v.field === field.field.id && indexValue === v.list_index
      );

      if (value) {
        slValue = JSON.parse(value.value);
        if (
          field.field.type_properties?.data_transform ===
          DataTransformTypes.selectWithKey
        ) {
          slValue = resolveDataTransform(
            field.field.type_properties?.data_transform_properties,
            DataTransformTypes.selectWithKey,
            slValue
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
      const val = findValue(field.field, values, indexValue);

      if (val) {
        for (let i = 0; i < Number.parseInt(val.value); i++) {
          if (val?.value_properties?.deleted?.includes(i.toString())) {
            continue;
          }
          let lsElValue: LooseObject = {};
          field.children.forEach((f) => {
            const fv = buildJsonForField(
              f,
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
    return format(excelDateToJSDate(excelRow[field.field_name]),"yyyy-MM-dd");
  }
  return excelRow[field.field_name];
};
