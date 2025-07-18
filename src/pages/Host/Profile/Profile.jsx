// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Camera, Edit, Save, X, Eye, EyeOff, ArrowLeft } from "lucide-react";

// ===== COMPONENTS (Shadcn.ui) ===== //
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// ===== CONTEXTS ===== //
import { useAuth } from "@/context/useAuth";
import { apiClient } from "@/api";
import { toast } from "sonner";

const HostProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/profile');
      setProfileData(response.data);
      setEditData({
        username: response.data.username,
        email: response.data.email,
        password: "",
        confirmPassword: "",
        profileImage: null
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
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
      profileImage: null
    });
  };

  const handleSave = async () => {
    try {
      // Validation
      if (editData.password && editData.password !== editData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      
      if (editData.password && editData.password.length > 0 && editData.password.length < 8) {
        toast.error("Password must be at least 8 characters long!");
        return;
      }

      setSaving(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('username', editData.username);
      formData.append('email', editData.email);
      if (editData.password) {
        formData.append('password', editData.password);
      }
      if (editData.profileImage) {
        formData.append('profileImage', editData.profileImage);
      }

      const response = await apiClient.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local state and auth context
      setProfileData(response.data.user);
      setUser({ ...user, ...response.data.user });
      
      setIsEditing(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
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
      profileImage: null
    });
  };

  const handleBack = () => {
    navigate('/host/events/view');
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setEditData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no profile data
  if (!profileData) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load profile data</p>
            <Button onClick={fetchProfile} variant="outline">Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const isPasswordValid = editData.password.length >= 8;
  const doPasswordsMatch = editData.password === editData.confirmPassword;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Profile Picture Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={editData.profileImage 
                        ? URL.createObjectURL(editData.profileImage)
                        : profileData.profileImage 
                          ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profileData.profileImage}`
                          : "/src/assets/Placeholder/host-profile.jpg"
                      } 
                      alt={profileData.username} 
                    />
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {profileData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
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
                
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg">{profileData.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    UUID: {profileData.id}
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
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
                      onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {profileData.username}
                    </div>
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
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {profileData.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={editData.password}
                        onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
                        className="pr-10"
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
                  ) : (
                    <div className="p-2 bg-muted rounded-md font-mono tracking-wider">
                      ••••••••
                    </div>
                  )}
                </div>

                {/* Confirm Password (only when editing) */}
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={editData.confirmPassword}
                        onChange={(e) => setEditData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Password Requirements (only when editing) */}
                {isEditing && (
                  <div className="bg-background p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">Password Requirements:</p>
                    <ul className="text-xs space-y-1">
                      <li className={`flex items-center gap-2 ${isPasswordValid ? 'text-green-600' : 'text-muted-foreground'}`}>
                        • At least 8 characters long
                      </li>
                      <li className="text-muted-foreground">
                        • Leave blank to keep current password
                      </li>
                      <li className={`flex items-center gap-2 ${doPasswordsMatch ? 'text-green-600' : 'text-muted-foreground'}`}>
                        • Confirm password must match
                      </li>
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="flex-1"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="flex-1 flex items-center gap-2"
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
                        variant="outline" 
                        onClick={handleBack}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleEdit}
                        className="flex-1 flex items-center gap-2"
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
      </div>
    </div>
  );
};

export default HostProfile;