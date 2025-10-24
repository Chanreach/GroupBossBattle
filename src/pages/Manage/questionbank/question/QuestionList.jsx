// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, List, Edit3 } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const QuestionList = ({ search, categoryFilter, ownershipFilter }) => {
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/questions");
      let questions = response.data;
      const categoryParam = searchParams.get("category");
      if (categoryParam) {
        questions = questions.filter(
          (question) =>
            question.category.name.toLowerCase() === categoryParam.toLowerCase()
        );
      }
      setQuestions(questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to fetch questions.");
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch questions.");
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleQuestionClick = (questionId) => {
    navigate(`/manage/questionbank/questions/${questionId}`);
  };

  const handleEdit = (questionId) => {
    navigate(`/manage/questionbank/questions/${questionId}/edit`);
  };

  // Get author name from question
  const getQuestionAuthor = (question) => {
    const author = question.author;
    if (author?.username) {
      return `${author.username} [${
        author?.role === "superadmin"
          ? "Superadmin"
          : author?.role === "admin"
          ? "Admin"
          : "Host"
      }]`;
    }
    return "Unknown";
  };

  // Check if user can edit question
  const canEditQuestion = (question) => {
    if (auth.user?.role === "superadmin" || auth.user?.role === "admin") {
      return true;
    }

    return question.creator?.id === auth.user?.id;
  };

  // Filter questions based on search query, category filter, and ownership
  const filteredQuestions = (questions || []).filter((question) => {
    const matchesSearch = question.text
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "" ||
      categoryFilter === "all" ||
      question.category?.name === categoryFilter;
    const matchesOwnership =
      ownershipFilter === "anyone" ||
      (ownershipFilter === "me" && question.author?.id === auth.user?.id);
    return matchesSearch && matchesCategory && matchesOwnership;
  });

  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = filteredQuestions.slice(startIndex, endIndex);

  const getAuthorBadgeColor = () => {
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700";
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <StatusOverlay message="Loading questions..." type="loading" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <StatusOverlay
            message={error}
            type="error"
            onRetry={fetchQuestions}
          />
        </CardContent>
      </Card>
    );
  }

  if (paginatedData.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
            <List className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
            No Questions Found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {search || categoryFilter || ownershipFilter === "me"
              ? `Try adjusting your search${
                  ownershipFilter === "me" ? ", ownership," : ""
                } or filter criteria.`
              : "No questions have been created yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Content Area */}
      <div className="content-area">
        <div className="space-y-3 mb-6">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="border-0 shadow-sm py-0  gap-0 overflow-hidden">
              <CardHeader className="border-b bg-muted/50 px-4 pt-6 flex items-center">
                <div className="grid grid-cols-12 text-sm font-semibold text-gray-800 dark:text-gray-200 items-center w-full">
                  <div className="col-span-7">Question</div>
                  <div className="col-span-2 text-center">Category</div>
                  <div className="col-span-2 text-center">Author</div>
                  <div className="col-span-1 text-center">Edit</div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((question) => (
                    <div
                      key={question.id}
                      className="grid grid-cols-12 gap-3 p-3 border-accent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer items-center"
                      onClick={() => handleQuestionClick(question.id)}
                    >
                      <div className="col-span-7 flex items-center">
                        <p
                          className="font-medium text-sm text-gray-900 dark:text-white truncate"
                          title={question.text}
                        >
                          {question.text}
                        </p>
                      </div>

                      <div className="col-span-2 flex justify-center items-center">
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {question.category?.name || "No Category"}
                        </Badge>
                      </div>

                      <div className="col-span-2 flex justify-center items-center">
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0.5 ${getAuthorBadgeColor()}`}
                        >
                          {getQuestionAuthor(question).split(" ")[0]}
                        </Badge>
                      </div>

                      <div className="col-span-1 flex justify-center items-center">
                        {canEditQuestion(question) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(question.id);
                            }}
                            className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        )}
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
              <Card
                key={question.id}
                className="border-0 shadow-sm"
                onClick={() => handleQuestionClick(question.id)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white leading-tight mb-1.5">
                        {question.text}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {question.category?.name || "No Category"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0.5 ${getAuthorBadgeColor()}`}
                        >
                          {getQuestionAuthor(question).split(" ")[0]}
                        </Badge>
                      </div>
                    </div>
                    {canEditQuestion(question) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(question.id);
                        }}
                        className="h-7 w-7 p-0 flex-shrink-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Pagination - Compact */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center sm:text-left">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredQuestions.length)} of{" "}
              {filteredQuestions.length} results
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

export default QuestionList;
