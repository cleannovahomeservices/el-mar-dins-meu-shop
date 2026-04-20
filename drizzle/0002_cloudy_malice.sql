CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(128) NOT NULL,
	`customerPhone` varchar(30) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`notes` text,
	`paymentMethod` enum('transferencia','enmà') NOT NULL,
	`totalPrice` int NOT NULL,
	`itemsJson` text NOT NULL,
	`isPaid` int NOT NULL DEFAULT 0,
	`isDelivered` int NOT NULL DEFAULT 0,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
