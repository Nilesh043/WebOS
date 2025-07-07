import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Settings,
  LogOut,
  User,
  ChevronUp,
  Menu,
  X,
  Search,
  Grid3X3,
  Calendar,
} from "lucide-react";

interface TaskbarProps {
  openApplications?: Array<{
    id: string;
    title: string;
    icon?: string;
    isMinimized?: boolean;
  }>;
  recentApps?: Array<{
    id: string;
    name: string;
    appType: string;
    icon: string;
    lastUsed: Date;
  }>;
  onApplicationClick?: (id: string) => void;
  onStartMenuClick?: () => void;
  onLogout?: () => void;
  onSearchApp?: (appName: string) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onRecentAppClick?: (appType: string) => void;
  username?: string;
}

const Taskbar = ({
  openApplications = [],
  recentApps = [],
  onApplicationClick = () => {},
  onStartMenuClick = () => {},
  onLogout = () => {},
  onSearchApp = () => {},
  onOpenProfile = () => {},
  onOpenSettings = () => {},
  onRecentAppClick = () => {},
  username = "User",
}: TaskbarProps) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecentApps, setShowRecentApps] = useState(false);

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const getRecentAppIcon = (iconName: string) => {
    switch (iconName) {
      case "folder":
        return "📁";
      case "file-text":
        return "📝";
      case "terminal":
        return "💻";
      case "bot":
        return "🤖";
      case "globe":
        return "🌐";
      default:
        return "📱";
    }
  };

  const handleStartMenuToggle = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
    onStartMenuClick();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchApp(searchQuery.trim());
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-background border-t border-border flex items-center justify-between px-2 z-50">
      {/* Start Menu Button */}
      <div className="flex items-center">
        <Popover open={isStartMenuOpen} onOpenChange={setIsStartMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-accent"
              onClick={handleStartMenuToggle}
            >
              <Grid3X3 size={20} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start" side="top">
            <div className="space-y-4">
              <div className="text-lg font-semibold">Applications</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                  onClick={() => {
                    onSearchApp("file explorer");
                    setIsStartMenuOpen(false);
                  }}
                >
                  <span className="text-2xl">📁</span>
                  <span className="text-xs">File Explorer</span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                  onClick={() => {
                    onSearchApp("text editor");
                    setIsStartMenuOpen(false);
                  }}
                >
                  <span className="text-2xl">📝</span>
                  <span className="text-xs">Text Editor</span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                  onClick={() => {
                    onSearchApp("terminal");
                    setIsStartMenuOpen(false);
                  }}
                >
                  <span className="text-2xl">💻</span>
                  <span className="text-xs">Terminal</span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                  onClick={() => {
                    onSearchApp("browser");
                    setIsStartMenuOpen(false);
                  }}
                >
                  <span className="text-2xl">🌐</span>
                  <span className="text-xs">Browser</span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                  onClick={() => {
                    onSearchApp("ai assistant");
                    setIsStartMenuOpen(false);
                  }}
                >
                  <span className="text-2xl">🤖</span>
                  <span className="text-xs">AI Assistant</span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                  onClick={() => {
                    onOpenSettings();
                    setIsStartMenuOpen(false);
                  }}
                >
                  <span className="text-2xl">⚙️</span>
                  <span className="text-xs">Settings</span>
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Open Applications */}
        <div className="flex items-center ml-2 space-x-1">
          {openApplications.map((app) => (
            <Button
              key={app.id}
              variant={app.isMinimized ? "ghost" : "secondary"}
              size="sm"
              className="h-8 px-2 flex items-center gap-1 text-xs"
              onClick={() => onApplicationClick(app.id)}
            >
              {app.icon ? (
                typeof app.icon === "string" ? (
                  <div className="w-4 h-4 bg-primary/20 rounded-sm flex items-center justify-center text-xs">
                    {app.icon.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img src={app.icon} alt={app.title} className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4 bg-primary/20 rounded-sm" />
              )}
              <span className="max-w-24 truncate">{app.title}</span>
              {app.isMinimized && <ChevronUp size={12} />}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 bg-background/80 backdrop-blur-sm border-border/50"
          />
        </form>
      </div>

      {/* Recent Apps */}
      {recentApps.length > 0 && (
        <div className="flex items-center space-x-2 ml-4">
          <Separator orientation="vertical" className="h-6" />
          <div className="text-xs text-muted-foreground">Recent:</div>
          {recentApps.slice(0, 4).map((app) => (
            <Button
              key={app.id}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center"
              onClick={() => onRecentAppClick(app.appType)}
              title={app.name}
            >
              <span className="text-sm">{getRecentAppIcon(app.icon)}</span>
            </Button>
          ))}
        </div>
      )}

      {/* System Tray */}
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 flex flex-col items-center justify-center px-2"
            >
              <Clock size={14} />
              <div className="text-xs leading-none">{formattedTime}</div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end" side="top">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{formattedTime}</div>
              <div className="text-lg text-muted-foreground">
                {formattedDate}
              </div>
              <Separator className="my-3" />
              <div className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString([], {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                  alt={username}
                />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                  alt={username}
                />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium">{username}</div>
            </div>
            <Separator className="my-2" />
            <div className="grid gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onOpenProfile}
              >
                <User size={16} className="mr-2" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onOpenSettings}
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Taskbar;
