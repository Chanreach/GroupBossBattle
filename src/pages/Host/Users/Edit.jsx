import React from 'react';
import { User, ArrowLeft, Save, X, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    username: '', 
    role: 'player' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/users/${id}`);
        setForm({
          username: res.data.username || '',
          role: res.data.role || 'player',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const validateForm = () => {
    const errors = {};
    
    if (!form.username.trim()) {
      errors.username = 'Username is required';
    } else if (form.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!form.role) {
      errors.role = 'Role is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[id]) {
      setValidationErrors({ ...validationErrors, [id]: '' });
    }
  };

  const handleRoleChange = (value) => {
    setForm({ ...form, role: value });
    
    // Clear validation error when user changes role
    if (validationErrors.role) {
      setValidationErrors({ ...validationErrors, role: '' });
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'host': return 'default';
      case 'player': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleteDialog(false);
    setDeleting(true);
    
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      navigate('/host/users/view');
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      await apiClient.put(`/users/${id}`, {
        username: form.username.trim(),
        role: form.role
      });
      
      toast.success('User updated successfully');
      navigate('/host/users/view');
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">Loading user...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !form.username) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/host/users/view')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Users
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/host/users/view')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Edit User
            </h1>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {form.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span>{form.username}</span>
                  <Badge variant={getRoleBadgeVariant(form.role)} className="text-xs">
                    {form.role}
                  </Badge>
                </div>
              </CardTitle>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-900 dark:text-white">
                  Username <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  className={`bg-white dark:bg-black dark:text-white ${
                    validationErrors.username ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="Enter username"
                />
                {validationErrors.username && (
                  <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.username}</p>
                )}
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Role <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Select value={form.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className={`bg-white dark:bg-black dark:text-white ${
                    validationErrors.role ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="host">Host</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.role && (
                  <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.role}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/host/users/view')}
                  disabled={saving || deleting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1"
                  disabled={saving || deleting}
                >
                  {saving ? (
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
            </form>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete User
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{form.username}"</span>? 
                <br />
                <span className="text-red-600 dark:text-red-400 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-6">
              <AlertDialogCancel className="flex-1">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Edit;