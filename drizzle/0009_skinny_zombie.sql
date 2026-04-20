CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`stripePaymentIntentId` varchar(256) NOT NULL,
	`stripeCustomerId` varchar(256),
	`stripeSessionId` varchar(256),
	`status` enum('pending','succeeded','failed','canceled') NOT NULL DEFAULT 'pending',
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'eur',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('transferencia','enmà','stripe') NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `pickupPointId` int;