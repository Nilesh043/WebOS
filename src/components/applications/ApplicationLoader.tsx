import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Folder,
  File,
  Terminal as TerminalIcon,
  Edit,
  Save,
  RefreshCw,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Home,
  Bot,
  Send,
  RotateCcw,
  Maximize,
  Search,
  ExternalLink,
  Star,
  History,
  Download,
  Settings,
  MoreHorizontal,
  X,
  Shield,
  Lock,
  Globe,
} from "lucide-react";
import ProfileSettings from "../auth/ProfileSettings";
import { useFileSystemStore } from "@/store/fileSystemStore";
import { useWindowStore } from "@/store/windowStore";
import { useRecycleBinStore } from "@/store/recycleBinStore";

interface ApplicationLoaderProps {
  appType:
    | "fileExplorer"
    | "textEditor"
    | "terminal"
    | "aiAssistant"
    | "profileSettings"
    | "browser"
    | "recycleBin";
  appTitle?: string;
  windowId?: string;
  data?: any;
  onClose?: () => void;
}

const ApplicationLoader = ({
  appType = "fileExplorer",
  appTitle = "Application",
  windowId,
  data,
  onClose,
}: ApplicationLoaderProps) => {
  // File system store
  const {
    items,
    currentPath,
    selectedItems,
    createItem,
    deleteItem,
    renameItem,
    updateFileContent,
    setCurrentPath,
    setSelectedItems,
    getItemsByPath,
    getItemById,
    getItemByPath,
  } = useFileSystemStore();

  // Window store
  const { updateWindowData, createWindow, maximizeWindow } = useWindowStore();

  // Recycle bin store
  const {
    items: recycleBinItems,
    restoreItem,
    permanentlyDelete,
    emptyRecycleBin,
  } = useRecycleBinStore();

  // Local state
  const [fileContent, setFileContent] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Welcome to WebOS Terminal\nType "help" for available commands',
  ]);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiMessages, setAiMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content:
        'Hello! I\'m your AI assistant. I can help you with file operations, opening applications, and answering questions. Try commands like:\n\n• "Open text editor"\n• "Create a folder named Projects"\n• "Show me the files in Documents"\n• "What can you do?"',
    },
  ]);
  const [browserUrl, setBrowserUrl] = useState("https://www.google.com");
  const [browserContent, setBrowserContent] = useState("");
  const [browserHistory, setBrowserHistory] = useState<string[]>([
    "https://www.google.com",
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<
    Array<{ id: string; title: string; url: string }>
  >([]);
  const [tabs, setTabs] = useState<
    Array<{ id: string; title: string; url: string; isActive: boolean }>
  >([
    {
      id: "1",
      title: "New Tab",
      url: "https://www.google.com",
      isActive: true,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Initialize file content when opening a file
  useEffect(() => {
    if (data?.filePath && appType === "textEditor") {
      const file = getItemByPath(data.filePath);
      if (file && file.type === "file") {
        setFileContent(file.content || "");
        setCurrentFile(file.id);
      }
    }
  }, [data, appType, getItemByPath]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Initialize browser content on first load
  useEffect(() => {
    if (appType === "browser" && !browserContent) {
      handleBrowserNavigation("https://www.google.com", false);
    }
  }, [appType, browserContent]);

  // Handle browser navigation
  const handleBrowserNavigation = (url: string, addToHistory = true) => {
    let processedUrl = url;

    // Add https:// if no protocol is specified
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      processedUrl = "https://" + processedUrl;
    }

    setIsLoading(true);
    setBrowserUrl(processedUrl);

    // Update active tab
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              url: processedUrl,
              title: getPageTitle(processedUrl),
            }
          : tab,
      ),
    );

    // Add to history if it's a new navigation
    if (addToHistory && processedUrl !== browserHistory[historyIndex]) {
      const newHistory = browserHistory.slice(0, historyIndex + 1);
      newHistory.push(processedUrl);
      setBrowserHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    if (
      processedUrl.includes("google.com") ||
      processedUrl.includes("search")
    ) {
      setBrowserContent(`
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4285f4; font-size: 48px; margin: 0;">Google</h1>
            <div style="margin: 20px 0;">
              <input type="text" placeholder="Search Google or type a URL" style="width: 400px; padding: 12px; border: 1px solid #ddd; border-radius: 24px; font-size: 16px;" />
              <button style="margin-left: 10px; padding: 12px 24px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">Search</button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <h3>Gmail</h3>
              <p>Access your email</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <h3>YouTube</h3>
              <p>Watch videos</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <h3>Maps</h3>
              <p>Find locations</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
              <h3>Drive</h3>
              <p>Cloud storage</p>
            </div>
          </div>
        </div>
      `);
    } else if (processedUrl.includes("github.com")) {
      setBrowserContent(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #0d1117; color: #c9d1d9; min-height: 100%;">
          <div style="border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #f0f6fc; margin: 0;">🐙 GitHub</h1>
            <p style="color: #8b949e;">Where the world builds software</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;">
              <h3 style="color: #58a6ff; margin-top: 0;">Popular Repositories</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 8px 0;">📦 microsoft/vscode</li>
                <li style="margin: 8px 0;">⚛️ facebook/react</li>
                <li style="margin: 8px 0;">🟢 nodejs/node</li>
              </ul>
            </div>
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;">
              <h3 style="color: #58a6ff; margin-top: 0;">Trending</h3>
              <p style="color: #8b949e;">Discover what the GitHub community is most excited about today.</p>
            </div>
          </div>
        </div>
      `);
    } else if (processedUrl.includes("youtube.com")) {
      setBrowserContent(`
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f0f0f; color: white; min-height: 100%;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <h1 style="color: #ff0000; margin: 0; font-size: 32px;">📺 YouTube</h1>
            <div style="margin-left: 20px; flex: 1;">
              <input type="text" placeholder="Search" style="width: 300px; padding: 8px; border: 1px solid #333; background: #121212; color: white; border-radius: 2px;" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            <div style="background: #1a1a1a; border-radius: 8px; padding: 12px;">
              <div style="width: 100%; height: 180px; background: #333; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">📹</div>
              <h3 style="margin: 8px 0; font-size: 14px;">Sample Video Title</h3>
              <p style="color: #aaa; font-size: 12px;">Channel Name • 1M views</p>
            </div>
            <div style="background: #1a1a1a; border-radius: 8px; padding: 12px;">
              <div style="width: 100%; height: 180px; background: #333; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">🎬</div>
              <h3 style="margin: 8px 0; font-size: 14px;">Another Video Title</h3>
              <p style="color: #aaa; font-size: 12px;">Creator • 500K views</p>
            </div>
          </div>
        </div>
      `);
    } else if (
      processedUrl.includes("twitter.com") ||
      processedUrl.includes("x.com")
    ) {
      setBrowserContent(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #000; color: white; min-height: 100%;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1d9bf0; font-size: 48px; margin: 0;">𝕏</h1>
            <p style="color: #71767b;">What's happening?</p>
          </div>
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: #16181c; border: 1px solid #2f3336; border-radius: 16px; padding: 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="width: 40px; height: 40px; background: #1d9bf0; border-radius: 50%; margin-right: 12px;"></div>
                <div>
                  <div style="font-weight: bold;">WebOS User</div>
                  <div style="color: #71767b; font-size: 14px;">@webos_user</div>
                </div>
              </div>
              <p>Welcome to the WebOS browser! This is a simulated social media experience.</p>
            </div>
          </div>
        </div>
      `);
    } else {
      setBrowserContent(`
        <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h2>WebOS Browser</h2>
          <p>Simulated web content for: <strong>${processedUrl}</strong></p>
          <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
            <p>This is a demo browser showing simulated content for the URL you entered.</p>
            <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #4285f4;">
              <h3 style="margin: 0 0 10px 0; color: #1a73e8;">Website: ${processedUrl}</h3>
              <p style="margin: 0; color: #5f6368;">This would normally load the actual website content.</p>
            </div>
            <p><strong>Try these working examples:</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>• google.com</li>
              <li>• github.com</li>
              <li>• youtube.com</li>
              <li>• twitter.com</li>
            </ul>
          </div>
        </div>
      `);
    }

    setTimeout(() => setIsLoading(false), 500);
  };

  const getPageTitle = (url: string) => {
    if (url.includes("google.com")) return "Google";
    if (url.includes("github.com")) return "GitHub";
    if (url.includes("youtube.com")) return "YouTube";
    if (url.includes("twitter.com") || url.includes("x.com"))
      return "X (Twitter)";
    try {
      return new URL(url).hostname;
    } catch {
      return "New Tab";
    }
  };

  // Handle terminal commands
  const handleTerminalCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && terminalInput.trim()) {
      const command = terminalInput.trim();
      const args = command.split(" ");
      const cmd = args[0];
      let output = "";

      // Command parsing
      switch (cmd) {
        case "help":
          output =
            "Available commands:\n- ls: List files\n- cd [directory]: Change directory\n- pwd: Print working directory\n- mkdir [name]: Create directory\n- touch [name]: Create file\n- rm [name]: Delete file/folder\n- cat [file]: Show file content\n- echo [text]: Print text\n- clear: Clear terminal";
          break;

        case "ls":
          const currentItems = getItemsByPath(currentPath);
          output =
            currentItems.length > 0
              ? currentItems
                  .map(
                    (item) =>
                      `${item.name}${item.type === "folder" ? "/" : ""}`,
                  )
                  .join("\n")
              : "No files found";
          break;

        case "pwd":
          output = currentPath;
          break;

        case "cd":
          if (args.length < 2) {
            output = "Usage: cd [directory]";
          } else {
            const targetDir = args[1];
            if (targetDir === "..") {
              const pathParts = currentPath.split("/").filter((p) => p);
              if (pathParts.length > 2) {
                // Don't go above /home/user
                pathParts.pop();
                const newPath = "/" + pathParts.join("/");
                setCurrentPath(newPath);
                output = `Changed directory to ${newPath}`;
              } else {
                output = "Cannot go up from current directory";
              }
            } else {
              const targetPath =
                currentPath === "/"
                  ? `/${targetDir}`
                  : `${currentPath}/${targetDir}`;
              const foundDir = getItemByPath(targetPath);
              if (foundDir && foundDir.type === "folder") {
                setCurrentPath(targetPath);
                output = `Changed directory to ${targetPath}`;
              } else {
                output = `Directory not found: ${targetDir}`;
              }
            }
          }
          break;

        case "mkdir":
          if (args.length < 2) {
            output = "Usage: mkdir [directory_name]";
          } else {
            try {
              createItem(args[1], "folder", currentPath);
              output = `Directory created: ${args[1]}`;
            } catch (error) {
              output = `Error creating directory: ${args[1]}`;
            }
          }
          break;

        case "touch":
          if (args.length < 2) {
            output = "Usage: touch [file_name]";
          } else {
            try {
              createItem(args[1], "file", currentPath);
              output = `File created: ${args[1]}`;
            } catch (error) {
              output = `Error creating file: ${args[1]}`;
            }
          }
          break;

        case "rm":
          if (args.length < 2) {
            output = "Usage: rm [file_or_directory]";
          } else {
            const targetPath =
              currentPath === "/" ? `/${args[1]}` : `${currentPath}/${args[1]}`;
            const item = getItemByPath(targetPath);
            if (item) {
              deleteItem(item.id);
              output = `Deleted: ${args[1]}`;
            } else {
              output = `File or directory not found: ${args[1]}`;
            }
          }
          break;

        case "cat":
          if (args.length < 2) {
            output = "Usage: cat [file_name]";
          } else {
            const targetPath =
              currentPath === "/" ? `/${args[1]}` : `${currentPath}/${args[1]}`;
            const file = getItemByPath(targetPath);
            if (file && file.type === "file") {
              output = file.content || "(empty file)";
            } else {
              output = `File not found: ${args[1]}`;
            }
          }
          break;

        case "echo":
          output = args.slice(1).join(" ");
          break;

        case "clear":
          setTerminalOutput([]);
          setTerminalInput("");
          return;

        default:
          output = `Command not found: ${command}`;
      }

      setTerminalOutput([...terminalOutput, `$ ${command}`, output]);
      setTerminalInput("");
    }
  };

  // Handle file operations
  const handleFileClick = (item: any) => {
    if (item.type === "file") {
      // Open file in text editor
      createWindow({
        title: `Text Editor - ${item.name}`,
        appType: "textEditor",
        isMinimized: false,
        isMaximized: false,
        position: { x: 150, y: 150 },
        size: { width: 700, height: 500 },
        data: { filePath: item.path },
      });
    } else if (item.type === "folder") {
      setCurrentPath(item.path);
    }
  };

  const handleSaveFile = () => {
    if (currentFile) {
      updateFileContent(currentFile, fileContent);
      // Update window title to remove asterisk if present
      if (windowId) {
        updateWindowData(windowId, {
          filePath: getItemById(currentFile)?.path,
          saved: true,
        });
      }
    }
  };

  const handleAiSubmit = () => {
    if (!aiInput.trim()) return;

    const userMessage = aiInput.trim();
    setAiMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setAiInput("");

    // Simple AI response logic
    let response = "";
    const lowerInput = userMessage.toLowerCase();

    if (lowerInput.includes("open") && lowerInput.includes("editor")) {
      createWindow({
        title: "Text Editor",
        appType: "textEditor",
        isMinimized: false,
        isMaximized: false,
        position: { x: 200, y: 200 },
        size: { width: 700, height: 500 },
      });
      response = "I've opened the Text Editor for you!";
    } else if (lowerInput.includes("open") && lowerInput.includes("terminal")) {
      createWindow({
        title: "Terminal",
        appType: "terminal",
        isMinimized: false,
        isMaximized: false,
        position: { x: 200, y: 200 },
        size: { width: 650, height: 400 },
      });
      response = "I've opened the Terminal for you!";
    } else if (
      lowerInput.includes("open") &&
      (lowerInput.includes("file") || lowerInput.includes("explorer"))
    ) {
      createWindow({
        title: "File Explorer",
        appType: "fileExplorer",
        isMinimized: false,
        isMaximized: false,
        position: { x: 200, y: 200 },
        size: { width: 800, height: 600 },
      });
      response = "I've opened the File Explorer for you!";
    } else if (lowerInput.includes("create") && lowerInput.includes("folder")) {
      const match = lowerInput.match(/folder.*?([a-zA-Z0-9_-]+)/);
      const folderName = match ? match[1] : "NewFolder";
      createItem(folderName, "folder");
      response = `I\'ve created a folder named "${folderName}" in the current directory.`;
    } else if (lowerInput.includes("what") && lowerInput.includes("can")) {
      response =
        'I can help you with:\n\n• Opening applications ("Open text editor", "Open terminal", "Open file explorer")\n• Creating files and folders ("Create a folder named Projects")\n• File operations\n• Answering questions about the system\n\nJust ask me in natural language!';
    } else {
      response =
        'I\'m here to help! I can open applications, create files and folders, and assist with various tasks. Try asking me to "open text editor" or "create a folder named Projects".';
    }

    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    }, 500);
  };

  // Render appropriate application based on type
  const renderApplication = () => {
    switch (appType) {
      case "fileExplorer":
        const currentItems = getItemsByPath(currentPath);
        const canGoUp = currentPath !== "/" && currentPath !== "/home/user";

        return (
          <div className="h-full bg-white">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPath("/home/user")}
                >
                  <Home className="h-4 w-4 mr-1" /> Home
                </Button>
                {canGoUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pathParts = currentPath.split("/").filter((p) => p);
                      pathParts.pop();
                      const newPath =
                        pathParts.length > 0 ? "/" + pathParts.join("/") : "/";
                      setCurrentPath(newPath);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {currentPath}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const name = prompt("Enter folder name:");
                    if (name) createItem(name, "folder", currentPath);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> New Folder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const name = prompt("Enter file name:");
                    if (name) createItem(name, "file", currentPath);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> New File
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="flex items-center">
                        {item.type === "folder" ? (
                          <Folder className="h-4 w-4 mr-2" />
                        ) : (
                          <File className="h-4 w-4 mr-2" />
                        )}
                        <span
                          className="cursor-pointer hover:underline"
                          onDoubleClick={() => handleFileClick(item)}
                        >
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.type === "folder" ? "Folder" : "File"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.modifiedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {item.type === "file" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileClick(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete ${item.name}?`)) {
                                deleteItem(item.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {currentItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        This folder is empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        );

      case "textEditor":
        const fileName = currentFile
          ? getItemById(currentFile)?.name || "Untitled.txt"
          : "Untitled.txt";

        return (
          <div className="h-full flex flex-col bg-white">
            <div className="flex items-center justify-between p-2 border-b">
              <span className="text-sm font-medium">{fileName}</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveFile}
                  disabled={!currentFile}
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
            <Textarea
              className="flex-1 resize-none p-4 rounded-none border-0 focus-visible:ring-0 font-mono"
              placeholder="Start typing..."
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
            />
          </div>
        );

      case "terminal":
        return (
          <div className="h-full flex flex-col bg-black text-green-500 font-mono">
            <div
              ref={terminalRef}
              className="flex-1 overflow-auto p-4 space-y-1"
            >
              {terminalOutput.map((line, i) => (
                <div key={i} className="whitespace-pre-line">
                  {line}
                </div>
              ))}
            </div>
            <div className="flex items-center p-4 border-t border-green-500/20">
              <span className="mr-2 text-green-400">{currentPath}$</span>
              <Input
                className="flex-1 bg-transparent border-none text-green-500 focus-visible:ring-0 placeholder:text-green-500/50"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalCommand}
                placeholder="Type a command..."
                autoFocus
              />
            </div>
          </div>
        );

      case "aiAssistant":
        return (
          <div className="h-full flex flex-col bg-white">
            <div className="flex items-center p-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <Bot className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium">AI Assistant</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {aiMessages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-line text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center p-4 border-t gap-2">
              <Input
                className="flex-1"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
                placeholder="Ask me anything or request an action..."
              />
              <Button onClick={handleAiSubmit} disabled={!aiInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case "profileSettings":
        return (
          <div className="w-full h-full bg-white overflow-hidden">
            <div className="w-full h-full">
              <ProfileSettings onClose={onClose} />
            </div>
          </div>
        );

      case "recycleBin":
        return (
          <div className="h-full bg-white">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5" />
                <span className="font-medium">Recycle Bin</span>
                <span className="text-sm text-muted-foreground">
                  ({recycleBinItems.length} items)
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        "Empty recycle bin? This action cannot be undone.",
                      )
                    ) {
                      emptyRecycleBin();
                    }
                  }}
                  disabled={recycleBinItems.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Empty Bin
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (windowId) {
                      maximizeWindow(windowId);
                    }
                  }}
                  title="Full Screen"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Original Location</TableHead>
                    <TableHead>Deleted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recycleBinItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="flex items-center">
                        {item.type === "folder" ? (
                          <Folder className="h-4 w-4 mr-2" />
                        ) : (
                          <File className="h-4 w-4 mr-2" />
                        )}
                        <span>{item.name}</span>
                      </TableCell>
                      <TableCell>
                        {item.type === "folder" ? "Folder" : "File"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.originalPath}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.deletedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const restoredItem = restoreItem(item.id);
                              if (restoredItem) {
                                // Note: In a real implementation, you'd restore to file system
                                alert(
                                  `Restored ${restoredItem.name} to ${restoredItem.originalPath}`,
                                );
                              }
                            }}
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  `Permanently delete ${item.name}? This action cannot be undone.`,
                                )
                              ) {
                                permanentlyDelete(item.id);
                              }
                            }}
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recycleBinItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        Recycle bin is empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        );

      case "browser":
        const goBack = () => {
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            handleBrowserNavigation(browserHistory[newIndex], false);
          }
        };

        const goForward = () => {
          if (historyIndex < browserHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            handleBrowserNavigation(browserHistory[newIndex], false);
          }
        };

        const refreshPage = () => {
          handleBrowserNavigation(browserUrl, false);
        };

        const addBookmark = () => {
          const newBookmark = {
            id: Date.now().toString(),
            title: getPageTitle(browserUrl),
            url: browserUrl,
          };
          setBookmarks((prev) => [...prev, newBookmark]);
        };

        const removeBookmark = (id: string) => {
          setBookmarks((prev) => prev.filter((b) => b.id !== id));
        };

        const addNewTab = () => {
          const newTab = {
            id: Date.now().toString(),
            title: "New Tab",
            url: "https://www.google.com",
            isActive: false,
          };
          setTabs((prev) => [
            ...prev.map((t) => ({ ...t, isActive: false })),
            { ...newTab, isActive: true },
          ]);
          setActiveTabId(newTab.id);
          handleBrowserNavigation("https://www.google.com");
        };

        const closeTab = (tabId: string) => {
          if (tabs.length === 1) return; // Don't close last tab

          const tabIndex = tabs.findIndex((t) => t.id === tabId);
          const newTabs = tabs.filter((t) => t.id !== tabId);

          if (tabId === activeTabId) {
            const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
            const newActiveTab = newTabs[newActiveIndex];
            setActiveTabId(newActiveTab.id);
            handleBrowserNavigation(newActiveTab.url, false);
          }

          setTabs(newTabs);
        };

        const switchTab = (tabId: string) => {
          const tab = tabs.find((t) => t.id === tabId);
          if (tab) {
            setTabs((prev) =>
              prev.map((t) => ({ ...t, isActive: t.id === tabId })),
            );
            setActiveTabId(tabId);
            handleBrowserNavigation(tab.url, false);
          }
        };

        const isBookmarked = bookmarks.some((b) => b.url === browserUrl);

        return (
          <div className="h-full flex flex-col bg-white">
            {/* Tab Bar */}
            <div className="flex items-center bg-gray-100 border-b">
              <div className="flex flex-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center min-w-0 max-w-48 px-3 py-2 border-r cursor-pointer group ${
                      tab.isActive
                        ? "bg-white border-b-2 border-blue-500"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => switchTab(tab.id)}
                  >
                    <Globe className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="text-xs truncate flex-1">{tab.title}</span>
                    {tabs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 py-1 text-xs"
                  onClick={addNewTab}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="flex items-center p-2 border-b bg-gray-50">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  disabled={historyIndex === 0}
                  title="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goForward}
                  disabled={historyIndex >= browserHistory.length - 1}
                  title="Forward"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshPage}
                  title="Refresh"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleBrowserNavigation("https://www.google.com")
                  }
                  title="Home"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 mx-4 flex items-center space-x-2">
                <div className="flex items-center flex-1 bg-white border rounded-full px-3 py-1">
                  {browserUrl.startsWith("https://") ? (
                    <Lock className="h-3 w-3 text-green-600 mr-2" />
                  ) : (
                    <Shield className="h-3 w-3 text-gray-400 mr-2" />
                  )}
                  <Input
                    className="flex-1 text-sm border-none focus-visible:ring-0 px-0"
                    value={browserUrl}
                    onChange={(e) => setBrowserUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleBrowserNavigation(browserUrl);
                      }
                    }}
                    placeholder="Search Google or type a URL"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleBrowserNavigation(browserUrl)}
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={
                    isBookmarked
                      ? () =>
                          removeBookmark(
                            bookmarks.find((b) => b.url === browserUrl)?.id ||
                              "",
                          )
                      : addBookmark
                  }
                  title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Star
                    className={`h-4 w-4 ${isBookmarked ? "fill-yellow-400 text-yellow-400" : ""}`}
                  />
                </Button>

                <Popover open={showBookmarks} onOpenChange={setShowBookmarks}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" title="Bookmarks">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2" align="end">
                    <Tabs defaultValue="bookmarks" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="downloads">Downloads</TabsTrigger>
                      </TabsList>
                      <TabsContent value="bookmarks" className="space-y-2 mt-2">
                        <div className="text-sm font-medium">Bookmarks</div>
                        {bookmarks.length === 0 ? (
                          <div className="text-xs text-muted-foreground py-4 text-center">
                            No bookmarks yet
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {bookmarks.map((bookmark) => (
                              <div
                                key={bookmark.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                              >
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => {
                                    handleBrowserNavigation(bookmark.url);
                                    setShowBookmarks(false);
                                  }}
                                >
                                  <div className="text-xs font-medium truncate">
                                    {bookmark.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {bookmark.url}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => removeBookmark(bookmark.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="history" className="space-y-2 mt-2">
                        <div className="text-sm font-medium">History</div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {browserHistory
                            .slice()
                            .reverse()
                            .map((url, index) => (
                              <div
                                key={index}
                                className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => {
                                  handleBrowserNavigation(url);
                                  setShowBookmarks(false);
                                }}
                              >
                                <History className="h-3 w-3 mr-2" />
                                <div className="flex-1">
                                  <div className="text-xs font-medium truncate">
                                    {getPageTitle(url)}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {url}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="downloads" className="space-y-2 mt-2">
                        <div className="text-sm font-medium">Downloads</div>
                        <div className="text-xs text-muted-foreground py-4 text-center">
                          No downloads yet
                        </div>
                      </TabsContent>
                    </Tabs>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (windowId) {
                      maximizeWindow(windowId);
                    }
                  }}
                  title="Full Screen"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-white overflow-auto">
              {browserContent ? (
                <div dangerouslySetInnerHTML={{ __html: browserContent }} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌐</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      WebOS Browser
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Enter a URL to browse the web
                    </p>
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">
                          Quick Links
                        </h3>
                        <div className="space-x-4 text-sm">
                          <button
                            onClick={() =>
                              handleBrowserNavigation("google.com")
                            }
                            className="text-blue-600 hover:underline"
                          >
                            Google
                          </button>
                          <button
                            onClick={() =>
                              handleBrowserNavigation("github.com")
                            }
                            className="text-blue-600 hover:underline"
                          >
                            GitHub
                          </button>
                          <button
                            onClick={() =>
                              handleBrowserNavigation("youtube.com")
                            }
                            className="text-blue-600 hover:underline"
                          >
                            YouTube
                          </button>
                          <button
                            onClick={() =>
                              handleBrowserNavigation("twitter.com")
                            }
                            className="text-blue-600 hover:underline"
                          >
                            Twitter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-white h-full">Unknown application type</div>
        );
    }
  };

  return (
    <div className="w-full h-full overflow-hidden bg-white">
      {renderApplication()}
    </div>
  );
};

export default ApplicationLoader;
