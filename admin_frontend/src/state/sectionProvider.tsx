import { createContext, useContext, useEffect, useState } from "react";
import { ISection, Section } from "../api/api";
interface ISectionContext {
  selectedSection: ISection |undefined;
  editSection:ISection|undefined;
  sections: ISection[];
  setSelectedSection: (section: ISection|undefined) => void;
  setEditSection: (section: ISection|undefined) => void;

}

const SectionContext = createContext<ISectionContext>({
  selectedSection: undefined,
  editSection:undefined,
  sections: [],
  setSelectedSection: (section: ISection|undefined) => {},
  setEditSection: (section: ISection|undefined) => {},
});

export const SectionProvider = (props: { children: React.ReactNode }) => {
  const [selectedSection, setselectedSection] =
    useState<ISection|undefined>();
    const [editSelectedSection, setEditSelectedSection] =
    useState<ISection|undefined>();
  const [sections, setSections] = useState<ISection[]>([]);

  useEffect(() => {
    async function fetchData() {
      const sections = await Section.getSections();
      const sectionName= document.getElementById("general-info-react")?.getAttribute("section") ??
        "unknown"
      setselectedSection(sections.find(s=>s.name===sectionName));
      setSections(sections);
    }
    fetchData();
  }, []);

  return (
    <SectionContext.Provider
      value={{
        selectedSection: selectedSection,
        sections: sections,
        setSelectedSection: setselectedSection,
        editSection:editSelectedSection,
        setEditSection:setEditSelectedSection
      }}
    >
      {props.children}
    </SectionContext.Provider>
  );
};
export const useSectionContext = () => {
  return useContext(SectionContext);
};
