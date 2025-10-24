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

// ===== HOOKS ===== //
import { useAuth } from "@/context/useAuth";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

const Authentication = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialIsSignIn = params.get("mode") !== "register";
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
  const [isClosing, setIsClosing] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

      // Preserve ALL current search parameters when switching forms
      const currentParams = new URLSearchParams(location.search);

      // Update URL while preserving all parameters
      if (newSignInState) {
        currentParams.delete("mode");
        const queryString = currentParams.toString();
        const newUrl = queryString ? `/auth?${queryString}` : "/auth";
        navigate(newUrl, { replace: true });
      } else {
        currentParams.set("mode", "register");
        const queryString = currentParams.toString();
        const newUrl = `/auth?${queryString}`;
        navigate(newUrl, { replace: true });
      }
    }, 180);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await apiClient.post("/auth/signup", {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      toast.success(
        response.data?.message || "Account created! You can now login."
      );
      handleFormTransition(true);
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Registration failed.");
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/auth/login", {
        emailOrUsername: loginData.emailOrUsername,
        password: loginData.password,
      });
      const { user, token } = response.data;
      login({ user, token, type: "user" });

      const role = user.role;
      const isPrivilegedUser =
        role === "superadmin" || role === "admin" || role === "host";

      // Check for returnUrl parameter
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get("returnUrl");
      if (returnUrl) {
        setTimeout(() => {
          navigate(decodeURIComponent(returnUrl), { replace: true });
        }, 50);
      } else {
        navigate(isPrivilegedUser ? "/manage/events" : "/", {
          replace: true,
        });
      }
      setTimeout(() => {
        toast.success(response.data?.message || "Login successful!");
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Login failed.");
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      const response = await apiClient.post("/auth/guest-login");
      const { user, token } = response.data;
      login({ user, token, type: "guest" });

      // Check for returnUrl parameter
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get("returnUrl");
      setTimeout(() => {
        navigate(returnUrl ? decodeURIComponent(returnUrl) : "/", {
          replace: true,
        });
      }, 50);

      setTimeout(() => {
        toast.success(
          response.data.message || "Logged in as guest successfully."
        );
      }, 100);
    } catch (error) {
      console.error("Guest login error:", error);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((errMsg) => toast.error(errMsg));
      } else {
        toast.error(data?.message || "Guest login failed.");
      }
    }
  };

  return (
    <main className="flex-grow px-4 pt-6 pb-6 sm:px-12 md:px-20 lg:px-20 xl:px-50 2xl:px-80 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8">
        {/* ===== REGISTER CARD ===== */}
        {!isSignIn && (
          <Card
            className={`border-2 flex flex-col md:flex-row overflow-hidden min-h-[600px] mt-2 g-lg-0 py-0 gap-0 ${
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
                          minLength={4}
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
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
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
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
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
                        className="flex-1 font-semibold px-3 py-2 rounded-2 !bg-purple-500 hover:!bg-purple-600 !text-white !border-purple-700 dark:!border-purple-600 halftone-texture"
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
                      Login instead
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
            className={`border-2 flex flex-col md:flex-row overflow-hidden min-h-[600px] py-0 gap-0 ${
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
              </div>
            </div>

            {/* ===== FORM SECTION (RIGHT) ===== */}
            <div className="flex-1 bg-white dark:bg-zinc-900 p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Login</CardTitle>
                  <CardDescription>
                    Login to continue your boss battle adventures
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
                        className="flex-1 font-semibold px-4 py-2 rounded-2 !bg-blue-500 hover:!bg-blue-600 !text-white !border-blue-700 dark:!border-blue-600 halftone-texture"
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
