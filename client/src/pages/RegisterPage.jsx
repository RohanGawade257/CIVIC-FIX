import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading2, Text } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const isAdminFlow = searchParams.get("role") === "admin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminField, setShowAdminField] = useState(isAdminFlow);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, user, isLoading } = useAuth();
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

    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    setLoading(true);

    try {
      const payload = { name, email, password };
      if (showAdminField && adminCode) payload.adminCode = adminCode;

      const newUser = await register(payload);
      navigate(newUser?.role === "ADMIN" ? "/admin" : "/feed", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to register account.");
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
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-3">
              <svg className="w-7 h-7 fill-none stroke-white" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <Heading2>
              {showAdminField ? "Administrator Registration" : "Join CivicFix AI"}
            </Heading2>
            <Text className="text-sm text-gray-600">
              {showAdminField
                ? "Enter your admin access code to register as a municipal administrator."
                : "Empower your neighborhood with smart civic reporting."}
            </Text>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold animate-fadeIn">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              placeholder="Minimum 12 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {showAdminField && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Admin Access Code Required</span>
                </div>
                <Input
                  label="Administrator Secret Code"
                  type="password"
                  placeholder="Enter admin secret code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full rounded-2xl">
              {showAdminField ? "Register as Administrator" : "Create Citizen Account"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign in instead
            </Link>
          </p>

          {!showAdminField && (
            <div className="border-t border-gray-100 pt-4 text-center">
              <button
                type="button"
                onClick={() => setShowAdminField(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                🔒 Register as Administrator
              </button>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
