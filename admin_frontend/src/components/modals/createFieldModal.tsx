import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import { FC, useState } from "react";
import { Field, ITypeProperties } from "../../api/api";
import { FieldTypes, FieldTypesList } from "../../fieldTypes";
import {
  DataTransformTypes,
  DataTransformTypesList,
} from "../../dataTransforms";
import { DataSourceTypesList } from "../../state/dataSourceProvider";
import { useFieldContext } from "../../state/fieldProvider";

const style: any = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type CreateFieldModalProps = {
  section: number;
  open: boolean;
  handleClose: () => void;
};
type CreateFieldState = {
  name: string;
  type: string;
  position: number;
  parent?: number;
  properties?: ITypeProperties;
};

export const CreateFieldModal: FC<CreateFieldModalProps> = ({
  section,
  open,
  handleClose,
}) => {
  const [state, setState] = useState<CreateFieldState>({
    name: "",
    type: "",
    position: 0,
  });
  const fieldContext = useFieldContext();
const groups =fieldContext.fields.filter(
  (g) =>
    g.field_type === FieldTypes.group ||
    g.field_type === FieldTypes.list
) ?? []
  return (
    <div>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            New field for this section
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
                style={{ width: "100px" }}
                labelWidth={100}
                value={state.type}
                onChange={(val) =>
                  setState({ ...state, type: val.target.value as string })
                }
              >
                <MenuItem value={undefined}>None</MenuItem>
                {FieldTypesList.map((i, n) => {
                  return (
                    <MenuItem key={n} value={i.value}>
                      {i.value}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>
          <div style={{ display: "flex", margin: "10px 0 10px 0" }}>
            <FormControl>
              <InputLabel>Data Source</InputLabel>
              <Select
                style={{ width: "100px" }}
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
            <FormControlLabel
              control={
                <Switch
                  checked={state.properties?.keyless}
                  onChange={(val, checked) => {
                    setState({
                      ...state,
                      properties: {
                        ...state.properties,
                        keyless: checked,
                      },
                    });
                  }}
                />
              }
              label="Keyless"
            />
            <FormControl>
              <InputLabel>Data transform</InputLabel>
              <Select
                style={{ width: "100px" }}
                label="Parent"
                value={state.properties?.data_transform}
                onChange={(val) =>
                  setState({
                    ...state,
                    properties: {
                      ...state.properties,
                      data_transform: val.target.value as string,
                    },
                  })
                }
              >
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
              style={{ width: "100px" }}
              label="Parent"
              value={state.parent}
              onChange={(val) =>
                setState({ ...state, parent: val.target.value as number })
              }
            >
              {groups.map((g, n) => {
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
            add field
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
