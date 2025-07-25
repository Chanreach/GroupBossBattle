import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api';
import { toast } from 'sonner';

const CreateCategory = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Category name must be 50 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for button styling
  const isFormValid = name.trim().length >= 2;

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.post('/categories', {
        name: name.trim()
      });
      
      toast.success('Category created successfully');
      navigate('/host/questionbank/categories/view');
    } catch (error) {
      console.error('Error creating category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create category';
      toast.error(errorMessage);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        setErrors({ name: error.response.data.errors.join(', ') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/host/questionbank/categories/view');
  };

  const clearErrors = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
              className="p-2 hover:bg-accent/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Category
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new category to organize questions
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-0 bg-card backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Category Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="categoryName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="e.g., Computer Science, Art, Business"
                maxLength={50}
                className={`${errors.name ? 'border-red-500 focus:border-red-500' : isFormValid ? 'border-green-500 focus:border-green-500' : ''} dark:bg-background dark:border-gray-600 dark:text-white transition-colors`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {name.length}/50 characters {isFormValid && !errors.name && <span className="text-green-600 dark:text-green-400">✓ Valid</span>}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto sm:min-w-[120px]"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;