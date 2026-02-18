import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import gpayQr from "@/assets/gpay-qr.jpeg";

const UPI_ID = "narenbachina22@okhdfcbank";

export function SupportSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy UPI ID");
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="shadow-card border-border/50 w-full max-w-md">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">

          {/* Mission text */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our domain and database costs are increasing.
            If Team Dino has helped you in your exam preparation,
            consider supporting us so we can keep everything free
            for all students.
          </p>

          {/* QR Code */}
          <div className="rounded-xl overflow-hidden bg-background p-3 shadow-lg">
            <img
              src={gpayQr}
              alt="UPI QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
            />
          </div>

          {/* UPI ID with copy */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-3 w-full justify-center">
            <span className="font-mono text-sm sm:text-base break-all">
              {UPI_ID}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="shrink-0 h-8 w-8"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Helper text */}
          <p className="text-sm text-muted-foreground">
            Copy the UPI ID and paste it in your preferred UPI app
            to complete your support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

