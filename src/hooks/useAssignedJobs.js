"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { useAuth } from "./useAuth";
import RequestService from "../services/requestService";

export function useAssignedJobs() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.repairs.list(),
    queryFn: async () => {
      const response = await RequestService.request("/repairs", {
        method: "GET",
        withAuth: true,
      });
      return Array.isArray(response) ? response : [];
    },
    enabled: !!user?._id,
    select: (data) => {
      if (!user || user.role !== "technician") return data;
      return data.filter(
        (job) => job.technicianId && job.technicianId._id === user._id
      );
    },
  });

  return {
    jobs: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

export default useAssignedJobs;
