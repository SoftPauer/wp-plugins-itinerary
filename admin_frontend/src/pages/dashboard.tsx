import { FC, useState, MouseEventHandler, useEffect } from "react";
import data from "./dummyData.json";
import {
  TableContainer,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
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
import { ItinerarySelection } from "../components/itinerarySelection";
import { useItineraryContext } from "../state/itineraryProvider";
import { FieldProvider } from "../state/fieldProvider";
import { TrendingUpOutlined } from "@material-ui/icons";
import { Costing, ICosting, Itinerary } from "../api/api";

enum Emojis {
  "Flights" = "✈️ ",
  "Hotels" = "🏠 ",
  "Hire_Cars" = "🚗 ",
  "Private" = "☑️",
}

const Emoji = (props: {
  field: string;
  count: number;
  onClick?: () => void;
  isPrivate?: boolean;
}) => {
  if (props.count >= 1) {
    return (
      <span onClick={props.onClick}>
        {Emojis[props.field as keyof typeof Emojis]}
      </span>
    );
  } else {
    return <span></span>;
  }
};

const DashboardRow = (props: { row: any; name: string }) => {
  const handleEmojiClick = (booking: string, items: {}) => {
    if (items) {
      localStorage.setItem("items", JSON.stringify(items));
      localStorage.setItem("name", JSON.stringify(props.name));
    }
    if (booking && booking.includes("_")) {
      const word: string = booking;
      const replace = word.replaceAll("_", "+");
      window.location.search = "?page=itinerary-plugin-section" + replace;
    } else {
      window.location.search = "?page=itinerary-plugin-section" + booking;
    }
  };

  const keyArr = [];
  var isPrivate: boolean = false;

  for (const key in props.row) {
    if (key !== "Private") {
      keyArr.push(key);
    } else {
      isPrivate = props.row[key][0];
    }
  }

  return (
    <TableRow>
      {/* <style>
        Emoji{
          cursor: pointer;
        }
      </style> */}
      <TableCell align="left">{props.name}</TableCell>
      {keyArr.map((booking, index) => {
        return (
          <TableCell align="center">
            {props.row[booking].map((emojiObj: {}) => {
              return (
                <Emoji
                  field={booking}
                  count={props.row[booking].length}
                  onClick={() => {
                    handleEmojiClick(booking, emojiObj);
                  }}
                  isPrivate={isPrivate}
                ></Emoji>
              );
            })}
          </TableCell>
        );
      })}
      <TableCell align="center">
        {isPrivate === true && <Emoji field={"Private"} count={1}></Emoji>}
        {isPrivate === false && <span></span>}
      </TableCell>
    </TableRow>
  );
};

const DashboardTable = (props: { rows: Record<string, {}> }) => {
  const rowArray = [];
  const headArr = [];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { rows } = props;
  for (const key in rows) {
    const value: any = rows[key];
    rowArray.push(key);
  }

  for (const item in rows[rowArray[0]]) {
    headArr.push(item);
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <ItinerarySelection></ItinerarySelection>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left" width={200}>
                Name
              </TableCell>
              {headArr.map((name) => {
                return <DashboardHead section={name}></DashboardHead>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowArray
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .sort()
              .map((name) => {
                return (
                  <DashboardRow row={rows[name]} name={name}></DashboardRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25]}
        component="div"
        count={rowArray.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

const ReportsTable = (props: { rows: Record<string, {}> }) => {
  const rowArray = [];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCost, setTotalCost] = useState(0);
  const { rows } = props;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Flight Class</TableCell>
              <TableCell>Cost</TableCell>
            </TableRow>
          </TableHead>

          <TableRow>
            <TableCell rowSpan={6} />
            <TableCell align="right">Total</TableCell>
            <TableCell>{totalCost}</TableCell>
          </TableRow>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25]}
        component="div"
        count={rowArray.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

const ReportsGrid = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const itinContext = useItineraryContext();

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

  function TotalCost() {
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

  const populateTable = async () => {
    let rows: any[] = [];
    const costingArr = await Costing.getCosting();

    costingArr.some((element) => {
      const costingObj = JSON.parse(element.costing);
      if (costingObj.units.Passenger) {
        rows.push({
          id: randomId(),
          name: costingObj.units.Passenger,
          cost: costingObj.units.Price,
          fareType: costingObj.units.FareType,
        });
      }
    });

    setRows(rows);
  };

  populateTable();

  return (
    <div>
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
      ></DataGrid>
    </div>
  );
};

export const DashboardPage: FC<{}> = () => {
  const itinContext = useItineraryContext();
  const [userList, setUserList] = useState(data);

  if (!userList) return <></>;

  return (
    <div>
      <DashboardTable rows={userList}></DashboardTable>
      <ReportsGrid></ReportsGrid>
    </div>
  );
};

const DashboardHead = (props: { section: string }) => {
  if (props.section.includes("_")) {
    const word: string = props.section;
    const replace = word.replaceAll("_", " ");
    return <TableCell align="center">{replace}</TableCell>;
  } else {
    return <TableCell align="center">{props.section}</TableCell>;
  }
};
