export type CategoryType =
  | "alojamiento"
  | "transporte"
  | "comida"
  | "entretenimiento"
  | "seguros"
  | "libre"
  | "otro";

export interface BudgetCategory {
  category: CategoryType;
  amount: number;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  categories: BudgetCategory[];
  status: "pendiente" | "en-progreso" | "completado";
}

export interface Movement {
  id: string;
  tripId: string;
  category: CategoryType;
  name: string;
  amount: number;
  date: string;
}
