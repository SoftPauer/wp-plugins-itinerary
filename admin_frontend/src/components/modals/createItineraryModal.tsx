import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { FC, useEffect, useState } from "react";
import { Itinerary } from "../../api/api";
import { useItineraryContext } from "../../state/itineraryProvider";
import { useValueContext } from "../../state/valueProvider";

const style: any = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type CreateItineraryModalProps = {
  open: boolean;
  toggle: () => void;
  handleClose: () => void;
};
export const CreateItineraryModal: FC<CreateItineraryModalProps> = ({
  open,
  toggle,
  handleClose,
}) => {
  const [name, setName] = useState<string>("");
  const [itinName, setItinName] = useState<string>("");
  const [newModalToggle, setNewModalToggle] = useState(open);
  const [copyModalToggle, setCopyModalToggle] = useState(false);
  const itinContext = useItineraryContext();
  const valueContext = useValueContext();

  useEffect(() => {
    if (open !== newModalToggle) {
      setNewModalToggle(open);
    }
  }, [open]);

  const handdleNewClick = () => {
    setCopyModalToggle(false);
    setNewModalToggle(true);
    toggle();
  };

  const handdleCopyClick = () => {
    handleClose();
    setCopyModalToggle(true);
  };

  const handleCopy = (name: string) => {
    Itinerary.createItinerary({ name });
    copyValuesFromSelectedItin();
    window.location.reload();
  };

  const copyValuesFromSelectedItin = () => {
    valueContext.copyValuesFromSelectedItin(itinContext.selected.id);
  };

  return (
    <div>
      <Modal
        open={newModalToggle}
        onClose={() => {
          handleClose();
        }}
      >
        <Box sx={style}>
          <Button>
            <Typography variant="h6" component="h2">
              New Itinerary
            </Typography>
          </Button>
          <Button
            onClick={(e) => {
              handdleCopyClick();
            }}
          >
            <Typography variant="h6" component="h2">
              Copy Itinerary
            </Typography>
          </Button>
          <TextField
            required
            label="New itinerary"
            placeholder="Itinerary name"
            onChange={(val) => setName(val.target.value)}
            value={name}
          />
          <Button
            style={{ marginLeft: "10px" }}
            color="secondary"
            variant="contained"
            onClick={() => {
              Itinerary.createItinerary({ name });
              window.location.reload();
            }}
          >
            Add itinerary
          </Button>
        </Box>
      </Modal>
      <Modal
        open={copyModalToggle}
        onClose={() => {
          setCopyModalToggle(false);
        }}
      >
        <Box sx={style}>
          <Button
            onClick={(e) => {
              handdleNewClick();
            }}
          >
            <Typography variant="h6" component="h2">
              New Itinerary
            </Typography>
          </Button>
          <Button>
            <Typography variant="h6" component="h2">
              Copy Itinerary
            </Typography>
          </Button>
          <TextField
            required
            label="Copy itinerary name"
            placeholder="Itinerary name"
            onChange={(val) => setName(val.target.value)}
            value={name}
          />
          <div>
            <FormControl>
              <Select
                label="Choose an itinerary to copy"
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
          </div>
          <Button
            style={{ marginLeft: "10px" }}
            color="secondary"
            variant="contained"
            onClick={() => {
              handleCopy(name);
            }}
          >
            Copy itinerary
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
