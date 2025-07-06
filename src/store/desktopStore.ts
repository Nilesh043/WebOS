import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DesktopIcon {
  id: string;
  name: string;
  appType: string;
  position: { x: number; y: number };
  icon: string;
}

interface DesktopState {
  wallpaper: string;
  icons: DesktopIcon[];
  selectedIcons: string[];

  // Actions
  setWallpaper: (url: string) => void;
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  setSelectedIcons: (ids: string[]) => void;
  addIcon: (icon: Omit<DesktopIcon, "id">) => void;
  removeIcon: (id: string) => void;
}

const defaultIcons: DesktopIcon[] = [
  {
    id: "file-explorer",
    name: "File Explorer",
    appType: "fileExplorer",
    position: { x: 50, y: 50 },
    icon: "folder",
  },
  {
    id: "text-editor",
    name: "Text Editor",
    appType: "textEditor",
    position: { x: 50, y: 150 },
    icon: "file-text",
  },
  {
    id: "terminal",
    name: "Terminal",
    appType: "terminal",
    position: { x: 50, y: 250 },
    icon: "terminal",
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    appType: "aiAssistant",
    position: { x: 50, y: 350 },
    icon: "bot",
  },
];

export const useDesktopStore = create<DesktopState>()(
  persist(
    (set) => ({
      wallpaper:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80",
      icons: defaultIcons,
      selectedIcons: [],

      setWallpaper: (url) => set({ wallpaper: url }),

      updateIconPosition: (id, position) => {
        set((state) => ({
          icons: state.icons.map((icon) =>
            icon.id === id ? { ...icon, position } : icon,
          ),
        }));
      },

      setSelectedIcons: (ids) => set({ selectedIcons: ids }),

      addIcon: (iconData) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          icons: [...state.icons, { ...iconData, id }],
        }));
      },

      removeIcon: (id) => {
        set((state) => ({
          icons: state.icons.filter((icon) => icon.id !== id),
          selectedIcons: state.selectedIcons.filter(
            (selectedId) => selectedId !== id,
          ),
        }));
      },
    }),
    {
      name: "webos-desktop",
    },
  ),
);
