import XLSX from "xlsx";
import { ExcelDisplayTypes, FieldTypes } from "../fieldTypes";
import { ISortedField } from "../pages/sectionValues";
import { getFieldByFieldName } from "../state/fieldProvider";
import { getJsonKeyFromField, getValueFromExcelImport, unNeighborSortedFields } from "../utils";
export const END_OF_LIST = "-------";
export const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

//get the length of the list from the table style
export const getListLengthFromSheetTableStyle = (
  sheet: XLSX.WorkSheet,
  column: number,
  row: number
) => {
  let endOfList = false;
  let listLength = 0;
  let i = 2;
  while (!endOfList) {
    const val = sheet[ALPHABET[column] + (row + i)]?.v;
    if (val === END_OF_LIST) {
      endOfList = true;
      continue;
    }
    listLength++;
    i++;
  }
  return listLength;
};

export const getListLengthFromSheetLinnearStyle = (
  sheet: XLSX.WorkSheet,
  column: number,
  row: number
) => {
  const key = sheet[ALPHABET[column] + (row + 1)]?.v;
  if (!key || key === END_OF_LIST) return 0;
  let endOfList = false;
  let listLength = 1;
  let i = 2;
  while (!endOfList) {
    const val = sheet[ALPHABET[column] + (row + i)]?.v;
    if (val === key) listLength++;
    if (val === END_OF_LIST) endOfList = true;
    i++;
  }
  return listLength;
};

export const getListLengthFromSheet = (
  sheet: XLSX.WorkSheet,
  column: number,
  row: number,
  field: ISortedField
) => {
  if (
    !field.field.type_properties?.excelDisplayType ||
    field.field.type_properties.excelDisplayType === ExcelDisplayTypes.linnear
  ) {
    return getListLengthFromSheetLinnearStyle(sheet, column, row);
  }
  if (
    field.field.type_properties.excelDisplayType === ExcelDisplayTypes.table
  ) {
    return getListLengthFromSheetTableStyle(sheet, column, row);
  }
  return 0;
};

export const wsDataToValuesTableStyle = (
  fields: ISortedField[],
  emptyColumn: number = 0,
  sheet: XLSX.WorkSheet,
  startingPos: number = 0,
  length: number = 0
) => {
  const values: any[] = [];

  startingPos++;
  for (let i = 0; i < length; i++) {
    values.push({});
    startingPos++;
    for (let j = 0; j < fields.length; j++) {
      switch (fields[j].field.field_type) {
        default:
          const jsonKey = getJsonKeyFromField(fields[j].field);
          const fieldValue = getValueFromExcelImport(fields[j].field,sheet[ALPHABET[emptyColumn + j] + startingPos]?.v);
          values[i][jsonKey] = fieldValue;
          break;
      }
    }
  }
  return { values, startingPos };
};
export const wsDataToValuesLinnearStyle = (
  field: ISortedField,
  sheet: XLSX.WorkSheet,
  index: string,
  length: number = 0,
  startingPos: number = 0,
  emptyColumn: number = 0
) => {
  let values: any[] = [];
  const fields = unNeighborSortedFields(field.children);
  for (let i = 0; i < length; i++) {
    values.push({});
    for(let j = 0; j < fields.length; j++) {
      startingPos++;
      switch (fields[j].field.field_type) {
        case FieldTypes.list:
          const fieldNameList =
            sheet[ALPHABET[emptyColumn + 1] + startingPos].v;
          const thisFieldList = getFieldByFieldName(fields, fieldNameList);
          if (!thisFieldList) continue;
          const jsonKeyList = getJsonKeyFromField(thisFieldList?.field);
          const { values: val, startingPos: pos } = wsDataToValues(
            fields[j],
            index + "." + i.toString(),
            emptyColumn + 1,
            sheet,
            startingPos
          );
          values[i][jsonKeyList] = val;
          startingPos = pos + 1; //end of list have one empty row
          console.log(val, pos);

          break;
        case FieldTypes.select:
          const fieldNameSelect = sheet[ALPHABET[emptyColumn] + startingPos].v;
          const thisFieldSelect = getFieldByFieldName(fields, fieldNameSelect);
          if (!thisFieldSelect) continue;
          const jsonKeySelect = getJsonKeyFromField(thisFieldSelect?.field);

          let selectCounter = emptyColumn + 1;
          let selectSingleValue = sheet[ALPHABET[selectCounter] + (j + 1)]?.v;
          const fieldValueSelect = [];
          while (selectSingleValue !== undefined) {
            selectSingleValue =
              sheet[ALPHABET[selectCounter + 1] + startingPos]?.v;
            if (selectSingleValue !== undefined)
              fieldValueSelect.push(selectSingleValue);
            selectCounter++;
          }
          values[i][jsonKeySelect] = fieldValueSelect;
          break;
        default:
          const fieldName = sheet[ALPHABET[emptyColumn] + startingPos].v;
          const thisField = getFieldByFieldName(fields, fieldName);
          if (!thisField) continue;
          const jsonKey = getJsonKeyFromField(thisField?.field);
         
          
          const fieldValue =getValueFromExcelImport(thisField?.field, sheet[ALPHABET[emptyColumn + 1] + startingPos].v);
          values[i][jsonKey] = fieldValue;
          break;
      }
    }
  
  }
  return { values, startingPos };
};

export const wsDataToValues = (
  field: ISortedField,
  index: string,
  emptyColumn: number = 0,
  sheet: XLSX.WorkSheet,
  startingPos: number = 0
) => {
  const fields = unNeighborSortedFields(field.children);

  if (field.field.field_type === FieldTypes.list) {
    const length = getListLengthFromSheet(
      sheet,
      emptyColumn,
      startingPos,
      field
    );
    if (
      !field.field.type_properties?.excelDisplayType ||
      field.field.type_properties.excelDisplayType === ExcelDisplayTypes.linnear
    )
      return wsDataToValuesLinnearStyle(
        field,
        sheet,
        index,
        length,
        startingPos,
        emptyColumn
      );
    if (
      field.field.type_properties?.excelDisplayType === ExcelDisplayTypes.table
    ) {
      return wsDataToValuesTableStyle(
        fields,
        emptyColumn,
        sheet,
        startingPos,
        length
      );
    }
  }

  return { values: [], startingPos };
};
