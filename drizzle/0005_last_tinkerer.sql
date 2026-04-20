CREATE TABLE `pickupPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`type` enum('entitat','associacio','botiga','altra') NOT NULL,
	`address` text NOT NULL,
	`city` varchar(128) NOT NULL,
	`postalCode` varchar(10) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`email` varchar(320) NOT NULL,
	`contactPerson` varchar(128) NOT NULL,
	`description` text,
	`website` varchar(512),
	`openingHours` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pickupPoints_id` PRIMARY KEY(`id`)
);
