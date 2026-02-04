"use client";

import { useState } from "react";
import { ContentPiece } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveContent, rejectContent } from "@/actions/portal-actions";
import { Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; // Ensure this exists or use Input for now
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PortalClientViewProps {
  initialContent: ContentPiece[];
  companyId: string;
}

export function PortalClientView({
  initialContent,
  companyId,
}: PortalClientViewProps) {
  const [contentList, setContentList] = useState(initialContent);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await approveContent(companyId, id);
      // Optimistic update
      setContentList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to approve", error);
      alert("Failed to approve content. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    try {
      await rejectContent(companyId, id, rejectFeedback);
      setContentList((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "rejected", feedback: rejectFeedback }
            : item,
        ),
      );
      setRejectFeedback("");
    } catch (error) {
      console.error("Failed to reject", error);
      alert("Failed to reject content. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contentList.map((item) => (
        <Card key={item.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg leading-tight mb-2">
                {item.title}
              </CardTitle>
              <Badge
                variant={
                  item.status === "approved"
                    ? "default" // "success" if you have a success variant
                    : item.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {item.status}
              </Badge>
            </div>
            <CardDescription>Topic: {item.topic}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
              {item.script}
            </div>
            {item.feedback && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                <strong>Feedback:</strong> {item.feedback}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 pt-4 border-t">
            {item.status === "review" && (
              <>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(item.id)}
                  disabled={loadingId === item.id}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={loadingId === item.id}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Content</DialogTitle>
                      <DialogDescription>
                        Please provide feedback on why this content is being
                        rejected so we can improve it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="e.g., The hook is too aggressive, change the tone..."
                        value={rejectFeedback}
                        onChange={(e) => setRejectFeedback(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => handleReject(item.id)}
                        disabled={!rejectFeedback || loadingId === item.id}
                      >
                        Confirm Rejection
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {item.status !== "review" && (
              <div className="text-sm text-center w-full text-muted-foreground italic">
                {item.status === "approved"
                  ? "Content approved for scheduling."
                  : "Content returned for revision."}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
      {contentList.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No content pending for review across the selected status.
        </div>
      )}
    </div>
  );
}
