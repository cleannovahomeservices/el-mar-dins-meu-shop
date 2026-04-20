CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`location` varchar(128),
	`rating` int NOT NULL DEFAULT 5,
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
