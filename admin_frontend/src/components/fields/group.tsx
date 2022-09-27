import { Button, makeStyles, Typography } from "@material-ui/core";
import { FC, useContext, useState } from "react";
import { Field } from "../../api/api";
import { ISortedField } from "../../pages/sectionValues";
import { ModalContext } from "../../state/modals";
import { useSectionContext } from "../../state/sectionProvider";
import { FieldWrapper } from "../fieldWrapper";
import { DeleteValidationModal } from "../modals/deleteValidationModal";


type GroupProps = {
  field: ISortedField;
  preview: boolean;
  index: string | undefined;
};
const useStyles = makeStyles((theme) => ({
  groupInd: {
    backgroundColor: theme.palette.primary.main,
    width: "15px",
    height: "3px",
    marginRight: "5px",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  groupField: {
    marginTop: "20px",
    paddingTop: "10px",
    paddingBottom: "35px",
    marginLeft: "-16px",
    paddingLeft: "16px",
    borderWidth: "1px",
    borderColor: "#ababab",
    borderStyle: "solid",
  },
}));

export const GroupField: FC<GroupProps> = ({
  field,
  preview,
  index
}) => {
  const classes = useStyles();
  const fillFields = (field: ISortedField,i:number) => {
    return (
      <FieldWrapper
        field={field}
        index={index+"."+i.toString()}
        preview={preview}
      ></FieldWrapper>
    );
  };
  const { dispatch } = useContext(ModalContext);
  const sectionContext  = useSectionContext();
  const [deleteModelState, setDeleteModelState] = useState<boolean>(false);


  return (
    <div className={classes.groupField}>

      <DeleteValidationModal
        open={deleteModelState}
        handleClose={() => {
          setDeleteModelState(false);
        }}
        handleDelet={() => {
          Field.deleteField(field.field.id);
          setDeleteModelState(false);
          window.location.reload();
        }}
      ></DeleteValidationModal>
      
      <div className={classes.header}>
        <div className={classes.groupInd}></div>
        <Typography variant="h5" component="h3">
          {field.field.field_name}
        </Typography>
        {preview && (
          <div>
            <Button
              onClick={(e) => {
                setDeleteModelState(true);
                //Field.deleteField(field.field.id);
              }}
            >
              remove
            </Button>
            <Button
              onClick={() => {
                dispatch({
                  type: "open",
                  modal: "EditField",
                  modalData: {
                    section: sectionContext.editSection?.id,
                    field: field.field,
                  },
                });
              }}
            >
              edit
            </Button>
          </div>
        )}
      </div>
      {field.children.map((c,i) => fillFields(c,i))}
    </div>
  );
};
