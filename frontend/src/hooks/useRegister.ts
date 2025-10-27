"use client";

import { registerUser } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRegisterUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["register"] });
    },
  });

  return mutation;
}
