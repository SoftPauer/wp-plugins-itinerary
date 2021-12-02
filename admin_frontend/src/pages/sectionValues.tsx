import { Button, makeStyles, Typography } from "@material-ui/core";
import { FC, useContext } from "react";
import ReactJson from "react-json-view";
import { IField, Field, Value, User, requestsMoodle } from "../api/api";
import { FieldWrapper } from "../components/fieldWrapper";
import { ItinerarySelection } from "../components/itinerarySelection";
import {  sortFields } from "../fieldTypes";
import { useItineraryContext } from "../state/itineraryProvider";
import { useSectionContext } from "../state/sectionProvider";
import { ModalContext } from "../state/modals";
import { buildJsonForSection, LooseObject } from "../utils";
import { useFieldContext } from "../state/fieldProvider";
import { useValueContext } from "../state/valueProvider";


export interface ISortedField {
  field: IField;
  children: ISortedField[];
  neighbors?: ISortedField[];
}

const useStyles = makeStyles((theme) => ({
  topSection: { display: "flex", justifyContent: "space-between" },
  fields: { marginLeft: "20px", paddingTop: "15px" },
  sectionPage: {
    marginLeft: "20px",
    marginTop: "10px",
  },
}));

export const SectionValuesPage: FC = () => {
  const classes = useStyles();
  const itinContext = useItineraryContext();
  const sectionContext = useSectionContext();
  const fieldContext = useFieldContext();
  const valueContext = useValueContext();
  const { dispatch } = useContext(ModalContext);

  const fillFields = (field: ISortedField) => {
    if (sectionContext.selectedSection === undefined) {
      return <div key={1}></div>;
    }

    return (
      <FieldWrapper
        key={field.field.id}
        field={field}
        values={valueContext.values}
      ></FieldWrapper>
    );
  };

  const renderFields = () => {
    const srFields = sortFields(fieldContext.fields);
    const jsxPosFields = srFields.map((f) => fillFields(f));

    return jsxPosFields;
  };

  const renderJsonData = () => {
    if (sectionContext.selectedSection) {
      return buildJsonForSection(
        sectionContext.selectedSection,
        sortFields(fieldContext.fields, false),
        valueContext.values
      );
    }
    return {};
  };

  const updateValues = async () => {
    dispatch({
      type: "open",
      modal: "Loading",
    });

    let json: LooseObject = {};
    for (let i = 0; i < sectionContext.sections.length; i++) {
      const s = sectionContext.sections[i];
      const f = sortFields(await Field.getFields(s.id), false);

      const val = await Value.getValues(s.id, itinContext.selected.id);
      const sectObj = buildJsonForSection(s, f, val);
      json[Object.keys(sectObj)[0]] = sectObj[Object.keys(sectObj)[0]];
    }
    let userswp = await User.getUsers();
    console.log(userswp);

    const users = userswp.map((u) => {
      const dep = u.meta.department === undefined ? "" : u.meta.department[0];
      const moodle_id =
        u.meta.moodle_id === undefined ? "" : u.meta.moodle_id[0];
      return {
        id: moodle_id,
        firstName: u.meta.first_name[0],
        surname: u.meta.last_name[0],
        department: dep,
        email: u.data.data.user_email,
        userName: u.data.data.user_login,
      };
    });
    json["users"] = users;
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed).toISOString();
    json["updatedAt"] = today;
    json["macrosVersion"] = "0.1.0";
    console.log(json);

    requestsMoodle.updateApp(JSON.stringify(json)).then((res) => {
      console.log(res);
      dispatch({
        type: "close",
      });
      dispatch({
        type: "open",
        modal: "Text",
        modalData: { text: res },
      });
    });
  };

  const copyValuesFromLastItin = () => {
    if (sectionContext.selectedSection)
      valueContext.copyValuesFromLastItin(sectionContext.selectedSection.id);
  };

  return (
    <div className={classes.sectionPage}>
      <div className={classes.topSection}>
        <Typography variant="h2" component="h1">
          {sectionContext.selectedSection?.name.toUpperCase()}
        </Typography>
        <ItinerarySelection></ItinerarySelection>
      </div>
      <div className={classes.fields}>
        {itinContext.selected !== undefined && renderFields()}
      </div>
      <Typography variant="h6" component="h2">
        Json data will look like this:
      </Typography>
      <ReactJson collapsed={true} name={false} src={renderJsonData()} />

      <Button
        style={{ marginLeft: "10px" }}
        color="primary"
        variant="contained"
        onClick={() => {
          updateValues();
        }}
      >
        Update app
      </Button>
      <Button
        style={{ marginLeft: "10px" }}
        color="secondary"
        variant="contained"
        onClick={() => {
          copyValuesFromLastItin();
        }}
      >
        Copy last values
      </Button>
     
    </div>
  );
};
