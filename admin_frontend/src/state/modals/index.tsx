import React, { FC } from "react"
import { reducer, initialState, IModalState, IModalAction } from "./reducer"

export const ModalContext = React.createContext<{
    state: IModalState;
    dispatch: React.Dispatch<IModalAction>;
  }>({
    state: initialState,
    dispatch: () => null
})

export const ModalProvider: FC<{}>= ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <ModalContext.Provider value={{state,dispatch}}>
    	{ children }
    </ModalContext.Provider>
  )
}