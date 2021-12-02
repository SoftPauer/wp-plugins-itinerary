import axios, { AxiosResponse } from "axios";

const instance = axios.create({
  baseURL: wpApiSettings.root,
  timeout: 15000,
});

const moodleInstance = axios.create({
  baseURL:
    wpApiSettings.moodle_base_url +
    "/webservice/rest/server.php?moodlewsrestformat=json",
  timeout: 150000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  },
});

const responseBody = <T>(response: AxiosResponse<T | any>) => response.data;
const responseBodyWithHeaders = <T>(response: AxiosResponse<T>) => {
  return { data: response.data, headers: response.headers };
};

interface IResponseWithHeader<T> {
  data: T;
  headers: Record<string, string>;
}
export const requestsMoodle = {
  updateApp: (json: string) => {
    const data = new FormData();
    data.append("wstoken", wpApiSettings.moodle_ws_token);
    data.append("json", json);
    data.append("wsfunction", "local_data_consumer_upload");

    return moodleInstance.post("", data).then(responseBody);
  },
};

const requestsItinerary = {
  get: <T>(url: string) =>
    instance.get<T>("itinerary/v1/" + url).then<T>(responseBody),
  post: (url: string, body: {}) =>
    instance.post("itinerary/v1/" + url, body).then(responseBody),
  put: (url: string, body: {}) =>
    instance.put("itinerary/v1/" + url, body).then(responseBody),
  delete: (url: string) =>
    instance.delete("itinerary/v1/" + url).then(responseBody),
};

const requestsCoreWP = {
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
}
export interface IDataSourceProperties{
  source?: number
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
export interface IValue {
  id: number;
  section: number;
  itinerary: number;
  field: number;
  value: string;
  list_index: string;
  value_properties?: IValueProperties;
}
export interface IValueCreate {
  id?: number;
  section: number;
  itinerary: number;
  field: number;
  value: string;
  list_index?: string;
  value_properties?: IValueProperties;
}
export interface IUpdatedRes {
  rowsUpdated: number | boolean;
}
export const Value = {
  getValues: async (
    section_id: number,
    itinerary_id: number
  ): Promise<IValue[]> => {
    const val = await requestsItinerary.get<IValue[]>(
      "values/" + itinerary_id + "/" + section_id
    );
    val.forEach((r) => {
      if (r.value_properties)
        r.value_properties = JSON.parse(r.value_properties as string);
    });
    return val;
  },
  // getAPost: (id: number): Promise<PostType> => requests.get(`posts/${id}`),
  createValueOrUpdate: (field: IValueCreate[]): Promise<IUpdatedRes | IValue> =>
    requestsItinerary.post("values/createOrUpdate", field),
  // updatePost: (post: PostType, id: number): Promise<PostType> =>
  // 	requests.put(`posts/${id}`, post),
  listDelete: (id: number, index: number): Promise<number> =>
    requestsItinerary.put(`values/flagDeleted/${id}/${index}`, {}),
  deleteValue: (id: number): Promise<number> =>
    requestsItinerary.delete(`values/delete/${id}`),
  copyLastItin: (id: number,section:number): Promise<string> =>
    requestsItinerary.post(`values/copyLast/${id}`, {section}),
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
    data: { user_email: string; user_login: string };
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
