import { create } from "zustand";

export interface WindowState {
  id: string;
  title: string;
  appType: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
  data?: any; // Additional data for the window (e.g., file path for text editor)
}

interface WindowStoreState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;

  // Actions
  createWindow: (
    window: Omit<WindowState, "id" | "zIndex" | "isActive">,
  ) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number },
  ) => void;
  updateWindowSize: (
    id: string,
    size: { width: number; height: number },
  ) => void;
  updateWindowData: (id: string, data: any) => void;
  getWindow: (id: string) => WindowState | undefined;
  getActiveWindow: () => WindowState | undefined;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,

  createWindow: (windowData) => {
    const id = generateId();
    const zIndex = get().nextZIndex;

    const newWindow: WindowState = {
      ...windowData,
      id,
      zIndex,
      isActive: true,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      nextZIndex: zIndex + 1,
    }));

    return id;
  },

  closeWindow: (id) => {
    set((state) => {
      const remainingWindows = state.windows.filter((w) => w.id !== id);
      const newActiveId =
        state.activeWindowId === id
          ? remainingWindows.length > 0
            ? remainingWindows[remainingWindows.length - 1].id
            : null
          : state.activeWindowId;

      return {
        windows: remainingWindows,
        activeWindowId: newActiveId,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const updatedWindows = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isActive: false } : w,
      );

      const visibleWindows = updatedWindows.filter((w) => !w.isMinimized);
      const newActiveId =
        state.activeWindowId === id
          ? visibleWindows.length > 0
            ? visibleWindows[visibleWindows.length - 1].id
            : null
          : state.activeWindowId;

      return {
        windows: updatedWindows,
        activeWindowId: newActiveId,
      };
    });
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isMaximized: !w.isMaximized, isMinimized: false }
          : w,
      ),
    }));
  },

  restoreWindow: (id) => {
    const state = get();
    const zIndex = state.nextZIndex;

    set({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isMinimized: false, isActive: true, zIndex }
          : { ...w, isActive: false },
      ),
      activeWindowId: id,
      nextZIndex: zIndex + 1,
    });
  },

  focusWindow: (id) => {
    const state = get();
    const zIndex = state.nextZIndex;

    set({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isActive: true, zIndex }
          : { ...w, isActive: false },
      ),
      activeWindowId: id,
      nextZIndex: zIndex + 1,
    });
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    }));
  },

  updateWindowSize: (id, size) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
  },

  updateWindowData: (id, data) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, data } : w)),
    }));
  },

  getWindow: (id) => get().windows.find((w) => w.id === id),

  getActiveWindow: () => {
    const state = get();
    return state.activeWindowId
      ? state.windows.find((w) => w.id === state.activeWindowId)
      : undefined;
  },
}));
