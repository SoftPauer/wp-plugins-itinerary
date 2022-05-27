import { Box, Button, Modal, TextField, Typography } from "@material-ui/core";
import { LocalConvenienceStoreOutlined } from "@material-ui/icons";
import { debug } from "console";
import React, { FC, useState } from "react";
import { IField } from "../../api/api";
import { sortFields } from "../../fieldTypes";
import { ISortedField } from "../../pages/sectionValues";
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
function flat(node: any, prev: IField[], result: IField[]) {
  console.log(node);
  if (Array.isArray(node)) {
    node.forEach((e) => flat(e, prev, result));
  } else {
    prev.push(node.field);
    if (!node.children.length) result.concat(prev);
    else flat(node.children, prev, result);
  }
}

function getChannels(
  parent: IField,
  result: any[],
  children?: ISortedField[],
  prev?: any[]
) {
  let itemArray: IField[] = [];
  if (children?.length == 0) {
    if (
      (parent.type_properties?.data_source == "users" ||
        parent.type_properties?.data_source == "parent") &&
      parent.field_type == "select"
    ) {
      itemArray.push(parent);
      Array.prototype.push.apply(prev, itemArray);
    }
  } else {
    itemArray.push(parent);
    children?.forEach((element) => {
      getChannels(element.field, result, element.children, itemArray);
    });
    if (itemArray.length > 1) result.push(itemArray);
  }
}

export const CreateRocketChannelsModal: FC<CreateRocketChannelsModalProps> = ({
  open,
  handleClose,
}) => {
  const valueContext = useValueContext();
  const fieldContext = useFieldContext();

  const generateAllPossibleChannels = () => {
    const possibleChannels: IChannelData[] = [];
    const channelBranches: [] = [];
    const sortedFields = sortFields(fieldContext.fields, false);
    sortedFields.forEach((element) => {
      getChannels(element.field, channelBranches, element.children);
    });

    channelBranches.forEach((possibleChannel: IField[]) => {
      //   possibleChannel.forEach((element: IField, index) => {
      //     console.log("data source: ", !!element.type_properties?.data_source);
      //     if (!!element.type_properties?.data_source) {
      //       if (index != 0) {
      //         possibleChannels.push({
      //           name: possibleChannel[index - 1].field_name,
      //         });
      //       }
      //     }
      //   });
      console.log(possibleChannel);
      const parent = possibleChannel[0];
      const child = possibleChannel[1];
      const parentValue = valueContext.getValue(parent);
      const childValue = valueContext.getValue(child, "0.1");
      console.log("parentValue is : ", parentValue);
      console.log("childValue is : ", childValue);
    });

    // sortedFields.forEach((field) => {
    //   console.log(field);
    //   console.log(field.field.type_properties?.data_source);
    //     if (
    //       field.field.type_properties?.data_source == "users" ||
    //       field.field.type_properties?.data_source == "parent"
    //     ) {
    //       valueContext.getListFieldLength(parent!);

    //       if (parent && valueContext.getValue(parent)) {
    //         console.log("field is: ", field);
    //         console.log("Parent is: ", parent);
    //         // if the parent value exists
    //         const parentValue = valueContext.getValue(parent);
    //         console.log("parent Value is: ", parentValue);
    //         type Key = keyof typeof parentValue;
    //         let key: Key = field.type_properties.json_key!;
    //         parentValue.forEach((element: any, index: number) => {
    //           possibleChannels.push({
    //             name: parent.field_name + " " + (index + 1),
    //             users: element[key],
    //           });
    //         });
    //       }
    //     }
    // });
    console.log(possibleChannels);

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
