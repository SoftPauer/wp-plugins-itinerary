import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from "@material-ui/core";
import { FC, useState } from "react";

enum Emojis {
  "flights" = "✈️ ",
  "hotels" = "🏠 ",
  "hire_cars" = "🚗 ",
}

const Emoji = (props: {
  field: string;
  count: number;
  object: any;
  onClick?: () => void;
  isPrivate?: boolean;
}) => {
  if (props.count >= 1) {
    let tooltipPhrase = "";
    if (props.field === "flights") {
      tooltipPhrase =
        JSON.stringify(`${props.object["flightDate"]}`) +
        ", " +
        JSON.stringify(`${props.object["outboundAirportAbr"]}`) +
        ", " +
        JSON.stringify(`${props.object["inboundAirportAbr"]}`);
    } else if (props.field === "hire_cars") {
      tooltipPhrase =
        JSON.stringify(`${props.object["pickUp"]}`) +
        ", " +
        JSON.stringify(`${props.object["return"]}`) +
        ", " +
        JSON.stringify(`${props.object["carType"]}`);
    } else {
      tooltipPhrase =
        JSON.stringify(`${props.object["name"]}`) +
        ", " +
        JSON.stringify(`${props.object["city"]}`) +
        ", " +
        JSON.stringify(`${props.object["postcode"]}`);
    }
    return (
      <Tooltip
        title={tooltipPhrase.replace(/['"]+/g, "")}
        placement="top"
        arrow
      >
        <span onClick={props.onClick}>
          {Emojis[props.field as keyof typeof Emojis]}
        </span>
      </Tooltip>
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
      const index = replace.indexOf("+");
      const searchword =
        replace[0].toUpperCase() +
        replace.substring(1, index) +
        replace[index] +
        replace[index + 1].toLocaleUpperCase() +
        replace.substring(index + 2);
      window.location.search = "?page=itinerary-plugin-section" + searchword;
    } else {
      switch (booking) {
        case "flights": {
          window.location.search = "?page=itinerary-plugin-sectionFlights";
          break;
        }
        case "hire_cars": {
          window.location.search = "?page=itinerary-plugin-sectionHire+Cars";
          break;
        }
        case "hotels": {
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
                <Emoji
                  field={booking}
                  count={props.row[booking].length}
                  object={emojiObj}
                  onClick={() => {
                    handleEmojiClick(booking, emojiObj);
                  }}
                ></Emoji>
              );
            })}
          </TableCell>
        );
      })}
    </TableRow>
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

export const DashboardTable: FC<{ rows: Record<string, {}> }> = (props: {
  rows: Record<string, {}>;
}) => {
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
