// ===== LIBRARIES ===== //
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ===== COMPONENTS ===== //
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticationCheck } from "./components/AuthenticationCheck";
import { PreventAuthenticatedAccess } from "./components/PreventAuthenticatedAccess";
import { PlayerViewGuard } from "./components/PlayerViewGuard";
import { ScrollToTop } from "./components/ScrollToTop";

// ===== CONTEXT PROVIDERS ===== //
import { ThemeProvider } from "./context/ThemeProvider";
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
import PlayerHome from "./pages/player/Home";
import PlayerEventBosses from "./pages/player/EventBosses";
import PlayerBadges from "./pages/player/Badges";
import PlayerLeaderboard from "./pages/AllTimeLeaderboard";
import PlayerProfile from "./pages/Profile";
import PlayerQR from "./pages/player/QR";
import BossPreview from "./pages/player/BossPreview";
import BossBattle from "./pages/player/BossBattle";
import BossPodium from "./pages/player/BossPodium";

// ===== Manage PAGES ===== //
// Bosses
import BossList from "./pages/manage/boss/BossList";
import CreateBoss from "./pages/manage/boss/CreateBoss";
import EditBoss from "./pages/manage/boss/EditBoss";
// Events
import EventList from "./pages/manage/event/EventList";
import EventDetails from "./pages/manage/event/EventDetails";
import AssignBoss from "./pages/manage/event/AssignBoss";
import CreateEvent from "./pages/manage/event/CreateEvent";
import EditEvent from "./pages/manage/event/EditEvent";
import ManageEventsPlayerBadges from "./pages/manage/event/PlayerBadges";
import BossBattleMonitor from "./pages/manage/event/BossBattleMonitor";
import ManageEventsAllLeaderboard from "./pages/AllTimeLeaderboard";
// Users
import UserList from "./pages/manage/users/UserList";
import EditUser from "./pages/manage/users/EditUser";
// QuestionBank
import QuestionBankList from "./pages/manage/questionbank/QuestionBankList";
// QuestionBank - Categories
import CreateCategory from "./pages/manage/questionbank/category/CreateCategory";
import EditCategory from "./pages/manage/questionbank/category/EditCategory";
// QuestionBank - Questions
import QuestionDetails from "./pages/manage/questionbank/question/QuestionDetails";
import CreateQuestion from "./pages/manage/questionbank/question/CreateQuestion";
import EditQuestion from "./pages/manage/questionbank/question/EditQuestion";
// Profile
import OpProfile from "./pages/Profile";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BossBattleProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* ===== LANDING ROUTES ===== */}
              <Route path="/landing" element={<AppLanding />}>
                <Route index element={<Landing />} />
              </Route>

              <Route path="/about-us" element={<AppLanding />}>
                <Route index element={<About />} />
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

              {/* ===== PUBLIC ROUTES ===== */}
              <Route path="/:eventId/event-bosses" element={<App />}>
                <Route index element={<PlayerEventBosses />} />
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
                      <BossPreview />
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
                      <BossBattle />
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
                      <BossPodium />
                    </AuthenticationCheck>
                  }
                />
              </Route>

              {/* ===== MANAGE ROUTES (Superadmin, Admin, Host) ===== */}
              <Route
                path="/manage"
                element={
                  <ProtectedRoute
                    allowedRoles={["superadmin", "admin", "host"]}
                  />
                }
              >
                <Route element={<AppOP />}>
                  {/* Manage Bosses Routes */}
                  <Route path="bosses" element={<BossList />} />
                  <Route path="bosses/create" element={<CreateBoss />} />
                  <Route path="bosses/:bossId/edit" element={<EditBoss />} />

                  {/* Manage Events Routes (Host, Admin, Superadmin) */}
                  <Route path="events" element={<EventList />} />
                  <Route path="events/:eventId" element={<EventDetails />} />
                  <Route
                    path="events/:eventId/assign-boss"
                    element={<AssignBoss />}
                  />
                  <Route
                    path="events/:eventId/player-badges"
                    element={<ManageEventsPlayerBadges />}
                  />
                  <Route
                    path="events/:eventId/:eventBossId/monitor"
                    element={<BossBattleMonitor />}
                  />
                  <Route
                    path="all-leaderboard"
                    element={<ManageEventsAllLeaderboard />}
                  />

                  {/* Manage QuestionBank Routes */}
                  <Route
                    path="questionbank/categories"
                    element={<QuestionBankList />}
                  />
                  <Route
                    path="questionbank/categories/create"
                    element={<CreateCategory />}
                  />
                  <Route
                    path="questionbank/categories/:categoryId/edit"
                    element={<EditCategory />}
                  />
                  <Route
                    path="questionbank/questions"
                    element={<QuestionBankList />}
                  />
                  <Route
                    path="questionbank/questions/:questionId"
                    element={<QuestionDetails />}
                  />
                  <Route
                    path="questionbank/questions/create"
                    element={<CreateQuestion />}
                  />
                  <Route
                    path="questionbank/questions/:questionId/edit"
                    element={<EditQuestion />}
                  />

                  {/* Manage Profile */}
                  <Route path="profile" element={<OpProfile />} />
                </Route>

                {/* Nested Protected Routes for Admin & Superadmin Only */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={["superadmin", "admin"]} />
                  }
                >
                  <Route element={<AppOP />}>
                    {/* Event Management (Admin Only) */}
                    <Route path="events/create" element={<CreateEvent />} />
                    <Route
                      path="events/:eventId/edit"
                      element={<EditEvent />}
                    />

                    {/* User Management (Admin Only) */}
                    <Route path="users" element={<UserList />} />
                    <Route path="users/:userId/edit" element={<EditUser />} />
                  </Route>
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
          </BrowserRouter>
        </BossBattleProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
