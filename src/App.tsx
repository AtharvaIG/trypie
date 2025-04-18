
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/navbar";
import { SimpleFooter } from "@/components/ui/simple-footer";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateTrip from "./pages/CreateTrip";
import Community from "./pages/Community";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import JoinGroup from "./pages/JoinGroup";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>;
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

// HomeRoute that redirects to dashboard if logged in
const HomeRoute = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>;
  
  return currentUser ? <Navigate to="/dashboard" /> : <Index />;
};

// Footer that only shows on non-home pages
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Don't show the footer on the home page as it has its own footer
  if (location.pathname === '/') return null;
  
  return <SimpleFooter />;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <Route path="/join-group/:groupId" element={
          <ProtectedRoute>
            <JoinGroup />
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
      <ConditionalFooter />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-right" className="z-50" toastOptions={{ duration: 3000 }} />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
