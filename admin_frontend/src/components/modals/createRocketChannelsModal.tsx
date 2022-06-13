import { Box, Button, Modal, TextField, Typography } from "@material-ui/core";
import React, { FC, useState } from "react";
import { IField, User } from "../../api/api";
import {
  IRocketChannelCreate,
  IRocketChannelData,
  RocketChat,
} from "../../api/rocketChannel";
import { FieldTypes } from "../../fieldTypes";
import { ISortedField } from "../../pages/sectionValues";
import { useFieldContext } from "../../state/fieldProvider";
import {
  IItineraryContext,
  useItineraryContext,
} from "../../state/itineraryProvider";
import {
  ISectionContext,
  useSectionContext,
} from "../../state/sectionProvider";

import { useValueContext } from "../../state/valueProvider";
import { sortFields } from "../../utils";
const style: any = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
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
  subChannels?: IChannelData[];
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
  valueContext: any,
  children?: ISortedField[],
  index?: string
) {
  const channelDataArray: IChannelData[] = [];

  if (parent.field_type === FieldTypes.list) {
    const parentValue = valueContext.getValue(parent, index);
    for (let i = 0; i < parentValue.length; i++) {
      let channelData: IChannelData = {
        name: parent.field_name + " " + (i + 1),
        subChannels: [],
      };
      children?.forEach((element) => {
        if (element.children.length === 0) {
          if (
            (element.field.type_properties?.data_source === "users" ||
              element.field.type_properties?.data_source === "parent") &&
            (element.field.field_type === "select" ||
              element.field.field_type === "text")
          ) {
            channelData.users = valueContext.getValue(
              element.field,
              index + "." + i
            );
          }
        } else {
          channelData.subChannels?.push(
            ...getChannels(
              element.field,
              valueContext,
              element.children,
              index + "." + i
            )
          );
        }
      });
      channelDataArray.push(channelData);
    }
  }
  return channelDataArray;
}

const getAuthToken = async () => {
  const body = { user: "soft", password: "12qwaszx" };
  const response = RocketChat.getAuthToken(body).then((res) => {
    return {
      "Content-type": "application/json",
      "X-User-Id": res.data.userId,
      "X-Auth-Token": res.data.authToken,
    };
  });

  const userAuth = await response;

  return userAuth;
};

async function getUserNames(users?: string[]) {
  if (!users) {
    return;
  }
  const usernameList: string[] = [];
  const usersList = await User.getUsers();
  usersList.forEach((user) => {
    if (users.indexOf(user.data.data.display_name) !== -1) {
      {
        usernameList.push(user.data.data.user_login);
      }
    }
  });
  return usernameList;
}

async function getExisitingChannels(
  itinContext: IItineraryContext,
  SectionContext: ISectionContext
) {
  const existingChannels: any[] = [];
  if (itinContext.selected.id != -1 && SectionContext.selectedSection) {
    const savedChannels = RocketChat.getChannels({
      itineraryId: itinContext.selected.id,
      sectionId: SectionContext.selectedSection?.id!,
    }).then((response) => {
      response.forEach((channel: any) => {
        const channelJson = channel.json_data.replace("'", "");
        const channelObj = JSON.parse(channelJson);
        existingChannels.push(channelObj);
      });
      return existingChannels;
    });
    return savedChannels;
  }
  return existingChannels;
}

async function createRocketChannels(
  channelData: IChannelData,
  itinContext: IItineraryContext,
  sectionContext: ISectionContext
) {
  if (!channelData.channelName) {
    return;
  }
  const members = await getUserNames(channelData.users);
  const adminAuth = await getAuthToken();
  const channelFields: IRocketChannelCreate = {
    name: channelData.channelName,
    members: members,
  };

  const channel = await RocketChat.createChannel(channelFields, {
    headers: adminAuth,
  });
  const rocketChannelData: IRocketChannelData = {
    itineraryId: itinContext.selected.id,
    sectionId: sectionContext.selectedSection?.id!,
    jsonData: JSON.stringify(channelData),
    channelId: `${channel.channel._id}`,
  };

  await RocketChat.saveChannelDetails(rocketChannelData);
}

export const CreateRocketChannelsModal: FC<CreateRocketChannelsModalProps> = ({
  open,
  handleClose,
}) => {
  const valueContext = useValueContext();
  const fieldContext = useFieldContext();
  const sectionContext = useSectionContext();
  const itnContext = useItineraryContext();

  const generateAllPossibleChannels = () => {
    const possibleChannels: IChannelData[] = [];
    const sortedFields = sortFields(fieldContext.fields, false);
    sortedFields.forEach((element, index) => {
      console.log(element);
      console.log(valueContext.getValue(element.field, index.toString()));
      possibleChannels.push(
        ...getChannels(
          element.field,
          valueContext,
          element.children,
          index.toString()
        )
      );
    });

    console.log("All Channel Branches: ", possibleChannels);
    return possibleChannels;
  };

  const channelData = generateAllPossibleChannels();
  getExisitingChannels(itnContext, sectionContext).then((res) => {
    const existingChannels = res;
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
            Create Chat Channels
          </Typography>
          {channelData.map((channel, index) => {
            return (
              <>
                <div style={{ display: "flex", margin: "10px 0 10px 0" }}>
                  <Typography variant="h6" component="h2" key={index}>
                    {channel.name}
                  </Typography>
                  <TextField
                    style={{ width: "100%", marginLeft: 20 }}
                    required
                    label="Channel Name"
                    onChange={(val) => {
                      channel.channelName = val.target.value;
                    }}
                    value={channel.channelName}
                  />
                  <Button>Create Channel</Button>
                </div>
                <div>
                  {channel.subChannels?.map((subChannel, subIndex) => {
                    return (
                      <div
                        style={{ display: "flex", margin: "10px 0 10px 30px" }}
                      >
                        <Typography variant="h6" component="h2" key={subIndex}>
                          {subChannel.name}
                        </Typography>
                        <TextField
                          style={{ width: "100%", marginLeft: 20 }}
                          required
                          label="Channel Name"
                          onChange={(val) => {
                            subChannel.channelName = val.target.value;
                          }}
                          error={subChannel.channelName === ""}
                          value={subChannel.channelName}
                        />
                        <Button
                          onClick={async () => {
                            getExisitingChannels(
                              itnContext,
                              sectionContext
                            ).then((res) => {
                              console.log(res);
                            });
                            await createRocketChannels(
                              subChannel,
                              itnContext,
                              sectionContext
                            );
                          }}
                        >
                          Create Channel
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })}
        </Box>
      </Modal>
    </div>
  );
};
