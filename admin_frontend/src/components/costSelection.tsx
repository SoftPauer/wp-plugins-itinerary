import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { FC } from "react";
import { ICosting, ISection } from "../api/api";
import { useSectionContext } from "../state/sectionProvider";

type CostSelectionProps = {
  sections: ICosting[];
  // handleChange: (
  //   event: React.ChangeEvent<{
  //     name?: string | undefined;
  //     value: unknown;
  //   }>,
  //   child: React.ReactNode
  // ) => void;
};
export const CostSelection: FC<CostSelectionProps> = ({
  sections,
  // handleChange,
}) => {
  const sectionContext = useSectionContext();

  const sectionArray = (costs: ICosting[]) => {
    let sections: string[] = [];
    for (const cost in costs) {
      const section = sectionContext.sections.find(
        (element) => element.id === costs[cost]["section_id"]
      )?.name;

      if (section && !sections.includes(section)) {
        sections.push(section);
      }
    }
    return sections;
  };

  const sectionArr = sectionArray(sections);

  return (
    <div className="costingSelection">
      <FormControl>
        <InputLabel id="demo-simple-select-label">Section</InputLabel>
        <Select label="section" defaultValue="">
          {sectionArr.length === 0 && (
            <MenuItem value={"Empty"}>Empty</MenuItem>
          )}
          {sectionArr.length === 1 && (
            <MenuItem value={0}>{sectionArr[0]}</MenuItem>
          )}
          {sectionArr.length >= 1 && (
            <div>
              <MenuItem value={"All"}>All</MenuItem>
              <div>
                {sectionArr?.map((section, index) => {
                  <MenuItem value={index}>{section}</MenuItem>;
                })}
              </div>
            </div>
          )}
        </Select>
      </FormControl>
      <Button>Export Costings</Button>
    </div>
  );
};
