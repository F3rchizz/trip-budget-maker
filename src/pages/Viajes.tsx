import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrips } from "@/contexts/TripContext";
import { formatCurrency } from "@/utils/categories";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Layout from "@/components/Layout";

const Viajes = () => {
  const { trips } = useTrips();
  const navigate = useNavigate();

  const upcomingTrips = trips.filter((trip) => trip.status === "pendiente");

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mis Viajes</h1>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-primary font-semibold"
          >
            Planear viaje +
          </Button>
        </div>

        {upcomingTrips.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Próximos</h2>
            </div>

            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg">{trip.name}</h3>
                    <Badge className="bg-status-pendiente/10 text-status-pendiente hover:bg-status-pendiente/20 border-0">
                      Pendiente
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha</span>
                      <span className="font-medium">
                        {format(new Date(trip.startDate), "dd", { locale: es })} al{" "}
                        {format(new Date(trip.endDate), "dd MMM, yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Presupuesto</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(trip.totalBudget)}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full rounded-xl font-semibold" size="lg">
                    Registrar Gasto
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {trips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes viajes planeados</p>
            <Button onClick={() => navigate("/")}>Crear primer viaje</Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Viajes;
