import { createContext, useContext, useEffect, useState } from "react";
import {
  IDataSourceProperties,
  IUser,
  User,
} from "../api/api";
import { useValueContext } from "./valueProvider";

export enum DataSourceTypes {
  users = "users",
  parent = "parent",
}

export const DataSourceTypesList: {
  key: string;
  value: string;
}[] = Object.entries(DataSourceTypes).map(([key, value]) => ({ key, value }));

interface IDataSourceContext {
  users: IUser[];
  resolveDataSource: (
    sourceType: string,
    sourceProps?: IDataSourceProperties,
    index?: string
  ) => IDataSourceOptions;
}

export interface IDataSourceOptions {
  options: string[];
  label: string;
  labelPlural: string;
}
const DataSourceContext = createContext<IDataSourceContext>({
  users: [],
  resolveDataSource: (
    sourceType: string,
    sourceProps?: IDataSourceProperties,
    index?: string
  ) => {
    return { options: [], label: "Missing", labelPlural: "Missing" };
  },
});

export const DataSourceProvider = (props: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const valuesContext = useValueContext();
  useEffect(() => {
    async function fetchData() {
      setUsers(await User.getUsers());

      console.log("users fetched");
      
    }
    fetchData();
  }, []);

  const resolveDataSource = (
    sourceType: string,
    sourceProps?: IDataSourceProperties,
    index?: string
  ): IDataSourceOptions => {
    switch (sourceType) {
      case DataSourceTypes.users:
          
        return {
          options: users.map((u) => u.name),
          label: "Users",
          labelPlural: "Users",
        };
      case DataSourceTypes.parent:
        let found = false;
        let options;
        let i = index;
        while (!found) {
          i = i?.substr(0, i?.lastIndexOf("."));
          const value = valuesContext.values
            ?.filter((v) => v.field === sourceProps?.source)
            .find((v) => {
              return v.list_index === i;
            });
          if(value){
              found = true;
              options = value;
          }
          if(i?.length??0 < 2){
            found = true;
          }
        }
        if(options){
            const aOptions = JSON.parse(options?.value);
             return {
               options: aOptions,
               label: "Users",
               labelPlural: "Users",
             };
        }
        else{
            return {
                options: [],
                label: "No options found",
                labelPlural: "No options found",
              };
        }
      default:
        return { options: [], label: "Missing", labelPlural: "Missing" };
    }
  };

  return (
    <DataSourceContext.Provider
      value={{
        users: users,
        resolveDataSource: resolveDataSource,
      }}
    >
      {props.children}
    </DataSourceContext.Provider>
  );
};
export const useDataSourceContext = () => {
  return useContext(DataSourceContext);
};
