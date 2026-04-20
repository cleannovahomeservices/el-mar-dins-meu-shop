CREATE TABLE `workshopReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`email` varchar(320),
	`eventType` enum('taller','xerrada','presentacio','altra') NOT NULL,
	`eventTitle` varchar(256) NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workshopReviews_id` PRIMARY KEY(`id`)
);
