import { createContext, useContext, useEffect, useState } from "react";
import { ISection, Section } from "../api/api";
export interface ISectionContext {
  selectedSection: ISection | undefined;
  editSection: ISection | undefined;
  sections: ISection[];
  selectedItem: number | undefined;
  setSelectedSection: (section: ISection | undefined) => void;
  setEditSection: (section: ISection | undefined) => void;
  setSelectedItem: (section: number | undefined) => void;
}

const SectionContext = createContext<ISectionContext>({
  selectedSection: undefined,
  editSection: undefined,
  sections: [],
  selectedItem: undefined,
  setSelectedSection: (section: ISection | undefined) => {},
  setEditSection: (section: ISection | undefined) => {},
  setSelectedItem: (section: number | undefined) => {},
});

export const SectionProvider = (props: { children: React.ReactNode }) => {
  const [selectedSection, setselectedSection] = useState<
    ISection | undefined
  >();
  const [selectedItem, setSelectedItem] = useState<number | undefined>();
  const [editSelectedSection, setEditSelectedSection] = useState<
    ISection | undefined
  >();
  const [sections, setSections] = useState<ISection[]>([]);

  useEffect(() => {
    async function fetchData() {
      const sections = await Section.getSections();
      const sectionName =
        document
          .getElementById("general-info-react")
          ?.getAttribute("section") ??
        decodeURI(window.location.search.slice(1));

      setselectedSection(sections.find((s) => s.name === sectionName));
      setSections(sections);
    }
    fetchData();
  }, []);

  return (
    <SectionContext.Provider
      value={{
        selectedItem: selectedItem,
        setSelectedItem: setSelectedItem,
        selectedSection: selectedSection,
        sections: sections,
        setSelectedSection: setselectedSection,
        editSection: editSelectedSection,
        setEditSection: setEditSelectedSection,
      }}
    >
      {props.children}
    </SectionContext.Provider>
  );
};
export const useSectionContext = () => {
  return useContext(SectionContext);
};
