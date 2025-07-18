import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
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
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="p-2 hover:bg-accent/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Question</h1>
            <p className="text-sm text-muted-foreground">Add a new question to the bank</p>
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
                  {isCategoryLocked && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      Auto-selected from {categoryFromUrl}
                    </span>
                  )}
                </Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={isCategoryLocked ? undefined : setSelectedCategory}
                  disabled={isCategoryLocked}
                >
                  <SelectTrigger className={`${errors.category ? 'border-red-500' : ''} ${isCategoryLocked ? 'bg-muted cursor-not-allowed opacity-75' : ''}`}>
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
              <div className="p-3 bg-muted rounded-md border">
                <p className="text-sm text-muted-foreground">
                  {user?.username || 'Unknown'} [{user?.role || 'User'}] (You)
                </p>
              </div>
            </div>

            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question here"
                className={`${errors.question ? 'border-red-500' : ''}`}
              />
              {errors.question && (
                <p className="text-red-500 text-xs">{errors.question}</p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Answer Options <span className="text-red-500">*</span>
              </Label>
              {errors.answers && (
                <p className="text-red-500 text-xs">{errors.answers}</p>
              )}
              
              <div className="border rounded-lg p-4 bg-muted space-y-3">
                {answers.map((answer, index) => (
                  <div key={answer.id} className="flex items-center gap-3">
                    <div className="flex-1">                        <Input
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                          placeholder={`A${index + 1}: Enter answer option`}
                          className="text-sm bg-card"
                        />
                    </div>
                    <input
                      type="radio"
                      name="correct-answer"
                      value={answer.id}
                      checked={correctAnswerId === answer.id}
                      onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                      className="w-4 h-4 text-primary bg-background border focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select the radio button next to the correct answer
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="flex items-center gap-2 flex-1"
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
        </Card>
      </div>
    </div>
  );
};

export default CreateQuestion;