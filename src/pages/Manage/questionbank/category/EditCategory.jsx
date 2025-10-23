// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const EditCategory = () => {
  const { categoryId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [categoryData, setCategoryData] = useState({
    name: "",
  });
  const [originalCategoryData, setOriginalCategoryData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/categories/${categoryId}`);
      setCategoryData(response.data);
      setOriginalCategoryData(response.data);
    } catch (error) {
      console.error("Error fetching category:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Category fetching failed.");
      }
      setError(data?.message || "Failed to fetch category.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const canEdit = () => {
    const user = auth?.user;
    return (
      user?.role === "superadmin" ||
      user?.role === "admin" ||
      originalCategoryData?.creatorId === user?.id
    );
  };

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCategoryData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const isSaveEnabled = () => {
    if (!categoryData || !originalCategoryData) return false;

    const hasFieldChanges = Object.keys(categoryData).some(
      (key) => categoryData[key] !== originalCategoryData[key]
    );

    const requiredFields = ["name"];
    const areRequiredFieldsFilled = requiredFields.every(
      (key) =>
        categoryData[key] !== undefined &&
        categoryData[key] !== null &&
        categoryData[key].toString().trim() !== ""
    );

    return hasFieldChanges && areRequiredFieldsFilled;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!isSaveEnabled() || !canEdit()) return;
    setIsSaving(true);
    try {
      const response = await apiClient.put(
        `/categories/${categoryId}`,
        categoryData
      );
      navigate("/manage/questionbank/categories");
      setTimeout(() => {
        toast.success(
          response.data?.message || "Category updated successfully!"
        );
      }, 100);
    } catch (error) {
      console.error("Error updating category:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Category update failed.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage/questionbank/categories");
  };

  const handleDelete = async () => {
    if (!canEdit()) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/categories/${categoryId}`);
      setShowDeleteDialog(false);
      navigate("/manage/questionbank/categories");
      setTimeout(() => {
        toast.success("Category deleted successfully!");
      }, 100);
    } catch (error) {
      console.error("Error deleting category:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to delete category");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <StatusOverlay message="Loading category..." type="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <StatusOverlay message={error} type="error" onRetry={fetchCategory} />
      </div>
    );
  }

  if (!canEdit()) {
    navigate("/manage/questionbank/categories");
    setTimeout(() => {
      toast.error(
        "Forbidden: You do not have permission to edit this category."
      );
    }, 100);
    return null;
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
              className="p-2 hover:bg-accent/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Category
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update category information
              </p>
            </div>
          </div>

          {/* Delete Button - Top Right */}
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
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-0 bg-card backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Save className="h-5 w-5" />
              Category Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category Name{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={categoryData.name}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science, Art, Business"
                maxLength={50}
                className="dark:bg-background dark:border-gray-600 dark:text-white transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {categoryData.name.length}/50 characters
              </p>
            </div>

            {/* Author Info (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Created By
              </Label>
              <div className="p-3 bg-muted rounded-md border">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {originalCategoryData?.creator?.username || "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto sm:min-w-[120px]"
            disabled={isSaving || isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            disabled={!isSaveEnabled() || isSaving || isDeleting}
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Delete Category
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete the category{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{categoryData.name}"
                </span>
                ?
                <br />
                <br />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  This action cannot be undone and will permanently remove all
                  associated questions.
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
                  "Delete Category"
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
