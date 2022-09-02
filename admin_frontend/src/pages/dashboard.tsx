import { FC, useState, MouseEventHandler, useEffect } from "react";
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
  DataGrid,
  GridColumns,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowModel,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { ItinerarySelection } from "../components/itinerarySelection";
import { useItineraryContext } from "../state/itineraryProvider";
import { FieldProvider } from "../state/fieldProvider";
import { TrendingUpOutlined } from "@material-ui/icons";
import { Costing, ICosting, Itinerary, Report } from "../api/api";

enum Emojis {
  "Flight" = "✈️ ",
  "hotel" = "🏠 ",
  "cars" = "🚗 ",
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
      window.location.search = "?page=itinerary-plugin-section" + booking + "s";
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

  console.log(rows);

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
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          {`Total Cost: £${getRowsTotal()}`}
        </Typography>
      </GridToolbarContainer>
    );
  }

  const populateTable = async () => {
    let rows: any[] = [];
    const costingArr = await Costing.getCosting(itinContext.selected.id);

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
    <div style={{ height: 400, width: "100%" }}>
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
      ></DataGrid>
    </div>
  );
};

export const DashboardPage: FC<{}> = () => {
  const [userList, setUserList] = useState<Record<string, {}>>();

  const fetchData = async () => {
    const obj = await Report.getReport();
    setUserList(obj);
  };

  if (userList === undefined) {
    fetchData();
  }

  if (!userList) return <></>;

  console.log(userList);

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
