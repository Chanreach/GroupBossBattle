// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const EditUser = () => {
  const { auth } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    id: "",
    username: "",
    email: "",
    role: "player",
  });
  const [originalUserData, setOriginalUserData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/users/${userId}`);
      const data = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      };
      setUserData(data);
      setOriginalUserData(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch user.");
      }
      setError(data?.message || "Failed to fetch user.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const isMe = auth?.user?.id === userData.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setUserData((prevData) => ({ ...prevData, role: value }));
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "host":
        return "default";
      case "player":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);

    try {
      await apiClient.delete(`/users/${userId}`);
      navigate("/manage/users");
      setTimeout(() => {
        toast.success("User deleted successfully!");
      }, 100);
    } catch (error) {
      console.error("Error deleting user:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to delete user.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const isSaveEnabled = () => {
    if (!userData || !originalUserData) return false;

    const hasChanges = Object.keys(userData).some(
      (key) => userData[key] !== originalUserData[key]
    );

    const requiredFields = ["username", "role"];
    const areRequiredFieldsFilled = requiredFields.every(
      (key) => userData[key] && userData[key].trim() !== ""
    );

    return hasChanges && areRequiredFieldsFilled;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!isSaveEnabled()) return;
    setIsSaving(true);
    try {
      const response = await apiClient.put(`/users/${userId}`, {
        username: userData.username,
        role: userData.role,
      });
      if (isMe) {
        window.location.reload();
      }
      navigate("/manage/users");
      // window.location.href = "/manage/users";
      setTimeout(() => {
        toast.success(response.data.message || "User updated successfully!");
      }, 100);
    } catch (error) {
      console.error("Error updating user:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to update user.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <StatusOverlay message="Loading user details..." type="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <StatusOverlay message={error} type="error" onRetry={fetchUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/manage/users")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit User</h1>
              <p className="text-sm text-muted-foreground">
                Update user information and role
              </p>
            </div>
          </div>

          {/* Delete Button - Top Right */}
          {!isMe && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
              disabled={isSaving || isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {userData.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span>{userData.username}</span>
                  <Badge
                    variant={getRoleBadgeVariant(userData.role)}
                    className="text-xs"
                  >
                    {userData.role}
                  </Badge>
                </div>
                {userData.id && (
                  <p className="text-xs text-muted-foreground font-mono">
                    UUID: {userData.id}
                  </p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              id="user-edit-form"
              onSubmit={handleSave}
              className="space-y-6"
            >
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={userData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  readOnly
                  className="bg-muted/60 border-muted text-muted-foreground cursor-default"
                  placeholder="Email address"
                />
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={userData.role}
                  onValueChange={handleRoleChange}
                  disabled={
                    auth?.user?.role === "superadmin" &&
                    userData.role === "superadmin"
                  }
                >
                  <SelectTrigger
                    className="
                        dark:bg-muted
                    "
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {userData.role === "superadmin" && (
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto sm:min-w-[120px]"
            onClick={() => navigate("/manage/users")}
            disabled={isSaving || isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-edit-form"
            className="w-full sm:w-auto sm:min-w-[120px]"
            disabled={!isSaveEnabled() || isSaving || isDeleting}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Delete User
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete the user{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{userData.username}"
                </span>
                ?
                <br />
                <br />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  This action cannot be undone.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </div>
                ) : (
                  "Delete User"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EditUser;
