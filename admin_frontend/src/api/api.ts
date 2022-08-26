import axios, { AxiosResponse } from "axios";
import { intervalToDuration } from "date-fns";
import { ExcelDisplayTypes } from "../fieldTypes";
import { LooseObject } from "../utils";


const instance = axios.create({
  baseURL: wpApiSettings.root,
  timeout: 15000,
});


const responseBody = <T>(response: AxiosResponse<T | any>) => response.data;
const responseBodyWithHeaders = <T>(response: AxiosResponse<T>) => {
  return { data: response.data, headers: response.headers };
};

interface IResponseWithHeader<T> {
  data: T;
  headers: Record<string, string>;
}


export const requestsItinerary = {
  get: <T>(url: string) =>
    instance.get<T>("itinerary/v1/" + url).then<T>(responseBody),
  post: (url: string, body: {}) =>
    instance.post("itinerary/v1/" + url, body).then(responseBody),
  put: (url: string, body: {}) =>
    instance.put("itinerary/v1/" + url, body).then(responseBody),
  delete: (url: string) =>
    instance.delete("itinerary/v1/" + url).then(responseBody),
};

export const requestsCosting = {
  get: <T>(url: string) =>
    instance.get<T>("itinerary/v1/" + url, body).then<T>(responseBody),
  post: (url: string, body: {}) =>
    instance.post("itinerary/v1/" + url, body).then(responseBody),
  put: (url: string, body: {}) =>
    instance.put("itinerary/v1/" + url, body).then(responseBody),
  delete: (url: string) =>
    instance.delete("itinerary/v1/" + url).then(responseBody),
};

export const requestsCoreWP = {
  get: <T>(url: string) =>
    instance
      .get("wp/v2/" + url, { headers: { "X-WP-Nonce": wpApiSettings.nonce } })
      .then<IResponseWithHeader<T>>(responseBodyWithHeaders),
  post: (url: string, body: {}) =>
    instance.post("wp/v2/" + url, body).then(responseBody),
  put: (url: string, body: {}) =>
    instance.put("wp/v2/" + url, body).then(responseBody),
  delete: (url: string) => instance.delete("wp/v2/" + url).then(responseBody),
};

export interface IItinerary {
  id: number;
  name: string;
  time_created: string;
  time_updated: string;
}

export interface ICreateItinerary {
  name: string;
}
export const Itinerary = {
  getItineraries: (): Promise<IItinerary[]> =>
    requestsItinerary.get("itineraries"),
  // getAPost: (id: number): Promise<PostType> => requests.get(`posts/${id}`),
  createItinerary: (post: ICreateItinerary): Promise<number> =>
    requestsItinerary.post("itineraries/create", post),
  // updatePost: (post: PostType, id: number): Promise<PostType> =>
  // 	requests.put(`posts/${id}`, post),
  deleteItinerary: (id: number): Promise<void> =>
    requestsItinerary.delete(`itineraries/delete/${id}`),
};

export interface ICosting{
  id: number;
  itinerary_id: number;
  section_id: number;
  listKey: string;
  costing: string;
}

export interface ICreateCosting{
  itinerary_id: number;
  section_id:number;
  listKey:string;
  costing:LooseObject;
}

export const Costing = {
  getCosting: (): Promise<ICosting[]> =>
    requestsCosting.get("costings"),
  // getAPost: (id: number): Promise<PostType> => requests.get(`posts/${id}`),
  createCosting: (post: ICreateCosting): Promise<number> =>
    requestsItinerary.post("costings/create", post),
  // updatePost: (post: PostType, id: number): Promise<PostType> =>
  // 	requests.put(`posts/${id}`, post),
  deleteCosting: (id: number): Promise<void> =>
    requestsItinerary.delete(`costings/delete/${id}`),
};

export interface IUpdateApp {
  itinId: number;
  time_updated: string;
  json_data: string;
}

export const UpdateApp = {
  createAppEntry: (payload: IUpdateApp): Promise<JSON> => {
    return requestsItinerary.post("itineraries/updateApp", payload);
  },
};

export interface ISection {
  id: number;
  name: string;
  time_created: string;
  time_updated: string;
  properties?: ISectionProperties;
}

export interface ISectionProperties {
  jsonName?: string;
}
export interface ISectionCreate {
  name: String;
  properties?: ISectionProperties;
}
export const Section = {
  getSections: async (): Promise<ISection[]> => {
    const res = await requestsItinerary.get<ISection[]>("sections");
    res.forEach((r) => {
      if (r.properties) r.properties = JSON.parse(r.properties as string); //someday I will change backend to send an object instead string for now it will do
    });
    return res;
  },
  // getAPost: (id: number): Promise<PostType> => requests.get(`posts/${id}`),
  createSection: (section: ISectionCreate): Promise<number> =>
    requestsItinerary.post("sections/create", section),
  // updatePost: (post: PostType, id: number): Promise<PostType> =>
  // 	requests.put(`posts/${id}`, post),
  deleteSection: (id: number): Promise<void> =>
    requestsItinerary.delete(`sections/delete/${id}`),
};
export interface ITypeProperties {
  data_source?: string;
  data_source_properties?: IDataSourceProperties;
  json_key?: string;
  keyless?: boolean;
  data_transform?: string;
  data_transform_properties?: string;
  excelDisplayType?: ExcelDisplayTypes;
  key_fields?: string[];// used to diplay next to the header 
  showOnDashboard?: boolean;
}
export interface IDataSourceProperties {
  source?: number;
}
export interface IField {
  id: number;
  section: number;
  position: number;
  field_type: string;
  field_name: string;
  parent: number;
  type_properties?: ITypeProperties;
}
export interface IFieldCreate {
  id?: number;
  name: string;
  section: number;
  position: number;
  type: string;
  parent?: number;
  type_properties?: ITypeProperties;
}
export const Field = {
  getFields: async (section_id: number): Promise<IField[]> => {
    const res = await requestsItinerary.get<IField[]>("fields/" + section_id);

    res.forEach((r) => {
      if (r.type_properties)
        r.type_properties = JSON.parse(r.type_properties as string); //someday I will change backend to send an object instead string for now it will do
    });

    return res;
  },
  // getAPost: (id: number): Promise<PostType> => requests.get(`posts/${id}`),
  createField: (field: IFieldCreate): Promise<number> =>
    requestsItinerary.post("fields/create", field),
  // updatePost: (post: PostType, id: number): Promise<PostType> =>
  // 	requests.put(`posts/${id}`, post),
  deleteField: (id: number): Promise<void> =>
    requestsItinerary.delete(`fields/delete/${id}`),
};

export interface IValueProperties {
  deleted?: string[];
}
export interface IValues {
  id: number;
  section: number;
  itinerary: number;
  value: any;
}
export interface IValueCreate {
  id?: number;
  section: number;
  itinerary: number;
  value: LooseObject;
}
export interface IUpdatedRes {
  rowsUpdated: number | boolean;
}
export const Value = {
  getValues: async (
    section_id: number,
    itinerary_id: number
  ): Promise<IValues | null> => {
    const val = await requestsItinerary.get<IValues | null>(
      "values/" + itinerary_id + "/" + section_id
    );

    return val;
  },
  // getAPost: (id: number): Promise<PostType> => requests.get(`posts/${id}`),
  createValueOrUpdate: (
    value: IValueCreate
  ): Promise<IUpdatedRes | IValues> => {
    return requestsItinerary.post("values/createOrUpdate", value);
  },
  // updatePost: (post: PostType, id: number): Promise<PostType> =>
  // 	requests.put(`posts/${id}`, post),
  listDelete: (id: number, index: number): Promise<number> =>
    requestsItinerary.put(`values/flagDeleted/${id}/${index}`, {}),
  deleteValue: (id: number): Promise<number> =>
    requestsItinerary.delete(`values/delete/${id}`),
  copyLastItin: (id: number, section: number): Promise<string> =>
    requestsItinerary.post(`values/copyLast/${id}`, { section }),
};

export interface IUser {
  name: string;
  meta: {
    department: string[];
    moodle_id: string[];
    first_name: string[];
    last_name: string[];
  };
  data: {
    data: { user_email: string; user_login: string; display_name: string };
    caps: { subscriber: boolean; administrator: boolean };
  };
}
export const User = {
  getUsers: async (): Promise<IUser[]> => {
    const users: IUser[] = [];
    const resp = await requestsCoreWP.get<IUser[]>("users/?per_page=100");

    const pages = Number.parseInt(resp.headers["x-wp-totalpages"]);
    users.push(...resp.data);

    for (let i = 2; i <= pages; i++) {
      let res = await requestsCoreWP.get<IUser[]>(
        "users/?per_page=100&page=" + i.toString()
      );
      users.push(...res.data);
    }
    return users;
  },
};
