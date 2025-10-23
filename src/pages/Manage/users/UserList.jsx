// ===== LIBRARIES ===== //
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Edit,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusOverlay } from "@/components/StatusOverlay";

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const UserList = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Failed to fetch users.");
      }
      setError(data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalCount = filteredUsers.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = filteredUsers.slice(startIndex, endIndex);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "host":
        return "default";
      case "player":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className=" "></div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        </div>
      </div>

      {/* Search Card */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 h-10"
                />
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter by role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin Only</SelectItem>
                  <SelectItem value="host">Host Only</SelectItem>
                  <SelectItem value="player">Player Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <StatusOverlay message="Loading users..." type="loading" />
            )}
            {!loading && error && (
              <StatusOverlay
                message={error}
                type="error"
                onRetry={fetchUsers}
              />
            )}
            {!loading && !error && paginatedData.length === 0 && (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery || roleFilter !== "all"
                    ? "No users found matching your search criteria."
                    : "No users have been created yet."}
                </p>
                {(searchQuery || roleFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setRoleFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
            {!loading && !error && paginatedData.length > 0 && (
              <div className="divide-y divide-gray-200 dark:divide-accent">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 ease-in-out"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium uppercase">
                            {user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate min-w-0">
                              {user.username}
                              {auth?.user?.id === user.id && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                  (You)
                                </span>
                              )}
                            </div>
                            <Badge
                              variant={getRoleBadgeVariant(user.role)}
                              className="text-xs flex-shrink-0"
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email || "No email provided."}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/manage/users/${user.id}/edit`)
                          }
                          className="h-8 px-3 transition-all duration-200 hover:scale-105"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-700 dark:text-gray-300 text-center sm:text-left">
              Showing {startIndex + 1} to {Math.min(endIndex, totalCount)} of{" "}
              {totalCount} results
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

export default UserList;
