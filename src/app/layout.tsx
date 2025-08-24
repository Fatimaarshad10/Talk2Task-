import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Talk2Task",
  description: "AI-powered productivity assistant that transforms voice and text into actionable tasks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-background text-foreground"
      >
        <AuthProvider>
          {/* Navbar at top */}
          <Navbar />

          {/* Toast notifications */}
          <Toaster position="top-right" />

          {/* Main content area */}
          <main className="flex-1 px-6 py-6">{children}</main>

          {/* Footer at bottom */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

