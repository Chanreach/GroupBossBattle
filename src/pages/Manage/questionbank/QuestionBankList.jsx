// ===== LIBRARIES ===== //
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, User } from "lucide-react";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ===== CHILD LIST COMPONENTS ===== //
import CategoryList from "./category/CategoryList";
import QuestionList from "./question/QuestionList";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const QuestionBankList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [currentList, setCurrentList] = useState(
    location.pathname.includes("/questions") ? "question" : "category"
  );
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("anyone");

  useEffect(() => {
    if (location.pathname.includes("/questions")) {
      setCurrentList("question");
    } else {
      setCurrentList("category");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes("/questions")) {
      const categoryParam = searchParams.get("category") || "";
      if (categoryParam) {
        const matchedCategory = categories.find(
          (cat) => cat.name.toLowerCase() === categoryParam.toLowerCase()
        );
        if (matchedCategory) {
          setCategoryFilter(matchedCategory.name);
        } else {
          setCategoryFilter("");
        }
      } else {
        setCategoryFilter("");
      }
    }
  }, [location.pathname, searchParams, categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleListChange = (listType) => {
    if (listType !== "category" && listType !== "question") return;

    setCurrentList(listType);
    setSearchQuery("");
    setCategoryFilter("");
    setOwnershipFilter("anyone");
    navigate(
      listType === "category"
        ? "/manage/questionbank/categories"
        : "/manage/questionbank/questions"
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryFilterChange = (category) => {
    setCategoryFilter(category);
  };

  const handleOwnershipFilterChange = (ownership) => {
    setOwnershipFilter(ownership);
  };

  const handleAddNew = () => {
    if (currentList === "category") {
      navigate("/manage/questionbank/categories/create");
    } else {
      const createUrl =
        categoryFilter && categoryFilter !== "all"
          ? `/manage/questionbank/questions/create?category=${encodeURIComponent(
              categoryFilter
            )}`
          : "/manage/questionbank/questions/create";
      navigate(createUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className=" "></div>
          <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add {currentList === "category" ? "Category" : "Question"}
        </Button>
      </div>

      {/* Controls */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* List Select */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label className="text-sm font-medium whitespace-nowrap">
                View:
              </Label>
              <Select value={currentList} onValueChange={handleListChange}>
                <SelectTrigger className="">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Categories</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={
                  currentList === "category"
                    ? "Search categories..."
                    : "Search questions..."
                }
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 h-10"
              />
            </div>

            {/* Category Filter (Only for Question view) */}
            {currentList === "question" && (
              <div className="flex items-center gap-3">
                <Select
                  value={categoryFilter === "" ? "all" : categoryFilter}
                  onValueChange={handleCategoryFilterChange}
                >
                  <SelectTrigger className="sm:w-auto w-full">
                    <Filter className="h-4 w-4 text-muted-foreground mr-2 capitalize" />
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
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                value={ownershipFilter}
                onValueChange={handleOwnershipFilterChange}
              >
                <SelectTrigger className="">
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

      {/* List Content */}
      {currentList === "category" ? (
        <CategoryList search={searchQuery} ownershipFilter={ownershipFilter} />
      ) : (
        <QuestionList
          search={searchQuery}
          categoryFilter={categoryFilter}
          ownershipFilter={ownershipFilter}
        />
      )}
    </div>
  );
};

export default QuestionBankList;
