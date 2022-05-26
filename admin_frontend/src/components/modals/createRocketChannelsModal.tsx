import { Box, Button, Modal, TextField, Typography } from "@material-ui/core";
import React, { FC, useState } from "react";
import { IField } from "../../api/api";
import { useFieldContext } from "../../state/fieldProvider";
import { useSectionContext } from "../../state/sectionProvider";
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

type CreateRocketChannelsModalProps = {
  open: boolean;
  handleClose: () => void;
};

interface IChannelData {
  name: string;
  channelName?: string;
  users?: string[];
}

export const CreateRocketChannelsModal: FC<CreateRocketChannelsModalProps> = ({
  open,
  handleClose,
}) => {
  const valueContext = useValueContext();
  const fieldContext = useFieldContext();

  const generateAllPossibleChannels = () => {
    const possibleChannels: IChannelData[] = [];
    fieldContext.fields.forEach((field) => {
      if (
        field.type_properties?.data_source == "users" ||
        field.type_properties?.data_source == "parent"
      ) {
        // check if field is of type user or parent which is a list of users
        const parent = fieldContext.getFieldById(field.parent);
        if (parent && valueContext.getValue(parent)) {
          console.log("field is: ", field);
          console.log("Parent is: ", parent);
          // if the parent value exists
          const parentValue = valueContext.getValue(parent);
          console.log("parent Value is: ", parentValue);
          type Key = keyof typeof parentValue;
          let key: Key = field.type_properties.json_key!;
          parentValue.forEach((element: any, index: number) => {
            possibleChannels.push({
              name: parent.field_name + " " + (index + 1),
              users: element[key],
            });
          });
        }
      }
    });

    return possibleChannels;
  };

  const channelData = generateAllPossibleChannels();

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
            Create Chat Channels
          </Typography>
          {channelData.map((element, index) => {
            console.log(element);
            return (
              <div style={{ display: "flex", margin: "10px 0 10px 0" }}>
                <Typography variant="h6" component="h2" key={index}>
                  {element.name}
                </Typography>
                <TextField
                  style={{ width: "50%" }}
                  required
                  label="Channel Name"
                  onChange={() => {}}
                  value={element.channelName}
                />
                <Button>Create Channel</Button>
              </div>
            );
          })}
        </Box>
      </Modal>
    </div>
  );
};
