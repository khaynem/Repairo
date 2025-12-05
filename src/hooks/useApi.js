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
  const isGetMethod = method === "GET";

  // Always call useQuery, but disable it when not needed
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      return await RequestService.request(endpoint, {
        method,
        params,
        withAuth,
      });
    },
    enabled: isGetMethod && enabled && !!endpoint,
    staleTime,
  });

  // Always call useMutation, but only use it when not GET
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

  // Return the appropriate result based on method
  if (isGetMethod) {
    return {
      data: queryResult.data ?? null,
      loading: queryResult.isLoading,
      error: queryResult.error,
      refetch: queryResult.refetch,
    };
  }

  return {
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error,
    refetch: mutation.mutate,
    mutate: mutation.mutate,
  };
}

export default useApi;
