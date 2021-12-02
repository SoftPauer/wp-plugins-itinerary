import { Button, makeStyles, Typography } from "@material-ui/core";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import Collapsible from "react-collapsible";
import { Field, IValue, IValueCreate, Value } from "../../api/api";
import { FieldTypes } from "../../fieldTypes";
import { ISortedField } from "../../pages/sectionValues";
import { useItineraryContext } from "../../state/itineraryProvider";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";
import { FieldWrapper } from "../fieldWrapper";
import XLSX from "xlsx";
import { getValueFromExcelImport, unNeighborSortedFields } from "../../utils";
import { StyledDropzone } from "../styledDropzone";
import { useValueContext } from "../../state/valueProvider";

type ListProps = {
  field: ISortedField;
  values: IValue[];
  fieldValue: IValue | undefined;
  preview?: boolean;
  index: string | undefined;
};
const useStyles = makeStyles((theme) => ({
  listField: {
    marginTop: "20px",
    paddingTop: "10px",
    marginLeft: "-16px",
    paddingLeft: "16px",
    borderWidth: "1px",
    borderColor: "#ababab",
    borderStyle: "solid",
    minWidth: "900px",
    "& $listField": {
      borderBottom: "none",
      borderRight: "none",
      borderLeft: "none",
    },
    "& $controls": {
      justifyContent: "flex-start",
    },
  },
  groupInd: {
    backgroundColor: theme.palette.primary.main,
    width: "15px",
    height: "3px",
    marginRight: "5px",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
    marginBottom: "10px",
  },
}));
export const ListField: FC<ListProps> = ({
  field,
  values,
  fieldValue,
  index,
  preview = false,
}) => {
  const [length, setLength] = useState<number>(
    Number.parseInt(fieldValue?.value ?? (preview ? "1" : "0"))
  );
  const [state, setState] = useState<IValue | undefined>(fieldValue);
  const classes = useStyles();
  const { dispatch } = useContext(ModalContext);
  const itinContext = useItineraryContext();
  const sectionContext = useSectionContext();
  const valueContext = useValueContext();

  useEffect(() => {
    setState(fieldValue);
    setLength(Number.parseInt(fieldValue?.value ?? (preview ? "1" : "0")));
  }, [fieldValue, preview]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const data = await acceptedFiles[0].arrayBuffer();
    const workbook = XLSX.read(data);
    const js_sheet = XLSX.utils.sheet_to_json(workbook.Sheets["SheetJS"], {
      blankrows: false,
    });
    addEntry(js_sheet.length, true);
    const values = wsDataToValues(
      unNeighborSortedFields(field.children),
      js_sheet
    );
    Value.createValueOrUpdate(values).then((res) => {
      valueContext.updateValues();
    });
  }, []);

  const fillFields = () => {
    const listElements: JSX.Element[] = [];
    let userFriendlyIndex = 0;
    for (let i = 0; i < length; i++) {
      const fields: JSX.Element[] = [];
      if (fieldValue?.value_properties?.deleted?.includes(i.toString())) {
        continue;
      }
      userFriendlyIndex++;
      field.children.forEach((c) => {
        fields.push(
          <FieldWrapper
            field={c}
            values={values}
            index={index + "." + i.toString()}
            preview={preview}
            key={c.field.id}
          ></FieldWrapper>
        );
      });
      fields.push(
        <div key={i + "buttons"}>
          {!preview && (
            <Button
              onClick={() => {
                if (fieldValue)
                  Value.listDelete(fieldValue?.id, i).then((res) => {
                    if (res === 1) {
                    }
                  });
              }}
            >
              Remove
            </Button>
          )}
        </div>
      );
      listElements.push(
        <Collapsible
          open={false}
          transitionTime={250}
          trigger={
            <div className={classes.header}>
              <div className={classes.groupInd}></div>
              <Typography variant="h5" component="h3">
                {`${field.field.field_name} ${userFriendlyIndex}`}
              </Typography>
            </div>
          }
        >
          <div key={i + "listElem"} className={classes.listField}>
            {fields}
          </div>
        </Collapsible>
      );
    }
    return listElements;
  };
  const fieldsToWsData = (fields: ISortedField[]) => {
    const ws_data: any[] = [];
    let ws_row: any[] = [];
    let ws_row_value: any[] = [];

    fields.forEach((e) => {
      switch (e.field.field_type) {
        case FieldTypes.list:
          if (ws_row.length > 0) {
            ws_data.push(ws_row);
            ws_data.push(ws_row_value);
            ws_row_value = [];
            ws_row = [];
          }
          ws_data.push([e.field.field_name]);
          ws_data.push(...fieldsToWsData(e.children));
          ws_data.push(["EOL " + e.field.field_name]);
          break;
        default:
          ws_row.push(e.field.field_name);
          ws_row_value.push("");
          break;
      }
    });
    if (ws_row.length > 0) {
      ws_data.push(ws_row);
      ws_data.push(ws_row_value);
      ws_row_value = [];
      ws_row = [];
    }
    return ws_data;
  };

  const wsDataToValues = (fields: ISortedField[], data: any[]) => {
    const values: IValueCreate[] = [];
    data.forEach((el, i) => {
      fields.forEach((f) => {
        if (itinContext.selected && sectionContext.selectedSection) {
          values.push({
            section: sectionContext.selectedSection.id,
            itinerary: itinContext.selected.id,
            field: f.field.id,
            value: getValueFromExcelImport(el, f.field),
            list_index: index + "." + i.toString(),
          });
        }
      });
    });

    return values;
  };

  const generateUploadTemplate = () => {
    var workBook = XLSX.utils.book_new();
    var ws_name = "SheetJS";
    /* make worksheet */
    var ws_data = fieldsToWsData(unNeighborSortedFields(field.children));

    // var ws =XLSX.utils.json_to_sheet(fieldContext.fields);
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(workBook, ws, ws_name);
    XLSX.writeFile(workBook, "out.xlsb");
  };

  const addEntry = async (entryCount?: number, reset?: boolean) => {
    const value = entryCount ?? length + 1;
    let value_properties = state?.value_properties;

    if (reset) {
      if (!value_properties) {
        value_properties = { deleted: [] };
      } else {
        value_properties.deleted = [];
      }
    }

    if (itinContext.selected && sectionContext.selectedSection) {
      const res = await Value.createValueOrUpdate([
        {
          section: sectionContext.selectedSection.id,
          itinerary: itinContext.selected.id,
          field: field.field.id,
          value: value.toString(),
          list_index: index,
          id: state?.id,
          value_properties: value_properties,
        },
      ]);
      if ((res as IValue).id) {
        setState(res as IValue);
        setLength(value);
      } else {
        setLength(value);
      }
    }
  };

  return (
    <div>
      <div>
        <div style={{ display: "flex" }}>
          {preview && (
            <div>
              <Button
                onClick={() => {
                  Field.deleteField(field.field.id);
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
                      field: field.field,
                    },
                  });
                }}
              >
                edit
              </Button>
            </div>
          )}
        </div>
        <div>{fillFields()}</div>
      </div>
      {!preview && (
        <div className={classes.controls}>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              if (fieldValue) {
                Value.deleteValue(fieldValue?.id).then((res) => {
                  valueContext.updateValues();
                });
              }
            }}
          >
            Clear list
          </Button>
          <Button
            style={{ marginLeft: "10px" }}
            color="primary"
            variant="contained"
            onClick={() => addEntry()}
          >
            {"+ Add another " + field.field.field_name}
          </Button>
          <Button
            style={{ marginLeft: "10px" }}
            color="secondary"
            variant="contained"
            onClick={() => {
              generateUploadTemplate();
            }}
          >
            Get upload template
          </Button>
          <StyledDropzone onDrop={onDrop}></StyledDropzone>
        </div>
      )}
    </div>
  );
};
