import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FileSystemItem } from "./fileSystemStore";

interface RecycleBinItem extends FileSystemItem {
  deletedAt: Date;
  originalPath: string;
}

interface RecycleBinState {
  items: RecycleBinItem[];

  // Actions
  addToRecycleBin: (item: FileSystemItem) => void;
  restoreItem: (id: string) => RecycleBinItem | null;
  permanentlyDelete: (id: string) => void;
  emptyRecycleBin: () => void;
  getRecycleBinItems: () => RecycleBinItem[];
}

export const useRecycleBinStore = create<RecycleBinState>()(
  persist(
    (set, get) => ({
      items: [],

      addToRecycleBin: (item) => {
        const recycleBinItem: RecycleBinItem = {
          ...item,
          deletedAt: new Date(),
          originalPath: item.path,
        };

        set((state) => ({
          items: [...state.items, recycleBinItem],
        }));
      },

      restoreItem: (id) => {
        const state = get();
        const item = state.items.find((i) => i.id === id);
        if (!item) return null;

        set({
          items: state.items.filter((i) => i.id !== id),
        });

        return item;
      },

      permanentlyDelete: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      emptyRecycleBin: () => {
        set({ items: [] });
      },

      getRecycleBinItems: () => get().items,
    }),
    {
      name: "webos-recycle-bin",
    },
  ),
);
