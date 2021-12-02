import { createContext, useContext, useEffect, useState } from "react";
import { Field, IField } from "../api/api";
import { useSectionContext } from "./sectionProvider";
interface IFieldContext {
  fields: IField[];
  loadFields: (section: number) => void;
}

const FieldContext = createContext<IFieldContext>({
  fields: [],
  loadFields: (section: number) => {},
});

export const FieldProvider = (props: { children: React.ReactNode }) => {
  const [fields, setfields] = useState<IField[]>([]);
  const sectionContext = useSectionContext();
  useEffect(() => {
    async function fetchData() {
      if (sectionContext.selectedSection) {
        const fields = await Field.getFields(sectionContext.selectedSection.id);
        setfields(fields);
      }
    }
     fetchData();
  }, [ sectionContext.selectedSection]);
  const loadFields = async (section:number)=>{
    setfields(await Field.getFields(section));
  }


  return (
    <FieldContext.Provider
      value={{
        fields: fields,
        loadFields:loadFields
      }}
    >
      {props.children}
    </FieldContext.Provider>
  );
};
export const useFieldContext = () => {
  return useContext(FieldContext);
};
