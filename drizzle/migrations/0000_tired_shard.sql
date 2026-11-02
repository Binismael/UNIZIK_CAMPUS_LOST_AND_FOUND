CREATE TABLE "claims" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"claimant_email" text NOT NULL,
	"proof_text" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT now() NOT NULL,
	"decided_at" text
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"finder_email" text NOT NULL,
	"photo" text,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"colors" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"marks" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"location" text NOT NULL,
	"status" text DEFAULT 'found' NOT NULL,
	"found_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"email" text PRIMARY KEY NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"admission_number" text,
	"faculty" text DEFAULT '' NOT NULL,
	"department" text DEFAULT '' NOT NULL,
	"level" text DEFAULT '' NOT NULL,
	"residence" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"profile_complete" boolean DEFAULT false NOT NULL,
	"match_alerts" boolean DEFAULT true NOT NULL,
	"notifications" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_admission_number_unique" UNIQUE("admission_number")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"reporter_email" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "profiles" ("email","full_name","admission_number","faculty","department","level","residence","phone","profile_complete") VALUES
('ada.okafor@unizik.edu.ng','Ada Okafor','2021/LAW/0142','Law','Law','300','Aroma Hostel','08031234567',true),
('tobe.nwosu@unizik.edu.ng','Tobe Nwosu','2020/ENG/0311','Engineering','Electrical Engineering','400','Off campus','08059876543',true),
('ifeoma.eze@unizik.edu.ng','Ifeoma Eze','2022/SCI/0087','Physical Sciences','Computer Science','200','Female Hostel A','07062223344',true);
--> statement-breakpoint
INSERT INTO "items" ("id","finder_email","title","category","colors","brand","marks","summary","location","status","found_at") VALUES
('seed-charger-dell','tobe.nwosu@unizik.edu.ng','Black Dell charger','Chargers',ARRAY['Black'],'Dell','blue tape','Dell laptop charger with blue tape wrapped near the brick','Block C, Engineering','found',(now() - interval '2 hours')::text),
('seed-phone-cracked','ifeoma.eze@unizik.edu.ng','Phone, cracked screen','Phones',ARRAY['Blue'],'','cracked corner','Smartphone in a blue case, top corner of the screen is cracked','Library, 2nd floor','found',(now() - interval '5 hours')::text),
('seed-student-id','ada.okafor@unizik.edu.ng','Student ID card','IDs',ARRAY['Green'],'','Law faculty','Student ID card on a green lanyard, Law faculty','Main gate','found',(now() - interval '1 day')::text),
('seed-umbrella','ifeoma.eze@unizik.edu.ng','Black umbrella','Other',ARRAY['Black'],'','Wooden handle','Black folding umbrella with a wooden handle','Lecture hall 3','found',(now() - interval '1 day 3 hours')::text),
('seed-hp-charger','ada.okafor@unizik.edu.ng','Laptop charger','Chargers',ARRAY['Black'],'HP','','Black HP laptop charger, round pin','Library, ground floor','found',(now() - interval '3 days')::text),
('seed-phone-charger','tobe.nwosu@unizik.edu.ng','Phone charger','Chargers',ARRAY['Black'],'','braided cable','Black USB-C phone charger with braided cable','Hostel B gate','found',(now() - interval '4 days')::text),
('seed-textbook','tobe.nwosu@unizik.edu.ng','Engineering Mathematics textbook','Books',ARRAY['Red'],'K.A. Stroud','name torn off cover','Red Engineering Mathematics textbook, 7th edition, highlighted pages','Faculty of Engineering lecture theatre','found',(now() - interval '2 days')::text),
('seed-airpods','ada.okafor@unizik.edu.ng','White earbuds case','Phones',ARRAY['White'],'Apple','sticker on lid','White AirPods case with a small star sticker on the lid','Student Affairs office','found',(now() - interval '6 hours')::text);
