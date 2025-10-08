// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

// ===== COMPONENTS ===== //
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

// ===== API ===== //
import { apiClient } from "@/api";

const AllTimeLeaderboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [eventFilter, setEventFilter] = useState();
  const [events, setEvents] = useState([]);
  const [leaderboards, setLeaderboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (isLoading && (!leaderboards || leaderboards.length === 0)) {
      const fetchAllTimeLeaderboards = async () => {
        try {
          setIsLoading(true);
          const response = await apiClient.get("/leaderboards");
          if (response.data) {
            setEvents(response.data.events || []);
            setLeaderboards(response.data.leaderboards || []);
          }
        } catch (error) {
          setError("Error fetching leaderboard data");
          console.error("Error fetching leaderboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllTimeLeaderboards();

      // .then((data) => {
      //   if (data) {
      //     setEvents(data.events || []);
      //     setLeaderboards(data.leaderboards || []);
      //   } else {
      //     setError("Failed to load leaderboard data");
      //     console.error("Failed to load leaderboard data");
      //   }
      //   setIsLoading(false);
      // })
      // .catch((error) => {
      //   setError("Error fetching leaderboard data");
      //   setIsLoading(false);
      //   console.error("Error fetching leaderboard data:", error);
      // });
    }
  }, [leaderboards, isLoading]);

  useEffect(() => {
    if (events.length > 0 && !eventFilter) {
      setEventFilter(events[0].id);
    }
  }, [events, eventFilter]);

  // Get data based on selected event filter
  const currentLeaderboard = eventFilter ? leaderboards[eventFilter] || [] : [];

  const totalPages = Math.ceil(currentLeaderboard.length / PAGE_SIZE);
  const paginatedData = currentLeaderboard.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page when event filter changes
  const handleEventFilterChange = (newEventId) => {
    setEventFilter(newEventId);
    setCurrentPage(1);
  };

  // Podium helpers
  const getPodiumColor = (rank) => {
    if (rank === 1) return "bg-yellow-500"; // Gold
    if (rank === 2) return "bg-gray-400"; // Silver
    if (rank === 3) return "bg-amber-600"; // Bronze
    return "bg-gray-500";
  };

  const getPodiumIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-white" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-white" />;
    if (rank === 3) return <Award className="w-4 h-4 text-white" />;
    return null;
  };

  const getAvatarInitials = (name) => {
    if (!name) return "";
    const names = name.trim().toUpperCase().split(" ");

    if (names.length === 1) return names[0].slice(0, 2);

    const initials = names.map((n) => n.charAt(0)).join("");
    return initials.slice(0, 2);
  };

  // Top 3 only
  const podiumPlayers = currentLeaderboard.slice(0, 3);

  if (isLoading) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <Card className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <Card className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">
                Unable to load leaderboard
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      {/* Podium Section */}
      <Card className="mb-8">
        <CardHeader className="pb-3 sm:pb-6 text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Podium
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Top 3 players by total damage and accuracy
          </p>
        </CardHeader>
        <CardContent>
          {/* Desktop Podium */}
          {podiumPlayers.length > 0 ? (
            <div className="flex items-end justify-center gap-6 py-4">
              {podiumPlayers.map((player, index) => {
                // Height for podium effect
                let height =
                  player.rank === 1 ? 120 : player.rank === 2 ? 80 : 60;

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${
                      index === 0
                        ? "order-2"
                        : index === 1
                        ? "order-1"
                        : "order-3"
                    }`}
                  >
                    <div className="mb-2 relative">
                      <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-gray-200 dark:border-gray-700 shadow-lg">
                        <AvatarImage
                          src={
                            player.profileImage
                              ? `https://api-uniraid.paragoniu.app/api/${player.profileImage}`
                              : `/src/assets/Placeholder/Profile${
                                  player.rank % 5
                                }.jpg`
                          }
                          alt={player.username}
                        />
                        <AvatarFallback className="uppercase">
                          {getAvatarInitials(player.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -top-3 -right-3 w-8 h-8 rounded-full ${getPodiumColor(
                          player.rank
                        )} flex items-center justify-center shadow-lg border-2 border-white`}
                      >
                        {getPodiumIcon(player.rank)}
                      </div>
                    </div>
                    <div className="font-bold text-lg mb-1">
                      {player.username}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {player.totalDamageDealt || 0} DMG
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {(player.accuracy * 100).toFixed(2)}% Accuracy
                    </div>
                    <div
                      className={`w-20 md:w-24 h-6 rounded-t-lg ${getPodiumColor(
                        player.rank
                      )} text-white flex items-center justify-center font-bold text-sm shadow-lg`}
                      style={{ height: `${height}px` }}
                    >
                      {player.rank === 1
                        ? "1st"
                        : player.rank === 2
                        ? "2nd"
                        : "3rd"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                No players found for this leaderboard
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="relative h-[690px]">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            All-time Leaderboard
          </CardTitle>
          <p className="text-muted-foreground mt-2 -mb-7 text-sm sm:text-base">
            See the top players by total damage and accuracy
          </p>
        </CardHeader>

        <CardContent>
          {/* Event Filter Tabs */}
          <div className="mb-2">
            {events.length > 0 && (
              <Tabs
                value={eventFilter || ""}
                onValueChange={handleEventFilterChange}
              >
                <TabsList className="grid w-full grid-cols-4 h-auto gap-1 p-1">
                  {events.map((event) => (
                    <TabsTrigger
                      key={event.id}
                      value={event.id}
                      className="text-xs sm:text-sm h-full py-2 px-2 whitespace-normal text-center leading-tight"
                    >
                      {event.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="w-full max-w-full overflow-x-auto">
            <div className="min-w-0 max-w-full">
              <Table className="w-full table-fixed overflow-hidden">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">Rank</TableHead>
                    <TableHead className="w-35">Username</TableHead>
                    <TableHead className="w-17 text-right">DMG</TableHead>
                    <TableHead className="w-14 text-right">ACC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((player) => {
                      return (
                        <TableRow key={player.userId}>
                          <TableCell className="text-center font-bold p-2">
                            {player.rank === 1 ? (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                1st
                              </Badge>
                            ) : player.rank === 2 ? (
                              <Badge className="bg-gray-400 hover:bg-gray-500 text-white">
                                2nd
                              </Badge>
                            ) : player.rank === 3 ? (
                              <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                                3rd
                              </Badge>
                            ) : (
                              <span className="text-sm font-medium text-muted-foreground">
                                #{player.rank}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="p-2">
                            <span className="truncate text-xs font-medium">
                              {player.username || "Unknown Player"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right p-2 text-sm">
                            {player.totalDamageDealt || 0}
                          </TableCell>
                          <TableCell className="text-right p-2 text-sm">
                            {(player.accuracy * 100).toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No players found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="absolute left-0 bottom-0 w-full flex justify-center pb-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(currentPage > 1 ? currentPage - 1 : 1);
                      }}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === idx + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(idx + 1);
                        }}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(
                          currentPage < totalPages
                            ? currentPage + 1
                            : totalPages
                        );
                      }}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllTimeLeaderboard;
