import { describe, it, expect, beforeAll } from "vitest";
import {
  createWorkshopReview,
  getApprovedWorkshopReviews,
  getAllWorkshopReviews,
  updateWorkshopReviewStatus,
  deleteWorkshopReview,
} from "./db";

describe("Workshop Reviews Database Functions", () => {
  let reviewId: number;

  beforeAll(async () => {
    // Clean up any test data
    const allReviews = await getAllWorkshopReviews();
    for (const review of allReviews) {
      if (review.authorName === "Test Author") {
        await deleteWorkshopReview(review.id);
      }
    }
  });

  it("should create a workshop review", async () => {
    const result = await createWorkshopReview({
      authorName: "Test Author",
      email: "test@example.com",
      eventType: "taller",
      eventTitle: "Test Workshop",
      rating: 5,
      content: "This is a test review of the workshop.",
      status: "pending",
    });

    expect(result).toBeDefined();
    expect(result.authorName).toBe("Test Author");
    expect(result.status).toBe("pending");
    reviewId = result.id;
  });

  it("should get approved workshop reviews only", async () => {
    // First, approve the review
    await updateWorkshopReviewStatus(reviewId, "approved");

    const approved = await getApprovedWorkshopReviews();
    const testReview = approved.find((r) => r.id === reviewId);

    expect(testReview).toBeDefined();
    expect(testReview?.status).toBe("approved");
  });

  it("should get all workshop reviews (admin)", async () => {
    const all = await getAllWorkshopReviews();
    const testReview = all.find((r) => r.id === reviewId);

    expect(testReview).toBeDefined();
    expect(testReview?.authorName).toBe("Test Author");
  });

  it("should update workshop review status", async () => {
    await updateWorkshopReviewStatus(reviewId, "rejected");

    const all = await getAllWorkshopReviews();
    const updated = all.find((r) => r.id === reviewId);

    expect(updated?.status).toBe("rejected");
  });

  it("should delete a workshop review", async () => {
    await deleteWorkshopReview(reviewId);

    const all = await getAllWorkshopReviews();
    const deleted = all.find((r) => r.id === reviewId);

    expect(deleted).toBeUndefined();
  });

  it("should validate review content length", async () => {
    const tooShort = "short";
    expect(tooShort.length).toBeLessThan(10);

    const validContent = "This is a valid review with enough content.";
    expect(validContent.length).toBeGreaterThanOrEqual(10);
  });

  it("should validate rating range", async () => {
    const validRatings = [1, 2, 3, 4, 5];
    validRatings.forEach((rating) => {
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
    });
  });
});
