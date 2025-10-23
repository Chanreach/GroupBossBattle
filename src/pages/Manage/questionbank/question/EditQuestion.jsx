// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const EditQuestion = () => {
  const { questionId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [questionData, setQuestionData] = useState(null);
  const [originalQuestionData, setOriginalQuestionData] = useState(null);
  const [answerChoices, setAnswerChoices] = useState([]);
  const [correctAnswerId, setCorrectAnswerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch categories."
      );
    }
  }, []);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/questions/${questionId}`);
      const question = response.data;
      console.log("Fetched question data:", question);
      const user = auth?.user;
      const canEdit =
        user.role === "superadmin" ||
        user.role === "admin" ||
        question.authorId === user.id;
      if (!canEdit) {
        navigate(-1);
        setTimeout(() => {
          toast.error(
            "Forbidden: You do not have permission to edit this question."
          );
        }, 100);
        return;
      }

      setQuestionData(question);
      setOriginalQuestionData(question);
      setSelectedCategoryId(question.categoryId);
      setAnswerChoices(question.answerChoices);
      const correctAnswer = question.answerChoices.find((ans) => ans.isCorrect);
      setCorrectAnswerId(correctAnswer ? correctAnswer.id : "");
    } catch (error) {
      console.error("Error fetching question:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch question.");
      }
      setError(data?.message || "Failed to fetch question.");
    } finally {
      setLoading(false);
    }
  }, [questionId, auth, navigate]);

  useEffect(() => {
    fetchCategories();
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, fetchQuestion, fetchCategories]);

  // Auto-resize textarea when questionText changes
  useEffect(() => {
    const textarea = document.getElementById("question");
    if (textarea && questionData.questionText) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [questionData?.questionText]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAnswerChange = (answerId, newText) => {
    setAnswerChoices((prev) =>
      prev.map((answer) =>
        answer.id === answerId ? { ...answer, choiceText: newText } : answer
      )
    );
  };

  const handleCorrectAnswerChange = (answerId) => {
    setCorrectAnswerId(answerId);
  };

  const hasChanges =
    originalQuestionData &&
    (selectedCategoryId !== originalQuestionData.categoryId ||
      questionData.timeLimit !== originalQuestionData.timeLimit ||
      questionData.questionText !== originalQuestionData.questionText ||
      correctAnswerId !== originalQuestionData.correctAnswerId ||
      answerChoices.some(
        (answer, index) =>
          answer.choiceText !==
          (originalQuestionData.answerChoices[index]?.choiceText || "")
      ));

  const isSaveEnabled =
    hasChanges &&
    selectedCategoryId &&
    questionData.questionText.trim() &&
    answerChoices.every((answer) => answer.choiceText.trim());

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const choices = answerChoices.map((answer) => ({
        choiceText: answer.choiceText,
        isCorrect: answer.id === correctAnswerId,
      }));

      const response = await apiClient.put(`/questions/${questionId}`, {
        categoryId: selectedCategoryId,
        questionText: questionData.questionText,
        timeLimit: questionData.timeLimit,
        answerChoices: choices,
      });
      navigate(`/manage/questionbank/questions/${questionId}`);
      setTimeout(() => {
        toast.success(
          response.data.message || "Question updated successfully!"
        );
      }, 100);
    } catch (error) {
      console.error("Error updating question:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to update question.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/questions/${questionId}`);
      setShowDeleteDialog(false);
      navigate("/manage/questionbank/questions");
      setTimeout(() => {
        toast.success("Question deleted successfully!");
      }, 100);
    } catch (error) {
      console.error("Error deleting question:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to delete question.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
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
              onClick={handleCancel}
              className="p-2 hover:bg-accent/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Question
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update question details
              </p>
            </div>
          </div>

          {/* Delete Button - Top Right */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-0 bg-card backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Category and Time Limit Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger className="g:white dark:bg-muted h-[36px]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="time-limit"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Time Limit (seconds)
                </Label>
                <Input
                  id="time-limit"
                  name="timeLimit"
                  type="number"
                  min="5"
                  max="120"
                  value={questionData.timeLimit}
                  onChange={handleChange}
                  placeholder="30"
                  className="w-full"
                />
              </div>
            </div>

            {/* Question Author (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question Author
              </Label>
              <Input
                value={`${questionData?.author?.username || "Unknown"} [${
                  questionData?.creator?.role || "User"
                }]${questionData?.authorId === auth.user?.id ? " (You)" : ""}`}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Question Input */}
            <div className="space-y-2">
              <Label
                htmlFor="question"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Question{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <div className="text-lg font-bold mt-2 p-4 bg-muted rounded-lg border">
                <textarea
                  id="question"
                  name="questionText"
                  value={questionData.questionText}
                  onChange={handleChange}
                  placeholder="Q: Enter your question here"
                  className="!bg-transparent !border-0 !ring-0 !outline-none !shadow-none focus:!ring-0 focus:!border-0 focus:!outline-none p-0 !text-lg !font-bold dark:text-white w-full resize-none overflow-hidden"
                  rows="1"
                  style={{ minHeight: "1.75rem" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
              </div>
            </div>

            {/* Answer Options */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Answer Options{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <div className="space-y-2">
                {answerChoices.map((answer, index) => (
                  <div
                    key={answer.id}
                    className={`flex items-center gap-3 px-3 py-1 border rounded-lg transition-colors ${
                      correctAnswerId === answer.id
                        ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                        : "border bg-card"
                    }`}
                  >
                    {/* Correct Answer Radio Button */}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        correctAnswerId === answer.id
                          ? "bg-green-500"
                          : "border-2 border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="correct-answer"
                        value={answer.id}
                        checked={correctAnswerId === answer.id}
                        onChange={(e) =>
                          handleCorrectAnswerChange(e.target.value)
                        }
                        className="absolute opacity-0 w-4 h-4 cursor-pointer"
                      />
                      {correctAnswerId === answer.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>

                    {/* Answer Input */}
                    <div className="flex-1">
                      <Input
                        value={answer.choiceText}
                        onChange={(e) =>
                          handleAnswerChange(answer.id, e.target.value)
                        }
                        placeholder={`A${index + 1}: Enter answer option`}
                        className="!bg-transparent !border-0 !ring-0 !outline-none !shadow-none focus:!ring-0 focus:!border-0 focus:!outline-none p-0 text-sm dark:text-white"
                      />
                    </div>

                    {/* Correct Badge */}
                    {correctAnswerId === answer.id && (
                      <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs">
                        Correct
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Click the circle next to an answer to mark it as correct
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto sm:min-w-[120px]"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            disabled={isSaving || !isSaveEnabled}
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
                Delete Question
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete this question?
                <br />
                <br />
                <span className="font-semibold text-gray-200">
                  "{questionData?.questionText}"
                </span>
                <br />
                <br />
                <span className="text-red-00 font-medium">
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

export default EditQuestion;
