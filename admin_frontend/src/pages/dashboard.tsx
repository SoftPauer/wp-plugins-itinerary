import { FC, useState, useEffect } from "react";
import { ItinerarySelection } from "../components/itinerarySelection";
import { useItineraryContext } from "../state/itineraryProvider";
import { Costing, ICosting, Report } from "../api/api";
import { useSectionContext } from "../state/sectionProvider";
import { ReportsGrid } from "../components/costGrid";
import { DashboardTable } from "../components/dashboardTable";

export const DashboardPage: FC<{}> = () => {
  const [userList, setUserList] = useState<Record<string, {}>>();
  const [costingArray, setCostingArray] = useState<ICosting[]>([]);
  const itinContext = useItineraryContext();

  useEffect(() => {
    const fetchData = async () => {
      const obj = await Report.getReport(itinContext.selected.id);
      setUserList(obj);
      const costObj = await Costing.getCosting(itinContext.selected.id);
      setCostingArray(costObj);
    };

    if (itinContext.selected.id !== -1) {
      fetchData();
    }
  }, [itinContext.selected.id]);

  const sectionContext = useSectionContext();

  if (!userList) return <></>;

  return (
    <div>
      <ItinerarySelection></ItinerarySelection>
      <DashboardTable rows={userList}></DashboardTable>
      <ReportsGrid costs={costingArray}></ReportsGrid>
    </div>
  );
};
