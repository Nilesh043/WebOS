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
  Home,
  Bot,
  Send,
} from "lucide-react";
import { useFileSystemStore } from "@/store/fileSystemStore";
import { useWindowStore } from "@/store/windowStore";

interface ApplicationLoaderProps {
  appType: "fileExplorer" | "textEditor" | "terminal" | "aiAssistant";
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
  const { updateWindowData, createWindow } = useWindowStore();

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
