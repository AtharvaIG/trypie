
import React from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Signup = () => {
  const { currentUser } = useAuth();
  
  // Redirect to dashboard if already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Create Your Account</h1>
        <p className="text-center text-muted-foreground mb-8">
          Join TryPie today and start planning your adventures
        </p>
        <AuthForm type="register" />
      </div>
    </div>
  );
};

export default Signup;
