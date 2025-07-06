import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Window from "./Window";

interface WindowData {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  appId: string;
}

interface WindowManagerProps {
  children?: React.ReactNode;
  onMinimize?: (windowId: string) => void;
  onMaximize?: (windowId: string) => void;
  onClose?: (windowId: string) => void;
  onFocus?: (windowId: string) => void;
}

const WindowManager: React.FC<WindowManagerProps> = ({
  children,
  onMinimize,
  onMaximize,
  onClose,
  onFocus,
}) => {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a new window
  const createWindow = useCallback(
    ({
      id = `window-${Date.now()}`,
      title = "New Window",
      content,
      position = { x: 50, y: 50 },
      size = { width: 600, height: 400 },
      appId = "default",
    }: Partial<WindowData> & { content: React.ReactNode }) => {
      const newWindow: WindowData = {
        id,
        title,
        content,
        position,
        size,
        isMinimized: false,
        isMaximized: false,
        zIndex: highestZIndex + 1,
        appId,
      };

      setWindows((prev) => [...prev, newWindow]);
      setActiveWindowId(id);
      setHighestZIndex((prev) => prev + 1);

      return id;
    },
    [highestZIndex],
  );

  // Focus a window
  const focusWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((window) => ({
          ...window,
          zIndex: window.id === windowId ? highestZIndex + 1 : window.zIndex,
        })),
      );
      setActiveWindowId(windowId);
      setHighestZIndex((prev) => prev + 1);
      onFocus?.(windowId);
    },
    [highestZIndex, onFocus],
  );

  // Minimize a window
  const minimizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === windowId
            ? { ...window, isMinimized: true, isMaximized: false }
            : window,
        ),
      );
      onMinimize?.(windowId);
    },
    [onMinimize],
  );

  // Maximize a window
  const maximizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === windowId
            ? {
                ...window,
                isMaximized: !window.isMaximized,
                isMinimized: false,
              }
            : window,
        ),
      );
      onMaximize?.(windowId);
    },
    [onMaximize],
  );

  // Restore a window from minimized state
  const restoreWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === windowId ? { ...window, isMinimized: false } : window,
        ),
      );
      focusWindow(windowId);
    },
    [focusWindow],
  );

  // Close a window
  const closeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => prev.filter((window) => window.id !== windowId));
      onClose?.(windowId);
    },
    [onClose],
  );

  // Update window position
  const updateWindowPosition = useCallback(
    (windowId: string, position: { x: number; y: number }) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === windowId ? { ...window, position } : window,
        ),
      );
    },
    [],
  );

  // Update window size
  const updateWindowSize = useCallback(
    (windowId: string, size: { width: number; height: number }) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === windowId ? { ...window, size } : window,
        ),
      );
    },
    [],
  );

  // Handle click outside of any window to clear focus
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setActiveWindowId(null);
    }
  }, []);

  // Expose methods to parent components
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).windowManager = {
        createWindow,
        focusWindow,
        minimizeWindow,
        maximizeWindow,
        closeWindow,
        restoreWindow,
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).windowManager;
      }
    };
  }, [
    createWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    restoreWindow,
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-transparent overflow-hidden"
      onClick={handleBackgroundClick}
    >
      {windows
        .filter((window) => !window.isMinimized)
        .map((window) => (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            position={window.position}
            size={window.size}
            zIndex={window.zIndex}
            isActive={activeWindowId === window.id}
            isMaximized={window.isMaximized}
            onFocus={() => focusWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onClose={() => closeWindow(window.id)}
            onPositionChange={(position) =>
              updateWindowPosition(window.id, position)
            }
            onSizeChange={(size) => updateWindowSize(window.id, size)}
          >
            {window.content}
          </Window>
        ))}
      {children}
    </div>
  );
};

export type { WindowData };
export default WindowManager;
