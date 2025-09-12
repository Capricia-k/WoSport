import { apiFetch } from "../services/api";

// Récupérer tous les cycles de l'utilisateur connecté
export const getCycles = async () => {
  return apiFetch("api/v1/cycles", { method: "GET", auth: true });
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
