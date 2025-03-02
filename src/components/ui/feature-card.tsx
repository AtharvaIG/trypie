
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, link, className }: FeatureCardProps) {
  return (
    <Link 
      to={link} 
      className={cn(
        "group block p-6 rounded-xl border border-border bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
