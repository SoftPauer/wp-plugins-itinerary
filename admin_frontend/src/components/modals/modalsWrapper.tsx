import { FC, useContext } from "react";
import { ModalContext } from "../../state/modals";
import { CreateFieldModal } from "./createFieldModal";
import { EditFieldModal } from "./editFieldModel";
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Typography,
} from "@material-ui/core";

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
export const ModalsWrapper: FC<{}> = () => {
  const { state, dispatch } = useContext(ModalContext);

  return (
    <div>
      <CreateFieldModal
        section={state.modalData?.section ?? 0}
        open={state.active && state.modal === "CreateField"}
        handleClose={() => dispatch({ type: "close" })}
      ></CreateFieldModal>
      <EditFieldModal 
        open={state.active && state.modal === "EditField"}
        handleClose={() => dispatch({ type: "close" })}
        section={state.modalData?.section ?? 0}
        field={state.modalData?.field}
      ></EditFieldModal>
      <Modal open={state.active && state.modal === "Loading"}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <CircularProgress id="spinner" color="primary" />
          <Typography variant="h4" component="h2">
            Loading ...
          </Typography>
        </div>
      </Modal>
      <Modal open={state.active && state.modal === "Text"}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Box sx={style}>
            <Typography variant="h6" component="p">
              {state.modalData?.text}
            </Typography>
            <Button
              onClick={() => {
                dispatch({ type: "close" });
              }}
            >
              Close
            </Button>
          </Box>
        </div>
      </Modal>
    </div>
  );
};
