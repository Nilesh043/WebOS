import React, { useState, useEffect, useCallback } from "react";
import WindowManager from "./desktop/WindowManager";
import Taskbar from "./desktop/Taskbar";
import ApplicationLoader from "./applications/ApplicationLoader";
import { motion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { useDesktopStore } from "@/store/desktopStore";
import { useFileSystemStore } from "@/store/fileSystemStore";
import { Folder, FileText, Terminal, Bot } from "lucide-react";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Store hooks
  const {
    windows,
    createWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();

  const {
    wallpaper,
    icons,
    selectedIcons,
    updateIconPosition,
    setSelectedIcons,
  } = useDesktopStore();

  const { setCurrentPath } = useFileSystemStore();

  // Simulate authentication check
  useEffect(() => {
    // For demo purposes, we'll just set authenticated to true
    // In a real app, you would check for a valid session/token
    const checkAuth = () => {
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 1000);
    };

    checkAuth();
  }, []);

  const launchApplication = useCallback(
    (appType: string, data?: any) => {
      const windowCount = windows.length;
      const windowId = createWindow({
        title: getAppTitle(appType),
        appType,
        isMinimized: false,
        isMaximized: false,
        position: {
          x: 100 + windowCount * 30,
          y: 100 + windowCount * 30,
        },
        size: getDefaultSize(appType),
        data,
      });

      return windowId;
    },
    [windows.length, createWindow],
  );

  const getAppTitle = (appType: string): string => {
    switch (appType) {
      case "fileExplorer":
        return "File Explorer";
      case "textEditor":
        return "Text Editor";
      case "terminal":
        return "Terminal";
      case "aiAssistant":
        return "AI Assistant";
      default:
        return "Application";
    }
  };

  const getDefaultSize = (
    appType: string,
  ): { width: number; height: number } => {
    switch (appType) {
      case "fileExplorer":
        return { width: 800, height: 600 };
      case "textEditor":
        return { width: 700, height: 500 };
      case "terminal":
        return { width: 650, height: 400 };
      case "aiAssistant":
        return { width: 600, height: 500 };
      default:
        return { width: 700, height: 500 };
    }
  };

  // Icon drag handlers
  const handleIconDragStart = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    const icon = icons.find((i) => i.id === iconId);
    if (!icon) return;

    setIsDragging(iconId);
    setDragOffset({
      x: e.clientX - icon.position.x,
      y: e.clientY - icon.position.y,
    });
    setSelectedIcons([iconId]);
  };

  const handleIconDoubleClick = (iconId: string) => {
    const icon = icons.find((i) => i.id === iconId);
    if (icon) {
      launchApplication(icon.appType);
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIcons([]);
    }
  };

  // Mouse move handler for icon dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateIconPosition(isDragging, {
          x: Math.max(0, e.clientX - dragOffset.x),
          y: Math.max(0, e.clientY - dragOffset.y),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, updateIconPosition]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading WebOS...</h2>
        </div>
      </div>
    );
  }

  const getAppIcon = (appType: string): string => {
    switch (appType) {
      case "fileExplorer":
        return "folder";
      case "textEditor":
        return "file-text";
      case "terminal":
        return "terminal";
      case "aiAssistant":
        return "bot";
      default:
        return "app-window";
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col bg-background"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex-1 relative" onClick={handleDesktopClick}>
        {/* Desktop Icons */}
        {icons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            id={icon.id}
            icon={icon.icon}
            label={icon.name}
            position={icon.position}
            isSelected={selectedIcons.includes(icon.id)}
            onDragStart={(e) => handleIconDragStart(e, icon.id)}
            onDoubleClick={() => handleIconDoubleClick(icon.id)}
            onClick={() => setSelectedIcons([icon.id])}
          />
        ))}

        {/* Windows */}
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
              isActive={window.isActive}
              isMaximized={window.isMaximized}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onMaximize={() => maximizeWindow(window.id)}
              onFocus={() => focusWindow(window.id)}
              onPositionChange={(position) =>
                updateWindowPosition(window.id, position)
              }
              onSizeChange={(size) => updateWindowSize(window.id, size)}
            >
              <ApplicationLoader
                appType={window.appType}
                appTitle={window.title}
                windowId={window.id}
                data={window.data}
              />
            </Window>
          ))}
      </div>

      {/* Taskbar */}
      <Taskbar
        openApplications={windows.map((window) => ({
          id: window.id,
          title: window.title,
          icon: getAppIcon(window.appType),
          isMinimized: window.isMinimized,
        }))}
        onApplicationClick={(id) => {
          const window = windows.find((w) => w.id === id);
          if (window?.isMinimized) {
            restoreWindow(id);
          } else {
            focusWindow(id);
          }
        }}
        onStartMenuClick={() => {}}
        onLogout={() => setIsAuthenticated(false)}
        onSearchApp={(appName) => {
          const lowerAppName = appName.toLowerCase();
          let appType = "";

          if (
            lowerAppName.includes("file") ||
            lowerAppName.includes("explorer")
          ) {
            appType = "fileExplorer";
          } else if (
            lowerAppName.includes("text") ||
            lowerAppName.includes("editor")
          ) {
            appType = "textEditor";
          } else if (
            lowerAppName.includes("terminal") ||
            lowerAppName.includes("cmd")
          ) {
            appType = "terminal";
          } else if (
            lowerAppName.includes("ai") ||
            lowerAppName.includes("assistant")
          ) {
            appType = "aiAssistant";
          }

          if (appType) {
            launchApplication(appType);
          }
        }}
        username="User"
      />
    </div>
  );
};

interface DesktopIconProps {
  id: string;
  icon: string;
  label: string;
  position: { x: number; y: number };
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  icon,
  label,
  position,
  isSelected,
  onDragStart,
  onDoubleClick,
  onClick,
}) => {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "folder":
        return Folder;
      case "file-text":
        return FileText;
      case "terminal":
        return Terminal;
      case "bot":
        return Bot;
      default:
        return Folder;
    }
  };

  const IconComponent = getIconComponent(icon);

  return (
    <motion.div
      className={`absolute flex flex-col items-center justify-center w-20 h-24 cursor-pointer group select-none ${
        isSelected ? "bg-blue-500/20 rounded-lg" : ""
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseDown={onDragStart}
      onDoubleClick={onDoubleClick}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-black/60">
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      <span className="mt-1 text-sm text-white font-medium px-2 py-1 rounded bg-black/40 backdrop-blur-sm max-w-20 truncate">
        {label}
      </span>
    </motion.div>
  );
};

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isActive: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  position,
  size,
  zIndex,
  isActive,
  onClose,
  onMinimize,
  onFocus,
  onPositionChange,
  onSizeChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onPositionChange({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange]);

  return (
    <motion.div
      className={`absolute rounded-lg overflow-hidden shadow-xl border ${isActive ? "border-blue-500" : "border-gray-300"}`}
      style={{
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
        zIndex,
        backgroundColor: "white",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={onFocus}
    >
      <div
        className={`h-10 flex items-center justify-between px-4 ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        onMouseDown={handleDragStart}
        style={{ cursor: "move" }}
      >
        <div className="font-medium truncate">{title}</div>
        <div className="flex space-x-2">
          <button
            className="w-4 h-4 rounded-full bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          />
          <button
            className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      </div>
      <div className="h-[calc(100%-2.5rem)] overflow-auto bg-white">
        {children}
      </div>
    </motion.div>
  );
};

export default Home;
