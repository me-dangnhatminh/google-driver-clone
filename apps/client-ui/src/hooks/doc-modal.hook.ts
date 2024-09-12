import { create, useStore } from "zustand";

type DocModal = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const docModal = create<DocModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const useDocModal = () => useStore(docModal);
