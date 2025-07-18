import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sword, Plus, Check, Zap, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getBossImageUrl } from '@/utils/imageUtils';
import { apiClient } from '@/api';
import { useAuth } from '@/context/useAuth';
import { toast } from 'sonner';

const BossTemplate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [selectedBosses, setSelectedBosses] = useState([]);
  const [availableBosses, setAvailableBosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchAvailableBosses();
  }, []);

  const fetchAvailableBosses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/bosses');
      // Filter to show only user's own bosses for hosts, all bosses for admins
      const bosses = user.role === 'admin' 
        ? response.data 
        : response.data.filter(boss => boss.creatorId === user.id);
      
      setAvailableBosses(bosses);
    } catch (error) {
      console.error('Error fetching bosses:', error);
      toast.error('Failed to fetch available bosses');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/host/events/assign_boss?eventId=${eventId}`);
  };

  const handleBossSelect = (bossId) => {
    if (selectedBosses.includes(bossId)) {
      setSelectedBosses(selectedBosses.filter(id => id !== bossId));
    } else {
      setSelectedBosses([...selectedBosses, bossId]);
    }
  };

  const handleAssignSelected = async () => {
    if (selectedBosses.length === 0) {
      toast.error('Please select at least one boss to assign');
      return;
    }

    try {
      setAssigning(true);
      await apiClient.post(`/events/${eventId}/bosses`, {
        bossIds: selectedBosses
      });
      toast.success(`Successfully assigned ${selectedBosses.length} boss(es) to the event`);
      navigate(`/host/events/assign_boss?eventId=${eventId}`);
    } catch (error) {
      console.error('Error assigning bosses:', error);
      toast.error(error.response?.data?.message || 'Failed to assign bosses');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <div className="text-center py-8">Loading available bosses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
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
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Assign Boss</h1>
            </div>
          </div>
          {selectedBosses.length > 0 && (
            <Button 
              onClick={handleAssignSelected} 
              disabled={assigning}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {assigning ? 'Assigning...' : `Assign Selected (${selectedBosses.length})`}
            </Button>
          )}
        </div>

        {/* Event Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Event: Adventure Quest 2024</h2>
                <p className="text-sm text-muted-foreground">
                  Select bosses to add to this active event
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Live
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Available Bosses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-lg font-semibold">Available Boss Templates</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Select bosses to add to your event
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {availableBosses.length} Available {user?.role === 'host' ? '(Your Bosses Only)' : ''}
            </div>
          </div>

          {/* Available Bosses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBosses.map((boss) => (
              <Card 
                key={boss.id}
                className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selectedBosses.includes(boss.id) 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleBossSelect(boss.id)}
              >
                <CardContent className="p-0">
                  {/* Boss Image */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                    <img
                      src={boss.image ? getBossImageUrl(boss.image) : '/src/assets/Placeholder/Falcon.png'}
                      alt={boss.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        selectedBosses.includes(boss.id) 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'bg-background border-border'
                      }`}>
                        {selectedBosses.includes(boss.id) && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Boss Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-base mb-1">{boss.name}</h3>
                      <div className="text-xs text-muted-foreground mb-2">
                        By: {boss.creator?.username || 'Unknown'}
                      </div>
                      {boss.description && (
                        <p className="text-xs text-muted-foreground">{boss.description}</p>
                      )}
                    </div>

                    {/* Boss Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Cooldown
                        </span>
                        <span className="font-medium">{boss.cooldownDuration || 60}s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Teams
                        </span>
                        <span className="font-medium">{boss.numberOfTeams || 2}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {availableBosses.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Sword className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No Bosses Available</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {user?.role === 'host' 
                        ? "You haven't created any bosses yet. Create bosses first to assign them to events."
                        : "No bosses are available for assignment."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        {selectedBosses.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedBosses.length} boss{selectedBosses.length !== 1 ? 'es' : ''} selected
                </span>
                <Button onClick={handleAssignSelected} size="sm" disabled={assigning}>
                  <Plus className="w-4 h-4 mr-2" />
                  {assigning ? 'Assigning...' : 'Assign to Event'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossTemplate;