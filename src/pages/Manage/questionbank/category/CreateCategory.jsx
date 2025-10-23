// ===== LIBRARIES ===== //
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { ArrowLeft, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const CreateCategory = () => {
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState({
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = categoryData.name.trim().length >= 2;

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/categories", {
        name: categoryData.name.trim(),
      });
      navigate("/manage/questionbank/categories");
      setTimeout(() => {
        toast.success(
          response.data.message || "Category created successfully!"
        );
      }, 100);
    } catch (error) {
      console.error("Error creating category:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Category creation failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage/questionbank/categories");
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
              <Label
                htmlFor="categoryName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category Name{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="categoryName"
                value={categoryData.name}
                onChange={(e) => {
                  setCategoryData({
                    name: e.target.value,
                  });
                }}
                placeholder="e.g., Computer Science, Art, Business"
                maxLength={50}
                className="dark:bg-background dark:border-gray-600 dark:text-white transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {categoryData.name.length}/50 characters{" "}
                {isFormValid && (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Valid
                  </span>
                )}
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
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
