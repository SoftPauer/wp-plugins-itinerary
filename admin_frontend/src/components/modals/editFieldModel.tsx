import MultiSelect from "@antlerengineering/multiselect";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { FC, useEffect, useState } from "react";
import { Field, IField, ITypeProperties } from "../../api/api";
import {
  DataTransformTypes,
  DataTransformTypesList,
} from "../../dataTransforms";
import {
  ExcelDisplayTypes,
  ExcelDisplayTypesList,
  FieldTypes,
  FieldTypesList,
} from "../../fieldTypes";
import {
  DataSourceTypes,
  DataSourceTypesList,
} from "../../state/dataSourceProvider";
import { useFieldContext } from "../../state/fieldProvider";
import { findChildren } from "../../utils";

const style: any = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type EditFieldModalProps = {
  field?: IField;
  section: number;
  open: boolean;
  handleClose: () => void;
};
type EditFieldState = {
  name: string;
  type: string;
  position: number;
  parent?: number;
  properties?: ITypeProperties;
};

export const EditFieldModal: FC<EditFieldModalProps> = ({
  section,
  open,
  handleClose,
  field,
}) => {
  const fieldContext = useFieldContext();
  const [state, setState] = useState<EditFieldState>({
    name: field?.field_name ?? "",
    type: field?.field_type ?? "",
    position: field?.position ?? 0,
    parent: field?.parent,
    properties: field?.type_properties,
  });
  useEffect(() => {
    setState({
      name: field?.field_name ?? "",
      type: field?.field_type ?? "",
      position: field?.position ?? 0,
      parent: field?.parent,
      properties: field?.type_properties,
    });
  }, [field]);

  const groupsAndLists =
    fieldContext.fields.filter(
      (g) =>
        g.field_type === FieldTypes.group || g.field_type === FieldTypes.list
    ) ?? [];

  const selectFields =
    fieldContext.fields.filter(
      (g) => g.field_type === FieldTypes.select && g.id !== field?.id
    ) ?? [];

  const membersList = (field?: IField) => {
    if (field) {
      const children = findChildren(field, fieldContext.fields);
      return children.map((c) => {
        return {
          value: c.field.id.toString(),
          label: c.field.field_name,
        };
      });
    }
    return [];
  };

  /**
   *  Get Fields required specified data source
   * @param sourceType
   */
  const getDataSourceExtraFields = () => {
    switch (state.properties?.data_source) {
      case DataSourceTypes.users:
        return <div></div>;
      case DataSourceTypes.parent:
        return (
          <FormControl>
            <InputLabel>Source</InputLabel>
            <Select
              style={{ width: "100px" }}
              label="Source"
              value={state.properties?.data_source_properties?.source}
              onChange={(val) =>
                setState({
                  ...state,
                  properties: {
                    ...state.properties,
                    data_source_properties: {
                      source: val.target.value as number,
                    },
                  },
                })
              }
            >
              {selectFields.map((g, n) => {
                return (
                  <MenuItem key={n} value={g.id}>
                    {g.field_name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Edit/Create Field
          </Typography>
          <TextField
            style={{ width: "100%" }}
            required
            label="Name"
            onChange={(val) => setState({ ...state, name: val.target.value })}
            value={state.name}
          />
          <TextField
            style={{ width: "100%" }}
            required
            label="JSON key"
            onChange={(val) =>
              setState({
                ...state,
                properties: {
                  ...state.properties,
                  json_key: val.target.value as string,
                },
              })
            }
            value={state.properties?.json_key}
          />
          <div style={{ display: "flex", margin: "10px 0 10px 0" }}>
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                style={{ width: "200px" }}
                labelWidth={100}
                value={state.type}
                onChange={(val) =>
                  setState({
                    ...state,
                    type: val.target.value as string,
                  })
                }
              >
                {FieldTypesList.map((i, n) => {
                  return (
                    <MenuItem key={n} value={i.value}>
                      {i.value}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {state.type === FieldTypes.list && (
              <>
                <FormControl>
                  <InputLabel>Excel diplay type</InputLabel>
                  <Select
                    style={{ width: "200px" }}
                    labelWidth={100}
                    value={state.properties?.excelDisplayType ?? ""}
                    onChange={(val) =>
                      setState({
                        ...state,
                        properties: {
                          ...state.properties,
                          excelDisplayType: val.target
                            .value as ExcelDisplayTypes,
                        },
                      })
                    }
                  >
                    {ExcelDisplayTypesList.map((i, n) => {
                      return (
                        <MenuItem key={n} value={i.value}>
                          {i.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <FormControl>
                  <MultiSelect
                    options={membersList(field)}
                    multiple={true}
                    label={"Key field"}
                    labelPlural={"Key fields"}
                    value={state.properties?.key_fields ?? []}
                    onChange={(val) =>
                      setState({
                        ...state,
                        properties: {
                          ...state.properties,
                          key_fields: val,
                        },
                      })
                    }
                  />
                </FormControl>
              </>
            )}
          </div>
          <div style={{ display: "flex", margin: "10px 0 10px 0" }}>
            <FormControl>
              <InputLabel>Data Source</InputLabel>
              <Select
                style={{ width: "200px" }}
                labelWidth={100}
                value={state.properties?.data_source}
                onChange={(val) =>
                  setState({
                    ...state,
                    properties: {
                      ...state.properties,
                      data_source: val.target.value as string,
                    },
                  })
                }
              >
                <MenuItem value={undefined}>None</MenuItem>
                {DataSourceTypesList.map((i, n) => {
                  return (
                    <MenuItem key={n} value={i.value}>
                      {i.value}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {getDataSourceExtraFields()}
          </div>
          <div style={{ display: "flex", margin: "10px 0 10px 0" }}>
            <FormControl>
              <InputLabel>Data transform</InputLabel>
              <Select
                style={{ width: "200px" }}
                value={state.properties?.data_transform}
                onChange={(val) => {
                  setState({
                    ...state,
                    properties: {
                      ...state.properties,
                      data_transform: val.target.value as string,
                    },
                  });
                }}
              >
                <MenuItem value={undefined}>None</MenuItem>
                {DataTransformTypesList.map((d, n) => {
                  return (
                    <MenuItem key={n} value={d.value}>
                      {d.value}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {state.properties?.data_transform ===
              DataTransformTypes.selectWithKey && (
              <TextField
                style={{ width: "100px" }}
                required
                label="JSON Key"
                onChange={(val) =>
                  setState({
                    ...state,
                    properties: {
                      ...state.properties,
                      data_transform_properties: val.target.value as string,
                    },
                  })
                }
                value={state.properties?.data_transform_properties}
              />
            )}
          </div>
          <FormControl>
            <InputLabel>Parent</InputLabel>
            <Select
              style={{ width: "200px" }}
              value={state.parent}
              onChange={(val) =>
                setState({ ...state, parent: val.target.value as number })
              }
            >
              {groupsAndLists.map((g, n) => {
                return (
                  <MenuItem key={n} value={g.id}>
                    {g.field_name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            style={{ width: "100%" }}
            required
            label="Position"
            onChange={(val) =>
              setState({
                ...state,
                position: Number.parseInt(val.target.value),
              })
            }
            value={state.position}
          />
          <Button
            onClick={() => {
              // TODO: handle error
              Field.createField({
                id: field?.id,
                name: state.name,
                type: state.type,
                position: state.position,
                section: section,
                parent: state.parent,
                type_properties: state.properties,
              }).then((_) => {
                handleClose();
              });
            }}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
