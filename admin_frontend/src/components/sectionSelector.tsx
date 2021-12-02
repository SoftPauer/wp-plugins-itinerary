import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import { FC } from "react";
import { ISection } from "../api/api";

type SectionSelectionProps = {
  sections: ISection[];
  selectedSection: number;
  handleChange: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
};
export const SectionSelection: FC<SectionSelectionProps> = ({
  sections,
  selectedSection,
  handleChange,
}) => {
  return (
    <div className="sectionSelector">
      <FormControl>
        <InputLabel id="demo-simple-select-label">Section</InputLabel>
        <Select label="section" value={selectedSection} onChange={handleChange}>
          {sections.map((i) => {
            return <MenuItem value={i.id}>{i.name}</MenuItem>;
          })}
        </Select>
      </FormControl>
    </div>
  );
};
