
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateTrip from "./pages/CreateTrip";
import Community from "./pages/Community";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { ClerkProvider } from "@clerk/clerk-react";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return currentUser ? <>{children}</> : <Navigate to="/" />;
};

const AppContent = () => {
  const { currentUser } = useAuth();
  
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/create-trip" element={
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />
        <Route path="/groups" element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        } />
        <Route path="/group-chat" element={
          <ProtectedRoute>
            <GroupChat />
          </ProtectedRoute>
        } />
        <Route path="/group-chat/:groupId" element={
          <ProtectedRoute>
            <GroupChat />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Use the provided key directly
const CLERK_PUBLISHABLE_KEY = "pk_test_cG9ldGljLXNwYXJyb3ctOTUuY2xlcmsuYWNjb3VudHMuZGV2JA";

const App = () => (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
