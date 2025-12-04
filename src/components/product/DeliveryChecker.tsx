"use client";

import { useState } from "react";
import { Check, X, Loader2, MapPin, Truck } from "lucide-react";
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
    <div className="w-full max-w-full border border-border/60 rounded-2xl p-4 md:p-6 bg-secondary/5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          Check Delivery Availability
        </h3>
      </div>

      <div className="w-full flex gap-2 md:gap-3">
        <div className="relative flex-1 min-w-0">
          <Input
            type="text"
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(value);
              setResult(null);
            }}
            maxLength={6}
            className="w-full h-12 rounded-xl border-border bg-background pl-4 text-base shadow-sm transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button
          onClick={handleCheck}
          disabled={isChecking || pincode.length !== 6}
          className="h-12 px-4 md:px-6 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-sm transition-all min-w-[80px] md:min-w-[100px] flex-shrink-0"
        >
          {isChecking ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check"}
        </Button>
      </div>

      {result && (
        <div
          className={cn(
            "mt-4 flex items-start gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300",
            result.available
              ? "bg-emerald-50/50 border-emerald-100 text-emerald-900 dark:bg-emerald-900/10 dark:border-emerald-900/20 dark:text-emerald-200"
              : "bg-red-50/50 border-red-100 text-red-900 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-200"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-full shrink-0",
            result.available ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"
          )}>
            {result.available ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-sm">{result.message}</p>
            {result.available && result.estimatedDays && (
              <p className="text-sm opacity-90 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                Estimated delivery by <span className="font-medium">{result.estimatedDays} business days</span>
              </p>
            )}
          </div>
        </div>
      )}

      {!result && (
        <p className="text-xs text-muted-foreground mt-3 ml-1">
          Enter your pincode to see estimated delivery date and shipping charges.
        </p>
      )}
    </div>
  );
}
