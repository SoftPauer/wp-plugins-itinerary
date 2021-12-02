import { Button, makeStyles, TextField } from "@material-ui/core";
import { FC, useContext, useEffect, useState } from "react";
import { Field, IField, IValue, Value } from "../../api/api";
import { useItineraryContext } from "../../state/itineraryProvider";
import { useSectionContext } from "../../state/sectionProvider";
import { ModalContext } from "../../state/modals";

type AppDatePickerProps = {
  field: IField;
  fieldValue: IValue | undefined;
  index: string | undefined;
  preview: boolean;
  type: "time" | "date" | "datetime-local";
};
interface IAppDatePickerState {
  value?: IValue;
  inputString?: string;
}
const useStyles = makeStyles((theme) => ({
  appDateField: { marginTop: "20px", marginRight: "20px" },
}));

export const AppDatePicker: FC<AppDatePickerProps> = ({
  field,
  fieldValue,
  index,
  preview,
  type,
}) => {
  const [state, setState] = useState<IAppDatePickerState>();
  const { dispatch } = useContext(ModalContext);
  const classes = useStyles();
  const itinContext = useItineraryContext();
  const sectionContext = useSectionContext();
  useEffect(() => {
    setState({ inputString: fieldValue?.value??"", value: fieldValue });
  }, [fieldValue]);

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
        onBlur={(e) => createUpdateValue(e.target.value)}
      />
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
