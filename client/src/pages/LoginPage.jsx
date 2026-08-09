import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading2, Text } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/feed", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login({ email, password });
      navigate(loggedInUser?.role === "ADMIN" ? "/admin" : "/feed", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout showFooter={false}>
        <div className="max-w-md mx-auto py-12 text-center text-gray-500">Checking session…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="max-w-md mx-auto py-12">
        <Card variant="clay" className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <Heading2>Welcome Back</Heading2>
            <Text className="text-sm text-gray-600">Sign in to track your civic reports and updates.</Text>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold animate-fadeIn">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full rounded-2xl">
              Sign In to CivicFix
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create one now
            </Link>
          </p>

          <div className="border-t border-gray-100 pt-4 text-center">
            <Link to="/register?role=admin" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              🔒 Register as Administrator
            </Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
