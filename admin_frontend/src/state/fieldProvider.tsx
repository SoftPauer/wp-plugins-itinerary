import { createContext, useContext, useEffect, useState } from "react";
import { Field, IField } from "../api/api";
import { ISortedField } from "../pages/sectionValues";
import { useSectionContext } from "./sectionProvider";
interface IFieldContext {
  fields: IField[];
  loadFields: (section: number) => void;
  getFieldById: (id: number) => IField | undefined;
}

const FieldContext = createContext<IFieldContext>({
  getFieldById: (id: number) => undefined,
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
  const getFieldById = (id:number)=>{
    return getFieldByIdFromFields(fields,id);
  }


  return (
    <FieldContext.Provider
      value={{
        getFieldById:getFieldById,
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


export const getFieldByIdFromFields = (fields:IField[], id:number)=>{
  return fields.find((field)=>field.id===id);
}
export const getFieldByFieldName = (fields:ISortedField[], name:string)=>{
  return fields.find((field)=>field.field.field_name === name);
}

