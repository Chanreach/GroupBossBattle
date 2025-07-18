import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api';
import { useAuth } from '@/context/useAuth';
import { toast } from 'sonner';
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

const EditCategory = () => {
  const navigate = useNavigate();
  const { id: categoryId } = useParams();
  const { user } = useAuth();
  
  const [categoryName, setCategoryName] = useState('');
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if user can edit this category
  const canEdit = () => {
    return user?.role === 'admin' || category?.creatorId === user?.id;
  };

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/categories/${categoryId}`);
        const categoryData = response.data;
        setCategory(categoryData);
        setCategoryName(categoryData.name);
      } catch (err) {
        console.error('Error fetching category:', err);
        toast.error('Failed to fetch category');
        navigate('/host/questionbank/categories/view');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    } else if (categoryName.trim().length < 3) {
      newErrors.categoryName = 'Category name must be at least 3 characters';
    } else if (categoryName.trim().length > 50) {
      newErrors.categoryName = 'Category name must be 50 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for button styling (same as Create)
  const isFormValid = categoryName.trim().length >= 3;

  const handleSave = async () => {
    if (!validateForm() || !canEdit()) return;
    
    setIsSaving(true);
    try {
      await apiClient.put(`/categories/${categoryId}`, {
        name: categoryName.trim()
      });
      
      toast.success('Category updated successfully');
      navigate('/host/questionbank/categories/view');
    } catch (error) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update category';
      toast.error(errorMessage);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        setErrors({ categoryName: error.response.data.errors.join(', ') });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/host/questionbank/categories/view');
  };

  const handleDelete = async () => {
    if (!canEdit()) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/categories/${categoryId}`);
      toast.success('Category deleted successfully');
      setShowDeleteDialog(false);
      navigate('/host/questionbank/categories/view');
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8 text-gray-500">Loading category...</div>
        </div>
      </div>
    );
  }

  if (!category || !canEdit()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-4">Category not found or access denied</p>
            <Button onClick={() => navigate('/host/questionbank/categories/view')} variant="outline">
              Back to Categories
            </Button>
          </div>
        </div>
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
              onClick={handleCancel}
              className="p-2 hover:bg-white/50 dark:hover:bg-background/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update category information</p>
            </div>
          </div>
          
          {/* Trash Icon - Top Right */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            disabled={isLoading}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-0 bg-card backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-600">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Save className="h-5 w-5" />
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  if (errors.categoryName) {
                    setErrors(prev => ({ ...prev, categoryName: '' }));
                  }
                }}
                placeholder="e.g., Computer Science, Art, Business"
                maxLength={50}
                className={`${errors.categoryName ? 'border-red-500 focus:border-red-500' : isFormValid ? 'border-green-500 focus:border-green-500' : ''} dark:bg-background dark:border-gray-600 dark:text-white transition-colors`}
              />
              {errors.categoryName && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.categoryName}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {categoryName.length}/50 characters {isFormValid && !errors.categoryName && <span className="text-green-600 dark:text-green-400">✓ Valid</span>}
              </p>
            </div>

            {/* Author Info (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Created By
              </Label>
              <div className="p-3 bg-muted rounded-md border">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {category?.creator?.username || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isSaving || isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className={`flex items-center gap-2 flex-1 transition-all duration-300 ${
                  isFormValid && !isSaving && !isDeleting
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
                } dark:${
                  isFormValid && !isSaving && !isDeleting
                    ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                disabled={!isFormValid || isSaving || isDeleting}
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Delete Category
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete the category{' '}
                <span className="font-semibold text-gray-900 dark:text-white">"{categoryName}"</span>?
                <br /><br />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  This action cannot be undone and will permanently remove all associated questions.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel 
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Category'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EditCategory;