ALTER TABLE animals ALTER COLUMN publication_date TYPE timestamp(6) USING publication_date::timestamp;
ALTER TABLE animals ALTER COLUMN publication_date SET DEFAULT timezone('utc', now());
