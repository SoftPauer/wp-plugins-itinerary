import { createContext, useContext, useEffect, useState } from "react";
import { IDataSourceProperties, IUser, User } from "../api/api";
import { useFieldContext } from "./fieldProvider";
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
  const fieldContext = useFieldContext();

  useEffect(() => {
    async function fetchData() {
      setUsers(await User.getUsers());
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
        if (!sourceProps?.source) {
          return {
            options: [],
            label: "Missing source",
            labelPlural: "No options found",
          };
        }
        const field = fieldContext.getFieldById(sourceProps?.source);
        if (field) {
          const val = valuesContext.getValue(field, index);

          if (val) {
            return {
              options: val,
              label: "Users",
              labelPlural: "Users",
            };
          } else {
            return {
              options: [],
              label: "No options found",
              labelPlural: "No options found",
            };
          }
        }
        return {
          options: [],
          label: "No options found",
          labelPlural: "No options found",
        };
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
