import { apiFetch } from "../services/api";

export type Cycle = {
  id: number;
  start_date: string;
  end_date: string;
  symptoms?: Record<string, boolean>;
  notes?: string;
};

// Récupérer tous les cycles de l'utilisateur connecté
export const getCycles = async (): Promise<Cycle[]> => {
  const res = await fetch('/api/cycles');
  const data = await res.json();
  return data as Cycle[];
};

// Créer un nouveau cycle
export const createCycle = async (cycle: {
  start_date: string;
  end_date?: string | null;
  notes?: string;
  symptoms?: Record<string, boolean>;
}) => {
  return apiFetch("api/v1/cycles", {
    method: "POST",
    body: { cycle },
    auth: true,
  });
};

// Mettre à jour un cycle existant
export const updateCycle = async (
  id: number,
  cycle: {
    start_date?: string;
    end_date?: string | null;
    notes?: string;
    symptoms?: Record<string, boolean>;
  }
) => {
  return apiFetch(`api/v1/cycles/${id}`, {
    method: "PUT",
    body: { cycle },
    auth: true,
  });
};

// Supprimer un cycle
export const deleteCycle = async (id: number) => {
  return apiFetch(`api/v1/cycles/${id}`, {
    method: "DELETE",
    auth: true,
  });
};
