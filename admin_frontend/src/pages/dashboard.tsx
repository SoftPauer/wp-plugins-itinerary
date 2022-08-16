import { FC, useState, MouseEventHandler, useEffect } from "react";
import data from "./dummyData.json";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { ItinerarySelection } from "../components/itinerarySelection";
import { useItineraryContext } from "../state/itineraryProvider";
import { FieldProvider } from "../state/fieldProvider";

enum Emojis {
  "Flights" = "✈️",
  "Hotels" = "🏠",
  "Hire_Cars" = "🚗",
}

const Emoji = (props: {
  field: string;
  count: number;
  onClick: () => void;
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
      localStorage.setItem("item", JSON.stringify(items));
      console.log(items);
    }
    if (booking && booking.includes("_")) {
      const word: string = booking;
      const replace = word.replaceAll("_", "+");
      //window.location.search = "?page=itinerary-plugin-section" + replace;
    } else {
      window.location.search = "?page=itinerary-plugin-section" + booking;
    }
  };

  const keyArr = [];

  for (const key in props.row) {
    keyArr.push(key);
  }

  return (
    <TableRow>
      <TableCell>{props.name}</TableCell>
      {keyArr.map((booking) => {
        return (
          <TableCell>
            {props.row[booking].map((emojiObj: {}) => {
              return (
                <Emoji
                  field={booking}
                  count={props.row[booking].length}
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

const DashboardTable = (props: { rows: Record<string, {}> }) => {
  const rowArray = [];
  const headArr = [];
  const { rows } = props;
  for (const key in rows) {
    const value: any = rows[key];
    rowArray.push(key);
  }

  for (const item in rows[rowArray[0]]) {
    headArr.push(item);
  }

  return (
    <div>
      <ItinerarySelection></ItinerarySelection>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              {headArr.map((name) => {
                return <DashboardHead section={name}></DashboardHead>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowArray.map((name) => {
              return <DashboardRow row={rows[name]} name={name}></DashboardRow>;
            })}
          </TableBody>
        </Table>
      </TableContainer>
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
    </div>
  );
};

const DashboardHead = (props: { section: string }) => {
  if (props.section.includes("_")) {
    const word: string = props.section;
    const replace = word.replaceAll("_", " ");
    return <TableCell>{replace}</TableCell>;
  } else {
    return <TableCell>{props.section}</TableCell>;
  }
};
