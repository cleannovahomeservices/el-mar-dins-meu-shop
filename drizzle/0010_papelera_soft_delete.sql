ALTER TABLE `orders` ADD `deletedAt` timestamp NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `deletedAt` timestamp NULL;--> statement-breakpoint
ALTER TABLE `pickupPoints` ADD `deletedAt` timestamp NULL;--> statement-breakpoint
ALTER TABLE `workshopReviews` ADD `deletedAt` timestamp NULL;
