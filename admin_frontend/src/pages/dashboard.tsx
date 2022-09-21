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
  Tooltip,
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
import {
  IItineraryContext,
  useItineraryContext,
} from "../state/itineraryProvider";
import { FieldProvider } from "../state/fieldProvider";
import { TrendingUpOutlined } from "@material-ui/icons";
import { Costing, ICosting, Itinerary, Report } from "../api/api";
import { fork } from "cluster";
import { CostSelection } from "../components/costSelection";
import { useSectionContext } from "../state/sectionProvider";

enum Emojis {
  "Flight" = "✈️ ",
  "hotel" = "🏠 ",
  "cars" = "🚗 ",
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

const DashboardRow = (props: {
  row: any;
  name: string;
  sections: string[];
}) => {
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
      switch (booking) {
        case "Flight": {
          window.location.search =
            "?page=itinerary-plugin-section" + booking + "s";
          break;
        }
        case "cars": {
          window.location.search = "?page=itinerary-plugin-sectionHire+Cars";
          break;
        }
        case "hotel": {
          window.location.search = "?page=itinerary-plugin-sectionHotels";
          break;
        }
      }
    }
  };

  let objectArr: any = {};

  for (const key in props.sections) {
    if (props.row[props.sections[key]] !== undefined) {
      objectArr[props.sections[key]] = props.row[props.sections[key]];
    } else {
      objectArr[props.sections[key]] = [];
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
      {props.sections.map((booking, index) => {
        return (
          <TableCell align="center">
            {objectArr[booking].map((emojiObj: {}) => {
              return (
                //<Tooltip children={Emoji}>
                <Emoji
                  field={booking}
                  count={props.row[booking].length}
                  onClick={() => {
                    handleEmojiClick(booking, emojiObj);
                  }}
                ></Emoji>
                //</Tooltip>
              );
            })}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

const DashboardTable = (props: { rows: Record<string, {}> }) => {
  const rowArray = [];
  const headArr: string[] = [];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { rows } = props;

  for (const key in rows) {
    rowArray.push(key);
    for (const section in rows[key]) {
      if (!headArr.includes(section)) {
        headArr.push(section);
      }
    }
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
                  <DashboardRow
                    row={rows[name]}
                    name={name}
                    sections={headArr}
                  ></DashboardRow>
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

const ReportsGrid = ({ costs }: { costs: ICosting[] }) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const itinContext = useItineraryContext();

  useEffect(() => {
    const populateTable = async (costs: ICosting[]) => {
      let rows: any[] = [];

      costs.some((element) => {
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

    if (costs.length !== 0) {
      populateTable(costs);
    }
  }, [costs]);

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

  return (
    <div style={{ height: 400, width: "100%" }}>
      <CostSelection sections={costs}></CostSelection>
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
  const [costingArray, setCostingArray] = useState<ICosting[]>([]);
  const itinContext = useItineraryContext();

  useEffect(() => {
    const fetchData = async () => {
      const obj = await Report.getReport(itinContext.selected.id);
      setUserList(obj);
      const costObj = await Costing.getCosting(itinContext.selected.id);
      setCostingArray(costObj);
    };

    if (itinContext.selected.id !== -1) {
      fetchData();
    }
  }, [itinContext.selected.id]);

  const sectionContext = useSectionContext();

  if (!userList) return <></>;

  return (
    <div>
      <ItinerarySelection></ItinerarySelection>
      <DashboardTable rows={userList}></DashboardTable>
      <ReportsGrid costs={costingArray}></ReportsGrid>
    </div>
  );
};

const DashboardHead = (props: { section: string }) => {
  const title: string = props.section;
  const titleCapital: string = title[0].toUpperCase() + title.substring(1);
  if (props.section.includes("_")) {
    const replace = titleCapital.replaceAll("_", " ");
    return <TableCell align="center">{replace}</TableCell>;
  } else {
    return <TableCell align="center">{titleCapital}</TableCell>;
  }
};
