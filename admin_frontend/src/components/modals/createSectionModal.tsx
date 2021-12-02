import { Box, Button, Modal, TextField, Typography } from "@material-ui/core";
import React, { FC, useState } from "react";
import { ISectionProperties, Section } from "../../api/api";

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

type CreateSectionModalProps = {
  open: boolean;
  handleClose: () => void;
};
interface ISectionCreateState {
  name: string;
  properties?: ISectionProperties;
}

export const CreateSectionModal: FC<CreateSectionModalProps> = ({
  open,
  handleClose,
}) => {
  const [state, setState] = useState<ISectionCreateState>({
    name: "",
    properties: undefined,
  });
  return (
    <div>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            New section
          </Typography>
          <TextField
            required
            id="outlined-required"
            label="New section"
            placeholder="Section name"
            onChange={(val) => setState({ ...state, name: val.target.value })}
            value={state.name}
          />
          <TextField
            required
            id="outlined-required"
            label="Json Key"
            placeholder="JSON key"
            onChange={(val) =>
              setState({ ...state, properties: { jsonName: val.target.value } })
            }
            value={state.properties?.jsonName}
          />
          <Button
            onClick={() => {
              Section.createSection({
                name: state.name,
                properties: state.properties,
              });
            }}
          >
            add section
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
