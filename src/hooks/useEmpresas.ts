import { useEffect, useState } from "react";
import { fetchEmpresas, type Empresa } from "@/services/empresaService";

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmpresas()
      .then((res) => {
        if (res.status === "success") {
          setEmpresas(res.data);
        } else {
          setError(res.message);
        }
      })
      .catch(() => setError("Error al cargar empresas"))
      .finally(() => setLoading(false));
  }, []);

  return { empresas, loading, error };
}
