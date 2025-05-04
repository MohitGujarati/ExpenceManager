
"use client";

import * as React from "react";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";

interface FinancialTipsDisplayProps {
  tips: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export function FinancialTipsDisplay({ tips, isLoading, onRegenerate }: FinancialTipsDisplayProps) {
  return (
    <Card className="min-h-[300px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Financial Tips
        </CardTitle>
        <CardDescription>Personalized insights based on your financial activity.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {isLoading ? (
          <div className="space-y-3 mt-2 flex-grow">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : tips ? (
           // Using react-markdown to render the tips which are expected in Markdown format
           // Added prose styles for better chat-like appearance
           <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-auto rounded-md border p-4 bg-muted/20">
             {tips}
           </ReactMarkdown>
        ) : (
          <div className="flex flex-grow flex-col items-center justify-center text-center text-muted-foreground">
             <Lightbulb className="h-10 w-10 mb-2" />
             <p>Click "Regenerate" to get your personalized financial tips.</p>
             <p className="text-xs mt-1">(Make sure you've added some transactions!)</p>
          </div>
        )}
         <Button
           onClick={onRegenerate}
           disabled={isLoading}
           variant="outline"
           size="sm"
           className="mt-4 self-start" // Align button to the start
         >
           <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
           {isLoading ? "Generating..." : "Regenerate Tips"}
         </Button>
      </CardContent>
    </Card>
  );
}
