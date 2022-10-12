import { createContext, useContext, useEffect, useState } from "react";
import { IDataSourceProperties, IUser, IValues, User, Value } from "../api/api";
import { useFieldContext } from "./fieldProvider";
import { useValueContext } from "./valueProvider";
import timezones from "../assets/timezones.json";
import { useSectionContext } from "./sectionProvider";
import { useItineraryContext } from "./itineraryProvider";
import { getValue } from "@mui/system";

export enum DataSourceTypes {
  users = "users",
  parent = "parent",
  timezones = "timezones",
  element = "element",
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
  const [value, setValue] = useState<IValues>();
  const valuesContext = useValueContext();
  const fieldContext = useFieldContext();
  const sectionContext = useSectionContext();
  const itinContext = useItineraryContext();
  const [section, setSection] = useState(sectionContext.selectedSection?.id);
  const sectionKey = sectionContext.selectedSection?.name.toLowerCase();

  useEffect(() => {
    async function fetchData() {
      setUsers(await User.getUsers());
    }

    fetchData();
  }, [sectionContext.selectedSection?.id]);

  async function getSectionValue() {
    if (
      sectionContext.selectedSection?.id &&
      sectionContext.selectedSection?.id !== -1
    ) {
      console.log(itinContext.selected.id)
      const sectionVal = await Value.getValues(
        sectionContext.selectedSection?.id,
        itinContext.selected.id
      );
      if (sectionVal) {
        setValue(sectionVal);
      }
    }
  }
  useEffect(()=> {
    getSectionValue()
  },[itinContext, sectionContext,valuesContext])

  const resolveDataSource = (
    sourceType: string,
    sourceProps?: IDataSourceProperties,
    index?: string
  ): IDataSourceOptions => {
    switch (sourceType) {
      case DataSourceTypes.users:
        return {
          options: users.map((u) => u.name),
          label: "Passenger",
          labelPlural: "Passengers",
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
              label: "Passenger",
              labelPlural: "Passengers",
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
      case DataSourceTypes.timezones:
        return {
          options: timezones.map((t) => t.text),
          label: "Timezone",
          labelPlural: "Timezones",
        };
      case DataSourceTypes.element:
        if (!sourceProps?.source) {
          return {
            options: [],
            label: "Missing source",
            labelPlural: "No options found",
          };
        }
        
        const elementField = fieldContext.getFieldById(sourceProps?.source);
        
        if (elementField) {
          let valList = [];
          const val = valuesContext.getValue(elementField, index);
          if (section !== sectionContext.selectedSection?.id) {
            setSection(sectionContext.selectedSection?.id);
          }
          const fieldProps = elementField.type_properties;
          if (value) {   
            console.log(value)
            const sectionVal = JSON.parse(value?.value);
            let list = [];
            list =
              sectionVal[
                sectionContext.selectedSection?.name
                  .toLowerCase()
                  .replace(" ", "_") ?? " "
              ];
            if (index?.includes("0.")) {
              if (elementField.type_properties?.data_transform_properties  && index.charAt(index.length - 1) < list.length) { 
                list =
                  list[index.charAt(index.length - 1) as unknown as number][
                    elementField.type_properties?.data_transform_properties
                  ];
              }
            }
            for (const item in list) {
              if (elementField.type_properties?.json_key) {
                valList.push(
                  list[item][elementField.type_properties?.json_key]
                );
              }
            }
          }

          if (valList) {
            return {
              options: valList,
              label: "Guest",
              labelPlural: "Guests",
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
