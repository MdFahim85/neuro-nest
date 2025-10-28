import { loginUser } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useLoginUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.success(`Welcome back ${data.user.username}`);

      queryClient.invalidateQueries({ queryKey: ["login"] });
    },
  });

  return mutation;
}
