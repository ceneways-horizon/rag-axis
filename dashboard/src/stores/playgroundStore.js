import { create } from 'zustand'

// Session-scoped playground state: selected experiment and the run results
// produced in this browser session (persisted runs also live in /runs).
export const usePlaygroundStore = create(set => ({
  selectedExpId: null,
  history: [],

  setSelectedExpId: (expId) => set({ selectedExpId: expId }),

  addResult: (result) => set(state => ({ history: [result, ...state.history] })),

  clearHistory: () => set({ history: [] }),
}))
