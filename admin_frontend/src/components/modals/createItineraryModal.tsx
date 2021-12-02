import { Box, Button, Modal, TextField, Typography } from "@material-ui/core";
import React, { FC, useState } from "react";
import { Itinerary } from "../../api/api";

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
  handleClose: () => void;
};
export const CreateItineraryModal: FC<CreateItineraryModalProps> = ({
  open,
  handleClose,
}) => {
  const [name, setName] = useState<string>("");
  return (
    <div>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            New itinerary
          </Typography>
          <TextField
            required
            label="New itinerary"
            placeholder="Itinerary name"
            onChange={(val) => setName(val.target.value)}
            value={name}
          />
          <Button
            onClick={() => {
              Itinerary.createItinerary({ name });
            }}
          >
            Add itinerary
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
