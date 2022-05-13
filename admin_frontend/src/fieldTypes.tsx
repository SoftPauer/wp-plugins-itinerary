import { Typography } from "@material-ui/core";
import { IField } from "./api/api";
import { AppDatePicker } from "./components/fields/datePicker";
import { GroupField } from "./components/fields/group";
import { ListField } from "./components/fields/listField";
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
  preview: boolean = false
) => {
  if (field.field.field_type === FieldTypes.text) {
    return (
      <AppTextField
        field={field.field}
        index={index}
        preview={preview}
        key={field.field.id}
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
      ></ListField>
    );
  }

  return (
    <Typography variant="h6" component="h2">
      Type not found
    </Typography>
  );
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

const findNeighbors = (parent: IField, sortedFields: ISortedField[]) => {
  const neighbors = sortedFields.filter(
    (s) => s.field.position === parent.position && s.field.id !== parent.id
  );
  return neighbors;
};
const sortNeighbors = (sortedFields: ISortedField[]) => {
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

const findChildren = (parent: IField, fields: IField[]) => {
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
