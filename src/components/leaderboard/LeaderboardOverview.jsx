// ===== LIBRARIES ===== //
import { useState } from "react";
import { Users, Trophy, User, Medal, Award } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const LeaderboardOverview = ({ leaderboard, isLoading, isPreview, isFullWidth = false }) => {
  const [currentPage, setCurrentPage] = useState({
    teams: 1,
    individual: 1,
    alltime: 1,
  });
  const PAGE_SIZE = 10;

  const teamLeaderboard = leaderboard?.teamLeaderboard || [];
  const individualLeaderboard = leaderboard?.individualLeaderboard || [];
  const allTimeLeaderboard = leaderboard?.allTimeLeaderboard || [];

  const getPaginatedData = (data, tabKey) => {
    const page = currentPage[tabKey];
    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { paginatedData, totalPages, currentPageNum: page };
  };

  const handlePageChange = (tabKey, newPage) => {
    setCurrentPage((prev) => ({ ...prev, [tabKey]: newPage }));
  };

  const getRankBadge = (rank) => {
    if (rank === 1)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          1st
        </Badge>
      );
    if (rank === 2)
      return (
        <Badge className="bg-gray-400 hover:bg-gray-500 text-white">2nd</Badge>
      );
    if (rank === 3)
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
          3rd
        </Badge>
      );
    return (
      <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    );
  };

  // Pagination component
  const PaginationControls = ({ totalPages, currentPageNum, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(currentPageNum > 1 ? currentPageNum - 1 : 1);
                }}
                className={
                  currentPageNum === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  href="#"
                  isActive={currentPageNum === idx + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(idx + 1);
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
                  onPageChange(
                    currentPageNum < totalPages
                      ? currentPageNum + 1
                      : totalPages
                  );
                }}
                className={
                  currentPageNum === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  const getAvatarInitials = (name) => {
    if (!name) return "";
    const names = name.trim().toUpperCase().split(" ");

    if (names.length === 1) return names[0].slice(0, 2);

    const initials = names.map((n) => n.charAt(0)).join("");
    return initials.slice(0, 2);
  };

  const teamColumns = [
    { header: "Rank", accessor: "rank" },
    { header: "Team", accessor: "name" },
    { header: "DMG", accessor: "totalDamage" },
    { header: "ACC %", accessor: "accuracy" },
  ];

  const individualColumns = [
    { header: "Rank", accessor: "rank" },
    { header: "Player", accessor: "nickname" },
    { header: "DMG", accessor: "totalDamage" },
    { header: "ACC %", accessor: "accuracy" },
  ];

  const allTimeColumns = [
    { header: "Rank", accessor: "rank" },
    { header: "Player", accessor: "username" },
    { header: "DMG", accessor: "totalDamageDealt" },
    { header: "ACC %", accessor: "accuracy" },
  ];

  const config = isPreview
    ? {
        icon: <Trophy className="w-5 h-5" />,
        title: "Live Leaderboard Rankings",
        description: "View performance across different categories",
        tabs: [
          {
            value: "teams",
            label: "Team Rankings",
            shortLabel: "Teams",
            icon: <Users className="w-4 h-4" />,
          },
          {
            value: "individual",
            label: "Individual Rankings",
            shortLabel: "Players",
            icon: <User className="w-4 h-4" />,
          },
          {
            value: "alltime",
            label: "All-Time",
            shortLabel: "All-Time",
            icon: <Trophy className="w-4 h-4" />,
          },
        ],
        tables: [
          {
            type: "teams",
            title: "Team Rankings",
            description: "Current event team performance",
            data: teamLeaderboard,
            loadingMessage: "Loading team leaderboard...",
            emptyMessage: "No team data available yet",
            columns: teamColumns,
          },
          {
            type: "individual",
            title: "Individual Rankings",
            description: "Current event individual performance",
            data: individualLeaderboard,
            loadingMessage: "Loading individual leaderboard...",
            emptyMessage: "No individual data available yet",
            columns: individualColumns,
          },
          {
            type: "alltime",
            title: "All-Time Rankings",
            description: "Historical player performance across all events",
            data: allTimeLeaderboard,
            loadingMessage: "Loading all-time leaderboard...",
            emptyMessage: "No historical data available yet",
            columns: allTimeColumns,
          },
        ],
      }
    : {
        icon: <Medal className="w-5 h-5" />,
        title: "Final Battle Results",
        description: "Complete performance rankings for this battle",
        tabs: [
          {
            value: "teams",
            label: "Team Results",
            shortLabel: "Teams",
            icon: <Users className="w-4 h-4" />,
          },
          {
            value: "individual",
            label: "Individual Results",
            shortLabel: "Players",
            icon: <User className="w-4 h-4" />,
          },
          {
            value: "alltime",
            label: "All-Time Records",
            shortLabel: "All-Time",
            icon: <Award className="w-4 h-4" />,
          },
        ],
        tables: [
          {
            type: "teams",
            title: "Team Final Rankings",
            description: "Final team performance for this battle",
            data: teamLeaderboard,
            loadingMessage: "Loading team results...",
            emptyMessage: "No team data available yet",
            columns: teamColumns,
          },
          {
            type: "individual",
            title: "Individual Final Rankings",
            description: "Final individual performance for this battle",
            data: individualLeaderboard,
            loadingMessage: "Loading individual results...",
            emptyMessage: "No individual data available yet",
            columns: individualColumns,
          },
          {
            type: "alltime",
            title: "All-Time Records",
            description: "Historical player performance across all battles",
            data: allTimeLeaderboard,
            loadingMessage: "Loading all-time records...",
            emptyMessage: "No historical data available yet",
            columns: allTimeColumns,
          },
        ],
      };

  return (
    <div className={`${isFullWidth ? "" : "max-w-4xl"} mx-auto mt-8`}>
      <Card className="h-[840px] relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </CardHeader>
        <CardContent className="relative h-full">
          <Tabs defaultValue="teams" className="space-y-3">
            {/* Tabs List */}
            <TabsList className="grid w-full grid-cols-3">
              {config.tabs.map((tab, index) => (
                <TabsTrigger
                  key={index}
                  value={tab.value}
                  className="flex items-center gap-2"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {/* Leaderboard */}
            {config.tables.map((table, index) => (
              <TabsContent key={index} value={table.type} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{table.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {table.description}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">
                        {table.columns[0].header}
                      </TableHead>
                      <TableHead className="whitespace-normal">
                        {table.columns[1].header}
                      </TableHead>
                      <TableHead className="text-right whitespace-normal">
                        {table.columns[2].header}
                      </TableHead>
                      <TableHead className="text-right whitespace-normal">
                        {table.columns[3].header}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            {table.loadingMessage}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : getPaginatedData(table.data, table.type).paginatedData
                        .length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {table.emptyMessage}
                        </TableCell>
                      </TableRow>
                    ) : (
                      getPaginatedData(
                        table.data,
                        table.type
                      ).paginatedData.map((item) => (
                        <TableRow
                          key={item.id || item.userId}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(item.rank)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    item.avatar ||
                                    `/src/assets/Placeholder/Profile${
                                      item.rank % 5
                                    }.jpg`
                                  }
                                  alt={
                                    item.name ||
                                    item.nickname ||
                                    item.username
                                  }
                                />
                                <AvatarFallback className="uppercase">
                                  {getAvatarInitials(
                                    item.name ||
                                      item.nickname ||
                                      item.username
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {item.name || item.nickname || item.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.totalDamage || item.totalDamageDealt || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {(item.accuracy * 100).toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <PaginationControls
                  {...getPaginatedData(table.data, table.type)}
                  onPageChange={(page) => handlePageChange(table.type, page)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { LeaderboardOverview };
