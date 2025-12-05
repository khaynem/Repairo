"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import RequestService from "../services/requestService";

export function useApi({
  endpoint,
  method = "GET",
  body,
  params,
  enabled = true,
  withAuth = true,
  staleTime,
  onSuccess,
  onError,
}) {
  const queryKey = [endpoint, method, params];

  if (method === "GET") {
    const { data, isLoading, error, refetch } = useQuery({
      queryKey,
      queryFn: async () => {
        return await RequestService.request(endpoint, {
          method,
          params,
          withAuth,
        });
      },
      enabled: enabled && !!endpoint,
      staleTime,
    });

    return {
      data: data ?? null,
      loading: isLoading,
      error,
      refetch,
    };
  }

  const mutation = useMutation({
    mutationFn: async () => {
      return await RequestService.request(endpoint, {
        method,
        body,
        params,
        withAuth,
      });
    },
    onSuccess,
    onError,
  });

  return {
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error,
    refetch: mutation.mutate,
    mutate: mutation.mutate,
  };
}

export default useApi;
