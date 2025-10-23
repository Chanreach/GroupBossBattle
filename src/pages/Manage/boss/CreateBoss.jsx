// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  ChevronDown,
  ArrowLeft,
  Sword,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const CreateBoss = () => {
  const navigate = useNavigate();
  const [bossData, setBossData] = useState({
    name: "",
    image: null,
    description: "",
    cooldownDuration: "",
    numberOfTeams: "",
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        const data = error.response?.data;
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach((errMsg) => toast.error(errMsg));
        } else {
          toast.error(data?.message || "Categories fetch failed.");
        }
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBossData((prevData) => ({
        ...prevData,
        image: file,
      }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = (category) => {
    if (!selectedCategories.find((cat) => cat.id === category.id)) {
      setSelectedCategories((prev) => [...prev, category]);
    }
    setIsDropdownOpen(false);
  };

  const handleCategoryRemove = (categoryToRemove) => {
    setSelectedCategories(
      selectedCategories.filter((cat) => cat.id !== categoryToRemove.id)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBossData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (selectedCategories.length > 0) {
        bossData.categoryIds = selectedCategories.map((cat) => cat.id);
      }
      const response = await apiClient.post("/bosses", bossData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/manage/bosses");
      setTimeout(() => {
        toast.success(response.data?.message || "Boss created successfully!");
      }, 100);
    } catch (error) {
      console.error("Error creating boss:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Boss creation failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/manage/bosses");
  };

  const unselectedCategories = (categories || []).filter(
    (cat) =>
      !(selectedCategories || []).find((selected) => selected.id === cat.id)
  );

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
                Create Boss
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new boss for battle events
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Boss Image <span className="text-red-500">*</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Boss preview"
                        className="w-full max-w-sm object-cover rounded-lg mx-auto aspect-square"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-medium">
                          Upload Boss Image
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPEG, JPG, GIF, WEBP up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boss Details Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sword className="h-5 w-5" />
                Boss Details
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Boss Name and Cooldown */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="boss-name">
                    Boss Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="boss-name"
                    name="name"
                    placeholder="Enter boss name"
                    value={bossData.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cooldown-duration">
                    Boss Cooldown (seconds)
                  </Label>
                  <Input
                    id="cooldown-duration"
                    name="cooldownDuration"
                    type="number"
                    placeholder="60"
                    min="1"
                    value={bossData.cooldownDuration}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label htmlFor="categories">
                  Category <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  {/* Category Display Bar with Tags and Dropdown Arrow */}
                  <div
                    className="flex px-2 w-full rounded-md border border-input bg-background dark:bg-input/30 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] py-2 flex-wrap gap-2 items-center cursor-pointer hover:border-muted-foreground/50"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {/* Selected Category Tags */}
                    {selectedCategories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-md"
                      >
                        {category.name}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryRemove(category);
                          }}
                        />
                      </span>
                    ))}

                    {/* Placeholder when no categories selected */}
                    {selectedCategories.length === 0 && (
                      <span className="text-muted-foreground text-sm">
                        Select categories
                      </span>
                    )}

                    {/* Dropdown Arrow */}
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && unselectedCategories.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden z-10">
                      {unselectedCategories.map((category) => (
                        <div
                          key={category.id}
                          className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b border-border last:border-b-0 text-popover-foreground"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Number of Teams */}
              <div className="space-y-2">
                <Label htmlFor="number-of-teams">
                  Number of Teams <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="number-of-teams"
                  name="numberOfTeams"
                  type="number"
                  placeholder="2"
                  min="2"
                  value={bossData.numberOfTeams}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Boss Description</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the boss, its abilities, difficulty level..."
                  value={bossData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-0 pb-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {isSubmitting ? "Creating..." : "Create Boss"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoss;
