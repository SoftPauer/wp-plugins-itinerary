import { FC } from "react";
import { useSectionContext } from "../state/sectionProvider";
import { SectionsPage } from "./sections";
import { SectionValuesPage } from "./sectionValues";
import { DashboardPage } from "./dashboard";

export const PageWrapper: FC<{}> = () => {
  const sectionContext = useSectionContext();
  const sectionName = document
    .getElementById("general-info-react")
    ?.getAttribute("section");

  return (
    <div>
      {sectionContext.selectedSection === undefined &&
        sectionName == "dashboard" && <DashboardPage></DashboardPage>}
      {sectionContext.selectedSection === undefined &&
        sectionName !== "dashboard" && <SectionsPage></SectionsPage>}
      {sectionContext.selectedSection !== undefined && (
        <SectionValuesPage></SectionValuesPage>
      )}
    </div>
  );
};
