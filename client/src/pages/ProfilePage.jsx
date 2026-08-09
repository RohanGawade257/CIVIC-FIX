import React, { useState } from "react";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text } from "../components/ui/Typography.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { updateCurrentUser } from "../services/authApi.js";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [locality, setLocality] = useState(user?.preferredLocation?.locality || "Pune Central");
  const [statusUpdates, setStatusUpdates] = useState(user?.notificationPreferences?.statusUpdates ?? true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateCurrentUser({
        preferredLocation: { locality },
        notificationPreferences: { statusUpdates },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      alert("Failed to update profile preferences.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        <div>
          <Heading1>Citizen Profile & Preferences</Heading1>
          <Text className="mt-1 text-gray-600">Manage your preferred locality and notification settings.</Text>
        </div>

        {isSaved && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-sm font-semibold animate-fadeIn">
            ✓ Profile preferences successfully saved!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Card variant="clay" className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Account Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <span className="text-gray-400 block text-xs">NAME</span>
                <span className="font-bold text-gray-800">{user?.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">EMAIL</span>
                <span className="font-bold text-gray-800">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">ROLE</span>
                <span className="font-bold text-blue-600">{user?.role}</span>
              </div>
            </div>
          </Card>

          <Card variant="neumorphic" className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Locality Preferences</h3>
            <Input
              label="Preferred locality"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              helperText="Used to personalize your CivicFeed and notifications"
            />
          </Card>

          <Card variant="neumorphic" className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Notification Settings</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={statusUpdates}
                onChange={(e) => setStatusUpdates(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-800">
                Receive status update alerts when officials respond to your reports
              </span>
            </label>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" variant="primary" size="lg" className="w-full rounded-2xl">
              Save profile
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={logout} className="w-full text-red-600 hover:bg-red-50 rounded-2xl">
              Logout
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
