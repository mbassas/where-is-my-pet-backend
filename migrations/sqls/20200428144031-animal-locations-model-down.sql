ALTER TABLE animals ADD COLUMN lat FLOAT;
ALTER TABLE animals ADD COLUMN lng FLOAT;

do $$
declare
	current_animal animals%ROWTYPE;
begin

    for current_animal in select * from animals a
    loop
        update animals set 
            lat = (select lat from animal_location WHERE id = current_animal.location_id),
            lng = (select lng from animal_location WHERE id = current_animal.location_id)
        where 
            id = current_animal.id;
end loop;
end;
$$ LANGUAGE PLPGSQL;

ALTER TABLE animals ALTER COLUMN lat set not null;
ALTER TABLE animals ALTER COLUMN lng set not null;

ALTER TABLE animals DROP COLUMN location_id;
DROP TABLE animal_location;

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
    lng FLOAT
) RETURNS INTEGER AS $$
DECLARE
    species_id INTEGER;
    state_id INTEGER;
    breed_id INTEGER;
    size_id INTEGER;
    gender_id INTEGER;
    animal_id INTEGER;
BEGIN
    state_id := (SELECT id FROM animal_status WHERE value = status);
    species_id := (SELECT id FROM animal_species WHERE value = species);
    breed_id := (SELECT id FROM animal_breed WHERE value = breed AND animal_breed.species = species_id);
    size_id := (SELECT id FROM animal_size WHERE value = size);
    gender_id := (SELECT id FROM animal_size WHERE value = gender);
    
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
        lat,
        lng
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
        lat,
        lng
    )
    RETURNING id into animal_id;

    RETURN animal_id;
END;
$$ LANGUAGE PLPGSQL;