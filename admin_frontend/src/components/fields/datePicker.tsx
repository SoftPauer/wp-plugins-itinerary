import { Button, makeStyles, TextField } from "@material-ui/core";
import { FC, useContext, useEffect, useState } from "react";
import { Field, IField,Costing} from "../../api/api";
import { useSectionContext } from "../../state/sectionProvider";
import { ModalContext } from "../../state/modals";
import { useValueContext } from "../../state/valueProvider";
import { DeleteValidationModal } from "../modals/deleteValidationModal";
import { useItineraryContext } from "../../state/itineraryProvider";


type AppDatePickerProps = {
  field: IField;
  index: string | undefined;
  preview: boolean;
  type: "time" | "date" | "datetime-local";
  listKey?: string;
};
interface IAppDatePickerState {
  inputString?: string;
}
const useStyles = makeStyles((theme) => ({
  appDateField: { marginTop: "20px", marginRight: "20px" },
}));

export const AppDatePicker: FC<AppDatePickerProps> = ({
  field,
  preview,
  type,
  index,
  listKey,
}) => {
  const [state, setState] = useState<IAppDatePickerState>();
  const { dispatch } = useContext(ModalContext);
  const classes = useStyles();
  const sectionContext = useSectionContext();
  const valueContext = useValueContext();
  const itinContext = useItineraryContext();
  const [deleteModelState, setDeleteModelState] = useState<boolean>(false);

  
  useEffect(() => {
    setState({ inputString: valueContext.getValue(field,index) });
  }, [valueContext,field,index]);

  function getKeys(newValue: any,oldValue:any, id:any){
    const oldListKey = listKey
    const newListKey = oldListKey?.replace(oldValue,newValue)
    processListKeyUpdate(newListKey, oldListKey, id)
  }

  const processListKeyUpdate = async (newListkey:string| undefined,oldListKey:string| undefined, id:any) => {
    if (newListkey && oldListKey){
    const newCosting = await Costing.updateCosting({
      newListKey: newListkey,
      ogListKey: oldListKey,
      id: id
    })
  }};

  return (
    <div className={classes.appDateField}>
      <TextField
        label={field.field_name}
        type={type}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(val) =>
          setState({ ...state, inputString: val.target.value })
        }
        value={state?.inputString}
        onBlur={() => {
          const ogListKey = valueContext.getValue(field, index)
          valueContext.updateValues({
            index: index,
            field: field,
            value: state?.inputString ?? "",
          });              
          getKeys(state?.inputString, ogListKey, itinContext.selected.id)
          valueContext.fetchData()
        }}
      />
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
