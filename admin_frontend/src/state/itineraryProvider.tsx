import { createContext, useContext, useEffect, useState } from "react";
import { IItinerary, Itinerary } from "../api/api";
interface IItineraryContext {
  selected: IItinerary;
  itineraries: IItinerary[];
  setSelectedItin: (itin: IItinerary) => void;
}
const defItin = { id: -1, name: "init", time_created: "", time_updated: "" };
const ItineraryContext = createContext<IItineraryContext>({
  selected: defItin,
  itineraries: [],
  setSelectedItin: (itin: IItinerary) => {},
});

export const ItineraryProvider = (props: { children: React.ReactNode }) => {
  const [selectedItinerary, setselectedItinterary] =
    useState<IItinerary>(defItin);
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);

  useEffect(() => {
    async function fetchData() {
      const itins = await Itinerary.getItineraries();
      setselectedItinterary(itins[itins.length - 1]);
      setItineraries(itins);
    }
    fetchData();
  }, []);

  return (
    <ItineraryContext.Provider
      value={{
        selected: selectedItinerary,
        itineraries: itineraries,
        setSelectedItin: setselectedItinterary,
      }}
    >
      {props.children}
    </ItineraryContext.Provider>
  );
};
export const useItineraryContext = () => {
  return useContext(ItineraryContext);
};
