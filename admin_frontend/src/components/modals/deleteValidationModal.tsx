import { Box, Button, Modal, TextField, Typography } from "@material-ui/core";
import { FC } from "react";

type DeleteValidationModalProps = {
  open: boolean;
  handleClose: () => void;
  handleDelet: () => void;
};

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

export const DeleteValidationModal: FC<DeleteValidationModalProps> = ({
  open,
  handleClose,
  handleDelet,
}) => {
  return (
    <div>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <Box sx={style}>
          <Typography variant="h6" component="h2" align="center">
            Are you sure you would like to delete this element?
          </Typography>
          <Button
            style={{ marginLeft: "10px" }}
            color="secondary"
            variant="contained"
            onClick={(e) => {
              handleDelet();
            }}
          >
            Yes
          </Button>
          <Button
            onClick={() => {
              handleClose();
            }}
          >
            <Typography variant="h6" component="h2">
              No
            </Typography>
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
