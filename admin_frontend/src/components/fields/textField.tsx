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
import { Field, IField, Costing } from "../../api/api";
import {
  IDataSourceOptions,
  useDataSourceContext,
} from "../../state/dataSourceProvider";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";
import { useValueContext } from "../../state/valueProvider";
import { DeleteValidationModal } from "../modals/deleteValidationModal";
import { useItineraryContext } from "../../state/itineraryProvider";
import { FieldProvider } from "../../state/fieldProvider";


type AppTextFieldProps = {
  field: IField;
  preview: boolean;
  index: string | undefined;
  listKey?: string;
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
  listKey,
}) => {
  const [state, setState] = useState<IAppTextFieldState>();
  const [options, setOptions] = useState<IDataSourceOptions | null>(null);
  const classes = useStyles();
  const { dispatch } = useContext(ModalContext);
  const sectionContext = useSectionContext();
  const valueContext = useValueContext();
  const dataSourceContext = useDataSourceContext();
  const [deleteModelState, setDeleteModelState] = useState<boolean>(false);
  const itinContext = useItineraryContext();

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

  function getKeys(newValue: any,oldValue:any,id: any){
    if (oldValue){
      const oldListKey = listKey
      const newListKey = oldListKey?.replace(oldValue,newValue)  
      processListKeyUpdate(newListKey, oldListKey, id)
  }}

  const processListKeyUpdate = async (newListkey:string| undefined,oldListKey:string| undefined, id:any) => {
    if (newListkey && oldListKey){
    const newCosting = await Costing.updateCosting({
      newListKey: newListkey,
      ogListKey: oldListKey,
      id: id
    })
  }};

  return (
    <div className={classes.appTextField}>
      {!field.type_properties?.data_source && (
        <TextField
          style={{ width: "300px", marginRight: "20px" }}
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
            const ogListKey = valueContext.getValue(field, index)
            valueContext.updateValues({
              field: field,
              value: state?.inputString ?? "",
              index: index,
            });
            valueContext.fetchData()
            console.log()
            getKeys(state?.inputString, ogListKey, itinContext.selected.id)
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
            <MenuItem defaultValue={""}>None</MenuItem>
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

      <DeleteValidationModal
        open={deleteModelState}
        handleClose={() => {
          setDeleteModelState(false);
        }}
        handleDelet={() => {
          Field.deleteField(field.id);
          setDeleteModelState(false);
          window.location.reload();
        }}
      ></DeleteValidationModal>

      {!preview && <div></div>}
      {preview && (
        <div>
          <Button
            onClick={(e) => {
              setDeleteModelState(true);
              //Field.deleteField(field.id);
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
