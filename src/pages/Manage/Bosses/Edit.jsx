import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  X,
  ChevronDown,
  ArrowLeft,
  Sword,
  ImageIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import { apiClient } from "@/api/apiClient";
import { toast } from "sonner";

const EditBoss = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasOriginalImage, setHasOriginalImage] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    cooldownDuration: "",
    numberOfTeams: "",
    description: "",
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [originalCategories, setOriginalCategories] = useState([]);
  const [originalImageState, setOriginalImageState] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      // API returns { categories: [], totalCount: ... } - we need the categories array
      const categoriesData = response.data.categories || response.data;
      setAvailableCategories(
        Array.isArray(categoriesData) ? categoriesData : []
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch boss data from API
  const fetchBossData = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await apiClient.get(`/bosses/${id}`);
      const boss = response.data;

      // Update form data
      const bossFormData = {
        name: boss.name || "",
        cooldownDuration: boss.cooldownDuration || "",
        numberOfTeams: boss.numberOfTeams || "",
        description: boss.description || "",
      };
      setFormData(bossFormData);
      setOriginalFormData(bossFormData);

      // Set selected categories (convert from boss.Categories to the expected format)
      const bossCategories = boss.Categories || [];
      setSelectedCategories(bossCategories);
      setOriginalCategories(bossCategories);

      // Set image preview if boss has an image
      const imageState = {
        hasImage: !!boss.image,
        imageUrl: boss.image,
      };
      setOriginalImageState(imageState);
      if (boss.image) {
        setImagePreview(boss.image);
        setHasOriginalImage(true);
      }
    } catch (error) {
      console.error("Error fetching boss data:", error);
      navigate("/host/bosses"); // Redirect if boss not found
    } finally {
      setPageLoading(false);
    }
  }, [id, navigate]);

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchBossData();
  }, [id, fetchBossData]);

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

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
    setHasOriginalImage(false);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCategorySelect = (category) => {
    if (!selectedCategories.find((cat) => cat.id === category.id)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setIsDropdownOpen(false);
  };

  const handleCategoryRemove = (categoryToRemove) => {
    setSelectedCategories(
      selectedCategories.filter((cat) => cat.id !== categoryToRemove.id)
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if current data is different from original data
  const hasFormChanges =
    originalFormData &&
    (formData.name !== originalFormData.name ||
      formData.cooldownDuration !== originalFormData.cooldownDuration ||
      formData.numberOfTeams !== originalFormData.numberOfTeams ||
      formData.description !== originalFormData.description);

  // Check if categories have changed
  const hasCategoryChanges =
    originalCategories &&
    (selectedCategories.length !== originalCategories.length ||
      selectedCategories.some(
        (cat) => !originalCategories.find((orig) => orig.id === cat.id)
      ));

  // Check if image has changed
  const hasImageChanges =
    selectedImage !== null ||
    (originalImageState && imagePreview !== originalImageState.imageUrl);

  // Overall changes check
  const hasChanges = hasFormChanges || hasCategoryChanges || hasImageChanges;

  // Check if save should be enabled
  const isSaveEnabled = hasChanges && formData.name.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Boss name is required");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("cooldownDuration", formData.cooldownDuration || 60);
      submitData.append("numberOfTeams", formData.numberOfTeams || 2);

      // Add category IDs
      if (selectedCategories.length > 0) {
        submitData.append(
          "categoryIds",
          JSON.stringify(selectedCategories.map((cat) => cat.id))
        );
      }

      // Add image if selected
      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      await apiClient.put(`/bosses/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Boss updated successfully!");
      navigate("/host/bosses/view");
    } catch (error) {
      console.error("Error updating boss:", error);
      toast.error(error.response?.data?.message || "Failed to update boss");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/host/bosses/view");
  };

  const handleDelete = () => {
    // Open confirmation dialog
    setDeleteDialog({ isOpen: true });
  };

  const confirmDeleteBoss = async () => {
    try {
      setLoading(true);
      await apiClient.delete(`/bosses/${id}`);
      toast.success("Boss deleted successfully!");
      setDeleteDialog({ isOpen: false });
      navigate("/host/bosses/view");
    } catch (error) {
      console.error("Error deleting boss:", error);
      toast.error(error.response?.data?.message || "Failed to delete boss");
      setDeleteDialog({ isOpen: false });
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteBoss = () => {
    setDeleteDialog({ isOpen: false });
  };

  const unselectedCategories = (availableCategories || []).filter(
    (cat) =>
      !(selectedCategories || []).find((selected) => selected.id === cat.id)
  );

  return (
    <div className="min-h-screen bg-background">
      {pageLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading boss data...</p>
          </div>
        </div>
      ) : (
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
                    Edit Boss
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Modify boss details and settings
                  </p>
                </div>
              </div>

              {/* Delete Button - Top Right */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
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
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors bg-muted/30 cursor-pointer ${
                        isDragOver
                          ? "border-primary bg-primary/10"
                          : imagePreview
                          ? "border-border hover:border-primary/50"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={!imagePreview ? triggerFileInput : undefined}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Boss preview"
                            className="w-full max-w-sm object-cover rounded-lg mx-auto aspect-square"
                          />
                          <div className="flex justify-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                              }}
                              className="flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerFileInput();
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Change
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-medium">
                              {hasOriginalImage
                                ? "Change Boss Image"
                                : "Add Boss Image"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Click to browse or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG up to 10MB
                            </p>
                          </div>
                          {!hasOriginalImage && (
                            <p className="text-xs text-red-600 bg-red dark:bg-red-900/10 px-3 py-2 rounded-md">
                              Boss image is required
                            </p>
                          )}
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
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="boss-cooldown">
                        Boss Cooldown (minutes)
                      </Label>
                      <Input
                        id="boss-cooldown"
                        type="number"
                        placeholder="e.g., 30"
                        min="1"
                        value={formData.cooldownDuration}
                        onChange={(e) =>
                          handleInputChange("cooldownDuration", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <Label htmlFor="categories">Category</Label>

                    <div className="relative">
                      {/* Category Display Bar with Tags and Dropdown Arrow */}
                      <div
                        className="flex px-2 w-full rounded-md border border-input bg-background dark:bg-input/30 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] py-2 flex-wrap gap-2 items-center cursor-pointer hover:border-muted-foreground/50"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        {/* Selected Category Tags */}
                        {selectedCategories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-md"
                          >
                            {category.name}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryRemove(category);
                              }}
                            />
                          </span>
                        ))}

                        {/* Placeholder when no categories selected */}
                        {selectedCategories.length === 0 && (
                          <span className="text-muted-foreground text-sm">
                            Select categories
                          </span>
                        )}

                        {/* Dropdown Arrow */}
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {/* Dropdown Options */}
                      {isDropdownOpen && unselectedCategories.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden z-10">
                          {unselectedCategories.map((category) => (
                            <div
                              key={category.id}
                              className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b border-border last:border-b-0 text-popover-foreground"
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
                    <Label htmlFor="teams-count">
                      Number of Teams to Start
                    </Label>
                    <Input
                      id="teams-count"
                      type="number"
                      placeholder="Enter number"
                      min="1"
                      value={formData.numberOfTeams}
                      onChange={(e) =>
                        handleInputChange("numberOfTeams", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background text-foreground placeholder:text-muted-foreground text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-0 pb-2 sm:justify-end">
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
                  disabled={loading || !isSaveEnabled}
                  className="w-full sm:w-auto sm:min-w-[120px]"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={cancelDeleteBoss}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle>Delete Boss</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{formData.name}</span>?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will permanently delete this boss and remove it from
              all events. This cannot be undone.
            </p>
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBoss}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Boss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditBoss;
