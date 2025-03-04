import create from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token"),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  removeToken: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));
