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
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [adminCode, setAdminCode] = useState("");
  const [showAdminField, setShowAdminField] = useState(isAdminFlow);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Location search state & debounced Nominatim search
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = React.useRef(null);

  const handleLocationInputChange = (val) => {
    setLocationAddress(val);
    setLocationCoordinates(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearchingLoc(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingLoc(false);
      }
    }, 400);
  };

  const handleSelectLocation = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setLocationCoordinates([lon, lat]);
    setLocationAddress(place.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
      if (locationCoordinates && locationCoordinates.length === 2) {
        payload.preferredLocation = {
          locality: locationAddress,
          coordinates: locationCoordinates,
        };
      }
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

            {/* Location Autocomplete Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Neighborhood / Area Location
                {isSearchingLoc && (
                  <span className="ml-2 text-xs text-blue-500 font-normal">Searching…</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => handleLocationInputChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Type your area or city (e.g. Goa, Panaji, FC Road Pune)"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/70 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                />
                {isSearchingLoc && (
                  <div className="absolute right-3 top-3.5">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin block" />
                  </div>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                  {suggestions.map((place) => (
                    <li
                      key={place.place_id}
                      onMouseDown={() => handleSelectLocation(place)}
                      className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-900 font-medium leading-snug truncate">
                          {place.name || place.display_name.split(",")[0]}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{place.display_name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {locationCoordinates && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Geocoded: [{locationCoordinates[1].toFixed(4)}°, {locationCoordinates[0].toFixed(4)}°]</span>
                </div>
              )}
            </div>

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
