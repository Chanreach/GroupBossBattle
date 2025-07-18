// ===== LIBRARIES ===== //
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ===== COMPONENTS ===== //
import { ThemeProvider } from "./theme/theme-provider";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthenticationCheck } from "./components/AuthenticationCheck";
import PreventAuthenticatedAccess from "./components/PreventAuthenticatedAccess";
import { MessageProvider } from "./context/MessageProvider";
import ScrollToTop from "./components/ScrollToTop";

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
import PlayerHome from "./pages/Player/Home";
import PlayerEventBosses from "./pages/Player/EventBosses";
import PlayerBadges from "./pages/Player/Badges";
import PlayerLeaderboard from "./pages/Player/Leaderboard";
import PlayerProfile from "./pages/Player/Profile";
import PlayerQR from "./pages/Player/QR";
import PlayerBossPreview from "./pages/Player/BossPreview";
import PlayerBossBattle from "./pages/Player/BossBattle";
import PlayerBossPodium from "./pages/Player/BossPodium";

// ===== HOST PAGES ===== //
// Bosses
import HostBossesView from "./pages/Host/Bosses/View";
import HostBossesCreate from "./pages/Host/Bosses/Create";
import HostBossesEdit from "./pages/Host/Bosses/Edit";
// Events
import HostEventsView from "./pages/Host/Events/View";
import HostEventsAssignBoss from "./pages/Host/Events/AssignBoss";
import HostEventsBossTemplate from "./pages/Host/Events/BossTemplate";
import HostEventsCreate from "./pages/Host/Events/Create";
import HostEventsEdit from "./pages/Host/Events/Edit";
import HostEventsPlayerbadges from "./pages/Host/Events/Playerbadges";
import HostEventsPlayerBadgesEdit from "./pages/Host/Events/Playerbadgesedit";
import HostEventsLeaderboard from "./pages/Host/Events/Leaderboard";
import HostEventsAllLeaderboard from "./pages/Host/Events/AllLeaderboard";
// Users
import HostUsersView from "./pages/Host/Users/View";
import HostUsersEdit from "./pages/Host/Users/Edit";
// QuestionBank - Categories
import HostCategoriesView from "./pages/Host/QuestionBank/Categories/View";
import HostCategoriesCreate from "./pages/Host/QuestionBank/Categories/Create";
import HostCategoriesEdit from "./pages/Host/QuestionBank/Categories/Edit";
// QuestionBank - Questions
import HostQuestionsIndex from "./pages/Host/QuestionBank/Questions/index";
import HostCategoriesQuesitonsView from "./pages/Host/QuestionBank/Questions/View";
import HostCategoriesQuestionsCreate from "./pages/Host/QuestionBank/Questions/Create";
import HostCategoriesQuestionsEdit from "./pages/Host/QuestionBank/Questions/Edit";
// Profile
import HostProfile from "./pages/Host/Profile/Profile";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <MessageProvider>
            <Routes>
              {/* ===== LANDING ROUTES ===== */}
              <Route path="/landing" element={<AppLanding />}>
                <Route index element={<Landing />} />
              </Route>

              <Route path="/about" element={<AppLanding />}>
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

              {/* ===== PLAYER ROUTES ===== */}
              <Route path="/" element={<App />}>
                <Route
                  index
                  element={
                    <AuthenticationCheck>
                      <PlayerHome />
                    </AuthenticationCheck>
                  }
                />
              </Route>

              <Route path="/event-bosses" element={<App />}>
                <Route
                  index
                  element={
                    <AuthenticationCheck>
                      <PlayerEventBosses />
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

              <Route path="/boss-preview" element={<App />}>
                <Route
                  index
                  element={
                    <AuthenticationCheck>
                      <PlayerBossPreview />
                    </AuthenticationCheck>
                  }
                />
              </Route>

              <Route path="/boss-battle" element={<AppBattle />}>
                <Route
                  index
                  element={
                    <AuthenticationCheck>
                      <PlayerBossBattle />
                    </AuthenticationCheck>
                  }
                />
              </Route>

              <Route path="/boss-podium" element={<AppBattle />}>
                <Route
                  index
                  element={
                    <AuthenticationCheck>
                      <PlayerBossPodium />
                    </AuthenticationCheck>
                  }
                />
              </Route>

              {/* ===== HOST ROUTES (Protected for host and admin roles) ===== */}
              <Route
                path="/host"
                element={<ProtectedRoute allowedRoles={["host", "admin"]} />}
              >
                {/* <Route path="/host"> */}
                {/* Host Bosses Routes */}
                <Route path="bosses/create" element={<AppOP />}>
                  <Route index element={<HostBossesCreate />} />
                </Route>

                <Route path="bosses/edit/:id" element={<AppOP />}>
                  <Route index element={<HostBossesEdit />} />
                </Route>

                <Route path="bosses/view" element={<AppOP />}>
                  <Route index element={<HostBossesView />} />
                </Route>

                {/* Host Events Routes */}
                <Route path="events/view" element={<AppOP />}>
                  <Route index element={<HostEventsView />} />
                </Route>

                <Route path="events/assign_boss" element={<AppOP />}>
                  <Route index element={<HostEventsAssignBoss />} />
                </Route>

                <Route path="events/boss_template" element={<AppOP />}>
                  <Route index element={<HostEventsBossTemplate />} />
                </Route>

                <Route path="events/player_badges" element={<AppOP />}>
                  <Route index element={<HostEventsPlayerbadges />} />
                </Route>

                <Route path="events/player_badges_edit" element={<AppOP />}>
                  <Route index element={<HostEventsPlayerBadgesEdit />} />
                </Route>

                <Route path="events/leaderboard" element={<AppOP />}>
                  <Route index element={<HostEventsLeaderboard />} />
                </Route>

                <Route path="all_leaderboard" element={<AppOP />}>
                  <Route index element={<HostEventsAllLeaderboard />} />
                </Route>

                <Route
                  path="events/create"
                  element={
                    <AdminRoute>
                      <AppOP />
                    </AdminRoute>
                  }
                >
                  <Route index element={<HostEventsCreate />} />
                </Route>

                <Route
                  path="events/edit"
                  element={
                    <AdminRoute>
                      <AppOP />
                    </AdminRoute>
                  }
                >
                  <Route index element={<HostEventsEdit />} />
                </Route>

                {/* Host QuestionBank Routes */}
                <Route path="questionbank/categories/view" element={<AppOP />}>
                  <Route index element={<HostCategoriesView />} />
                </Route>

                <Route
                  path="questionbank/categories/create"
                  element={<AppOP />}
                >
                  <Route index element={<HostCategoriesCreate />} />
                </Route>

                <Route
                  path="questionbank/categories/edit/:id"
                  element={<AppOP />}
                >
                  <Route index element={<HostCategoriesEdit />} />
                </Route>

                <Route path="questionbank/questions" element={<AppOP />}>
                  <Route index element={<HostQuestionsIndex />} />
                </Route>

                <Route path="questionbank/questions/view" element={<AppOP />}>
                  <Route index element={<HostCategoriesQuesitonsView />} />
                </Route>

                <Route path="questionbank/questions/create" element={<AppOP />}>
                  <Route index element={<HostCategoriesQuestionsCreate />} />
                </Route>

                <Route path="questionbank/questions/edit" element={<AppOP />}>
                  <Route index element={<HostCategoriesQuestionsEdit />} />
                </Route>

                {/* Host Profile */}
                <Route path="profile" element={<AppOP />}>
                  <Route index element={<HostProfile />} />
                </Route>

                {/* Host Users Routes - Admin Only */}
                {/* <Route path="users/view" element={
                  <AdminRoute>
                    <AppOP />
                  </AdminRoute>
                }>
                  <Route index element={<HostUsersView />} />
                </Route> */}
                <Route path="users/view" element={<AppOP />}>
                  <Route index element={<HostUsersView />} />
                </Route>

                {/* <Route path="users/edit/:id" element={
                  <AdminRoute>
                    <AppOP />
                  </AdminRoute>
                }>
                  <Route index element={<HostUsersEdit />} />
                </Route> */}
                <Route path="users/edit/:id" element={<AppOP />}>
                  <Route index element={<HostUsersEdit />} />
                </Route>
              </Route>

              {/* 404 Error Route */}
              <Route path="/error" element={<Error />} />
              <Route path="*" element={<AppError />}>
                <Route path="*" element={<Error />} />
              </Route>
            </Routes>
          </MessageProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
