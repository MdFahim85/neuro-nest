"use client";

import { loginUser } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLoginUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
  });

  return mutation;
}
