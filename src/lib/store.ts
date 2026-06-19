import { create } from "zustand"

export type AppRoute =
  | { page: "landing" }
  | { page: "login"; redirect?: string }
  | { page: "signup" }
  | { page: "forgot-password" }
  | { page: "dashboard" }
  | { page: "create-memorial" }
  | { page: "edit-memorial"; memorialId: string }
  | { page: "memorial"; slug: string }
  | { page: "settings" }

interface NavigationState {
  route: AppRoute
  history: AppRoute[]
  navigate: (route: AppRoute) => void
  back: () => void
}

export const useNavigation = create<NavigationState>((set) => ({
  route: { page: "landing" },
  history: [],
  navigate: (route) =>
    set((state) => ({
      route,
      history: [...state.history, state.route],
    })),
  back: () =>
    set((state) => {
      const history = [...state.history]
      const previous = history.pop()
      return {
        route: previous || { page: "landing" },
        history,
      }
    }),
}))

export type { AppRoute }
