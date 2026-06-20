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

function syncUrlForRoute(route: AppRoute) {
  if (typeof window === "undefined") return

  if (route.page === "memorial") {
    const path = `/memorial/${encodeURIComponent(route.slug)}`
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path)
    }
    return
  }

  if (/^\/memorial\/.+/.test(window.location.pathname)) {
    window.history.replaceState(null, "", "/")
  }
}

interface NavigationState {
  route: AppRoute
  history: AppRoute[]
  navigate: (route: AppRoute) => void
  back: () => void
}

export const useNavigation = create<NavigationState>((set) => ({
  route: { page: "landing" },
  history: [],
  navigate: (route) => {
    syncUrlForRoute(route)
    set((state) => ({
      route,
      history: [...state.history, state.route],
    }))
  },
  back: () =>
    set((state) => {
      const history = [...state.history]
      const previous = history.pop()
      const route = previous || { page: "landing" }
      syncUrlForRoute(route)
      return { route, history }
    }),
}))

export type { AppRoute }
