import React from 'react';
import { Search, Edit, Users, ArrowLeft, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const View = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  // Fetch users from API
  const fetchUsers = async (search = '', page = 1, role = 'all', isSearching = false) => {
    try {
      if (isSearching) {
        setSearching(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const params = { 
        page, 
        limit: 10,
        ...(search && { search }),
        ...(role !== 'all' && { role })
      };
      
      const res = await apiClient.get('/users', { params });
      
      // Handle the response format from your user controller
      const { users: userData, totalCount, currentPage, totalPages } = res.data;
      
      // Filter out admin users and apply role filter
      let filteredUsers = Array.isArray(userData) ? userData.filter(user => user.role !== 'admin') : [];
      
      // Apply role filter if not 'all'
      if (role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }
      
      setUsers(filteredUsers);
      setTotalCount(filteredUsers.length);
      setCurrentPage(currentPage || 1);
      setTotalPages(Math.ceil(filteredUsers.length / 10) || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers(searchTerm, currentPage, roleFilter);
  }, [currentPage]);

  // Load users when role filter changes
  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(searchTerm, 1, roleFilter, true);
  }, [roleFilter]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
    };
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
    
    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Debounce search to avoid too many API calls
    window.searchTimeout = setTimeout(() => {
      fetchUsers(value, 1, roleFilter, true); // Pass true for isSearching
    }, 300); // Reduced from 500ms to 300ms for more responsive feel
  };

  // Function to highlight search terms with stable layout
  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span className="inline-block w-full">
        {parts.map((part, index) => 
          regex.test(part) ? (
            <span 
              key={index} 
              className="bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-100 px-0.5 py-0.5 rounded-sm font-medium transition-colors duration-200"
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'host': return 'default';
      case 'player': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">Loading users...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={() => filterUsers()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            User Management
          </h1>
        </div>

        {/* Search Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                {searching ? (
                  <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-white transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                        fetchUsers('', 1, roleFilter);
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Role Filter */}
              <div className="w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Filter by role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="host">Host Only</SelectItem>
                    <SelectItem value="player">Player Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            {(loading || searching) && users.length > 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm border-b bg-muted/50">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {searching ? 'Searching...' : 'Loading...'}
                </div>
              </div>
            )}

            {users.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 ease-in-out">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate min-w-0">
                              {user.username}
                            </div>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs flex-shrink-0">
                              {user.role}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/host/users/edit/${user.id}`)}
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
            ) : (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'No users found matching your search criteria.' 
                    : 'No users have been created yet.'}
                </p>
                {(searchTerm || roleFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setCurrentPage(1);
                      fetchUsers('', 1, 'all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium px-3 py-1 bg-muted rounded">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default View;