import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  parentId: string | null;
  content?: string;
  createdAt: Date;
  modifiedAt: Date;
}

interface FileSystemState {
  items: FileSystemItem[];
  currentPath: string;
  selectedItems: string[];

  // Actions
  createItem: (
    name: string,
    type: "file" | "folder",
    parentPath?: string,
  ) => void;
  deleteItem: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
  moveItem: (id: string, newParentPath: string) => void;
  updateFileContent: (id: string, content: string) => void;
  setCurrentPath: (path: string) => void;
  setSelectedItems: (items: string[]) => void;
  getItemsByPath: (path: string) => FileSystemItem[];
  getItemById: (id: string) => FileSystemItem | undefined;
  getItemByPath: (path: string) => FileSystemItem | undefined;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialFileSystem = (): FileSystemItem[] => [
  {
    id: "root",
    name: "",
    type: "folder",
    path: "/",
    parentId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "home",
    name: "home",
    type: "folder",
    path: "/home",
    parentId: "root",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "user",
    name: "user",
    type: "folder",
    path: "/home/user",
    parentId: "home",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "documents",
    name: "Documents",
    type: "folder",
    path: "/home/user/Documents",
    parentId: "user",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "pictures",
    name: "Pictures",
    type: "folder",
    path: "/home/user/Pictures",
    parentId: "user",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "downloads",
    name: "Downloads",
    type: "folder",
    path: "/home/user/Downloads",
    parentId: "user",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "readme",
    name: "readme.txt",
    type: "file",
    path: "/home/user/readme.txt",
    parentId: "user",
    content:
      "Welcome to WebOS!\n\nThis is a web-based operating system built with React and TypeScript.\n\nFeatures:\n- Virtual file system\n- Window management\n- Built-in applications\n- Terminal with basic commands\n\nEnjoy exploring!",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "notes",
    name: "notes.txt",
    type: "file",
    path: "/home/user/notes.txt",
    parentId: "user",
    content:
      "My Notes\n\n- Remember to save files regularly\n- Use the terminal for quick file operations\n- Try dragging windows around\n- Right-click for context menus",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
];

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      items: createInitialFileSystem(),
      currentPath: "/home/user",
      selectedItems: [],

      createItem: (name, type, parentPath = get().currentPath) => {
        const id = generateId();
        const parentItem = get().getItemByPath(parentPath);
        const path = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;

        const newItem: FileSystemItem = {
          id,
          name,
          type,
          path,
          parentId: parentItem?.id || null,
          content: type === "file" ? "" : undefined,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => {
            // Delete the item and all its children
            const itemToDelete = state.items.find((i) => i.id === id);
            if (!itemToDelete) return true;

            return !item.path.startsWith(itemToDelete.path);
          }),
          selectedItems: state.selectedItems.filter(
            (selectedId) => selectedId !== id,
          ),
        }));
      },

      renameItem: (id, newName) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;

          const oldPath = item.path;
          const pathParts = oldPath.split("/");
          pathParts[pathParts.length - 1] = newName;
          const newPath = pathParts.join("/");

          return {
            items: state.items.map((i) => {
              if (i.id === id) {
                return {
                  ...i,
                  name: newName,
                  path: newPath,
                  modifiedAt: new Date(),
                };
              }
              // Update children paths
              if (i.path.startsWith(oldPath + "/")) {
                return { ...i, path: i.path.replace(oldPath, newPath) };
              }
              return i;
            }),
          };
        });
      },

      moveItem: (id, newParentPath) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          const newParent = state.items.find((i) => i.path === newParentPath);
          if (!item || !newParent) return state;

          const oldPath = item.path;
          const newPath =
            newParentPath === "/"
              ? `/${item.name}`
              : `${newParentPath}/${item.name}`;

          return {
            items: state.items.map((i) => {
              if (i.id === id) {
                return {
                  ...i,
                  path: newPath,
                  parentId: newParent.id,
                  modifiedAt: new Date(),
                };
              }
              // Update children paths
              if (i.path.startsWith(oldPath + "/")) {
                return { ...i, path: i.path.replace(oldPath, newPath) };
              }
              return i;
            }),
          };
        });
      },

      updateFileContent: (id, content) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, content, modifiedAt: new Date() }
              : item,
          ),
        }));
      },

      setCurrentPath: (path) => set({ currentPath: path }),
      setSelectedItems: (items) => set({ selectedItems: items }),

      getItemsByPath: (path) => {
        const items = get().items;
        return items.filter((item) => {
          const parent = items.find((p) => p.id === item.parentId);
          return parent?.path === path;
        });
      },

      getItemById: (id) => get().items.find((item) => item.id === id),

      getItemByPath: (path) => get().items.find((item) => item.path === path),
    }),
    {
      name: "webos-filesystem",
    },
  ),
);
