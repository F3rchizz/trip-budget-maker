import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";
import { useTrips } from "@/contexts/TripContext";
import { CategoryType } from "@/types";
import { categories } from "@/utils/categories";
import { toast } from "@/hooks/use-toast";

interface RegisterExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId?: string;
}

const RegisterExpenseModal = ({ open, onOpenChange, tripId }: RegisterExpenseModalProps) => {
  const { addMovement, trips } = useTrips();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryType | "">("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [selectedTripId, setSelectedTripId] = useState(tripId || "");

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para el gasto",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Por favor selecciona una categoría",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un monto válido",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTripId) {
      toast({
        title: "Error",
        description: "Por favor selecciona un viaje",
        variant: "destructive",
      });
      return;
    }

    addMovement({
      tripId: selectedTripId,
      name: name.trim(),
      category: category as CategoryType,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
    });

    toast({
      title: "Gasto registrado",
      description: "El gasto se ha registrado exitosamente",
    });

    // Reset form
    setName("");
    setCategory("");
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Registrar gasto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Name Input */}
          <Input
            placeholder="Ej: Hospedaje johnny cay"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-input h-12 text-base"
          />

          {/* Trip Selection - only show if no tripId provided */}
          {!tripId && trips.length > 0 && (
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="Selecciona un viaje" />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Category Select */}
          <div className="relative">
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryType)}>
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Amount Input with Currency */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                placeholder="300.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl border-input h-12 text-base pl-8"
              />
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="rounded-xl h-12 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Button */}
          <Button
            variant="outline"
            className="w-full rounded-xl h-12 text-base font-semibold"
            type="button"
          >
            <Camera className="h-5 w-5" />
            Tomar Foto
          </Button>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full rounded-xl h-12 text-base font-semibold"
          >
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterExpenseModal;
