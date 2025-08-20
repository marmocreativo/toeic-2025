import { useEmpresas } from "@/hooks/useEmpresas";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function EmpresasList() {
  const { empresas, loading, error } = useEmpresas();

  if (loading) return <Loader2 className="animate-spin w-6 h-6 mx-auto" />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {empresas.map((empresa) => (
        <Card key={empresa.ID_EMPRESA} className="rounded-2xl shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <img
              src={`http://tuservidor.com/uploads/${empresa.EMPRESA_LOGO}`}
              alt={empresa.EMPRESA_NOMBRE_COMERCIAL}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">{empresa.EMPRESA_NOMBRE_COMERCIAL}</h2>
              <p className="text-sm text-muted-foreground">
                RFC: {empresa.EMPRESA_RFC || "No disponible"}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
