// ===== LIBRARIES ===== //
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ===== COMPONENTS ===== //
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthenticationCheck } from "./components/AuthenticationCheck";
import { PreventAuthenticatedAccess } from "./components/PreventAuthenticatedAccess";
import { PlayerViewGuard } from "./components/PlayerViewGuard";
import { MessageProvider } from "./context/MessageProvider";
import { ScrollToTop } from "./components/ScrollToTop";

// ===== CONTEXT PROVIDERS ===== //
import { ThemeProvider } from "./theme/theme-provider";
import { AuthProvider } from "./context/AuthProvider";
import { BossBattleProvider } from "./context/BossBattleProvider";

// ===== STYLES ===== //
import "./index.css";

// ===== MASTER PAGES ===== //
import AppLanding from "./AppLanding";
import App from "./App";
import AppOP from "./AppOP";
import AppBattle from "./AppBattle";
import AppError from "./AppError";

// ===== LANDING PAGES ===== //
import Landing from "./pages/Landing";
import About from "./pages/About";
import Authentication from "./pages/Authentication";

// ===== PLAYER PAGES ===== //
import Error from "./pages/Error";
import Loading from "./pages/Loading";
import PlayerHome from "./pages/Player/Home";
import PlayerEventBosses from "./pages/Player/EventBosses";
import PlayerBadges from "./pages/Player/Badges2";
import PlayerLeaderboard from "./pages/AllTimeLeaderboard";
import PlayerProfile from "./pages/Player/Profile";
import PlayerQR from "./pages/Player/QR";
import PlayerQRTest from "./pages/Player/QRTest";
import PlayerJoin from "./pages/Player/Join";
import PlayerJoinTest from "./pages/Player/JoinTest";
import PlayerBossPreview from "./pages/Player/BossPreview2";
import PlayerBossBattle from "./pages/Player/BossBattle2";
import PlayerBossPodium from "./pages/Player/BossPodium2";

// ===== Manage PAGES ===== //
// Bosses
import ManageBossesView from "./pages/Manage/Bosses/View";
import ManageBossesCreate from "./pages/Manage/Bosses/Create";
import ManageBossesEdit from "./pages/Manage/Bosses/Edit";
// Events
import ManageEventsView from "./pages/Manage/Events/View";
import ManageEventsAssignBoss from "./pages/Manage/Events/AssignBoss";
import ManageEventsBossTemplate from "./pages/Manage/Events/BossTemplate";
import ManageEventsCreate from "./pages/Manage/Events/Create";
import ManageEventsEdit from "./pages/Manage/Events/Edit";
import ManageEventsPlayerbadges from "./pages/Manage/Events/Playerbadges";
import ManageEventsPlayerBadges from "./pages/Manage/Events/PlayerBadges2";
import ManageEventsPlayerBadgesEdit from "./pages/Manage/Events/Playerbadgesedit";
import ManageEventsLeaderboard from "./pages/Manage/Events/Leaderboard2";
import ManageEventsAllLeaderboard from "./pages/AllTimeLeaderboard";
// Users
import ManageUsersView from "./pages/Manage/Users/View";
import ManageUsersEdit from "./pages/Manage/Users/Edit";
// QuestionBank - Categories
import ManageCategoriesView from "./pages/Manage/QuestionBank/Categories/View";
import ManageCategoriesCreate from "./pages/Manage/QuestionBank/Categories/Create";
import ManageCategoriesEdit from "./pages/Manage/QuestionBank/Categories/Edit";
// QuestionBank - Questions
import ManageQuestionsIndex from "./pages/Manage/QuestionBank/Questions/index";
import ManageCategoriesQuesitonsView from "./pages/Manage/QuestionBank/Questions/View";
import ManageCategoriesQuestionsCreate from "./pages/Manage/QuestionBank/Questions/Create";
import ManageCategoriesQuestionsEdit from "./pages/Manage/QuestionBank/Questions/Edit";
// Profile
import ManageProfile from "./pages/Manage/Profile/Profile";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BossBattleProvider>
          <BrowserRouter>
            <ScrollToTop />
            <MessageProvider>
              <Routes>
                {/* ===== LANDING ROUTES ===== */}
                <Route path="/landing" element={<AppLanding />}>
                  <Route
                    index
                    element={
                      <PreventAuthenticatedAccess>
                        <Landing />
                      </PreventAuthenticatedAccess>
                    }
                  />
                </Route>

                {/* About page for logged-out users */}
                <Route path="/about-us" element={<AppLanding />}>
                  <Route
                    index
                    element={
                      <PreventAuthenticatedAccess>
                        <About />
                      </PreventAuthenticatedAccess>
                    }
                  />
                </Route>

                <Route path="/auth" element={<AppLanding />}>
                  <Route
                    index
                    element={
                      <PreventAuthenticatedAccess>
                        <Authentication />
                      </PreventAuthenticatedAccess>
                    }
                  />
                </Route>

                {/* ===== PLAYER ROUTES ===== */}
                <Route path="/" element={<App />}>
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerViewGuard>
                          <PlayerHome />
                        </PlayerViewGuard>
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                {/* About page for logged-in users */}
                <Route path="/about" element={<App />}>
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <About />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route path="/event-bosses" element={<App />}>
                  <Route index element={<PlayerEventBosses />} />
                </Route>

                <Route path="/qr" element={<App />}>
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerQR />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route path="/player/join" element={<PlayerJoin />} />
                <Route path="/boss-preview/join" element={<PlayerJoin />} />

                <Route path="/join-test" element={<PlayerJoinTest />} />

                <Route path="/qr-test" element={<App />}>
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerQRTest />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route path="/badges" element={<App />}>
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerBadges />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route path="/leaderboard" element={<App />}>
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerLeaderboard />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route path="/profile" element={<App />}>
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerProfile />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route
                  path="/boss-preview/:eventBossId/:joinCode"
                  element={<App />}
                >
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerBossPreview />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route
                  path="/boss-battle/:eventBossId/:joinCode"
                  element={<AppBattle />}
                >
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerBossBattle />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                <Route
                  path="/boss-podium/:eventBossId/:joinCode"
                  element={<AppBattle />}
                >
                  <Route
                    index
                    element={
                      <AuthenticationCheck>
                        <PlayerBossPodium />
                      </AuthenticationCheck>
                    }
                  />
                </Route>

                {/* ===== Manage ROUTES (Protected for Manage and admin roles) ===== */}
                <Route
                  path="/Manage"
                  element={
                    <ProtectedRoute allowedRoles={["Manage", "admin"]} />
                  }
                >
                  {/* <Route path="/Manage"> */}
                  {/* Manage Bosses Routes */}
                  <Route path="bosses/create" element={<AppOP />}>
                    <Route index element={<ManageBossesCreate />} />
                  </Route>

                  <Route path="bosses/edit/:id" element={<AppOP />}>
                    <Route index element={<ManageBossesEdit />} />
                  </Route>

                  <Route path="bosses/view" element={<AppOP />}>
                    <Route index element={<ManageBossesView />} />
                  </Route>

                  {/* Manage Events Routes */}
                  <Route path="events/view" element={<AppOP />}>
                    <Route index element={<ManageEventsView />} />
                  </Route>

                  <Route path="events/assign_boss" element={<AppOP />}>
                    <Route index element={<ManageEventsAssignBoss />} />
                  </Route>

                  <Route path="events/boss_template" element={<AppOP />}>
                    <Route index element={<ManageEventsBossTemplate />} />
                  </Route>

                  <Route
                    path="events/:eventId/player_badges"
                    element={<AppOP />}
                  >
                    <Route index element={<ManageEventsPlayerbadges />} />
                  </Route>

                  <Route
                    path="events/:eventId/player_badges2"
                    element={<AppOP />}
                  >
                    <Route index element={<ManageEventsPlayerBadges />} />
                  </Route>

                  <Route
                    path="events/:eventId/player_badges_edit"
                    element={<AppOP />}
                  >
                    <Route index element={<ManageEventsPlayerBadgesEdit />} />
                  </Route>

                  <Route
                    path="events/:eventId/:eventBossId/leaderboard"
                    element={<AppOP />}
                  >
                    <Route index element={<ManageEventsLeaderboard />} />
                  </Route>

                  <Route path="all_leaderboard" element={<AppOP />}>
                    <Route index element={<ManageEventsAllLeaderboard />} />
                  </Route>

                  <Route
                    path="events/create"
                    element={
                      <AdminRoute>
                        <AppOP />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<ManageEventsCreate />} />
                  </Route>

                  <Route
                    path="events/edit"
                    element={
                      <AdminRoute>
                        <AppOP />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<ManageEventsEdit />} />
                  </Route>

                  {/* Manage QuestionBank Routes */}
                  <Route
                    path="questionbank/categories/view"
                    element={<AppOP />}
                  >
                    <Route index element={<ManageCategoriesView />} />
                  </Route>

                  <Route
                    path="questionbank/categories/create"
                    element={<AppOP />}
                  >
                    <Route index element={<ManageCategoriesCreate />} />
                  </Route>

                  <Route
                    path="questionbank/categories/edit/:id"
                    element={<AppOP />}
                  >
                    <Route index element={<ManageCategoriesEdit />} />
                  </Route>

                  <Route path="questionbank/questions" element={<AppOP />}>
                    <Route index element={<ManageQuestionsIndex />} />
                  </Route>

                  <Route path="questionbank/questions/view" element={<AppOP />}>
                    <Route index element={<ManageCategoriesQuesitonsView />} />
                  </Route>

                  <Route
                    path="questionbank/questions/create"
                    element={<AppOP />}
                  >
                    <Route
                      index
                      element={<ManageCategoriesQuestionsCreate />}
                    />
                  </Route>

                  <Route path="questionbank/questions/edit" element={<AppOP />}>
                    <Route index element={<ManageCategoriesQuestionsEdit />} />
                  </Route>

                  {/* Manage Profile */}
                  <Route path="profile" element={<AppOP />}>
                    <Route index element={<ManageProfile />} />
                  </Route>

                  {/* Manage Users Routes - Admin Only */}
                  {/* <Route path="users/view" element={
                  <AdminRoute>
                    <AppOP />
                  </AdminRoute>
                }>
                  <Route index element={<ManageUsersView />} />
                </Route> */}
                  <Route path="users/view" element={<AppOP />}>
                    <Route index element={<ManageUsersView />} />
                  </Route>

                  {/* <Route path="users/edit/:id" element={
                  <AdminRoute>
                    <AppOP />
                  </AdminRoute>
                }>
                  <Route index element={<ManageUsersEdit />} />
                </Route> */}
                  <Route path="users/edit/:id" element={<AppOP />}>
                    <Route index element={<ManageUsersEdit />} />
                  </Route>
                </Route>

                {/* Loading Route */}
                <Route path="/loading" element={<Loading />} />

                {/* 404 Error Route */}
                <Route path="/error" element={<Error />} />

                <Route path="*" element={<AppError />}>
                  <Route path="*" element={<Error />} />
                </Route>
              </Routes>
            </MessageProvider>
          </BrowserRouter>
        </BossBattleProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
