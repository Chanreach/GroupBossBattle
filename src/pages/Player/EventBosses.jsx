import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Zap, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getBossImageUrl } from '@/utils/imageUtils';
import { apiClient } from '@/api';
import { useAuth } from '@/context/useAuth';
import { toast } from 'sonner';

const EventBosses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedBosses, setAssignedBosses] = useState([]);

  useEffect(() => {
    // Add some debugging
    console.log('EventBosses: useEffect triggered', { eventId, user });
    
    if (eventId) {
      fetchEventDetails();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    // Don't make API calls if no eventId
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch event details
      const eventResponse = await apiClient.get(`/api/events/${eventId}`);
      if (eventResponse.data && eventResponse.data.success) {
        setEvent(eventResponse.data.data);
      }

      // Fetch assigned bosses for the event
      const bossesResponse = await apiClient.get(`/api/events/${eventId}/bosses`);
      if (bossesResponse.data && bossesResponse.data.success) {
        setAssignedBosses(bossesResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      // More specific error handling
      if (error.response?.status === 404) {
        toast.error('Event not found');
      } else if (error.response?.status === 403) {
        toast.error('Access denied to this event');
      } else {
        toast.error('Failed to load event details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBattleBoss = (boss) => {
    if (boss.status !== 'active') {
      toast.error('This boss is currently on cooldown');
      return;
    }
    
    // Navigate to boss preview or battle page
    navigate(`/boss-preview?bossId=${boss.id}&eventId=${eventId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">Loading event details...</div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No Event Selected</h2>
          <p className="text-muted-foreground mb-4">Please select an event to view its bosses.</p>
          <Button onClick={handleBack}>Go Back to Home</Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested event could not be found.</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Event Bosses</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleViewLeaderboard}
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Button>
            </div>
          </div>

          {/* Event Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">{event.name}</h2>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1 mb-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      <strong>Start:</strong> {event.startTimeFormatted?.formatted || 'N/A'}
                    </span>
                    <span>
                      <strong>End:</strong> {event.endTimeFormatted?.formatted || 'N/A'}
                    </span>
                    <span>
                      <strong>Bosses:</strong> {assignedBosses.length} available
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {event.status || 'Active'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Bosses Grid */}
          {assignedBosses.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No Bosses Available</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      There are currently no bosses assigned to this event. Check back later!
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Available Bosses</Label>
                <div className="text-sm text-muted-foreground">
                  {assignedBosses.filter(boss => boss.status === 'active').length} Active • {assignedBosses.filter(boss => boss.status === 'cooldown').length} On Cooldown
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedBosses.map((boss) => (
                  <Card key={boss.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      {/* Boss Image */}
                      <div className="relative bg-gradient-to-br from-primary/20 to-primary/5">
                        <img
                          src={boss.image ? getBossImageUrl(boss.image) : '/src/assets/Placeholder/Falcon.png'}
                          alt={boss.name}
                          className="w-full h-[270px] object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          {boss.status === 'active' ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Zap className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Cooldown
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Boss Details */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-base mb-1">{boss.name}</h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>{boss.cooldownDuration || 60}s cooldown</span>
                          </div>
                          {boss.description && (
                            <p className="text-xs text-muted-foreground mb-2">{boss.description}</p>
                          )}
                        </div>

                        {/* Boss Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Teams Allowed:</span>
                            <span className="text-sm font-semibold">{boss.numberOfTeams || 2}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className="text-sm font-mono">
                              {boss.status === 'active' ? 'Ready to Battle' : 'On Cooldown'}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center justify-center pt-2 border-t">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={boss.status === 'active' ? 'default' : 'secondary'}
                                size="sm" 
                                className="w-full flex items-center gap-2"
                                onClick={() => handleBattleBoss(boss)}
                                disabled={boss.status !== 'active'}
                              >
                                <Swords className="w-4 h-4" />
                                {boss.status === 'active' ? 'Battle Boss' : 'On Cooldown'}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {boss.status === 'active' ? 'Start battle with this boss' : 'Boss is currently on cooldown'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EventBosses;
