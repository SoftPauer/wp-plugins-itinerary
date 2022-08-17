import { Button, makeStyles, Typography } from "@material-ui/core";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import Collapsible, { CollapsibleProps } from "react-collapsible";
import { Field } from "../../api/api";
import { ISortedField } from "../../pages/sectionValues";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";
import { FieldWrapper } from "../fieldWrapper";
import XLSX from "xlsx-js-style";
import { StyledDropzone } from "../styledDropzone";
import { useValueContext } from "../../state/valueProvider";
import { wsDataToValues } from "../../helpers/sheetUtils";
import { useSheetContext } from "../../state/sheetProvider";
import { useFieldContext } from "../../state/fieldProvider";
import { SatelliteSharp } from "@material-ui/icons";
import el from "date-fns/esm/locale/el/index.js";

type ListProps = {
  field: ISortedField;
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
export const ListField: FC<ListProps> = ({ field, index, preview = false }) => {
  const [length, setLength] = useState<number>(
    Number.parseInt(preview ? "1" : "0")
  );

  const handleClose = () => {
    localStorage.removeItem("items");
    localStorage.removeItem("name");
  };

  const states: boolean[] = [];

  const classes = useStyles();
  const { dispatch } = useContext(ModalContext);
  const sectionContext = useSectionContext();
  const { fieldsToWsData } = useSheetContext();
  const {
    getListFieldLength,
    values,
    getValue,
    updateValues,
    fetchData,
    deleteItem,
  } = useValueContext();
  const fieldContext = useFieldContext();

  const [key, setKey] = useState<string>("");
  const local = localStorage.getItem("items");
  let compareKey: string = "";

  useEffect(() => {
    const length = getListFieldLength(field.field, index);
    setLength(Number.parseInt(preview ? "1" : length.toString()));
    if (local !== null) {
      const items = JSON.parse(local);
      const firstKey = Object.keys(items)[0];
      switch (firstKey) {
        case "flightDate":
          setKey(
            `${items["flightDate"]},${items["outboundAirportAbr"]},${items["inboundAirportAbr"]}`
          );
          break;
        case "name": //hotel name
          const nameItem = localStorage.getItem("name");
          if (nameItem) {
            const name = JSON.parse(nameItem);
            for (let i = 0; i < items["guests"].length; i++) {
              if (items["guests"][i]["name"] === name) {
                setKey(
                  `${items["name"]}/${name},${items["guests"][i]["checkIn"]},${items["guests"][i]["checkOut"]}`
                );
              }
            }
            break;
          }
          break;
        case "carType":
          setKey(`${items["mainDriver"]}`);
          break;
      }
    }
  }, [getListFieldLength, preview, values, field.field, index]);

  for (let i = 0; i < length; i++) {
    states.push(false);
  }
  if (sectionContext.selectedItem !== undefined) {
    states[sectionContext.selectedItem] = true;
  }

  const addEntry = async () => {
    let val = [];
    try {
      const v = getValue(field.field, index);
      console.log(v);
      if (typeof v === "string") {
        val = JSON.parse(getValue(field.field, index)) ?? [];
      } else {
        val = v;
      }
    } catch (error) {
      console.log(error);
    }
    val.push({});
    updateValues({
      index: index,
      field: field.field,
      value: JSON.stringify(val),
    });
    fetchData(); // react not working very well... useEffect not firing after values change
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const data = await acceptedFiles[0].arrayBuffer();
      const workbook = XLSX.read(data);
      const values = wsDataToValues(
        field,
        index ?? "0",
        0,
        workbook.Sheets["SheetJS"]
      );
      updateValues({
        field: field.field,
        index,
        value: JSON.stringify(values.values),
      });
      fetchData();
    },
    [updateValues, field, index, fetchData]
  );

  const fillFields = () => {
    const listElements: JSX.Element[] = [];
    for (let i = 0; i < length; i++) {
      const fields: JSX.Element[] = [];
      let key_string = "";
      if (field.field.type_properties?.key_fields)
        for (
          let j = 0;
          j < field.field.type_properties?.key_fields?.length;
          j++
        ) {
          const keyField = fieldContext.getFieldById(
            Number.parseInt(field.field.type_properties?.key_fields[j])
          );
          if (keyField) {
            key_string += getValue(keyField, index + "." + i.toString());
          }
          if (j < field.field.type_properties?.key_fields?.length - 1) {
            key_string += ",";
          }
        }
      field.children.forEach((c) => {
        fields.push(
          <FieldWrapper
            field={c}
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
                deleteItem(field.field, index + "." + i.toString());
                fetchData();
              }}
            >
              Remove
            </Button>
          )}
        </div>
      );
      const compareKeys = (elementKey: string, compareKey: string) => {
        if (compareKey.includes("/")) {
          const index = compareKey.indexOf("/");
          const hotel = compareKey.substring(0, index);
          const guest = compareKey.substring(index + 1);
          return elementKey === hotel || elementKey === guest ? true : false;
        } else {
          return elementKey === compareKey ? true : false;
        }
      };
      listElements.push(
        <Collapsible
          open={local === null ? false : compareKeys(key_string, key)}
          transitionTime={250}
          trigger={
            <div className={classes.header}>
              <div className={classes.groupInd}></div>
              <Typography variant="h5" component="h3">
                {`${field.field.field_name}`}
              </Typography>
              <Typography
                style={{ paddingLeft: 5 }}
                variant="body1"
                component="p"
              >{`(${key_string})`}</Typography>
            </div>
          }
          className={`${i}`}
          onClose={() => {
            handleClose();
          }}
        >
          <div key={i + "listElem"} className={classes.listField}>
            {fields}
          </div>
        </Collapsible>
      );
    }

    return listElements;
  };

  const generateUploadTemplate = () => {
    var workBook = XLSX.utils.book_new();
    var ws_name = "SheetJS";
    /* make worksheet */
    var ws_data = fieldsToWsData(field, index ?? "0");

    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws["!cols"] = [
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
    ];

    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(workBook, ws, ws_name);
    XLSX.writeFile(
      workBook,
      (sectionContext.selectedSection?.name ?? "out") + ".xlsx"
    );
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
              updateValues({
                index: index,
                field: field.field,
                value: "[]",
              });
              fetchData();
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
