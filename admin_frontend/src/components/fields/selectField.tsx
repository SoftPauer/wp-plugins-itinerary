import MultiSelect from "@antlerengineering/multiselect";
import { Button, FormControl, makeStyles } from "@material-ui/core";
import { FC, useContext, useEffect, useState } from "react";
import { Costing, Field, IField } from "../../api/api";
import {
  IDataSourceOptions,
  useDataSourceContext,
} from "../../state/dataSourceProvider";
import { useItineraryContext } from "../../state/itineraryProvider";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";
import { useValueContext } from "../../state/valueProvider";
import { DeleteValidationModal } from "../modals/deleteValidationModal";

type AppSelectFieldProps = {
  field: IField;
  preview: boolean;
  index: string | undefined;
  listKey?: string;
};
const useStyles = makeStyles((theme) => ({
  appSelectFieldField: { marginTop: "20px", marginRight: "20px" },
}));
export const AppSelectField: FC<AppSelectFieldProps> = ({
  field,
  index,
  preview,
  listKey,
}) => {
  const [state, setState] = useState<string[]>([]);
  const [options, setOptions] = useState<IDataSourceOptions | null>(null);
  const { dispatch } = useContext(ModalContext);
  const sectionContext = useSectionContext();
  const valueContext = useValueContext();
  const itinContext = useItineraryContext();
  const dataSourceContext = useDataSourceContext();
  const [deleteModelState, setDeleteModelState] = useState<boolean>(false);

  const classes = useStyles();
  useEffect(() => {
    let state;
    const val = valueContext.getValue(field, index);
    if (val) {
      try {
        state = JSON.parse(val);
      } catch (error) {
        state = val;
      }
      setState(state);
    }
    async function fetchData() {
      setOptions(
        dataSourceContext.resolveDataSource(
          field.type_properties?.data_source ?? "",
          field.type_properties?.data_source_properties,
          index
        )
      );
    }
    fetchData();
  }, [index, field, dataSourceContext, valueContext]);

  const handleChange = (stateList: string[]) => {
    state.filter((element) => {
      if (!stateList.includes(element)) {
        console.log(element);
        if (listKey) {
          Costing.deleteCosting(itinContext.selected.id, {
            name: element,
            list_key: listKey,
          });
        }
      }
    });
    setState(stateList);
  };

  return (
    <div className={classes.appSelectFieldField}>
      <FormControl>
        <MultiSelect
          value={state}
          onChange={(e) => {
            handleChange(e);
          }}
          options={options?.options ?? []}
          labelPlural={options?.labelPlural}
          label={options?.label}
          onClose={() => {
            valueContext.updateValues({
              field: field,
              value: JSON.stringify(state),
              index: index,
            });
          }}
        />
      </FormControl>

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
