import {
  Button,
  FormControl,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useState } from "react";
import { Itinerary } from "../api/api";
import { useItineraryContext } from "../state/itineraryProvider";
import { CreateItineraryModal } from "./modals/createItineraryModal";

const useStyles = makeStyles((theme) => ({
  itinerarySelector: { display: "flex", alignItems: "center" },
}));
export const ItinerarySelection = () => {
  const itinContext = useItineraryContext();
  const classes = useStyles();
  const [modelState, setModelState] = useState<boolean>(false);

  const toggle = () => {
    setModelState(!modelState);
  };

  return (
    <div className={classes.itinerarySelector}>
      <CreateItineraryModal
        open={modelState}
        toggle={() => toggle()}
        handleClose={() => setModelState(false)}
      ></CreateItineraryModal>
      {itinContext.itineraries.length > 0 && (
        <FormControl>
          <Select
            onChange={(e) => {
              const itin = itinContext.itineraries.find(
                (i) => i.id === e.target.value
              );
              if (itin) {
                itinContext.setSelectedItin(itin);
              } else {
                console.error("didn't find itinerary");
              }
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
          if (itinContext.selected)
            Itinerary.deleteItinerary(itinContext.selected.id);
          window.location.reload();
        }}
      >
        Delete itinerary
      </Button>
    </div>
  );
};
