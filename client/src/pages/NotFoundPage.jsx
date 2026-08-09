import React from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { Heading1, Text } from "../components/ui/Typography.jsx";
import { Button } from "../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <AppLayout showFooter={false}>
      <div className="py-24 text-center max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center font-mono font-extrabold text-2xl shadow-inner">
          404
        </div>
        <Heading1>Page Not Found</Heading1>
        <Text className="text-gray-600">
          The page or civic report you're looking for doesn't exist or has moved.
        </Text>
        <Link to="/" className="inline-block pt-2">
          <Button variant="primary" size="lg" className="rounded-2xl">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
