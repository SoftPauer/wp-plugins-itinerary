import axios, { AxiosResponse } from "axios";
import { requestsCoreWP, requestsItinerary } from "../api/api";

const wordpressInstance = axios.create({
  baseURL: wpApiSettings.root,
  timeout: 15000,
});

const rocketInstance = axios.create({
  baseURL: "https://alpinechat.bwtsoftpauer.com",
  timeout: 15000,
  // headers: {
  //   "Content-Type": "application/json",
  //   "Access-Control-Allow-Origin": "*",
  // },
});

const responseBody = <T>(response: AxiosResponse<T | any>) => response.data;

const requestsRocketChat = {
  get: <T>(url: string) =>
    rocketInstance.get<T>("api/v1/" + url).then<T>(responseBody),
  post: (url: string, body: {}, headers?: {}) =>
    rocketInstance.post("api/v1/" + url, body, headers).then(responseBody),
  put: <T>(url: string) =>
    rocketInstance.put<T>("api/v1/" + url).then<T>(responseBody),
  delete: <T>(url: string) =>
    rocketInstance.delete<T>("api/v1/" + url).then<T>(responseBody),
};

export interface IRocketChannelData {
  id?: Number;
  itineraryId: Number;
  sectionId: Number;
  jsonData: string;
  channelId: string;
}

export interface IRocketChannelCreate {
  name: string;
  members?: string[];
  readonly?: Boolean;
}

export interface IRocketLogin {
  user: string;
  password: string;
  resume?: string;
}

export interface IRocketChannelQuery {
  itineraryId: Number;
  sectionId: Number;
}

export const RocketChat = {
  saveChannelDetails: async (field: IRocketChannelData): Promise<any> =>
    requestsItinerary.post("rocketChannel/create", field),
  createChannel: async (
    field: IRocketChannelCreate,
    headers: {}
  ): Promise<any> => requestsRocketChat.post("channels.create", field, headers),
  getAuthToken: async (body: {}): Promise<any> =>
    requestsRocketChat.post("login", body, {
      "Content-type": "application/json",
    }),
  getChannels: async (field: IRocketChannelQuery): Promise<[]> =>
    requestsItinerary.get(
      `rocketChannel/getChannels/${field.itineraryId}/${field.sectionId}`
    ),
};
