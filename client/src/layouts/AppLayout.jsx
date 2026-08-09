import React from "react";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import { PageTransition } from "../components/ui/Motion.jsx";

export function AppLayout({ children, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col relative bg-[#F7F9FC] text-gray-900 selection:bg-blue-500 selection:text-white">
      {/* Ambient background light orbs per UI-UX.md Section 3.1 & 106 */}
      <div className="bg-ambient-blob-1 top-[-100px] left-[-100px] opacity-70" />
      <div className="bg-ambient-blob-2 top-[30%] right-[-150px] opacity-60" />
      <div className="bg-ambient-blob-1 bottom-[10%] left-[20%] opacity-40" />

      {/* Floating Dynamic Island Navbar */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
