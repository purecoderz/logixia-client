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
}

export interface SignupResponse {
  message: string;
}

const api = "http://localhost:8000";

const authservices = {
  async getCurrentUser(): Promise<User | null> {
    const response = await fetch(`${api}/user`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail);
    }

    return await response.json();
  },

  async userLogin(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${api}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    return await response.json();
  },

  async createAccount(payload: SignupPayload): Promise<SignupResponse> {
    const response = await fetch(`${api}/sign-up`, {
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

  async logout(): Promise<void> {
    const response = await fetch(`${api}/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Logout failed");
  },
};

export default authservices;
