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
} from "lucide-react";

interface TaskbarProps {
  openApplications?: Array<{
    id: string;
    title: string;
    icon?: string;
    isMinimized?: boolean;
  }>;
  onApplicationClick?: (id: string) => void;
  onStartMenuClick?: () => void;
  onLogout?: () => void;
  onSearchApp?: (appName: string) => void;
  username?: string;
}

const Taskbar = ({
  openApplications = [],
  onApplicationClick = () => {},
  onStartMenuClick = () => {},
  onLogout = () => {},
  onSearchApp = () => {},
  username = "User",
}: TaskbarProps) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

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
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-accent"
          onClick={handleStartMenuToggle}
        >
          {isStartMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

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

      {/* System Tray */}
      <div className="flex items-center space-x-2">
        <div className="text-sm text-muted-foreground">{formattedTime}</div>

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
              <Button variant="ghost" size="sm" className="justify-start">
                <User size={16} className="mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
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

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Clock size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Taskbar;
