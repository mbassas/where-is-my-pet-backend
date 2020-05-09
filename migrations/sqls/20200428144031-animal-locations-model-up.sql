CREATE TABLE animal_location
(
    id serial NOT NULL PRIMARY KEY,
    lat float8 NOT NULL,
    lng float8 NOT NULL,
    "location" varchar NULL,
    map_image oid NULL
);

ALTER TABLE animals ADD COLUMN location_id int4 REFERENCES animal_location(id) ON DELETE CASCADE;

do $$
declare
	last_location_inserted integer;
	current_animal animals%ROWTYPE;
begin
	
	for current_animal in select * from animals a
	loop
		insert into animal_location (lat, lng) values (current_animal.lat, current_animal.lng) returning id into last_location_inserted;
		update animals set location_id = last_location_inserted where id = current_animal.id;
	end loop;
end;
$$ LANGUAGE PLPGSQL;

ALTER TABLE animals DROP COLUMN lat;
ALTER TABLE animals DROP COLUMN lng;
ALTER TABLE animals ALTER COLUMN location_id SET NOT NULL;

CREATE OR REPLACE FUNCTION insert_animal (
    user_id INTEGER,
    status VARCHAR,
    species VARCHAR,
    breed VARCHAR,
    size VARCHAR,
    color VARCHAR,
    name VARCHAR,
    gender VARCHAR,
    age INTEGER,
    lat FLOAT,
    lng FLOAT,
    location VARCHAR
) RETURNS INTEGER AS $$
DECLARE
    species_id INTEGER;
    state_id INTEGER;
    breed_id INTEGER;
    size_id INTEGER;
    gender_id INTEGER;
    animal_id INTEGER;
    location_id INTEGER;
BEGIN
    state_id := (SELECT id FROM animal_status WHERE value = status);
    species_id := (SELECT id FROM animal_species WHERE value = species);
    breed_id := (SELECT id FROM animal_breed WHERE value = breed AND animal_breed.species = species_id);
    size_id := (SELECT id FROM animal_size WHERE value = size);
    gender_id := (SELECT id FROM animal_size WHERE value = gender);
    
    insert into animal_location (lat, lng, location) values (lat, lng, location) returning id into location_id;
    
    INSERT INTO animals (
        user_id,
        status,
        species,
        breed,
        size,
        color,
        name,
        gender,
        age,
        location_id
    ) 
    VALUES (
        user_id,
        state_id, 
        species_id,
        breed_id, 
        size_id,
        color,
        name,
        gender_id,
        age,
        location_id
    )
    RETURNING id into animal_id;

    RETURN animal_id;
END;
$$ LANGUAGE PLPGSQL;


