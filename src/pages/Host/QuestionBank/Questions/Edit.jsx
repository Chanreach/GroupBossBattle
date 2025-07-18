import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/api';
import { useAuth } from '@/context/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const EditQuestion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('id');
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [question, setQuestion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState([]);
  const [correctAnswerId, setCorrectAnswerId] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if user can edit this question
  const canEdit = () => {
    return user?.role === 'admin' || question?.authorId === user?.id;
  };

  // Fetch categories and question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const categoriesResponse = await apiClient.get('/categories');
        // Extract categories from response object
        const categoriesData = categoriesResponse.data?.categories || categoriesResponse.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // Fetch question
        const questionResponse = await apiClient.get(`/questions/${questionId}`);
        const questionData = questionResponse.data;
        setQuestion(questionData);
        
        // Populate form fields
        setSelectedCategory(questionData.categoryId?.toString() || '');
        setTimeLimit(questionData.timeLimit?.toString() || '30');
        setQuestionText(questionData.questionText || ''); // Fixed: use questionText not text
        
        // Populate answers with 8 slots
        const answerChoices = questionData.answerChoices || [];
        const formattedAnswers = Array.from({ length: 8 }, (_, index) => {
          const choice = answerChoices[index];
          return {
            id: index + 1,
            text: choice?.choiceText || '', // Fixed: use choiceText not text
            isCorrect: choice?.isCorrect || false
          };
        });
        setAnswers(formattedAnswers);
        
        // Set correct answer ID
        const correctChoice = answerChoices.find(choice => choice.isCorrect);
        if (correctChoice) {
          const correctIndex = answerChoices.indexOf(correctChoice);
          setCorrectAnswerId(correctIndex + 1);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to fetch question data');
        navigate(-1); // Go back to previous page instead of forcing categories view
      } finally {
        setIsLoading(false);
      }
    };

    if (questionId) {
      fetchData();
    }
  }, [questionId, navigate]);
  const handleAnswerChange = (answerId, newText) => {
    if (!canEdit()) return;
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId ? { ...answer, text: newText } : answer
    ));
  };

  const handleCorrectAnswerChange = (answerId) => {
    if (!canEdit()) return;
    setCorrectAnswerId(parseInt(answerId));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedCategory) {
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

  const handleSave = async () => {
    if (!validateForm() || !canEdit()) return;
    
    setIsSaving(true);
    try {
      const answerChoices = answers.map((answer, index) => ({
        choiceText: answer.text.trim(), // Fixed: use choiceText not text
        isCorrect: answer.id === correctAnswerId
      }));

      const questionData = {
        categoryId: selectedCategory, // Fixed: don't parseInt UUID
        questionText: questionText.trim(), // Fixed: use questionText not text
        timeLimit: parseInt(timeLimit),
        answerChoices
      };

      await apiClient.put(`/questions/${questionId}`, questionData);
      toast.success('Question updated successfully!');
      navigate(`/host/questionbank/questions/view?id=${questionId}`);
    } catch (error) {
      console.error('Error updating question:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update question';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit()) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/questions/${questionId}`);
      toast.success('Question deleted successfully');
      setShowDeleteDialog(false);
      // Navigate back to previous page or default to categories view
      navigate(-1);
    } catch (error) {
      console.error('Error deleting question:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete question';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to the previous page
    navigate(-1);
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
          <p className="text-muted-foreground">Question not found</p>
        </div>
      </div>
    );
  }

  if (!canEdit()) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">You don't have permission to edit this question</p>
          <Button onClick={handleCancel} className="mt-4">Go Back</Button>
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
              onClick={handleCancel}
              className="p-2 hover:bg-white/50 dark:hover:bg-background/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>            <h1 className="text-2xl font-bold">Edit Question</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update question details</p>
            </div>
          </div>
          
          {/* Trash Icon - Top Right */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            disabled={isLoading}
          >
            <Trash2 className="h-5 w-5" />
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className={`${errors.category ? 'border-red-500' : ''}`}>
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
                {errors.category && (
                  <p className="text-red-500 dark:text-red-400 text-xs">{errors.category}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time-limit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Limit (seconds)
                </Label>
                <Input
                  id="time-limit"
                  type="number"
                  min="5"
                  max="300"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="30"
                  className={`${errors.timeLimit ? 'border-red-500' : ''} dark:bg-background dark:border-gray-600 dark:text-white`}
                />
                {errors.timeLimit && (
                  <p className="text-red-500 dark:text-red-400 text-xs">{errors.timeLimit}</p>
                )}
              </div>
            </div>

            {/* Question Author (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question Author
              </Label>
              <div className="p-3 bg-muted rounded-md border">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {question?.creator?.username || 'Unknown'} [{question?.creator?.role || 'User'}]
                  {question?.authorId === user?.id ? ' (You)' : ''}
                </p>
              </div>
            </div>

            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question here"
                className={`${errors.question ? 'border-red-500' : ''} dark:bg-background dark:border-gray-600 dark:text-white`}
              />
              {errors.question && (
                <p className="text-red-500 dark:text-red-400 text-xs">{errors.question}</p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Answer Options <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              {errors.answers && (
                <p className="text-red-500 dark:text-red-400 text-xs">{errors.answers}</p>
              )}
              
              <div className="border rounded-lg p-4 bg-muted space-y-3">
                {answers.map((answer, index) => (
                  <div key={answer.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        value={answer.text}
                        onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                        placeholder={`A${index + 1}: Enter answer option`}
                        className="text-sm bg-white dark:bg-background dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <input
                      type="radio"
                      name="correct-answer"
                      value={answer.id}
                      checked={correctAnswerId === answer.id}
                      onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-background border-gray-300 focus:ring-blue-500"
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
                onClick={handleSave}
                className="flex items-center gap-2 flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
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
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete this question?
                <br /><br />
                <span className="font-semibold text-gray-200">"{questionText}"</span>
                <br /><br />
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
                  'Delete Question'
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