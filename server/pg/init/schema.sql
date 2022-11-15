CREATE SCHEMA IF NOT EXISTS "cs6400";


SET search_path to "cs6400";

CREATE extension IF NOT exist cube WITH SCHEMA "cs6400";
CREATE extension IF NOT exist earthdistance WITH SCHEMA "cs6400";

CREATE TABLE IF NOT EXISTS "PostalAddress" (
	postal_code INTEGER NOT NULL PRIMARY KEY,
	city VARCHAR(256) NOT NULL,
	state CHAR(2) NOT NULL,
	latitude FLOAT NOT NULL,
	longitude FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
	email VARCHAR(256) NOT NULL UNIQUE,
	"password" VARCHAR(256) NOT NULL,
	first_name VARCHAR(256) NOT NULL,
	last_name VARCHAR(256) NOT NULL,
	nickname VARCHAR(256) NOT NULL UNIQUE,
	postal_code INTEGER NOT NULL,
	trades_completed INTEGER NOT NULL,

	CONSTRAINT "fk_User_addressId_Address_addressId"
  	FOREIGN KEY ("postal_code")
  	REFERENCES "PostalAddress" (postal_code)
  	ON DELETE NO ACTION
  	ON UPDATE CASCADE
);

DO $$ BEGIN
	CREATE TYPE condition AS ENUM ('Unopened', 'Like New', 'Lightly Used', 'Moderately Used', 'Heavily Used', 'Damaged/Missing parts');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	CREATE TYPE platform_name AS ENUM ('Nintendo', 'PlayStation', 'Xbox', 'Linux', 'macOS', 'Windows');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	CREATE TYPE game_type AS ENUM ('Playing Card Game', 'Board Game', 'Collectible Card Game', 'Video Game', 'Computer Game');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	CREATE TYPE media AS ENUM ('Optical disc', 'Game card', 'Cartridge');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Item" (
	item_no SERIAL PRIMARY KEY,
	title VARCHAR NOT NULL,
	"description" VARCHAR,
	condition condition NOT NULL,
	owner_email VARCHAR NOT NULL,
	Game_Type game_type NOT NULL,
	Num_Cards INTEGER,

CONSTRAINT "fk_Item_owner_email"
  	FOREIGN KEY ("owner_email")
  	REFERENCES "User" (email)
  	ON DELETE NO ACTION
  	ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS "Game_Platform"(
	platformId SERIAL PRIMARY KEY,
	Game_Type game_type NOT NULL,
	platform_name platform_name NOT NULL,
	Item_No Serial UNIQUE,
	Media media,

	CONSTRAINT "fk_Item_item_no"
  	FOREIGN KEY ("item_no")
  	REFERENCES "Item" (Item_No)
  	ON DELETE NO ACTION
  	ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Trade" (
	trade_id INTEGER GENERATED ALWAYS AS IDENTITY,
	proposal_date DATE NOT NULL,
	transaction_date DATE,
	pp_email VARCHAR(256) NOT NULL,
	cp_email VARCHAR(256) NOT NULL,
	proposed_item_no INTEGER NOT NULL,
	desired_item_no INTEGER NOT NULL,
	trade_status BOOLEAN DEFAULT NULL,

	CONSTRAINT "fk_User_cp_email"
  	FOREIGN KEY ("cp_email")
  	REFERENCES "User" (email)
  	ON DELETE NO ACTION
  	ON UPDATE CASCADE,

	CONSTRAINT "fk_User_pp_email"
  	FOREIGN KEY ("pp_email")
  	REFERENCES "User" (email)
  	ON DELETE NO ACTION
  	ON UPDATE CASCADE,

	CONSTRAINT "fk_Item_proposed_itemId"
  	FOREIGN KEY ("proposed_item_no")
  	REFERENCES "Item" (item_no)
  	ON DELETE NO ACTION
  	ON UPDATE CASCADE,

	CONSTRAINT "fk_Item_desired_itemId"
  	FOREIGN KEY ("desired_item_no")
  	REFERENCES "Item" (item_no)
  	ON DELETE NO ACTION
  	ON UPDATE CASCADE
);
