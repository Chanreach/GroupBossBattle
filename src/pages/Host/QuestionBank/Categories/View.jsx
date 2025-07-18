import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
  Grid3X3,
  List,
  Edit3,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const QuestionBankView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine initial view mode based on current route
  const getInitialViewMode = useCallback(() => {
    if (location.pathname.includes("/questions/")) return "question";
    return "category";
  }, [location.pathname]);

  const [viewMode, setViewMode] = useState(getInitialViewMode());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("anyone"); // 'me' or 'anyone'
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  // Update view mode when route changes
  useEffect(() => {
    const newViewMode = getInitialViewMode();
    if (newViewMode !== viewMode) {
      setViewMode(newViewMode);
      setSearchQuery("");
      setCategoryFilter("");
      setOwnershipFilter("anyone"); // Reset ownership filter
      setCurrentPage(1);

      // Fetch questions when switching to question view
      if (newViewMode === "question") {
        fetchQuestions();
      }
    }
  }, [location.pathname, viewMode, getInitialViewMode]);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/categories");

      // Extract categories from response object
      const categoriesData = response.data?.categories || response.data;
      const categories = Array.isArray(categoriesData) ? categoriesData : [];

      // Fetch question counts for each category using the existing questions endpoint
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          try {
            const questionsResponse = await apiClient.get(
              `/questions/category/${category.id}`
            );
            const questions = Array.isArray(questionsResponse.data)
              ? questionsResponse.data
              : [];
            return {
              ...category,
              questionCount: questions.length,
            };
          } catch (error) {
            console.error(
              `Error fetching questions for category ${category.id}:`,
              error
            );
            return {
              ...category,
              questionCount: 0,
            };
          }
        })
      );

      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error("Error fetching categories:", err);
      console.log(
        "Token in localStorage:",
        localStorage.getItem("accessToken")
      );
      console.log("Response status:", err.response?.status);
      console.log("Response data:", err.response?.data);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch categories";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit category
  const canEditCategory = (category) => {
    return user?.role === "admin" || category?.creatorId === user?.id;
  };

  // Get author name from category
  const getCategoryAuthor = (category) => {
    // The API returns creator object with username
    if (category.creator?.username) {
      return category.creator.username;
    }
    return "Unknown";
  };

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const response = await apiClient.get("/questions");

      // Extract questions from response object
      const questionsData = response.data?.questions || response.data;
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      console.log(
        "Token in localStorage:",
        localStorage.getItem("accessToken")
      );
      console.log("Response status:", err.response?.status);
      console.log("Response data:", err.response?.data);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch questions";
      toast.error(errorMessage);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleViewModeChange = (value) => {
    if (value === "category") {
      navigate("/host/questionbank/categories/view");
    } else if (value === "question") {
      navigate("/host/questionbank/questions");
      // Fetch questions when switching to question view
      if (questions.length === 0) {
        fetchQuestions();
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handleOwnershipFilterChange = (value) => {
    setOwnershipFilter(value);
    setCurrentPage(1);
  };

  const handleAddNew = () => {
    if (viewMode === "category") {
      navigate("/host/questionbank/categories/create");
    } else {
      // Pass the current category filter to the create page if one is active
      const createUrl =
        categoryFilter && categoryFilter !== "all"
          ? `/host/questionbank/questions/create?category=${encodeURIComponent(
              categoryFilter
            )}`
          : "/host/questionbank/questions/create";
      navigate(createUrl);
    }
  };

  const handleEdit = (id) => {
    if (viewMode === "category") {
      navigate(`/host/questionbank/categories/edit/${id}`);
    } else {
      navigate(`/host/questionbank/questions/edit?id=${id}`);
    }
  };

  const handleCategoryClick = (categoryName) => {
    // Navigate to questions with the category filter
    navigate(`/host/questionbank/questions?category=${categoryName}`);
  };

  // Get author name from question
  const getQuestionAuthor = (question) => {
    if (question.creator?.username) {
      return `${question.creator.username} [${
        user?.role === "admin" ? "Admin" : "Host"
      }]`;
    }
    return "Unknown";
  };

  // Filter categories based on search query and ownership
  const filteredCategories = (categories || []).filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesOwnership =
      ownershipFilter === "anyone" ||
      (ownershipFilter === "me" && category.creatorId === user?.id);
    return matchesSearch && matchesOwnership;
  });

  // Filter questions based on search query, category filter, and ownership
  const filteredQuestions = (questions || []).filter((question) => {
    const matchesSearch = question.questionText
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "" ||
      categoryFilter === "all" ||
      question.category?.name === categoryFilter;
    const matchesOwnership =
      ownershipFilter === "anyone" ||
      (ownershipFilter === "me" && question.creatorId === user?.id);
    return matchesSearch && matchesCategory && matchesOwnership;
  });

  // Get current data based on view mode
  const currentData =
    viewMode === "category" ? filteredCategories : filteredQuestions;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentData.slice(startIndex, endIndex);

  const getAuthorBadgeColor = (author) => {
    if (author.includes("[Admin]"))
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700";
    if (author.includes("[Host]"))
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700";
    return "bg-muted text-muted-foreground border";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Question Bank
            </h1>
          </div>
          <Button
            onClick={handleAddNew}
            className="flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              Add {viewMode === "category" ? "Category" : "Question"}
            </span>
          </Button>
        </div>

        {/* Controls */}
        <Card className="mb-4 border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Mode Select */}
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium whitespace-nowrap">
                  View:
                </Label>
                <Select value={viewMode} onValueChange={handleViewModeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Categories</SelectItem>
                    <SelectItem value="question">Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={
                    viewMode === "category"
                      ? "Search categories..."
                      : "Search questions..."
                  }
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 h-10"
                />
              </div>

              {/* Category Filter (Only for Question view) */}
              {viewMode === "question" && (
                <div className="flex items-center gap-3">
                  <Select
                    value={categoryFilter === "" ? "all" : categoryFilter}
                    onValueChange={handleCategoryFilterChange}
                  >
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 text-muted-foreground mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Ownership Filter */}
              <div className="flex items-center gap-3">
                <Select
                  value={ownershipFilter}
                  onValueChange={handleOwnershipFilterChange}
                >
                  <SelectTrigger className="w-48">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anyone">Owned by anyone</SelectItem>
                    <SelectItem value="me">Owned by me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="content-area">
          {loading || (viewMode === "question" && questionsLoading) ? (
            // Loading State
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Loading {viewMode === "category" ? "categories" : "questions"}
                  ...
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            // Error State
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                <Button
                  onClick={() =>
                    viewMode === "category"
                      ? fetchCategories()
                      : fetchQuestions()
                  }
                  variant="outline"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : paginatedData.length === 0 ? (
            // Empty State
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                  {viewMode === "category" ? (
                    <Grid3X3 className="h-6 w-6 text-gray-400" />
                  ) : (
                    <List className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                  No {viewMode === "category" ? "Categories" : "Questions"}{" "}
                  Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {searchQuery || categoryFilter || ownershipFilter === "me"
                    ? `Try adjusting your search${
                        ownershipFilter === "me" ? ", ownership," : ""
                      } or filter criteria.`
                    : `No ${
                        viewMode === "category" ? "categories" : "questions"
                      } have been created yet.`}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "category" ? (
            // Categories Grid View - Compact Cards
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
                            handleEdit(category.id);
                          }}
                          className="h-7 w-7 p-0 flex-shrink-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {category.questionsCount || category.questionCount || 0}{" "}
                        questions
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0.5 ${getAuthorBadgeColor(
                          getCategoryAuthor(category) + " [Admin]"
                        )} truncate max-w-20`}
                      >
                        {getCategoryAuthor(category)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Questions List View - Compact Layout
            <div className="space-y-3 mb-6">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="border-b bg-muted/50 py-2 px-4">
                    <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="col-span-5">Question</div>
                      <div className="col-span-2 text-center">Category</div>
                      <div className="col-span-2 text-center">Time Limit</div>
                      <div className="col-span-2 text-center">Author</div>
                      <div className="col-span-1 text-center">Edit</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedData.map((question) => (
                        <div
                          key={question.id}
                          className="grid grid-cols-12 gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="col-span-5">
                            <p
                              className="font-medium text-sm text-gray-900 dark:text-white truncate"
                              title={question.questionText}
                            >
                              {question.questionText}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Modified:{" "}
                              {new Date(
                                question.updatedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5"
                            >
                              {question.category?.name || "No Category"}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
                            >
                              {question.timeLimit}s
                            </Badge>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0.5 ${getAuthorBadgeColor(
                                getQuestionAuthor(question)
                              )}`}
                            >
                              {getQuestionAuthor(question).split(" ")[0]}
                            </Badge>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(question.id)}
                              className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-2">
                {paginatedData.map((question) => (
                  <Card key={question.id} className="border-0 shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white leading-tight mb-1.5">
                            {question.questionText}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5"
                            >
                              {question.category?.name || "No Category"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
                            >
                              {question.timeLimit}s
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0.5 ${getAuthorBadgeColor(
                                getQuestionAuthor(question)
                              )}`}
                            >
                              {getQuestionAuthor(question).split(" ")[0]}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Modified:{" "}
                            {new Date(question.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(question.id)}
                          className="h-7 w-7 p-0 flex-shrink-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pagination - Compact */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-700 dark:text-gray-300 text-center sm:text-left">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, currentData.length)} of {currentData.length}{" "}
                results
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
    </div>
  );
};

export default QuestionBankView;
