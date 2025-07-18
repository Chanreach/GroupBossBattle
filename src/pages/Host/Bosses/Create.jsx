import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ChevronDown, ArrowLeft, Sword, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { apiClient } from '@/api';
import { toast } from 'sonner';

const CreateBoss = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cooldownDuration: '',
    numberOfTeams: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      // API returns { categories: [], totalCount: ... } - we need the categories array
      const categoriesData = response.data.categories || response.data;
      setAvailableCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      // Fallback to empty array if API fails
      setAvailableCategories([]);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = (category) => {
    if (!selectedCategories.find(cat => cat.id === category.id)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setIsDropdownOpen(false);
  };

  const handleCategoryRemove = (categoryToRemove) => {
    setSelectedCategories(selectedCategories.filter(cat => cat.id !== categoryToRemove.id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Boss name is required');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('cooldownDuration', formData.cooldownDuration || 60);
      submitData.append('numberOfTeams', formData.numberOfTeams || 2);
      
      // Add category IDs
      if (selectedCategories.length > 0) {
        submitData.append('categoryIds', JSON.stringify(selectedCategories.map(cat => cat.id)));
      }
      
      // Add image if selected
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }
      
      await apiClient.post('/bosses', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Boss created successfully!');
      navigate('/host/bosses/view');
    } catch (error) {
      console.error('Error creating boss:', error);
      toast.error(error.response?.data?.message || 'Failed to create boss');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/host/bosses/view');
  };

  const unselectedCategories = (availableCategories || []).filter(
    cat => !(selectedCategories || []).find(selected => selected.id === cat.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Create Boss</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Boss Image
              </h3>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Boss preview"
                        className="w-full max-w-sm h-48 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedImage(null);
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-medium">Upload Boss Image</p>
                        <p className="text-sm text-muted-foreground">
                          Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boss Details Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sword className="h-5 w-5" />
                Boss Details
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Boss Name and Cooldown */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="boss-name">Boss Name *</Label>
                  <Input
                    id="boss-name"
                    placeholder="Enter boss name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boss-cooldown">Boss Cooldown (minutes)</Label>
                  <Input
                    id="boss-cooldown"
                    type="number"
                    placeholder="e.g., 30"
                    min="1"
                    value={formData.cooldownDuration}
                    onChange={(e) => handleInputChange('cooldownDuration', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Categories - UNCHANGED */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Category
                </Label>
                
                <div className="relative">
                  {/* Category Display Bar with Tags and Dropdown Arrow */}
                  <div 
                    className="border border-gray-300 dark:border-gray-600 rounded-md p-3 min-h-[40px] flex flex-wrap gap-2 items-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-background"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {/* Selected Category Tags */}
                    {selectedCategories.map((category) => (
                      <span 
                        key={category.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm rounded-md"
                      >
                        {category.name}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryRemove(category);
                          }}
                        />
                      </span>
                    ))}
                    
                    {/* Placeholder when no categories selected */}
                    {selectedCategories.length === 0 && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Select categories</span>
                    )}
                    
                    {/* Dropdown Arrow */}
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && unselectedCategories.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-background border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
                      {unselectedCategories.map((category) => (
                        <div
                          key={category.id}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-gray-900 dark:text-white"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Number of Teams */}
              <div className="space-y-2">
                <Label htmlFor="teams-count">Number of Teams to Start</Label>
                <Input
                  id="teams-count"
                  type="number"
                  placeholder="Enter number"
                  min="1"
                  value={formData.numberOfTeams}
                  onChange={(e) => handleInputChange('numberOfTeams', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Boss Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe the boss, its abilities, difficulty level..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {loading ? 'Creating...' : 'Create Boss'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoss;