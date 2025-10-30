import { loginUser, registerUser } from "@/lib/api";
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
