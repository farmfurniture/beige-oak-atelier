"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DeliveryCheckerProps {
  onCheck?: (pincode: string) => Promise<{
    available: boolean;
    message: string;
    estimatedDays?: number;
  }>;
}

export default function DeliveryChecker({ onCheck }: DeliveryCheckerProps) {
  const [pincode, setPincode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    available: boolean;
    message: string;
    estimatedDays?: number;
  } | null>(null);

  const handleCheck = async () => {
    if (!pincode || pincode.length !== 6) {
      setResult({
        available: false,
        message: "Please enter a valid 6-digit pincode",
      });
      return;
    }

    setIsChecking(true);
    setResult(null);

    try {
      if (onCheck) {
        const deliveryResult = await onCheck(pincode);
        setResult(deliveryResult);
      } else {
        // Mock delivery check for demo
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setResult({
          available: true,
          message: "Delivery available",
          estimatedDays: 7,
        });
      }
    } catch (error) {
      setResult({
        available: false,
        message: "Unable to check delivery. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-background">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Check Delivery Code
      </h3>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter pincode"
          value={pincode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(value);
            setResult(null);
          }}
          maxLength={6}
          className="flex-1"
        />
        <Button
          onClick={handleCheck}
          disabled={isChecking || pincode.length !== 6}
          className="px-6 bg-primary hover:bg-primary/90"
        >
          {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </Button>
      </div>

      {result && (
        <div
          className={cn(
            "mt-3 flex items-start gap-2 text-sm p-3 rounded-md",
            result.available
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          )}
        >
          {result.available ? (
            <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
          ) : (
            <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">{result.message}</p>
            {result.available && result.estimatedDays && (
              <p className="text-xs mt-1 opacity-80">
                Expected delivery in {result.estimatedDays} business days
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Enter your pincode to check product availability and delivery options
      </p>
    </div>
  );
}
