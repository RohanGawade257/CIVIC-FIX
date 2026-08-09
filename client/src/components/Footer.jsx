import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200/60 bg-white/50 backdrop-blur-md relative z-0">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                CF
              </div>
              <span className="font-extrabold text-xl text-gray-900">
                CivicFix<span className="text-blue-600">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
              Empowering citizens with AI-powered civic issue reporting, automated priority calculations, and transparent resolution tracking.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><Link to="/feed" className="hover:text-blue-600 transition-colors">CivicFeed Map</Link></li>
              <li><Link to="/reports/new" className="hover:text-blue-600 transition-colors">Report Issue</Link></li>
              <li><Link to="/reports/my" className="hover:text-blue-600 transition-colors">My Reports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><Link to="/login" className="hover:text-blue-600 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-blue-600 transition-colors">Create Account</Link></li>
              <li><Link to="/profile" className="hover:text-blue-600 transition-colors">Profile Preferences</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-gray-200/50 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} CivicFix AI. All rights reserved.</p>
          <p className="text-gray-400">Crafted with care for modern smart cities & engaged citizens.</p>
        </div>
      </div>
    </footer>
  );
}
