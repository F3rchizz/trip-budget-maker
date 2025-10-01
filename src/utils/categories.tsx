import { Home, Car, Utensils, PartyPopper, Shield, Wallet, MoreHorizontal } from "lucide-react";
import { CategoryType } from "@/types";

export const categories = [
  { id: "alojamiento" as CategoryType, name: "Alojamiento", icon: Home },
  { id: "transporte" as CategoryType, name: "Transporte", icon: Car },
  { id: "comida" as CategoryType, name: "Comida", icon: Utensils },
  { id: "entretenimiento" as CategoryType, name: "Entretenimiento", icon: PartyPopper },
  { id: "seguros" as CategoryType, name: "Seguros", icon: Shield },
  { id: "libre" as CategoryType, name: "Libre", icon: Wallet },
  { id: "otro" as CategoryType, name: "Otro", icon: MoreHorizontal },
];

export const getCategoryInfo = (categoryId: CategoryType) => {
  return categories.find((c) => c.id === categoryId);
};

export const formatCurrency = (amount: number, currency: string = "COP") => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
