import { createContext, useContext, useEffect, useState } from "react";
import { IValue, Value } from "../api/api";
import { useItineraryContext } from "./itineraryProvider";
import { useSectionContext } from "./sectionProvider";
interface IValueContext {
  values: IValue[];
  copyValuesFromLastItin: (section: number) => void;
  updateValues: () =>void;
}

const ValueContext = createContext<IValueContext>({
  values: [],
  copyValuesFromLastItin: (section) => {},
  updateValues:()=> {}
});

export const ValueProvider = (props: { children: React.ReactNode }) => {
  const [values, setValues] = useState<IValue[]>([]);

  const sectionContext = useSectionContext();
  const itineraryContext = useItineraryContext();
  async function fetchData() {
    if (sectionContext.selectedSection && itineraryContext.selected.id !== -1) {
      const values = await Value.getValues(
        sectionContext.selectedSection.id,
        itineraryContext.selected.id
      );
      setValues(values);
    }
  }
  useEffect(() => {
    fetchData();
  }, [sectionContext.selectedSection, itineraryContext.selected]);

  const copyValuesFromLastItin = (section: number) => {
    Value.copyLastItin(itineraryContext.selected.id, section).then((res) => {
      fetchData();
    });
  };
  return (
    <ValueContext.Provider
      value={{
        values: values,
        copyValuesFromLastItin: copyValuesFromLastItin,
        updateValues:fetchData
      }}
    >
      {props.children}
    </ValueContext.Provider>
  );
};
export const useValueContext = () => {
  return useContext(ValueContext);
};
