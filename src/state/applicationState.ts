import { create } from "zustand";

type ApplicationState = {
  isEditor: boolean;
};

export const useApplicationState = create<ApplicationState>((set) => ({
  isEditor: false,
  setIsEditor: (isEditor: boolean) => set({ isEditor }),
}));
