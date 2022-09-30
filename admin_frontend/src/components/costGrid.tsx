import { Button, Checkbox, Table, Typography } from "@material-ui/core";
import {
  DataGrid,
  GridColumns,
  GridRowModel,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import * as docx from "docx";
import { randomId } from "@mui/x-data-grid-generator";
import { FC, useEffect, useState } from "react";
import { ICosting, ISection } from "../api/api";
import { useSectionContext } from "../state/sectionProvider";
import { CostSelection } from "./costSelection";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export const ReportsGrid: FC<{ costs: ICosting[] }> = ({
  costs,
}: {
  costs: ICosting[];
}) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [costSection, setCostSection] = useState<ISection>();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const sectionContext = useSectionContext();

  useEffect(() => {
    const populateTable = async (costs: ICosting[]) => {
      let rows: any[] = [];

      costs.some((element) => {
        const costingObj = JSON.parse(element.costing);
        if (costingObj.units.Passenger && costSection?.id === undefined) {
          rows.push({
            id: randomId(),
            name: costingObj.units.Passenger,
            class: sectionContext.sections.find(
              (s) => s.id === element.section_id
            )?.name,
            key: element.listKey,
            cost: costingObj.units.Price,
            fareType: costingObj.units.FareType,
          });
        } else if (
          costingObj.units.Passenger &&
          element.section_id === costSection?.id
        ) {
          rows.push({
            id: randomId(),
            name: costingObj.units.Passenger,
            class: sectionContext.sections.find(
              (s) => s.id === element.section_id
            )?.name,
            key: element.listKey,
            cost: costingObj.units.Price,
            fareType: costingObj.units.FareType,
          });
        }
      });

      setRows(rows);
    };

    if (costs.length !== 0) {
      populateTable(costs);
    }
  }, [costs, costSection]);

  const handleChange = (e: any) => {
    console.log(e.target.value);
    setCostSection(
      sectionContext.sections.find((s) => s.name === e.target.value)
    );
  };

  const columns: GridColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      field: "class",
      headerName: "Class",
      width: 400,
      disableExport: true,
    },
    {
      field: "key",
      headerName: "Key",
      width: 400,
      disableExport: true,
    },
    {
      field: "fareType",
      headerName: "Type",
      width: 300,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        "Business Class",
        "Economy Class",
        "First Class",
        "Single Room",
        "Double Room",
        "Twin Room",
        "5 Seater",
        "6 Seater",
        "12 Seater",
      ],
    },
    {
      field: "cost",
      headerName: "Cost",
      align: "right",
      width: 200,
      editable: true,
      valueFormatter: ({ value }) => currencyFormatter.format(value),
    },
  ];

  const currencyFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  });

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };
  interface TotalCostProps {
    rows: any[];
  }

  function groupArrayOfObjects(list: ICosting[], key: keyof ICosting) {
    return list.reduce(function (rv: any, x: ICosting) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  const handleCLick = () => {
    const groups: any = groupArrayOfObjects(costs, "section_id");
  };

  function TotalCost() {
    const getRowsTotal = () => {
      return rows.reduce((accumilator, row) => {
        return accumilator + parseFloat(row.cost);
      }, 0);
    };
    return (
      <GridToolbarContainer>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          {`Total Cost: £${getRowsTotal()}`}
        </Typography>
      </GridToolbarContainer>
    );
  }

  function customToolBar() {
    return (
      <GridToolbarContainer>
        <GridToolbarDensitySelector />
        <Button
          color="secondary"
          startIcon={<FileDownloadIcon />}
          onClick={() => {
            handleCLick();
          }}
        >
          Export
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <div style={{ height: 400, width: "100%" }}>
      <CostSelection
        sections={costs}
        handleChange={handleChange}
      ></CostSelection>
      <DataGrid
        rows={rows}
        columns={columns}
        rowModesModel={rowModesModel}
        processRowUpdate={processRowUpdate}
        density="compact"
        //onCellEditStop={handleCellEditStop}
        components={{
          Footer: TotalCost,
          Toolbar: customToolBar,
        }}
        componentsProps={{
          footer: { rows },
        }}
        experimentalFeatures={{ newEditingApi: true }}
      ></DataGrid>
    </div>
  );
};
