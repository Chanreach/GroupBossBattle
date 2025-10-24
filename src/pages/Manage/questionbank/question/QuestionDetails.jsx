// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit3 } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const QuestionDetails = () => {
  const { questionId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user can edit this question
  const canEdit = () => {
    const user = auth?.user;
    return (
      user?.role === "superadmin" ||
      user?.role === "admin" ||
      question?.authorId === user?.id
    );
  };

  const fetchQuestion = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiClient.get(`/questions/${questionId}`);
      setQuestion(response.data);
    } catch (err) {
      console.error("Error fetching question:", err);
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch question");
      }
      setError(data?.message || "Failed to fetch question.");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, fetchQuestion]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleEditClick = () => {
    navigate(`/manage/questionbank/questions/${questionId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <StatusOverlay message="Loading question details..." type="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <StatusOverlay message={error} type="error" onRetry={fetchQuestion} />
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
              onClick={handleBackClick}
              className="p-2 hover:bg-accent/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                View Question
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question details and answers
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg border-0 bg-card backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Category and Time Limit */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </Label>
                <div className="mt-1">
                  <Badge variant="outline" className={`text-xs px-1.5 py-0.5`}>
                    {question.category?.name || "Uncategorized"}
                  </Badge>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Limit
                </Label>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {question.timeLimit || 20}s
                </div>
              </div>
            </div>

            {/* Question Author */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question Author
              </Label>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {question.author?.username || "Unknown"}
              </div>
            </div>

            {/* Question */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question
              </Label>
              <div className="text-lg font-bold mt-2 p-4 bg-muted rounded-lg border whitespace-pre-wrap break-words">
                {question.text}
              </div>
            </div>

            {/* Answer Options */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Answer Options
              </Label>
              <div className="space-y-2">
                {question.answerChoices
                  ?.sort((a, b) => a.text.localeCompare(b.text))
                  .map((answer) => (
                    <div
                      key={answer.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        answer.isCorrect
                          ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                          : "border bg-card"
                      }`}
                    >
                      {/* Correct Answer Indicator */}
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          answer.isCorrect
                            ? "bg-green-500"
                            : "border-2 border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {answer.isCorrect && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>

                      {/* Answer Text */}
                      <div
                        className={`text-sm flex-1 ${
                          answer.isCorrect
                            ? "text-green-800 dark:text-green-200 font-medium"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {/* A{index + 1}: {answer.text} */}
                        {answer.text}
                      </div>

                      {/* Correct Badge */}
                      {answer.isCorrect && (
                        <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs">
                          Correct
                        </Badge>
                      )}
                    </div>
                  )) || (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No answer choices available
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="w-full sm:w-auto sm:min-w-[120px]"
          >
            Back
          </Button>
          {canEdit() && (
            <Button
              onClick={handleEditClick}
              className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
              disabled={loading}
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;
