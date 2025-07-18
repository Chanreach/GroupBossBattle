import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/api';
import { useAuth } from '@/context/useAuth';
import { toast } from 'sonner';

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryFromUrl, setCategoryFromUrl] = useState('');
  const [isCategoryLocked, setIsCategoryLocked] = useState(false);
  const [timeLimit, setTimeLimit] = useState('30');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState([
    { id: 1, text: '', isCorrect: false },
    { id: 2, text: '', isCorrect: false },
    { id: 3, text: '', isCorrect: false },
    { id: 4, text: '', isCorrect: false },
    { id: 5, text: '', isCorrect: false },
    { id: 6, text: '', isCorrect: false },
    { id: 7, text: '', isCorrect: false },
    { id: 8, text: '', isCorrect: false }
  ]);
  const [correctAnswerId, setCorrectAnswerId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        // Extract categories from response object
        const categoriesData = response.data?.categories || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // Check for category parameter in URL
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setCategoryFromUrl(categoryParam);
          setIsCategoryLocked(true);
          
          // Find and set the category ID based on the category name
          const matchingCategory = categoriesData.find(cat => cat.name === categoryParam);
          if (matchingCategory) {
            setSelectedCategory(matchingCategory.id.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, [searchParams]);

  const handleAnswerChange = (answerId, newText) => {
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId ? { ...answer, text: newText } : answer
    ));
  };

  const handleCorrectAnswerChange = (answerId) => {
    setCorrectAnswerId(parseInt(answerId));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCategory || selectedCategory === '') {
      newErrors.category = 'Category is required';
    }
    
    if (!timeLimit || timeLimit < 5 || timeLimit > 300) {
      newErrors.timeLimit = 'Time limit must be between 5 and 300 seconds';
    }
    
    if (!questionText.trim()) {
      newErrors.question = 'Question text is required';
    }
    
    const hasEmptyAnswers = answers.some(answer => !answer.text.trim());
    if (hasEmptyAnswers) {
      newErrors.answers = 'All answer options must be filled';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const answerChoices = answers.map((answer, index) => ({
        choiceText: answer.text.trim(),
        isCorrect: answer.id === correctAnswerId
      }));

      const questionData = {
        categoryId: selectedCategory,
        questionText: questionText.trim(),
        timeLimit: parseInt(timeLimit),
        answerChoices
      };

      await apiClient.post('/questions', questionData);
      toast.success('Question created successfully!');
      
      // Navigate back to the filtered questions view if we came from a category filter
      const returnUrl = categoryFromUrl 
        ? `/host/questionbank/questions?category=${encodeURIComponent(categoryFromUrl)}`
        : '/host/questionbank/categories/view';
      navigate(returnUrl);
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create question';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to the filtered questions view if we came from a category filter
    const returnUrl = categoryFromUrl 
      ? `/host/questionbank/questions?category=${encodeURIComponent(categoryFromUrl)}`
      : '/host/questionbank/categories/view';
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
                  Category <span className="text-red-500 dark:text-red-400">*</span>
                  {/* {isCategoryLocked && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      Auto-selected from {categoryFromUrl}
                    </span>
                  )} */}
                </Label>
                <Select 
                  className="!h-10"
                  value={selectedCategory} 
                  onValueChange={isCategoryLocked ? undefined : setSelectedCategory}
                  disabled={isCategoryLocked}
                >
                  <SelectTrigger className={`${errors.category ? 'border-red-500' : ''} ${isCategoryLocked ? 'bg-muted h-[36px] cursor-not-allowed opacity-75' : 'bg:white dark:bg-muted h-[36px]'}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCategoryLocked && (
                  <p className="text-xs text-gray-500">
                    Category is automatically set because you're creating a question from the {categoryFromUrl} category filter.
                  </p>
                )}
                {errors.category && (
                  <p className="text-red-500 dark:text-red-400 text-xs">{errors.category}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time-limit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Limit (seconds) <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="time-limit"
                  type="number"
                  min="5"
                  max="300"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="30"
                  className={`${errors.timeLimit ? 'border-red-500' : ''}`}
                />
                {errors.timeLimit && (
                  <p className="text-red-500 dark:text-red-400 text-xs">{errors.timeLimit}</p>
                )}
              </div>
            </div>

            {/* Question Author (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Question Author
              </Label>
              <Input
                value={`${user?.username || 'Unknown'} [${user?.role || 'User'}] (You)`}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question <span className="text-red-500">*</span>
              </Label>
              <div className={`text-lg font-bold mt-2 p-4 bg-muted rounded-lg border ${errors.question ? 'border-red-500' : ''}`}>
                <textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question here"
                  className="!bg-transparent !border-0 !ring-0 !outline-none !shadow-none focus:!ring-0 focus:!border-0 focus:!outline-none p-0 !text-lg !font-bold dark:text-white w-full resize-none overflow-hidden"
                  rows="1"
                  style={{ minHeight: '1.75rem' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
              {errors.question && (
                <p className="text-red-500 text-xs">{errors.question}</p>
              )}
            </div>

            {/* Answer Options */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Answer Options <span className="text-red-500">*</span>
              </Label>
              {errors.answers && (
                <p className="text-red-500 text-xs mb-3">{errors.answers}</p>
              )}
              <div className="space-y-2">
                {answers.map((answer, index) => (
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
                        onChange={(e) => handleCorrectAnswerChange(e.target.value)}
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
                        onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isLoading ? 'Creating...' : 'Create Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;