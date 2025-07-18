// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, VenetianMask } from "lucide-react";
import { toast } from "sonner";

// ===== COMPONENTS ===== //
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ===== CONTEXTS ===== //
import { useAuth } from "@/context/useAuth";
import { apiClient } from "@/api";

const Authentication = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial form state from URL
  const params = new URLSearchParams(location.search);
  const initialIsSignIn = params.get("mode") !== "register"; // true for login, false for register
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
  const [isClosing, setIsClosing] = useState(false); // State to track when form is closing
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Add this state
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loginData, setLoginData] = useState({
    emailOrUsername: "",
    password: "",
  });

  // Sync form state with URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsSignIn(params.get("mode") !== "register");
  }, [location.search]);

  // Function to handle form transitions with animation and update URL
  const handleFormTransition = (newSignInState) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsSignIn(newSignInState);
      setIsClosing(false);
      // Update URL
      if (newSignInState) {
        navigate("/auth", { replace: true });
      } else {
        navigate("/auth?mode=register", { replace: true });
      }
    }, 180); // Match this with your CSS animation duration
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await apiClient.post("/auth/signup", {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      toast.success("Account created! You can now sign in.");
      handleFormTransition(true);
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      let message = "Signup failed";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      toast.error(message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/auth/login", {
        email: loginData.emailOrUsername,
        password: loginData.password,
      });
      const data = response.data;
      if (!data.token || !data.user) {
        throw new Error("Invalid login response from server");
      }
      login({ accessToken: data.token, user: data.user });

      // Redirect based on user role
      if (data.user.role === "admin" || data.user.role === "host") {
        navigate("/host/events/view");
      } else {
        navigate("/");
      }
    } catch (err) {
      let message = "Login failed";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      toast.error(message);
    }
  };

  const handleGuestLogin = async () => {
    try {
      // Call backend to create a guest session
      const response = await apiClient.post("/auth/guest-login");
      const { token, user } = response.data;

      // Store guest token and user data in localStorage
      localStorage.setItem("guestToken", token);
      localStorage.setItem("guestUser", JSON.stringify(user));

      toast.success("Logging in as guest...");
      setTimeout(() => navigate("/"), 1000);
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
    <main className="flex-grow px-4 pt-6 pb-6 sm:px-12 md:px-20 lg:px-20 xl:px-50 2xl:px-80 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8">
        {/* ===== REGISTER CARD ===== */}
        {!isSignIn && (
          <Card
            className={`border-0 flex flex-col md:flex-row overflow-hidden min-h-[600px] mt-2 g-lg-0 py-0 gap-0 ${
              isClosing
                ? "animated-fadeOut-down-fast"
                : "animated-fadeIn-down-fast"
            }`}
          >
            {/* ===== BANNER SECTION (LEFT) ===== */}
            <div className="flex-1 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-6 flex flex-col justify-center text-white relative min-h-[160px] md:h-auto">
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full transform rotate-45"></div>
                <div className="absolute top-35 right-20 w-16 h-4 bg-orange-400 rounded-full transform rotate-12"></div>
                <div className="absolute bottom-32 left-16 w-24 h-6 bg-pink-400 rounded-full transform -rotate-12"></div>
                <div className="absolute bottom-20 right-10 w-18 h-5 bg-yellow-300 rounded-full transform rotate-45"></div>
              </div>

              <div className="relative z-10 p-0 lg:p-8">
                <h1 className="text-4xl font-bold mb-0 sm:mb-4">
                  Welcome to UniRAID
                </h1>
                {/* <p className="hidden md:block text-lg opacity-90 leading-relaxed">
                  Join epic boss battles with your fellow students! Create your account to participate in multiplayer boss fights and compete for glory in the ultimate university gaming experience.
                </p> */}
              </div>
            </div>

            {/* ===== FORM SECTION (RIGHT) ===== */}
            <div className="flex-1 bg-white dark:bg-zinc-900 p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Register</CardTitle>
                  <CardDescription>
                    Create your account to participate in boss battles
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-username"
                          name="username"
                          type="text"
                          placeholder="Enter your username"
                          value={registerData.username}
                          onChange={handleRegisterChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-password"
                          name="password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="register-confirmPassword">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={handleGuestLogin}
                      >
                        <VenetianMask className="w-4 h-4 mr-0" />
                        Login as Guest
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="flex-1 bg-zinc-900 dark:bg-zinc-750 text-white hover:text-white hover:bg-zinc-800 px-0 py-2 rounded-2"
                      >
                        Create Account
                      </Button>
                    </div>
                  </form>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <span
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => handleFormTransition(true)}
                    >
                      Sign in
                    </span>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        )}

        {/* ===== LOGIN CARD ===== */}
        {isSignIn && (
          <Card
            className={`border-0 flex flex-col md:flex-row overflow-hidden min-h-[600px] py-0 gap-0 ${
              isClosing
                ? "animated-fadeOut-down-fast"
                : "animated-fadeIn-down-fast"
            }`}
          >
            {/* ===== BANNER SECTION (LEFT) ===== */}
            <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 flex flex-col justify-center text-white relative min-h-[160px] md:h-auto">
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-400 rounded-full transform rotate-45"></div>
                <div className="absolute top-35 right-20 w-16 h-4 bg-blue-400 rounded-full transform rotate-12"></div>
                <div className="absolute bottom-32 left-16 w-24 h-6 bg-indigo-400 rounded-full transform -rotate-12"></div>
                <div className="absolute bottom-20 right-10 w-18 h-5 bg-cyan-300 rounded-full transform rotate-45"></div>
              </div>

              <div className="relative z-10 p-0 lg:p-8">
                <h1 className="text-4xl font-bold mb-0 sm:mb-4">
                  Welcome Back, Warrior!
                </h1>
                {/* <p className="hidden md:block text-lg opacity-90 leading-relaxed">
                  Ready for another epic boss battle? Sign back into UniRAID and rejoin your team to take on legendary bosses and claim victory!
                </p> */}
              </div>
            </div>

            {/* ===== FORM SECTION (RIGHT) ===== */}
            <div className="flex-1 bg-white dark:bg-zinc-900 p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Login</CardTitle>
                  <CardDescription>
                    Sign in to continue your boss battle adventures
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email or Username */}
                    <div className="space-y-2">
                      <Label htmlFor="login-emailOrUsername">
                        Email / Username
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="login-emailOrUsername"
                          name="emailOrUsername"
                          type="text"
                          placeholder="Enter your email or username"
                          value={loginData.emailOrUsername}
                          onChange={handleLoginChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="login-password"
                          name="password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password */}
                    {/* <div className="text-right">
                      <span className="text-sm text-primary cursor-pointer hover:underline">
                        Forgot password?
                      </span>
                    </div> */}

                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={handleGuestLogin}
                      >
                        <VenetianMask className="w-4 h-4 mr-0" />
                        Login as Guest
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="flex-1 bg-zinc-900 dark:bg-zinc-750 text-white hover:text-white hover:bg-zinc-800 px-6 py-2 rounded-2"
                      >
                        Login
                      </Button>
                    </div>
                  </form>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <span
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => handleFormTransition(false)}
                    >
                      Create account
                    </span>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
};

export default Authentication;
