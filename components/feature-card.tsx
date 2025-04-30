import type React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex flex-col items-center text-center">
      <CardHeader className="pb-2 flex items-center justify-center space-x-2">
        <div className="">{icon}</div>
        <h3 className="text-lg font-bold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
