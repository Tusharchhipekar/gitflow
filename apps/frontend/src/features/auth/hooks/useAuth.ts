import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { SigninInput, CredentialsSignupPayload } from "@repo/types";
import { setAccessToken } from "@/shared/lib/api-client";
import { signup, signin, logout, fetchMe } from "../api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });
}

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SigninInput) => signin(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(["me"], data.user);
      router.push("/projects");
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CredentialsSignupPayload) => signup(payload),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(["me"], data.user);
      router.push("/projects");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setAccessToken(null);
      queryClient.clear();
      router.push("/login");
    },
  });
}
