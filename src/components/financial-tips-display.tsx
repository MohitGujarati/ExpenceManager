
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, RefreshCw } from "lucide-react";
import ReactMarkdown from 'react-markdown'; // Import react-markdown

interface FinancialTipsDisplayProps {
  tips: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export function FinancialTipsDisplay({ tips, isLoading, onRegenerate }: FinancialTipsDisplayProps) {
  return (
    <Card className="min-h-[300px] flex flex-col"> {/* Ensure card takes up space */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                AI Financial Tips
            </CardTitle>
            <CardDescription>Personalized advice based on your data.</CardDescription>
        </div>
         <Button
            variant="ghost"
            size="icon"
            onClick={onRegenerate}
            disabled={isLoading}
            className="h-8 w-8"
         >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Regenerate Tips</span>
         </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center"> {/* Center content vertically */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[50%]" />
          </div>
        ) : tips ? (
           // Use ReactMarkdown to render tips with chat-like formatting
           <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
             <ReactMarkdown>{tips}</ReactMarkdown>
           </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Click the refresh button to generate financial tips.</p>
            <p className="text-xs">(Make sure you have transactions logged!)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
