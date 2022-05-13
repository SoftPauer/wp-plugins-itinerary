import { createContext, useContext } from "react";
import { ExcelDisplayTypes, FieldTypes } from "../fieldTypes";
import { ISortedField } from "../pages/sectionValues";
import { unNeighborSortedFields } from "../utils";
import { useValueContext } from "./valueProvider";
interface ISheetContext {
  fieldsToWsData: (
    field: ISortedField,
    index: string,
    emptyColumn?: number
  ) => any[];
}
const sheetContext = createContext<ISheetContext>({
    fieldsToWsData: () => [],
});

export const SheetProvider = (props: { children: React.ReactNode }) => {
  const { getValue, getListFieldLength } = useValueContext();

  const fieldsToWsData = (
    field: ISortedField,
    index: string,
    emptyColumn: number = 0
  ) => {
    const ws_data: any[] = [];

    const emptyColumns = Array(emptyColumn).fill("");

    if (field.field.field_type === FieldTypes.list) {
      if (
        !field.field.type_properties?.excelDisplayType ||
        field.field.type_properties.excelDisplayType ===
          ExcelDisplayTypes.linnear
      ) {
        const listLinnear = linnearStyleListToWSData(field, index, emptyColumn);
        ws_data.push(...listLinnear);
      }
      if (
        field.field.type_properties?.excelDisplayType ===
        ExcelDisplayTypes.table
      ) {
        const listTable = tableStyleListToWSData(field, index, emptyColumn);
        ws_data.push(...listTable);
      }
      ws_data.push([...emptyColumns, "-------"]);
    }

    return ws_data;
  };

  const linnearStyleListToWSData = (
    field: ISortedField,
    index: string,
    emptyColumn: number
  ) => {
    const ws_data: any[] = [];
    let ws_row: any[] = [];
    const fields = unNeighborSortedFields(field.children);
    const length = getListFieldLength(field.field, index);
    const emptyColumns = Array(emptyColumn).fill("");
    for (let i = 0; i < length; i++) {
      fields.forEach((e) => {
        switch (e.field.field_type) {
          case FieldTypes.list:
            ws_data.push([...emptyColumns, "", e.field.field_name]);
            const listWsData = fieldsToWsData(
              e,
              index + "." + i.toString(),
              emptyColumn + 1
            );
            ws_data.push(...listWsData);
            break;
          case FieldTypes.select:
            ws_row.push(...emptyColumns, e.field.field_name);
            const selectvalue = getValue(e.field, index + "." + i.toString());
            ws_row.push(...selectvalue);
            ws_data.push(ws_row);
            ws_row = [];
            break;
          default:
            ws_row.push(...emptyColumns, e.field.field_name);
            const val = getValue(e.field, index + "." + i.toString());
            ws_row.push(val);
            ws_data.push(ws_row);
            ws_row = [];
            break;
        }
      });
    }
    return ws_data;
  };

  const tableStyleListToWSData = (
    field: ISortedField,
    index: string,
    emptyColumn: number
  ) => {
    const ws_data: any[] = [];
    let ws_row: any[] = [];
    const fields = unNeighborSortedFields(field.children);
    const length = getListFieldLength(field.field, index);
    const emptyColumns = Array(emptyColumn).fill("");
    fields.forEach((e) => {
      ws_row.push(e.field.field_name);
    });
    ws_data.push([...emptyColumns, ...ws_row]);
    ws_row = [];
    for (let i = 0; i < length; i++) {
      fields.forEach((e) => {
        const val = getValue(e.field, index + "." + i.toString());
        ws_row.push(val);
      });
      ws_data.push([...emptyColumns, ...ws_row]);
      ws_row = [];
    }

    return ws_data;
  };

  return (
    <sheetContext.Provider value={{
        fieldsToWsData,
    }}>{props.children}</sheetContext.Provider>
  );
};
export const useSheetContext = () => {
  return useContext(sheetContext);
};
