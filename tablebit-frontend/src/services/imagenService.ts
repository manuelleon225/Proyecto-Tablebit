import api from "./api";

export interface ImagenData {
  id: number;
  url: string;
  tipo: string;
}

export const imagenService = {
  subirImagen: async (
    restauranteId: number,
    file: File,
    tipo: "logo" | "galeria" | "portada" = "galeria"
  ): Promise<{ data: { message: string; imagen: ImagenData } }> => {
    const formData = new FormData();
    formData.append("imagen", file);
    formData.append("tipo", tipo);

    const response = await api.post(
      `/restaurantes/${restauranteId}/imagenes`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  eliminarImagen: async (imagenId: number) => {
    return api.delete(`/imagenes/${imagenId}`);
  },
};
