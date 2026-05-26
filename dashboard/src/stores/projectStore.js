import { create } from 'zustand'

export const useProjectStore = create(set => ({
  currentProjectId: null,
  setCurrentProject: (id) => set({ currentProjectId: id }),
}))
