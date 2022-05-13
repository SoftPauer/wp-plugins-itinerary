import { IField } from "../../api/api";

export interface IModalState {
  active: boolean;
  modal?: string;
  modalData?: { section?: number; field?: IField; text?: string };
}

export interface IModalAction {
  type: "open" | "close";
  modal?: "CreateField" | "EditField" | "Loading" | "Text";
  modalData?: { section?: number; field?: IField; text?: string };
}

export const reducer = (state: IModalState, action: IModalAction) => {

  switch (action.type) {
    case "open":
      return {
        ...state,
        modalData: action.modalData,
        modal: action.modal,
        active: true,
      };
    case "close":
      return {
        ...state,
        modalData: undefined,
        modal: undefined,
        active: false,
      };
    default:
      return state;
  }
};

export const initialState: IModalState = {
  active: false,
};
