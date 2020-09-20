DROP FUNCTION IF EXISTS insert_animal("int4","varchar","varchar","varchar","varchar","varchar","varchar","varchar","int4","float8","float8");
DROP FUNCTION IF EXISTS insert_animal("int4","varchar","varchar","varchar","varchar","varchar","varchar","varchar","int4","float8","float8","varchar");

CREATE OR REPLACE FUNCTION insert_animal(
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
    location VARCHAR,
    published BOOLEAN
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
    gender_id := (SELECT id FROM animal_gender WHERE value = gender);
    
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
        location_id,
        published
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
        location_id,
        published
    )
    RETURNING id into animal_id;

    RETURN animal_id;
END;
$$ LANGUAGE PLPGSQL;