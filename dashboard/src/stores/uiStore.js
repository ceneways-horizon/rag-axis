import { create } from 'zustand'

export const useUIStore = create(set => ({
  toasts: [],
  addToast: (toast) => set(state => ({ toasts: [...state.toasts, { ...toast, id: Date.now() }] })),
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))
