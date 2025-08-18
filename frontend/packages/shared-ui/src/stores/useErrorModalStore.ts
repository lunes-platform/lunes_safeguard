import { create } from 'zustand';

interface ErrorModalState {
  isOpen: boolean;
  title: string;
  message: string;
  openModal: (title: string, message: string) => void;
  closeModal: () => void;
}

export const useErrorModalStore = create<ErrorModalState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  openModal: (title, message) => set({ isOpen: true, title, message }),
  closeModal: () => set({ isOpen: false, title: '', message: '' }),
}));