import { axiosInstance } from "@/shared/lib/api-client";
import type {
  User,
  SigninInput,
  CredentialsSignupPayload,
  AuthResponse,
} from "@repo/types";

export async function signup(
  payload: CredentialsSignupPayload,
): Promise<AuthResponse> {
  const res = await axiosInstance.post("/api/v1/auth/signup", {
    ...payload,
    provider: "credentials",
  });
  return res.data;
}

export async function signin(payload: SigninInput): Promise<AuthResponse> {
  const res = await axiosInstance.post("/api/v1/auth/signin", payload);
  return res.data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/api/v1/auth/logout");
}

export async function fetchMe(): Promise<User> {
  const res = await axiosInstance.get("/api/v1/auth/me");
  return res.data.user;
}

export function googleLoginUrl(): string {
  return `${axiosInstance.defaults.baseURL}/api/v1/auth/google`;
}
