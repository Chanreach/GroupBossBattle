// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
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

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const CreateQuestion = () => {
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryFromUrl, setCategoryFromUrl] = useState("");
  const [isCategoryLocked, setIsCategoryLocked] = useState(false);
  const [questionData, setQuestionData] = useState({
    text: "",
    timeLimit: "",
  });
  const [answerChoices, setAnswerChoices] = useState([
    { id: "uuid1", text: "", isCorrect: false, order: 1 },
    { id: "uuid2", text: "", isCorrect: false, order: 2 },
    { id: "uuid3", text: "", isCorrect: false, order: 3 },
    { id: "uuid4", text: "", isCorrect: false, order: 4 },
    { id: "uuid5", text: "", isCorrect: false, order: 5 },
    { id: "uuid6", text: "", isCorrect: false, order: 6 },
    { id: "uuid7", text: "", isCorrect: false, order: 7 },
    { id: "uuid8", text: "", isCorrect: false, order: 8 },
  ]);
  const [correctAnswerId, setCorrectAnswerId] = useState("uuid1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        const categoriesData = response.data;
        setCategories(categoriesData);

        const categoryParam = searchParams.get("category");
        if (categoryParam) {
          setCategoryFromUrl(categoryParam);
          setIsCategoryLocked(true);

          const matchingCategory = categoriesData.find(
            (category) =>
              category.name.toLowerCase() === categoryParam.toLowerCase()
          );
          if (matchingCategory) {
            setSelectedCategoryId(matchingCategory.id.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        const data = error.response?.data;
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach((errMsg) => toast.error(errMsg));
        } else {
          toast.error(data?.message || "Failed to fetch categories.");
        }
      }
    };

    fetchCategories();
  }, [searchParams]);

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
        answer.id === answerId ? { ...answer, text: newText } : answer
      )
    );
  };

  const handleCorrectAnswerChange = (answerId) => {
    setCorrectAnswerId(answerId);
  };

  const isCreateDisabled =
    !selectedCategoryId ||
    !questionData.text.trim() ||
    answerChoices.some((ans) => !ans.text.trim());

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const choices = answerChoices.map((answer) => ({
        text: answer.text,
        isCorrect: answer.id === correctAnswerId,
        order: answer.order,
      }));

      const response = await apiClient.post("/questions", {
        ...questionData,
        categoryId: selectedCategoryId,
        answerChoices: choices,
      });

      const returnUrl = categoryFromUrl
        ? `/manage/questionbank/questions?category=${encodeURIComponent(
            categoryFromUrl
          )}`
        : "/manage/questionbank/questions";
      navigate(returnUrl);
      setTimeout(() => {
        toast.success(
          response.data.message || "Question created successfully!"
        );
      }, 100);
    } catch (error) {
      console.error("Error creating question:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to create question.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const returnUrl = categoryFromUrl
      ? `/manage/questionbank/questions?category=${encodeURIComponent(
          categoryFromUrl
        )}`
      : "/manage/questionbank/categories";
    navigate(returnUrl);
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
                Create Question
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new question to the bank
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-0 bg-card backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Category and Time Limit Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Select
                  className="!h-10"
                  value={selectedCategoryId}
                  onValueChange={
                    isCategoryLocked ? undefined : setSelectedCategoryId
                  }
                  disabled={isCategoryLocked}
                >
                  <SelectTrigger
                    className={`${
                      isCategoryLocked
                        ? "bg-muted h-[36px] cursor-not-allowed opacity-75"
                        : "bg:white dark:bg-muted h-[36px]"
                    }`}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCategoryLocked && (
                  <p className="text-xs text-gray-500">
                    Category is automatically set because you're creating a
                    question from the {categoryFromUrl} category filter.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="time-limit"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Time Limit (seconds){" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="time-limit"
                  name="timeLimit"
                  type="number"
                  min="5"
                  max="120"
                  value={questionData.timeLimit}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            {/* Question Author (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Question Author</Label>
              <Input
                value={`${auth.user?.username || "Unknown"} [${
                  auth.user?.role || "User"
                }] (You)`}
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
                Question <span className="text-red-500">*</span>
              </Label>
              <div className="text-lg font-bold mt-2 p-4 bg-muted rounded-lg border">
                <textarea
                  id="question"
                  name="text"
                  value={questionData.text}
                  onChange={handleChange}
                  placeholder="Enter your question here"
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
                Answer Options <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {answerChoices.map((answer) => (
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
                        value={answer.text}
                        onChange={(e) =>
                          handleAnswerChange(answer.id, e.target.value)
                        }
                        placeholder={`Enter answer option`}
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            disabled={isSubmitting || isCreateDisabled}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isSubmitting ? "Creating..." : "Create Question"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
