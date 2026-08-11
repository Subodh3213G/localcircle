import { create } from 'zustand'

export interface User {
  id: string
  full_name: string
  avatar_url?: string
  neighborhood_id?: string
  is_verified: boolean
}

export interface Neighborhood {
  id: string
  name: string
  slug: string
  city: string
  state: string
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'advisory'
  status: 'active' | 'resolved' | 'cancelled'
  created_at: string
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  currentNeighborhood: Neighborhood | null
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void
  urgentAlerts: Alert[]
  setUrgentAlerts: (alerts: Alert[]) => void
  addUrgentAlert: (alert: Alert) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  currentNeighborhood: null,
  setCurrentNeighborhood: (neighborhood) => set({ currentNeighborhood: neighborhood }),
  urgentAlerts: [],
  setUrgentAlerts: (alerts) => set({ urgentAlerts: alerts }),
  addUrgentAlert: (alert) => set((state) => ({ 
    urgentAlerts: [alert, ...state.urgentAlerts] 
  })),
}))
