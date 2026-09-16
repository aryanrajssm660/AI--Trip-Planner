import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { Button, Input, Card } from "../../components/ui";
import {
  FaRoute,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaShieldAlt,
  FaRocket,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { values, errors, handleChange, handleBlur, isValid } =
    useFormValidation(
      {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      {
        name: {
          required: true,
          minLength: 2,
          maxLength: 50,
          pattern: /^[a-zA-Z\s'-]+$/,
          message:
            "Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes",
        },
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
          minLength: 8,
          validate: (value) => {
            if (!value) return "Password is required";
            if (value.length < 8) return "Password must be at least 8 characters";
            if (!/[a-z]/.test(value))
              return "Password must include at least one lowercase letter";
            if (!/[A-Z]/.test(value))
              return "Password must include at least one uppercase letter";
            if (!/\d/.test(value))
              return "Password must include at least one number";
            if (!/[@$!%*?&#^()_+\-=[\]{}|;:,.<>~]/.test(value))
              return "Password must include at least one special character (@$!%*?&#...)";
            return null;
          },
        },
        confirmPassword: {
          required: true,
          validate: (value, allValues) => {
            if (!allValues || !allValues.password) return null;
            return value === allValues.password
              ? null
              : "Passwords do not match";
          },
        },
      }
    );

  // Password criteria checklist
  const passwordCriteria = [
    { label: "8+ characters", met: (values.password || "").length >= 8 },
    { label: "Uppercase (A-Z)", met: /[A-Z]/.test(values.password || "") },
    { label: "Lowercase (a-z)", met: /[a-z]/.test(values.password || "") },
    { label: "Number (0-9)", met: /\d/.test(values.password || "") },
    {
      label: "Special character",
      met: /[@$!%*?&#^()_+\-=[\]{}|;:,.<>~]/.test(values.password || ""),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!isValid) return;

    setIsLoading(true);
    try {
      const result = await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      if (result.success) {
        navigate("/dashboard");
      } else if (result.message) {
        setServerError(result.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950/50 dark:to-gray-900 flex items-center justify-center py-6 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="hidden md:block absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex items-center justify-center"
        >
          <div className="w-full">
            <div className="text-center mb-6 hidden md:block">
              <motion.div
                className="flex justify-center mb-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg">
                    <FaRoute className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                AI Trip Planner
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create Your Account
              </p>
            </div>

            <Card className="p-4 md:p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl">
              {/* Server error alert banner */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2 text-red-700 dark:text-red-300 text-sm"
                  >
                    <FaExclamationCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="flex-1">{serverError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    name="name"
                    type="text"
                    label="Full Name"
                    placeholder="e.g. Alex Smith"
                    icon={FaUser}
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    required
                    className="py-2.5 text-sm"
                  />
                </div>

                <div>
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="e.g. alex@example.com"
                    icon={FaEnvelope}
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    required
                    className="py-2.5 text-sm"
                  />
                </div>

                <div>
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="Create a strong password"
                    icon={FaLock}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password}
                    required
                    className="py-2.5 text-sm"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    }
                  />

                  {/* Password requirements visual indicator */}
                  {values.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 p-2.5 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {passwordCriteria.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center space-x-1.5 transition-colors duration-150 ${
                              item.met
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                                item.met
                                  ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                                  : "bg-gray-200 dark:bg-gray-700 text-transparent"
                              }`}
                            >
                              <FaCheck />
                            </span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    icon={FaLock}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.confirmPassword}
                    required
                    className="py-2.5 text-sm"
                    rightElement={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    }
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-md transform active:scale-95 transition-all duration-200 py-3 text-base min-h-[48px]"
                  disabled={!isValid || isLoading}
                  loading={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline p-1"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </Card>

            {/* Trust Indicators */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <FaShieldAlt className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center">
                  <FaRocket className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                  <span>Free to Start</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
