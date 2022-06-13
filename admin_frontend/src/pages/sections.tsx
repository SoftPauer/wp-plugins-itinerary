import { Button, Typography } from "@material-ui/core";
import { FC,useState } from "react";
import { Section} from "../api/api";
import { FieldWrapper } from "../components/fieldWrapper";
import { CreateSectionModal } from "../components/modals/createSectionModal";
import { EditFieldModal } from "../components/modals/editFieldModel";
import { SectionSelection } from "../components/sectionSelector";
import { useFieldContext } from "../state/fieldProvider";
import { useSectionContext } from "../state/sectionProvider";
import { sortFields } from "../utils";
import { ISortedField } from "./sectionValues";

export const SectionsPage: FC<{}> = () => {
  const [modelState, setaddSectionModel] = useState<boolean>(false);
  const [newFieldModelState, setNewFieldModelState] = useState<boolean>(false);
  const sectionContext = useSectionContext();
  const fieldContext = useFieldContext();


  const addSection = () => {
    setaddSectionModel(true);
  };

  const onSectionChange = async (e: any) => {
    sectionContext.setEditSection(sectionContext.sections.find((s) => s.id === e.target.value));
    fieldContext.loadFields(e.target.value as number);
  };



  const fillFields = (field: ISortedField) => {

    if (sectionContext.editSection === undefined) {
      return;
    }

    return (
      <FieldWrapper
        field={field}
        preview={true}
      ></FieldWrapper>
    );
  };

  return (
    <div className="sectionsPage">
      <div style={{ display: "flex" }}>
        <SectionSelection
          sections={sectionContext.sections}
          selectedSection={sectionContext.editSection?.id ?? 0}
          handleChange={onSectionChange}
        ></SectionSelection>
        <Button
          onClick={() => {
            addSection();
          }}
        >
          Add section
        </Button>
        <Button
          onClick={() => {
            if (sectionContext.editSection) Section.deleteSection(sectionContext.editSection?.id);
          }}
        >
          Delete section
        </Button>
        <CreateSectionModal 
          open={modelState}
          handleClose={() => setaddSectionModel(false)}
        ></CreateSectionModal>
      </div>
      <div style={{ display: "flex" }}>
        <Button
          onClick={() => {
            setNewFieldModelState(true);
          }}
        >
          Add field
        </Button>
        <EditFieldModal
          section={sectionContext.editSection?.id ?? 0}
          open={newFieldModelState}
          handleClose={() => setNewFieldModelState(false)}
        ></EditFieldModal>
      </div>
      <Typography variant="h6" component="h2">
        Section fields will look like this:
      </Typography>
      {sortFields(fieldContext.fields).map((f) => fillFields(f))}
    </div>
  );
};
