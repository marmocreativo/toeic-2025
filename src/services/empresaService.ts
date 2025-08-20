import api from "@/lib/api";

export interface Empresa {
  ID_EMPRESA: string;
  EMPRESA_NOMBRE_COMERCIAL: string;
  EMPRESA_RAZON_SOCIAL: string;
  EMPRESA_RFC: string;
  EMPRESA_LOGO: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export async function fetchEmpresas(): Promise<ApiResponse<Empresa[]>> {
  const response = await api.get<ApiResponse<Empresa[]>>("/empresas");
  return response.data;
}
