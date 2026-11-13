import { apiFetch } from "../lib/http";

// services/authService.ts
export interface SignupPayload {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role?: "student" | "ta" | "instructor" | "admin";
  bio?: string | null;
  current_streak?: number;
  longest_streak?: number;
  last_streak_date?: string | null;
}

export interface SignupResponse {
  message: string;
}

export interface MessageResponse {
  message: string;
}

const authservices = {
  async getCurrentUser(): Promise<User | null> {
    const response = await apiFetch("/user");

    if (response.status === 401) return null;

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail ?? "Failed to load user");
    }

    return response.json();
  },
  async userLogin(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiFetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async createAccount(payload: SignupPayload): Promise<SignupResponse> {
    const response = await apiFetch("/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    const response = await apiFetch("/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail ?? "Unable to request a password reset");
    }
    return response.json();
  },

  async resetPassword(token: string, password: string): Promise<MessageResponse> {
    const response = await apiFetch("/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, "new_password":password}),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail ?? "Unable to reset your password");
    }
    return response.json();
  },

  async logout(): Promise<void> {
    const response = await apiFetch("/logout", {
      method: "POST",
    });
    if (!response.ok) throw new Error("Logout failed");
  },
};

export default authservices;
