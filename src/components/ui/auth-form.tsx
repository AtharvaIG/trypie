
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuthFormProps {
  type?: "login" | "register";
}

export function AuthForm({ type = "login" }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(type);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, signInWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      await login(email, password);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      // Redirect to home page instead of dashboard
      navigate("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      await register(email, password);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Welcome to Wanderly!",
      });
      // Redirect to home page instead of dashboard
      navigate("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      
      toast({
        title: "Login successful",
        description: "Welcome to Wanderly!",
      });
      // Redirect to home page instead of dashboard
      navigate("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Google sign-in failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-border">
        <Tabs 
          defaultValue={type} 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "register")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email-login" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-login">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password-login" 
                    name="password" 
                    type="password" 
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : "Login"}
              </Button>
            </form>
            
            <div className="mt-6">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setActiveTab("register")}
                >
                  Register
                </button>
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="First Name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email-register" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-register">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password-register" 
                    name="password" 
                    type="password" 
                    placeholder="Create a password"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : "Create account"}
              </Button>
            </form>
            
            <div className="mt-6">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              type="button" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
