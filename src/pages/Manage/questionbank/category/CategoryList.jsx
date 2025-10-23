// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Grid3X3, Edit3 } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const CategoryList = ({ search, ownershipFilter }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories.");
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch categories.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const canEditCategory = (category) => {
    return (
      auth?.user?.role === "superadmin" ||
      auth?.user?.role === "admin" ||
      category?.creatorId === auth?.user?.id
    );
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/manage/questionbank/questions?category=${categoryName}`);
  };

  // Filter categories based on search query and ownership
  const filteredCategories = (categories || []).filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesOwnership =
      ownershipFilter === "anyone" ||
      (ownershipFilter === "me" && category.creatorId === auth?.user?.id);
    return matchesSearch && matchesOwnership;
  });

  const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = filteredCategories.slice(startIndex, endIndex);

  const getAuthorBadgeColor = (author) => {
    if (author.includes("[Admin]"))
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700";
    if (author.includes("[Host]"))
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700";
    return "bg-muted text-muted-foreground border";
  };

  if (loading) {
    return <StatusOverlay message="Loading categories..." type="loading" />;
  }

  if (error) {
    return (
      <StatusOverlay message={error} type="error" onRetry={fetchCategories} />
    );
  }

  if (paginatedData.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
            <Grid3X3 className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
            No Categories Found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {search || ownershipFilter === "me"
              ? `Try adjusting your search${
                  ownershipFilter === "me" ? ", ownership," : ""
                } or filter criteria.`
              : `No categories have been created yet.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Content Area */}
      <div className="content-area">
        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
          {paginatedData.map((category) => (
            <Card
              key={category.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  {canEditCategory(category) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/manage/questionbank/categories/${category.id}/edit`
                        );
                      }}
                      className="h-7 w-7 p-0 flex-shrink-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {category.questionsCount || category.questionCount || 0}{" "}
                    questions
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs px-1.5 py-0.5 ${getAuthorBadgeColor(
                      category?.creator?.username + " [Admin]"
                    )} truncate max-w-20`}
                  >
                    {category?.creator?.username || "Unknown"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination - Compact */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center sm:text-left">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredCategories.length)} of{" "}
              {filteredCategories.length} results
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const page = currentPage <= 2 ? i + 1 : currentPage - 1 + i;
                if (page > totalPages) return null;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-7 w-7 p-0 text-xs"
                  >
                    {page}
                  </Button>
                );
              })}

              {totalPages > 3 && currentPage < totalPages - 1 && (
                <span className="text-gray-400 text-xs px-1">...</span>
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
