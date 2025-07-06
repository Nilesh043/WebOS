import React, { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface WindowProps {
  id: string;
  title: string;
  isActive: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  minSize?: { width: number; height: number };
  isMinimized?: boolean;
  isMaximized?: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  isActive,
  position,
  size,
  zIndex,
  minSize = { width: 300, height: 200 },
  isMinimized = false,
  isMaximized = false,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [prevSize, setPrevSize] = useState(size);
  const [prevPosition, setPrevPosition] = useState(position);

  const windowRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef({ x: 0, y: 0 });

  // Handle window focus
  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive) {
      onFocus(id);
    }
  };

  // Start dragging the window
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMaximized) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Start resizing the window
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized) return;

    setIsResizing(true);
    setResizeDirection(direction);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: Math.max(0, e.clientY - dragOffset.y), // Prevent dragging above the top of the screen
        };
        onPositionChange(newPosition);
      } else if (isResizing && resizeDirection) {
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;

        resizeStartPos.current = { x: e.clientX, y: e.clientY };

        let newWidth = size.width;
        let newHeight = size.height;
        let newX = position.x;
        let newY = position.y;

        // Handle different resize directions
        if (resizeDirection.includes("e")) {
          newWidth = Math.max(minSize.width, size.width + deltaX);
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(minSize.height, size.height + deltaY);
        }
        if (resizeDirection.includes("w")) {
          newWidth = Math.max(minSize.width, size.width - deltaX);
          newX = position.x + deltaX;
        }
        if (resizeDirection.includes("n")) {
          newHeight = Math.max(minSize.height, size.height - deltaY);
          newY = position.y + deltaY;
        }

        onSizeChange({ width: newWidth, height: newHeight });
        if (newX !== position.x || newY !== position.y) {
          onPositionChange({ x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    position,
    size,
    resizeDirection,
    minSize,
  ]);

  // Handle window maximization
  useEffect(() => {
    if (isMaximized) {
      // Save current size and position before maximizing
      if (
        !prevSize.width ||
        !prevSize.height ||
        (prevSize.width === window.innerWidth &&
          prevSize.height === window.innerHeight - 50)
      ) {
        // Don't save if already maximized dimensions
        return;
      }
      setPrevSize(size);
      setPrevPosition(position);

      // Set window to full screen (minus taskbar height)
      onSizeChange({
        width: window.innerWidth,
        height: window.innerHeight - 50,
      });
      onPositionChange({ x: 0, y: 0 });
    } else if (
      prevSize.width &&
      prevSize.height &&
      (prevSize.width !== window.innerWidth ||
        prevSize.height !== window.innerHeight - 50)
    ) {
      // Restore previous size and position when unmaximizing
      onSizeChange(prevSize);
      onPositionChange(prevPosition);
    }
  }, [isMaximized, onSizeChange, onPositionChange]);

  // Handle window visibility
  if (isMinimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className={cn(
        "absolute flex flex-col rounded-lg shadow-lg border border-gray-200 bg-background overflow-hidden",
        isActive ? "shadow-xl" : "shadow-md",
        isDragging && "opacity-80 cursor-move",
      )}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex,
      }}
      onClick={handleWindowClick}
    >
      {/* Window title bar */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 cursor-move select-none",
          isActive ? "bg-gray-200 dark:bg-gray-700" : "",
        )}
        onMouseDown={handleDragStart}
      >
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="flex space-x-2">
          <button
            onClick={() => onMinimize(id)}
            className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            onClick={() => onMaximize(id)}
            className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
          >
            {isMaximized ? (
              <Minimize className="h-3 w-3" />
            ) : (
              <Maximize className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => onClose(id)}
            className="p-1 rounded-full hover:bg-red-500 hover:text-white focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Window content */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {children}
      </div>

      {/* Resize handles */}
      {!isMaximized && (
        <>
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />

          <div
            className="absolute top-0 left-4 right-4 h-2 cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </div>
  );
};

export default Window;
