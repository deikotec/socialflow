"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { IdeaGenerator } from "@/components/domain/content/idea-generator";
import { getContent } from "@/actions/content-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContentDashboardPage() {
  const { currentCompany, loading } = useAuth();
  const [contentList, setContentList] = useState<any[]>([]);

  const loadContent = async () => {
    if (currentCompany) {
      const data = await getContent(currentCompany.id);
      setContentList(data);
    }
  };

  useEffect(() => {
    loadContent();
  }, [currentCompany]);

  if (loading) return <div>Loading...</div>;

  if (!currentCompany) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">No Company Selected</h2>
        <p className="text-muted-foreground">
          Please select or create a company to manage content.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {currentCompany.name} Content
        </h1>
        <p className="text-muted-foreground">
          Generate ideas and manage your content pipeline.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">AI Idea Generator</h2>
        <IdeaGenerator onIdeaCreated={loadContent} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentList.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title || "Untitled"}
                </CardTitle>
                <Badge
                  variant={item.status === "approved" ? "default" : "secondary"}
                >
                  {item.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Topic: {item.topic}
                </p>
                <div className="text-sm">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
          {contentList.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No content found. Generate some ideas above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
