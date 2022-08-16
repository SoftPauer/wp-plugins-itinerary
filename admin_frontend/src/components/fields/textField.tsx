import {
  Button,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { FC, useEffect, useState, useContext } from "react";
import { Field, IField } from "../../api/api";
import {
  IDataSourceOptions,
  useDataSourceContext,
} from "../../state/dataSourceProvider";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";
import { useValueContext } from "../../state/valueProvider";

type AppTextFieldProps = {
  field: IField;
  preview: boolean;
  index: string | undefined;
};
interface IAppTextFieldState {
  inputString?: string;
}

const useStyles = makeStyles((theme) => ({
  appTextField: { marginTop: "20px", marginRight: "20px" },
}));

export const AppTextField: FC<AppTextFieldProps> = ({
  field,
  index,
  preview,
}) => {
  const [state, setState] = useState<IAppTextFieldState>();
  const [options, setOptions] = useState<IDataSourceOptions | null>(null);
  const classes = useStyles();
  const { dispatch } = useContext(ModalContext);
  const sectionContext = useSectionContext();
  const valueContext = useValueContext();
  const dataSourceContext = useDataSourceContext();

  useEffect(() => {
    const initFieldValue = valueContext.getValue(field, index);

    setState({ inputString: initFieldValue });
    setOptions(
      dataSourceContext.resolveDataSource(
        field.type_properties?.data_source ?? "",
        field.type_properties?.data_source_properties,
        index
      )
    );
  }, [valueContext.values, field, dataSourceContext, index]);

  return (
    <div className={classes.appTextField}>
      {!field.type_properties?.data_source && (
        <TextField
          label={field.field_name}
          onChange={(val) =>
            setState({ ...state, inputString: val.target.value })
          }
          InputLabelProps={{
            shrink: true,
          }}
          placeholder="value"
          value={state?.inputString}
          onBlur={() => {
            valueContext.updateValues({
              field: field,
              value: state?.inputString ?? "",
              index: index,
            });
          }}
        />
      )}
      {field.type_properties?.data_source && (
        <FormControl>
          <InputLabel shrink htmlFor="age-native-label-placeholder">
            {field.field_name}
          </InputLabel>
          <Select
            labelWidth={100}
            value={`${state?.inputString}`}
            onChange={(val) =>
              setState({ ...state, inputString: val.target.value as string })
            }
            onBlur={() => {
              valueContext.updateValues({
                field: field,
                value: state?.inputString ?? "",
                index: index,
              });
            }}
          >
            <MenuItem value={undefined}>None</MenuItem>
            {(options?.options ?? []).map((i, n) => {
              return (
                <MenuItem key={n} value={i}>
                  {i}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}
      {!preview && <div></div>}
      {preview && (
        <div>
          <Button
            onClick={() => {
              Field.deleteField(field.id);
            }}
          >
            remove
          </Button>
          <Button
            onClick={() => {
              dispatch({
                type: "open",
                modal: "EditField",
                modalData: {
                  section: sectionContext.editSection?.id,
                  field: field,
                },
              });
            }}
          >
            edit
          </Button>
        </div>
      )}
    </div>
  );
};
