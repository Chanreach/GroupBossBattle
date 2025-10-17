// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Trophy,
  Target,
  Swords,
  Badge as BadgeIcon,
  QrCode,
  Heart,
  Shield,
  VenetianMask,
} from "lucide-react";
import { toast } from "sonner";
import { startConfettiCelebration } from "@/lib/Confetti";

// ===== COMPONENTS ===== //
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCarousel from "@/layouts/EventCarousel";
import {
  LiquidPillElement,
  LiquidCircleElement,
  LiquidFloatingElement,
} from "@/lib/LiquidParallax";

// ===== LIB ===== //
import IntersectionObserver, {
  useIntersectionObserver,
} from "@/lib/IntersectionObserver.jsx";

// ===== CONTEXTS ===== //
import { useAuth } from "@/context/useAuth";
import { apiClient } from "@/api/apiClient";

// ===== STYLES ===== //
import "@/index.css";

// ===== LANDING CONTENT COMPONENT ===== //
const LandingContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [logoClicked, setLogoClicked] = useState(false);
  const { registerSection, isVisible } = useIntersectionObserver();

  // ===== HANDLERS ===== //
  const handleLearnMore = () => {
    document.getElementById("howItWorks")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleLogoClick = async () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600);

    await startConfettiCelebration({
      origin: { x: 0.5, y: 0.3 },
      maxBursts: 1,
      burstInterval: 1500,
    });
  };

  const handleGuestLogin = async () => {
    try {
      // Call backend to create a guest session
      const response = await apiClient.post("/auth/guest-login");
      const { token, user } = response.data;
      console.log("Guest login response:", response.data);

      // Store guest token and user data in localStorage
      localStorage.setItem("guestToken", token);
      localStorage.setItem("guestUser", JSON.stringify(user));

      // Set the user in auth context immediately
      setUser(user);

      // Set authorization header for future requests
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Logged in as guest!");

      // Check for returnUrl parameter
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get("returnUrl");

      if (returnUrl) {
        setTimeout(() => navigate(decodeURIComponent(returnUrl)), 500);
      } else {
        setTimeout(() => navigate("/"), 500);
      }
    } catch (err) {
      let message = "Failed to create guest session";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      toast.error(message);
    }
  };

  return (
    <main className="flex-grow">
      {/* ===== HERO SECTION ===== */}
      <section
        ref={(el) => registerSection("hero", el)}
        id="hero"
        className={`relative min-h-screen overflow-hidden py-6 bg-[#f3f0ff] dark:bg-[#140f25] transition-all duration-1000 ease-out ${
          isVisible("hero")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {/* Liquid Parallax Decorative Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <LiquidPillElement
            className="absolute top-40 right-20 w-24 h-6 bg-blue-400 rounded-full transform rotate-12 blur-sm"
            intensity={1.2}
            delay={200}
            floatRange={12}
          />
          <LiquidPillElement
            className="absolute bottom-32 left-16 w-36 h-9 bg-pink-400 rounded-full transform -rotate-12"
            intensity={1.0}
            delay={400}
            floatRange={10}
          />
          <LiquidPillElement
            className="absolute bottom-20 right-10 w-28 h-8 bg-purple-300 rounded-full transform rotate-45"
            intensity={1.1}
            delay={600}
            floatRange={11}
          />
          <LiquidPillElement
            className="absolute bottom-40 right-1/4 w-20 h-5 bg-purple-400 rounded-full transform rotate-30"
            intensity={1.3}
            delay={500}
            floatRange={9}
          />
          <LiquidCircleElement
            className="absolute bottom-16 left-1/3 w-16 h-16 bg-purple-500 rounded-full blur-sm"
            intensity={1.3}
            delay={150}
            floatRange={22}
          />
          <LiquidCircleElement
            className="absolute top-72 left-12 w-8 h-8 bg-blue-400 rounded-full opacity-60 blur-md"
            intensity={2.2}
            delay={350}
            floatRange={18}
          />
          <LiquidCircleElement
            className="absolute bottom-60 right-16 w-12 h-12 bg-pink-400 rounded-full opacity-70 blur-sm"
            intensity={1.8}
            delay={450}
            floatRange={16}
          />
          <LiquidCircleElement
            className="absolute top-96 right-12 w-7 h-7 bg-purple-400 rounded-full opacity-50 blur-md"
            intensity={2.5}
            delay={550}
            floatRange={20}
          />
          <LiquidPillElement
            className="absolute top-72 left-20 w-32 h-6 bg-blue-300 rounded-full transform -rotate-15 blur-sm"
            intensity={0.9}
            delay={800}
            floatRange={13}
          />

          <LiquidPillElement
            className="absolute bottom-12 left-1/4 w-24 h-5 bg-pink-300 rounded-full transform -rotate-40 blur-md"
            intensity={1.0}
            delay={700}
            floatRange={10}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48">
          <div className="max-w-6xl mx-auto text-center w-full">
            {/* Main Hero Content */}
            <div
              className={`mb-12 sm:mb-12 transition-all duration-1000 ease-out delay-300 ${
                isVisible("hero")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Swords Image */}
              <div className="mb-0 sm:mb-0 flex justify-center">
                <img
                  src="https://em-content.zobj.net/source/microsoft-3D-fluent/406/crossed-swords_2694-fe0f.png"
                  alt="Crossed Swords"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain drop-shadow-lg cursor-pointer"
                  onClick={handleLogoClick}
                />
              </div>
              <h1 className="hero-text-gradient dark:text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-0 leading-tight">
                UniRAID
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-normal px-2">
                Scan. Team up. Battle epic bosses together!
              </p>
            </div>

            {/* Event Carousel */}
            <div
              className={`mb-8 sm:mb-14 transition-all duration-1000 ease-out delay-500 ${
                isVisible("hero")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <EventCarousel />
            </div>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-2 transition-all duration-1000 ease-out delay-700 ${
                isVisible("hero")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <Button
                onClick={() => navigate("/auth?mode=register")}
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold !bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-500 transition-all duration-300 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 group halftone-texture"
              >
                <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Register
              </Button>

              <Button
                onClick={handleGuestLogin}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 rounded-xl backdrop-blur-sm group bg-transparent"
              >
                <VenetianMask className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Login as Guest
              </Button>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto px-2">
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                  50
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Battles Fought
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                  3
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Epic Bosses
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                  123
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Unique Players
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section
        ref={(el) => registerSection("howItWorks", el)}
        id="howItWorks"
        className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-1000 ease-out ${
          isVisible("howItWorks")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div
            className={`text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 ease-out delay-200 ${
              isVisible("howItWorks")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Badge className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              How It Works
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white px-2">
              How to Join &
              <span className="pb-3 block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Battle
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Join live boss battles instantly with QR codes. Team up with other
              players and use your knowledge to defeat epic bosses together.
            </p>
          </div>

          {/* How It Works Steps */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 transition-all duration-1000 ease-out delay-400 ${
              isVisible("howItWorks")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Step 1 */}
            <Card className="relative overflow-hidden py-1 border-2 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="relative z-10 text-center pt-10 sm:pt-12 px-6 sm:px-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 border-2 rounded-2xl flex items-center justify-center">
                  <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                </div>
                <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm mx-auto inline-block">
                  Step 1
                </Badge>
                <CardTitle className="text-xl sm:text-2xl mb-0 sm:mb-0 text-gray-900 dark:text-white">
                  Scan QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-6 sm:px-8 pb-6">
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                  Simply scan the event QR code to instantly join a live boss
                  battle. No app downloads or complicated registration required!
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative overflow-hidden py-1 border-2 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="relative z-10 text-center pt-10 sm:pt-12 px-6 sm:px-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 border-2 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                </div>
                <Badge className="mb-3 sm:mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-sm mx-auto inline-block">
                  Step 2
                </Badge>
                <CardTitle className="text-xl sm:text-2xl mb-0 sm:mb-0 text-gray-900 dark:text-white">
                  Join Team
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-6 sm:px-8 pb-6">
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                  Enter your nickname and get automatically assigned to a team.
                  Battle starts when at least 2 players are ready!
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative overflow-hidden py-1 border-2 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="relative z-10 text-center pt-10 sm:pt-12 px-6 sm:px-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 border-2 rounded-2xl flex items-center justify-center">
                  <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                </div>
                <Badge className="mb-3 sm:mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm mx-auto inline-block">
                  Step 3
                </Badge>
                <CardTitle className="text-xl sm:text-2xl mb-0 sm:mb-0 text-gray-900 dark:text-white">
                  Battle Boss
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-6 sm:px-8 pb-6">
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                  Answer multiple-choice questions to deal damage! Fast correct
                  answers deal more damage. Work together to defeat the boss!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== GAME FEATURES SECTION ===== */}
      <section
        ref={(el) => registerSection("gameFeatures", el)}
        id="gameFeatures"
        className={`py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-all duration-1000 ease-out ${
          isVisible("gameFeatures")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div
            className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ease-out delay-200 ${
              isVisible("gameFeatures")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Badge className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Game Features
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white px-2">
              Epic Battle
              <span className="pb-3 block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mechanics
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Experience thrilling gameplay with our unique combination of
              teamwork, strategy, and knowledge-based combat.
            </p>
          </div>

          {/* Game Features Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 transition-all duration-1000 ease-out delay-400 ${
              isVisible("gameFeatures")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Hearts System */}
            <Card className="text-center p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 border-2 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hearts System</h3>
              <p className="text-sm text-muted-foreground">
                Start with 3 hearts. Wrong answers cost 1 heart. Get knocked out
                at 0, but teammates can revive you!
              </p>
            </Card>

            {/* Real-time Leaderboards */}
            <Card className="text-center p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 border-2 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Rankings</h3>
              <p className="text-sm text-muted-foreground">
                Track team and individual performance in real-time during
                battles with dynamic leaderboards.
              </p>
            </Card>

            {/* Badges & Rewards */}
            <Card className="text-center p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 border-2 rounded-lg flex items-center justify-center">
                <BadgeIcon className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Epic Badges</h3>
              <p className="text-sm text-muted-foreground">
                Earn special badges for defeating bosses, landing final blows,
                MVP performance, and milestone achievements.
              </p>
            </Card>

            {/* Team Revival */}
            <Card className="text-center p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 border-2 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Revival</h3>
              <p className="text-sm text-muted-foreground">
                Knocked out? Get a revival code and have teammates enter it to
                bring you back into the fight!
              </p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};

// ===== MAIN LANDING COMPONENT WITH PROVIDER ===== //
const Landing = () => {
  return (
    <IntersectionObserver initialVisible={["hero"]}>
      <LandingContent />
    </IntersectionObserver>
  );
};

export default Landing;
