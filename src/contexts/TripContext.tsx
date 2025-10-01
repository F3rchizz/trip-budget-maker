import { createContext, useContext, useState, ReactNode } from "react";
import { Trip, Movement } from "@/types";

interface TripContextType {
  trips: Trip[];
  movements: Movement[];
  addTrip: (trip: Omit<Trip, "id">) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  addMovement: (movement: Omit<Movement, "id">) => void;
  getTripById: (id: string) => Trip | undefined;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const addTrip = (trip: Omit<Trip, "id">) => {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString(),
    };
    setTrips((prev) => [...prev, newTrip]);
  };

  const updateTrip = (id: string, updatedData: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((trip) => (trip.id === id ? { ...trip, ...updatedData } : trip))
    );
  };

  const addMovement = (movement: Omit<Movement, "id">) => {
    const newMovement: Movement = {
      ...movement,
      id: Date.now().toString(),
    };
    setMovements((prev) => [...prev, newMovement]);
  };

  const getTripById = (id: string) => {
    return trips.find((trip) => trip.id === id);
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        movements,
        addTrip,
        updateTrip,
        addMovement,
        getTripById,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrips must be used within a TripProvider");
  }
  return context;
};
