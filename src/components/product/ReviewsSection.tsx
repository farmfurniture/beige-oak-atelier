"use client";

import { useState } from "react";
import { Star, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type Review, type ReviewSummary } from "@/models/ProductDetail";

interface ReviewsSectionProps {
  reviews: Review[];
  reviewSummary: ReviewSummary;
  onSubmitReview?: (review: {
    rating: number;
    title: string;
    content: string;
    displayName: string;
    email?: string;
  }) => void;
}

export default function ReviewsSection({
  reviews,
  reviewSummary,
  onSubmitReview,
}: ReviewsSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    title: "",
    content: "",
    displayName: "",
    email: "",
  });

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  const handleSubmitReview = () => {
    if (onSubmitReview && selectedRating > 0) {
      onSubmitReview({
        rating: selectedRating,
        ...reviewForm,
      });
      // Reset form
      setSelectedRating(0);
      setReviewForm({
        title: "",
        content: "",
        displayName: "",
        email: "",
      });
    }
  };

  return (
    <section id="reviews" className="py-12 bg-secondary/10 scroll-mt-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Customer Reviews
        </h2>

        {/* Rating Summary */}
        <div className="bg-background rounded-xl p-6 mb-8 border border-border">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground mb-2">
                  {reviewSummary.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(reviewSummary.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < reviewSummary.averageRating
                          ? "fill-yellow-200 text-yellow-400"
                          : "fill-none text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {reviewSummary.totalReviews.toLocaleString("en-IN")} Verified
                  Reviews
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  reviewSummary.distribution[
                    rating as keyof typeof reviewSummary.distribution
                  ];
                const percentage = (count / reviewSummary.totalReviews) * 100;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Button */}
          <div className="mt-6 pt-6 border-t border-border">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Star Rating Picker */}
                  <div>
                    <Label>Your Rating *</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setSelectedRating(rating)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              "h-8 w-8",
                              rating <= (hoveredRating || selectedRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-none text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <Label htmlFor="review-title">Review Title *</Label>
                    <Input
                      id="review-title"
                      placeholder="Sum up your experience"
                      value={reviewForm.title}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, title: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  {/* Review Content */}
                  <div>
                    <Label htmlFor="review-content">Your Review *</Label>
                    <Textarea
                      id="review-content"
                      placeholder="Share your thoughts about this product..."
                      value={reviewForm.content}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          content: e.target.value,
                        })
                      }
                      rows={5}
                      className="mt-2"
                    />
                  </div>

                  {/* Display Name */}
                  <div>
                    <Label htmlFor="display-name">Display Name *</Label>
                    <Input
                      id="display-name"
                      placeholder="Enter your name"
                      value={reviewForm.displayName}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          displayName: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={reviewForm.email}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, email: e.target.value })
                      }
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll never share your email with anyone else
                    </p>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-secondary/20 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">
                      Review Guidelines
                    </p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        Focus on the product's features and your experience
                      </li>
                      <li>Be specific and honest</li>
                      <li>Avoid inappropriate language</li>
                    </ul>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={
                        selectedRating === 0 ||
                        !reviewForm.title ||
                        !reviewForm.content ||
                        !reviewForm.displayName
                      }
                      className="flex-1"
                    >
                      Submit Review
                    </Button>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </DialogTrigger>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-background rounded-xl p-6 border border-border"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {review.authorInitial}
                </div>

                <div className="flex-1">
                  {/* Author and Date */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {review.author}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-none text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.date}
                    </span>
                  </div>

                  {/* Review Title */}
                  <h5 className="font-semibold text-foreground mb-2">
                    {review.title}
                  </h5>

                  {/* Review Content */}
                  <p className="text-muted-foreground leading-relaxed">
                    {review.content}
                  </p>

                  {/* Helpful Count */}
                  {review.helpful > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      {review.helpful} people found this helpful
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More/Less Toggle */}
        {reviews.length > 2 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="px-8"
            >
              {showAllReviews ? (
                <>
                  View Less
                  <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  View More ({reviews.length - 2} more reviews)
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
