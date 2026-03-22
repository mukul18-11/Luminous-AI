import api from "./axios";
import type { User } from "../types";

interface AuthResponse {
  user: User;
}

export async function signup(name: string, email: string, password: string) {
  const { data } = await api.post("/auth/signup", { name, email, password });
  return data;
}

export async function verifyOTP(email: string, otp: string): Promise<AuthResponse> {
  const { data } = await api.post("/auth/verify-otp", { email, otp });
  return data;
}

export async function resendOTP(email: string) {
  const { data } = await api.post("/auth/resend-otp", { email });
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(email: string, otp: string, password: string) {
  const { data } = await api.post("/auth/reset-password", { email, otp, password });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function googleAuth(credential: string): Promise<AuthResponse> {
  const { data } = await api.post("/auth/google", { credential });
  return data;
}

export async function getMe(): Promise<{ user: User }> {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function logout() {
  const { data } = await api.post("/auth/logout");
  return data;
}
