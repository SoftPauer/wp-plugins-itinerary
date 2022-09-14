import { createContext, useContext, useEffect, useState } from "react";
import { IItinerary, Itinerary } from "../api/api";
export interface IItineraryContext {
  selected: IItinerary;
  itineraries: IItinerary[];
  setSelectedItin: (itin: IItinerary) => void;
}
const SESSION_KEY_SELECTED_ITIN = "selectedItin";

const defItin = { id: -1, name: "init", time_created: "", time_updated: "" };
const ItineraryContext = createContext<IItineraryContext>({
  selected: defItin,
  itineraries: [],
  setSelectedItin: (itin: IItinerary) => {},
});

export const ItineraryProvider = (props: { children: React.ReactNode }) => {
  const [selectedItinerary, _setselectedItinerary] =
    useState<IItinerary>(defItin);
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);

  useEffect(() => {
    async function fetchData() {
      const itins = await Itinerary.getItineraries();
      const selectedItin = sessionStorage.getItem(SESSION_KEY_SELECTED_ITIN);
      if (selectedItin === null) {
        _setselectedItinerary(itins[itins.length - 1]);
      } else {
        const itin = JSON.parse(selectedItin);
        _setselectedItinerary(itin);
      }
      setItineraries(itins);
    }
    fetchData();
  }, []);

  const setselectedItinerary = (value: IItinerary) => {
    _setselectedItinerary(value);
    sessionStorage.setItem(SESSION_KEY_SELECTED_ITIN, JSON.stringify(value));
  };

  return (
    <ItineraryContext.Provider
      value={{
        selected: selectedItinerary,
        itineraries: itineraries,
        setSelectedItin: setselectedItinerary,
      }}
    >
      {props.children}
    </ItineraryContext.Provider>
  );
};
export const useItineraryContext = () => {
  return useContext(ItineraryContext);
};
