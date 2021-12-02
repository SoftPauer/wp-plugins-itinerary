import { Button, Typography } from "@material-ui/core";
import { FC,useState } from "react";
import { Section} from "../api/api";
import { FieldWrapper } from "../components/fieldWrapper";
import { CreateFieldModal } from "../components/modals/createFieldModal";
import { CreateSectionModal } from "../components/modals/createSectionModal";
import { SectionSelection } from "../components/sectionSelector";
import {  sortFields } from "../fieldTypes";
import { useFieldContext } from "../state/fieldProvider";
import { useSectionContext } from "../state/sectionProvider";
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

  const renderJsonData = () => {
    return "comming soon";
  };

  const fillFields = (field: ISortedField) => {

    if (sectionContext.editSection === undefined) {
      return;
    }

    return (
      <FieldWrapper
        field={field}
        values={[]}
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
        <CreateSectionModal // TODO move all model into model controller component
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
        <CreateFieldModal
          section={sectionContext.editSection?.id ?? 0}
          open={newFieldModelState}
          handleClose={() => setNewFieldModelState(false)}
        ></CreateFieldModal>
      </div>
      <Typography variant="h6" component="h2">
        Section fields will look like this:
      </Typography>
      {sortFields(fieldContext.fields).map((f) => fillFields(f))}

      <Typography variant="h6" component="h2">
        Json data will look like this:
      </Typography>
      {renderJsonData()}
    </div>
  );
};
