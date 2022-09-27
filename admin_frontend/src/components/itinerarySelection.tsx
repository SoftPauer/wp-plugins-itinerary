import {
  Button,
  FormControl,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import React, { useState } from "react";
import { Itinerary } from "../api/api";
import { useItineraryContext } from "../state/itineraryProvider";
import { CreateItineraryModal } from "./modals/createItineraryModal";
import { DeleteValidationModal } from "./modals/deleteValidationModal";

const useStyles = makeStyles((theme) => ({
  itinerarySelector: { display: "flex", alignItems: "center" },
}));
export const ItinerarySelection = () => {
  const itinContext = useItineraryContext();
  const classes = useStyles();
  const [modelState, setModelState] = useState<boolean>(false);
  const [deleteModelState, setDeleteModelState] = useState<boolean>(false);

  const toggle = () => {
    setModelState(!modelState);
  };

  const onItineraryChanged = (value: number) => {
    const itin = itinContext.itineraries.find((i) => i.id === value);
    if (itin) {
      itinContext.setSelectedItin(itin);
    } else {
      console.error("didn't find itinerary");
    }
  };

  return (
    <div className={classes.itinerarySelector}>
      <CreateItineraryModal
        open={modelState}
        toggle={() => toggle()}
        handleClose={() => setModelState(false)}
      ></CreateItineraryModal>
      
      <DeleteValidationModal
        open={deleteModelState}
        handleClose={() => {
          setDeleteModelState(false);
        }}
        handleDelet={() => {
          if (itinContext.selected)
            Itinerary.deleteItinerary(itinContext.selected.id);
          window.location.reload();
        }}
      ></DeleteValidationModal>

      {itinContext.itineraries.length > 0 && (
        <FormControl>
          <Select
            onChange={(e) => {
              onItineraryChanged(e.target.value as number);
            }}
            label="Itinerary"
            value={
              itinContext.selected?.id ??
              itinContext.itineraries[itinContext.itineraries.length - 1].id
            }
          >
            {itinContext.itineraries.map((i, n) => {
              return (
                <MenuItem key={n} value={i.id}>
                  {i.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}

      <Button
        onClick={(e) => {
          setModelState(true);
        }}
      >
        Create itinerary
      </Button>
      <Button
        onClick={(e) => {
          setDeleteModelState(true);
        }}
      >
        Delete itinerary
      </Button>
    </div>
  );
};
