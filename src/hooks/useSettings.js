// hooks/useSettings.js
import { useQuery } from "@tanstack/react-query";
import Api from "../Config/Api";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await Api.get("/api/settings");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};
