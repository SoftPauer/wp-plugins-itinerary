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
import { Field, IField, IValue, Value } from "../../api/api";
import {
  IDataSourceOptions,
  useDataSourceContext,
} from "../../state/dataSourceProvider";
import { useItineraryContext } from "../../state/itineraryProvider";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";

type AppTextFieldProps = {
  field: IField;
  fieldValue: IValue | undefined;
  preview: boolean;
  index: string | undefined;
};
interface IAppTextFieldState {
  value?: IValue;
  inputString?: string;
}
const useStyles = makeStyles((theme) => ({
  appTextField: { marginTop: "20px", marginRight: "20px" },
}));
export const AppTextField: FC<AppTextFieldProps> = ({
  field,
  fieldValue,
  index,
  preview,
}) => {
  const [state, setState] = useState<IAppTextFieldState>();
  const [options, setOptions] = useState<IDataSourceOptions | null>(null);
  const classes = useStyles();
  const { dispatch } = useContext(ModalContext);
  const itinContext = useItineraryContext();
  const sectionContext = useSectionContext();
  const dataSourceContext = useDataSourceContext();
  useEffect(() => {
    setState({ inputString: fieldValue?.value?? "", value: fieldValue });
    setOptions(
      dataSourceContext.resolveDataSource(
        field.type_properties?.data_source ?? "",
        field.type_properties?.data_source_properties,
        index
      )
    );
  }, [fieldValue, field.type_properties?.data_source,dataSourceContext]);

  const createUpdateValue = async (val: string) => {
    if (itinContext.selected && sectionContext.selectedSection) {
      const res = await Value.createValueOrUpdate([{
        section: sectionContext.selectedSection.id,
        itinerary: itinContext.selected.id,
        field: field.id,
        value: val,
        list_index: index,
        id: state?.value?.id,
      }]);
      if ((res as IValue).id) {
        setState({ ...state, value: res as IValue });
      } else {
      }
    }
  };

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
          onBlur={(e) => createUpdateValue(e.target.value)}
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
            onBlur={(e) => createUpdateValue(e.target.value)}
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
