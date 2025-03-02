
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, LogIn } from "lucide-react";
import { useInView } from "@/lib/animations";

type AuthFormProps = {
  type: "login" | "register";
};

export function AuthForm({ type }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { ref, isInView } = useInView();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };
  
  return (
    <div 
      ref={ref}
      className={`w-full max-w-md mx-auto p-8 rounded-xl glass-morphism transition-all duration-500 ${
        isInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold font-display">
          {type === "login" ? "Welcome Back" : "Create Your Account"}
        </h3>
        <p className="text-muted-foreground mt-1">
          {type === "login" 
            ? "Sign in to continue your journey" 
            : "Join Wanderly to start your travel adventure"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "register" && (
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        {type === "login" && (
          <div className="flex justify-end">
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>
        )}
        
        <Button type="submit" className="w-full button-glow group">
          {type === "login" ? "Sign In" : "Create Account"}
          <LogIn size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-muted-foreground">OR CONTINUE WITH</span>
        </div>
      </div>
      
      <Button variant="outline" className="w-full" type="button">
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhjLS43IDIuMS0yLjggMy42LTUuMyAzLjZhNS44IDUuOCAwIDAxLTUuNC0zLjlBNS44IDUuOCAwIDAxNC42IDUuOSA1LjggNS44IDAgMDE5IDIuOWEzLjEgMy4xIDAgMDEyLjIuOWw2LjQtNi40QTkgOSAwIDAwOSAwYTkgOSAwIDAwLTkgOSA5IDkgMCAwMDkgOWMzLjcgMCAzLjQtMS4zIDQuNy0xLjlsMy4zLTIuN3oiIGZpbGw9IiM0Mjg1RjQiLz48cGF0aCBkPSJNOS4yIDE4YTkgOSAwIDAwNi4zLTIuNWwtMy4xLTIuNEE1LjggNS44IDAgMDEzLjkgOUg5LjJWMTh6IiBmaWxsPSIjMzRBODUzIi8+PHBhdGggZD0iTTMuOSA5YTUuOCA1LjggMCAwMTAtMy4yVjIuM0gwQTkgOSAwIDAwMCA5aDMuOXoiIGZpbGw9IiNGQkJDMDUiLz48cGF0aCBkPSJNOS4yIDBhNS4xIDUuMSAwIDAxMy42IDEuNGwtMi43IDIuN2E3LjIgNy4yIDAgMDAtMi41LS40IDUuOCA1LjggMCAwMC01LjQgMy45SDBBOSA5IDAgMDE5LjIgMHoiIGZpbGw9IiNFQTQzMzUiLz48L2c+PC9zdmc+" 
          alt="Google"
          className="mr-2 h-4 w-4"
        />
        Sign in with Google
      </Button>
      
      <p className="text-center mt-6 text-sm text-muted-foreground">
        {type === "login" ? (
          <>
            Don't have an account?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Sign in
            </a>
          </>
        )}
      </p>
    </div>
  );
}
