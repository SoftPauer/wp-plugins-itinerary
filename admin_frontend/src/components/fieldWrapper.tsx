import { makeStyles } from "@material-ui/styles";
import { FC } from "react";
import { renderField } from "../fieldTypes";
import { ISortedField } from "../pages/sectionValues";

type FieldWrapperProps = {
  field: ISortedField;
  index?: string;
  preview?: boolean;
};
const useStyles = makeStyles((theme) => ({
  fieldWrapper: { display: "flex", alignItems: "flex-start" },
}));

export const FieldWrapper: FC<FieldWrapperProps> = ({
  field,
  index = "0",
  preview = false,
}) => {
  const classes = useStyles();
  const getFieldWithNeighbors = () => {
    const fields: JSX.Element[] = [];
    
    fields.push(renderField(field, index, preview));
    
    if (field.neighbors) {
      fields.push(
        ...field.neighbors.map((n) =>
          renderField(n, index, preview)
        )
      );
    }
    return fields;
  };

  return <div className={classes.fieldWrapper}>{getFieldWithNeighbors()}</div>;
};
