import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Settings,
  Save,
  Camera,
  Shield,
  Bell,
  Palette,
  Monitor,
  Volume2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useDesktopStore } from "@/store/desktopStore";

interface ProfileSettingsProps {
  onClose?: () => void;
}

const ProfileSettings = ({ onClose = () => {} }: ProfileSettingsProps) => {
  const { user, updateProfile } = useAuthStore();
  const { wallpaper, setWallpaper } = useDesktopStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [wallpaperUrl, setWallpaperUrl] = useState(wallpaper);

  const handleProfileSave = () => {
    updateProfile(profileData);
    setSaveMessage("Profile updated successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleWallpaperSave = () => {
    setWallpaper(wallpaperUrl);
    setSaveMessage("Wallpaper updated successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const predefinedWallpapers = [
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80",
  ];

  if (!user) return null;

  return (
    <div className="w-full h-full bg-white">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {saveMessage && (
          <div className="p-4">
            <Alert>
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex-1 p-4 bg-white overflow-auto max-h-[calc(100vh-120px)]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.username}
                      />
                      <AvatarFallback className="text-lg">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Member since {user.createdAt.toLocaleDateString()}
                  </div>

                  <Button onClick={handleProfileSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Desktop Wallpaper
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallpaperUrl">Custom Wallpaper URL</Label>
                    <Input
                      id="wallpaperUrl"
                      type="url"
                      placeholder="https://example.com/wallpaper.jpg"
                      value={wallpaperUrl}
                      onChange={(e) => setWallpaperUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Predefined Wallpapers</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {predefinedWallpapers.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setWallpaperUrl(url)}
                          className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                            wallpaperUrl === url
                              ? "border-blue-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Wallpaper ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleWallpaperSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Apply Wallpaper
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    System Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span>Sound</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Advanced Settings</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Account Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your account security settings
                    </p>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Data & Privacy</h4>
                    <p className="text-sm text-muted-foreground">
                      Control how your data is used and stored
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Data
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Session Management</h4>
                    <p className="text-sm text-muted-foreground">
                      View and manage your active sessions
                    </p>
                    <Button variant="outline" size="sm">
                      View Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
