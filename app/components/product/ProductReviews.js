"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { submitProductReviewAction } from "@/app/actions/reviews";

export default function ProductReviews({ productId, rating, reviewCount, breakdown, reviews, canReview }) {
  const [state, formAction, pending] = useActionState(
    async (_previousState, formData) => submitProductReviewAction(productId, formData),
    { ok: false, error: "" }
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.25fr]">
      <div className="space-y-6">
        <div className="rounded-lg border border-ink-100 p-6 text-center">
          <p className="text-sm font-medium text-ink-500">Based on {reviewCount} reviews</p>
          <p className="mt-2 text-5xl font-extrabold text-ink-900">{rating.toFixed(1)}</p>
          <div className="mt-3 flex items-center justify-center gap-1 text-brand-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-5 w-5"
                fill={index < Math.round(rating) ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-sm text-ink-600">{row.stars} Star</span>
              <div className="h-1.5 w-full rounded-full bg-ink-100">
                <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${row.percent}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-sm text-ink-500">{row.percent}%</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-ink-100 p-5">
          <h3 className="text-sm font-semibold text-ink-900">Write a review</h3>
          {canReview ? (
            <form action={formAction} className="mt-4 space-y-3">
              <select
                name="rating"
                required
                defaultValue=""
                className="block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="" disabled>
                  Choose rating
                </option>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <option key={stars} value={stars}>
                    {stars} star{stars === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
              <input
                name="title"
                maxLength={120}
                placeholder="Review title"
                className="block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <textarea
                name="comment"
                required
                minLength={8}
                rows={4}
                placeholder="What should other customers know?"
                className="block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              {state?.error && <p className="text-sm text-danger">{state.error}</p>}
              {state?.ok && <p className="text-sm font-medium text-green-600">Review saved.</p>}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
              >
                {pending ? "Saving..." : "Submit review"}
              </button>
            </form>
          ) : (
            <p className="mt-2 text-sm text-ink-500">
              <Link href="/login" className="font-medium text-brand-600 hover:underline">
                Log in
              </Link>{" "}
              to rate this product.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-ink-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink-900">{review.reviewer_name}</p>
                  {review.title && <p className="mt-1 text-sm font-medium text-ink-700">{review.title}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-0.5 text-brand-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4"
                      fill={index < Number(review.rating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-600">{review.comment}</p>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-ink-200 p-8 text-center">
            <p className="font-medium text-ink-900">No reviews yet</p>
            <p className="mt-1 text-sm text-ink-500">Be the first customer to share what you think.</p>
          </div>
        )}
      </div>
    </div>
  );
}
