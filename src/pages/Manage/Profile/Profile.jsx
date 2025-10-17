// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Camera,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  LogOut,
} from "lucide-react";

// ===== COMPONENTS (Shadcn.ui) ===== //
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import AlertLogout from "@/layouts/AlertLogout";

// ===== CONTEXTS ===== //
import { useAuth } from "@/context/useAuth";
import { apiClient } from "@/api/apiClient";
import { toast } from "sonner";

const HostProfile = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/users/profile");
      setProfileData(response.data);
      console.log(response.data);
      setEditData({
        username: response.data.username,
        email: response.data.email,
        password: "",
        confirmPassword: "",
        profileImage: null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      username: profileData.username,
      email: profileData.email,
      password: "",
      confirmPassword: "",
      profileImage: null,
    });
  };

  const handleSave = async () => {
    try {
      // Validation
      if (editData.password && editData.password !== editData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      if (
        editData.password &&
        editData.password.length > 0 &&
        editData.password.length < 8
      ) {
        toast.error("Password must be at least 8 characters long!");
        return;
      }

      setSaving(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("username", editData.username);
      formData.append("email", editData.email);
      if (editData.password) {
        formData.append("password", editData.password);
      }
      if (editData.profileImage) {
        formData.append("profileImage", editData.profileImage);
      }

      const response = await apiClient.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local state and auth context
      setProfileData(response.data.user);
      setUser({ ...user, ...response.data.user });

      setIsEditing(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/host/events/view");
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate("/landing");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditData({
      username: profileData.username,
      email: profileData.email,
      password: "",
      confirmPassword: "",
      profileImage: null,
    });
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only image files (JPEG, PNG, GIF, WebP) are allowed");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setEditData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no profile data
  if (!profileData) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load profile data</p>
            <Button onClick={fetchProfile} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            onClick={() => setShowLogoutDialog(true)}
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== PROFILE PICTURE ===== */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 sm:w-40 sm:h-40">
                  <AvatarImage
                    src={
                      editData.profileImage
                        ? URL.createObjectURL(editData.profileImage)
                        : profileData.profileImage
                        ? `${profileData.profileImage}`
                        : "/src/assets/Placeholder/host-profile.jpg"
                    }
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl sm:text-3xl">
                    {(isEditing ? editData.username : profileData.username)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {isEditing ? editData.username : profileData.username}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  UUID: {profileData.id}
                </p>
                <Badge variant="outline" className="mt-1">
                  {profileData.role.charAt(0).toUpperCase() +
                    profileData.role.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== ACCOUNT INFORMATION ===== */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={editData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter your username"
                  />
                ) : (
                  <Input
                    id="username"
                    value={profileData.username}
                    readOnly
                    className="bg-muted/60 border-muted text-muted-foreground cursor-default"
                  />
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                  />
                ) : (
                  <Input
                    id="email"
                    value={profileData.email}
                    readOnly
                    className="bg-muted/60 border-muted text-muted-foreground cursor-default"
                  />
                )}
              </div>

              <Separator />

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={editData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={editData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          placeholder="Confirm your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {editData.password &&
                      editData.confirmPassword &&
                      editData.password !== editData.confirmPassword && (
                        <p className="text-sm text-destructive">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                ) : (
                  <Input
                    id="password"
                    type="password"
                    value="••••••••"
                    readOnly
                    className="bg-muted/60 border-muted text-muted-foreground cursor-default font-mono tracking-wider"
                  />
                )}
              </div>

              {isEditing && (
                <>
                  <div className="bg-background p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Leave blank to keep current password</li>
                      <li>• Confirm password must match</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleEdit}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertLogout
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default HostProfile;
