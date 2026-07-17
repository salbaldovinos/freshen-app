CREATE TABLE `births` (
	`id` text PRIMARY KEY NOT NULL,
	`breeding_record_id` text NOT NULL,
	`birth_date` text NOT NULL,
	`does_count` integer NOT NULL,
	`bucks_count` integer NOT NULL,
	`stillborn_count` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`breeding_record_id`) REFERENCES `breeding_records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `breeding_records` (
	`id` text PRIMARY KEY NOT NULL,
	`animal_name` text NOT NULL,
	`sire_name` text,
	`pairing_date` text NOT NULL,
	`species` text NOT NULL,
	`gestation_days` integer NOT NULL,
	`notes` text,
	`color` text DEFAULT 'gray' NOT NULL,
	`photo_url` text,
	`confirmed_pregnant` integer DEFAULT false NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
