import { useState } from "react";
import { Receipt, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/contexts/TripContext";
import { formatCurrency, getCategoryInfo } from "@/utils/categories";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Layout from "@/components/Layout";

const Movimientos = () => {
  const { trips, movements } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMovements = movements.filter((movement) => {
    if (selectedTrip !== "all" && movement.tripId !== selectedTrip) return false;
    if (selectedCategory !== "all" && movement.category !== selectedCategory) return false;
    return true;
  });

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Movimientos</h1>
          <Button variant="ghost" className="text-primary font-semibold">
            Registrar +
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <Select value={selectedTrip} onValueChange={setSelectedTrip}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Viaje a San Andrés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los viajes</SelectItem>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="alojamiento">Alojamiento</SelectItem>
              <SelectItem value="transporte">Transporte</SelectItem>
              <SelectItem value="comida">Comida</SelectItem>
              <SelectItem value="entretenimiento">Entretenimiento</SelectItem>
              <SelectItem value="seguros">Seguros</SelectItem>
              <SelectItem value="libre">Libre</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredMovements.length > 0 ? (
          <div className="space-y-3">
            {filteredMovements.map((movement) => {
              const categoryInfo = getCategoryInfo(movement.category);
              const CategoryIcon = categoryInfo?.icon || Receipt;
              return (
                <button
                  key={movement.id}
                  className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:bg-muted transition-colors"
                >
                  <div className="bg-muted p-3 rounded-xl">
                    <CategoryIcon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">{movement.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(movement.date), "dd MMM yyyy, h:mm a", { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-category-{movement.category} bg-category-{movement.category}/10 px-3 py-1 rounded-full mb-1">
                      {categoryInfo?.name}
                    </p>
                    <p className="font-bold">{formatCurrency(movement.amount)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-muted rounded-2xl p-8 inline-block mb-4">
              <Receipt className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {trips.length === 0
                ? "Crea un viaje primero para registrar gastos"
                : "No hay movimientos registrados"}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movimientos;
