import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading2, Text } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({ name, email, password });
      navigate("/feed");
    } catch (err) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="max-w-md mx-auto py-12">
        <Card variant="clay" className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <Heading2>Join CivicFix AI</Heading2>
            <Text className="text-sm text-gray-600">Empower your neighborhood with smart civic reporting.</Text>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold animate-fadeIn">
              {error}
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
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full rounded-2xl">
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign in instead
            </Link>
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
