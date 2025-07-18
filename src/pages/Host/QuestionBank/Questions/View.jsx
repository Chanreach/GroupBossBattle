import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/api";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";
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

const ViewQuestionDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get("id");
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user can edit this question
  const canEdit = () => {
    return user?.role === "admin" || question?.authorId === user?.id;
  };

  // Fetch question data
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/questions/${questionId}`);
        setQuestion(response.data);
      } catch (err) {
        console.error("Error fetching question:", err);
        toast.error("Failed to fetch question");
        navigate(-1); // Go back to previous page instead of forcing categories view
      } finally {
        setIsLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, navigate]);

  const handleDelete = async () => {
    if (!canEdit()) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/questions/${questionId}`);
      toast.success("Question deleted successfully");
      setShowDeleteDialog(false);
      navigate(-1); // Go back to previous page instead of forcing categories view
    } catch (error) {
      console.error("Error deleting question:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete question";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  const handleEditClick = () => {
    navigate(`/host/questionbank/questions/edit?id=${questionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Question not found</p>
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

          {/* Trash Icon - Top Right */}
          {canEdit() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              disabled={isLoading}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
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
                  <Badge
                    className={`bg-blue-500 text-white px-3 py-1 text-sm font-medium`}
                  >
                    {question.category?.name || "Uncategorized"}
                  </Badge>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Limit
                </Label>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {question.timeLimit || 30}s
                </div>
              </div>
            </div>

            {/* Question Author */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question Author
              </Label>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {question.creator?.username || "Unknown"}
              </div>
            </div>

            {/* Question */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question
              </Label>
              <div className="text-lg font-bold mt-2 p-4 bg-muted rounded-lg border">
                Q: {question.questionText}
              </div>
            </div>

            {/* Answer Options */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Answer Options
              </Label>
              <div className="space-y-2">
                {question.answerChoices?.map((answer, index) => (
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
                      A{index + 1}: {answer.choiceText}
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={handleBackClick}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              {canEdit() && (
                <Button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 flex-1"
                  disabled={isLoading}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Delete Question
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this question?
                <br />
                <br />
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{question.questionText}"
                </span>
                <br />
                <br />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  This action cannot be undone.
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
                  "Delete Question"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ViewQuestionDetail;
