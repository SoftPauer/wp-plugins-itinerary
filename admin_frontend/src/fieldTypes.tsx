import { Typography } from "@material-ui/core";
import { AppDatePicker } from "./components/fields/datePicker";
import { GroupField } from "./components/fields/group";
import { ListField } from "./components/fields/listField";
import { PassengersTable } from "./components/fields/passengersTable";
import { AppSelectField } from "./components/fields/selectField";
import { AppTextField } from "./components/fields/textField";
import { ISortedField } from "./pages/sectionValues";

export enum FieldTypes {
  text = "text",
  group = "group",
  date = "date",
  list = "list",
  select = "select",
  time = "time",
  dateTime = "dateTime",
  costingTable = "costingTable",
}

export const FieldTypesList: {
  key: string;
  value: string;
}[] = Object.entries(FieldTypes).map(([key, value]) => ({ key, value }));

export enum ExcelDisplayTypes {
  table = "table",
  linnear = "linnear",
}

export const ExcelDisplayTypesList: {
  key: string;
  value: string;
}[] = Object.entries(ExcelDisplayTypes).map(([key, value]) => ({ key, value }));

export const renderField = (
  field: ISortedField,
  index: string = "0",
  preview: boolean = false,
  listKey?: string
) => {
  if (field.field.field_type === FieldTypes.text) {
    return (
      <AppTextField
        field={field.field}
        index={index}
        preview={preview}
        key={field.field.id}
        listKey = {listKey}
      ></AppTextField>
    );
  }
  if (field.field.field_type === FieldTypes.select) {
    return (
      <AppSelectField
        field={field.field}
        index={index}
        preview={preview}
        key={field.field.id}
        listKey={listKey}
      ></AppSelectField>
    );
  }

  if (field.field.field_type === FieldTypes.date) {
    return (
      <AppDatePicker
        field={field.field}
        index={index}
        preview={preview}
        type="date"
        key={field.field.id}
        listKey={listKey}
      ></AppDatePicker>
    );
  }
  if (field.field.field_type === FieldTypes.dateTime) {
    return (
      <AppDatePicker
        field={field.field}
        index={index}
        preview={preview}
        type="datetime-local"
        key={field.field.id}
      ></AppDatePicker>
    );
  }
  if (field.field.field_type === FieldTypes.time) {
    return (
      <AppDatePicker
        field={field.field}
        index={index}
        preview={preview}
        type="time"
        key={field.field.id}
      ></AppDatePicker>
    );
  }
  if (field.field.field_type === FieldTypes.group) {
    return (
      <GroupField
        field={field}
        index={index}
        preview={preview}
        key={field.field.id}
      ></GroupField>
    );
  }
  if (field.field.field_type === FieldTypes.list) {
    return (
      <ListField
        index={index}
        field={field}
        preview={preview}
        key={field.field.id}
        listKey={listKey}
      ></ListField>
    );
  }

  if (field.field.field_type === FieldTypes.costingTable) {
    return (
      <PassengersTable
        index={index}
        field={field.field}
        preview={preview}
        listKey={listKey}
      />
    );
  }

  return (
    <Typography variant="h6" component="h2">
      Type not found
    </Typography>
  );
};
