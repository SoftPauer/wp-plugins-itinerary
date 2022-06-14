import { Button, makeStyles, Typography } from "@material-ui/core";
import { FC, useContext, useState } from "react";
import { IField, Value, User, UpdateApp } from "../api/api";
import { FieldWrapper } from "../components/fieldWrapper";
import { ItinerarySelection } from "../components/itinerarySelection";
import { useItineraryContext } from "../state/itineraryProvider";
import { useSectionContext } from "../state/sectionProvider";
import { ModalContext } from "../state/modals";
import { getJsonKeyFromSection, LooseObject, sortFields } from "../utils";
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
  const [modelState, setAddChannelModel] = useState<boolean>(false);

  const fillFields = (field: ISortedField) => {
    if (sectionContext.selectedSection === undefined) {
      return <div key={1}></div>;
    }

    return <FieldWrapper key={field.field.id} field={field}></FieldWrapper>;
  };

  const renderFields = () => {
    const srFields = sortFields(fieldContext.fields);
    const jsxPosFields = srFields.map((f) => fillFields(f));

    return jsxPosFields;
  };

  const updateValues = async () => {
    dispatch({
      type: "open",
      modal: "Loading",
    });

    let json: LooseObject = {};
    for (let i = 0; i < sectionContext.sections.length; i++) {
      const s = sectionContext.sections[i];

      const val = await Value.getValues(s.id, itinContext.selected.id);
      if (val) {
        json[getJsonKeyFromSection(s)] = JSON.parse(val?.value);
      } else {
        json[getJsonKeyFromSection(s)] = null;
      }
    }
    let userswp = await User.getUsers();

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

    // commit data to database instead of sending to moodle!

    const payload = {
      itinId: itinContext.selected.id,
      time_updated: `'${new Date(timeElapsed)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'`,
      json_data: JSON.stringify(json),
    };

    UpdateApp.createAppEntry(payload);
    dispatch({
      type: "close",
      modal: "Loading",
    });
    dispatch({
      type: "open",
      modal: "Text",
      modalData: { text: "App Has been Updated!" },
    });
  };

  const copyValuesFromLastItin = () => {
    if (sectionContext.selectedSection)
      valueContext.copyValuesFromLastItin(sectionContext.selectedSection.id);
  };

  const doesContainUserType = () => {
    let containsUserType = false;
    fieldContext.fields.forEach((field) => {
      if (field.type_properties?.data_source === "users") {
        containsUserType = true;
      }
    });
    return containsUserType;
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
      {/* {doesContainUserType() ? (
        <Button
          style={{ marginLeft: "10px" }}
          color="default"
          variant="contained"
          onClick={() => {
            setAddChannelModel(true);
          }}
        >
          Create Rocket Channels
        </Button>
      ) : (
        <></>
      )} */}

      {/* <CreateRocketChannelsModal
        open={modelState}
        handleClose={() => setAddChannelModel(false)}
      /> */}
    </div>
  );
};
