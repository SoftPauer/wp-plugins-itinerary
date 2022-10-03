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
  handleChange: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
};
export const CostSelection: FC<CostSelectionProps> = ({
  sections,
  handleChange,
}) => {
  const sectionContext = useSectionContext();

  const sectionArray = (costs: ICosting[]) => {
    let sections: string[] = [];

    if (costs.length > 1) {
      sections.push("All");
    }

    for (const cost in costs) {
      const section = sectionContext.sections.find(
        (section) => section.id === costs[cost]["section_id"]
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
        <Select label="section" defaultValue={"All"} onChange={handleChange}>
          {sectionArr.length === 0 && (
            <MenuItem value={"Empty"}>Empty</MenuItem>
          )}

          {sectionArr.length === 1 && (
            <MenuItem value={sectionArr[0]}>{sectionArr[0]}</MenuItem>
          )}

          {sectionArr.length > 1 &&
            sectionArr?.map((section, index) => {
              return (
                <MenuItem key={index} value={section}>
                  {section}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    </div>
  );
};
