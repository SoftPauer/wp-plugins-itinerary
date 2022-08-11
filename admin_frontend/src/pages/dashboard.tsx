import { FC, useState } from "react";
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

const DashboardRow = (props: { row: any; name: string }) => {
  const handleEmojis = (field: string, count: number) => {
    switch (field) {
      case "Flights":
        return Array(count).fill("✈️").join(" ");
      case "Hotels":
        return Array(count).fill("🏠").join(" ");
      case "Car_allocations":
        return Array(count).fill("🚗").join(" ");
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
            {handleEmojis(booking, props.row[booking].length)}
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
  const [userList, setUserList] = useState(data);
  if (!userList) return <></>;

  return (
    <div>
      <DashboardTable rows={userList}></DashboardTable>
    </div>
  );
};

const DashboardHead = (props: { section: string }) => {
  if (props.section === "Car_allocations") {
    const word: string = props.section;
    const replace = word.replaceAll("_", " ");
    return <TableCell>{replace}</TableCell>;
  } else {
    return <TableCell>{props.section}</TableCell>;
  }
};
