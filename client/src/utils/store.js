import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      token: "",
      setToken: (token) => set({ token: token }),
      user: "",
      setUser: (user) => set({ user: user }),
    }),
    { name: "auth" }
  )
);
