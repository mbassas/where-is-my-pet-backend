ALTER TABLE animals ALTER COLUMN publication_date TYPE timestamptz(6) USING publication_date::timestamptz;
ALTER TABLE animals ALTER COLUMN publication_date SET DEFAULT now();