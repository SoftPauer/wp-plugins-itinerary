import { FC } from "react";
import { useSectionContext } from "../state/sectionProvider";
import { SectionsPage } from "./sections";
import { SectionValuesPage } from "./sectionValues";

export const PageWrapper: FC<{}> = () => {
  const sectionContext = useSectionContext();
  return (
    <div>
      {sectionContext.selectedSection === undefined && (
        <SectionsPage></SectionsPage>
      )}
      {sectionContext.selectedSection !== undefined && (
        <SectionValuesPage></SectionValuesPage>
      )}
    </div>
  );
  ``;
};
