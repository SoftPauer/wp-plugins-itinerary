import MultiSelect from "@antlerengineering/multiselect";
import { Button, FormControl, makeStyles } from "@material-ui/core";
import { FC, useContext, useEffect, useState } from "react";
import { Field, IField, IValue, Value } from "../../api/api";
import {
  IDataSourceOptions,
  useDataSourceContext,
} from "../../state/dataSourceProvider";
import { useItineraryContext } from "../../state/itineraryProvider";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";

type AppSelectFieldProps = {
  field: IField;
  fieldValue: IValue | undefined;
  preview: boolean;
  index: string | undefined;
};
const useStyles = makeStyles((theme) => ({
  appSelectFieldField: { marginTop: "20px", marginRight: "20px" },
}));
export const AppSelectField: FC<AppSelectFieldProps> = ({
  field,
  fieldValue,
  index,
  preview,
}) => {
  const [state, setState] = useState<string[]>([]);
  const [value, setvalue] = useState<IValue | undefined>(fieldValue);
  const [options, setOptions] = useState<IDataSourceOptions | null>(null);
  const { dispatch } = useContext(ModalContext);
  const itinContext = useItineraryContext();
  const sectionContext = useSectionContext();
  const dataSourceContext = useDataSourceContext();
  const classes = useStyles();
  useEffect(() => {
    let state;
    setvalue(fieldValue);
    if (fieldValue?.value) {
      try {
        state = JSON.parse(fieldValue.value);
      } catch (error) {
        state = [];
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
  }, [
    fieldValue,
    field.type_properties?.data_source,
    index,
    field.type_properties?.data_source_properties,
    dataSourceContext,
  ]);

  const createUpdateValue = async () => {
    if (itinContext.selected && sectionContext.selectedSection) {
      const res = await Value.createValueOrUpdate([{
        section: sectionContext.selectedSection.id,
        itinerary: itinContext.selected.id,
        field: field.id,
        value: JSON.stringify(state),
        list_index: index,
        id: value?.id,
      }]);
      if ((res as IValue).id) {
        setvalue(res as IValue);
      } else {
      }
    }
  };

  return (
    <div className={classes.appSelectFieldField}>
      <FormControl>
        <MultiSelect
          value={state}
          onChange={setState}
          options={options?.options ?? []}
          labelPlural={options?.labelPlural}
          label={options?.label}
          onClose={createUpdateValue}
        />
      </FormControl>
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
