import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColumns,
  GridRowParams,
  MuiEvent,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridCellParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { Button, Typography } from "@mui/material";
import { FC, useContext, useEffect, useState } from "react";
import {
  IDataSourceOptions,
  useDataSourceContext,
} from "../../state/dataSourceProvider";
import { useSectionContext } from "../../state/sectionProvider";
import { useValueContext } from "../../state/valueProvider";

import { Costing, Field, IField } from "../../api/api";
import { ModalContext } from "../../state/modals";
import styles from "./table.module.css";
import { Theme, makeStyles } from "@material-ui/core";
import Collapsible from "react-collapsible";
import { useItineraryContext } from "../../state/itineraryProvider";

type costingTableFieldProps = {
  field: IField;
  preview: boolean;
  index: string | undefined;
  listKey?: string;
};

interface IAppTextFieldState {
  inputString?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
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

const style: any = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: "90%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface TotalCostProps {
  rows: any[];
}

function TotalCost(props: TotalCostProps) {
  const { rows } = props;

  const getRowsTotal = () => {
    return rows.reduce((accumilator, row) => {
      return accumilator + parseFloat(row.cost);
    }, 0);
  };
  return (
    <GridToolbarContainer>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        {`Total Cost: £${getRowsTotal()}`}
      </Typography>
    </GridToolbarContainer>
  );
}

export const PassengersTable: FC<costingTableFieldProps> = ({
  field,
  index,
  preview = false,
  listKey,
}) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [state, setState] = useState<IAppTextFieldState>();
  const [options, setOptions] = useState<IDataSourceOptions | null>(null);
  const [passengers, setPassengers] = useState([]);
  const { dispatch } = useContext(ModalContext);
  const classes = useStyles();
  const apiRef = useGridApiRef();
  const itinContext = useItineraryContext();

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
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
  }, [valueContext.values, field, dataSourceContext, index, valueContext]);

  useEffect(() => {
    populateTable();
  }, [options]);

  const populateTable = async () => {
    let rows: any[] = [];
    const passengers = options?.options ?? [];
    const costingArr = await Costing.getCosting(itinContext.selected.id);

    passengers.forEach((passenger) => {
      costingArr.some((element) => {
        const costingObj = JSON.parse(element.costing);
        if (
          costingObj.units.Passenger === passenger &&
          element.listKey === listKey
        ) {
          rows.push({
            id: randomId(),
            name: costingObj.units.Passenger,
            cost: costingObj.units.Price,
            fareType: costingObj.units.FareType,
          });
        }
      });
    });

    setRows(rows);
  };

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    valueContext.updateValues({
      field: field,
      value: JSON.stringify(state),
      index: index,
    });
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const currencyFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const columns: GridColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      field: "fareType",
      headerName: "Fare Type",
      width: 200,
      editable: true,
      type: "singleSelect",
      valueOptions: ["Business Class", "Economy Class", "First Class"],
    },
    {
      field: "cost",
      headerName: "Cost",
      width: 200,
      editable: true,
      valueFormatter: ({ value }) => currencyFormatter.format(value),
    },
  ];

  const handleCellEditStop = () => {
    let row = apiRef.current.getEditRowsModel();
    console.log(row);
  };
  return (
    <div style={{ width: "100%" }}>
      <Collapsible
        open={false}
        transitionTime={250}
        trigger={
          <div className={classes.header}>
            <div className={classes.groupInd}></div>

            <Typography id={index} variant="h5" component="h3">
              {"Costing"}
            </Typography>
          </div>
        }
        classParentString={styles.tableColapse}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowModesModel={rowModesModel}
          processRowUpdate={processRowUpdate}
          density="compact"
          //onCellEditStop={handleCellEditStop}
          components={{
            Footer: TotalCost,
          }}
          componentsProps={{
            footer: { rows },
          }}
          experimentalFeatures={{ newEditingApi: true }}
          style={{ height: 400, width: "100%" }}
        />
      </Collapsible>
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
