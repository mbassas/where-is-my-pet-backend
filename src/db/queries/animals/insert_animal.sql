
DO $$

DECLARE
    species_id INTEGER;
    state_id INTEGER;
    breeds_id INTEGER;
    size_id INTEGER;
    gender_id INTEGER;
BEGIN
    state_id := (SELECT id FROM state WHERE value = $2);
    species_id := (SELECT id FROM species WHERE value = $3);
    breeds_id := (SELECT id FROM breeds WHERE value = $4);
    size_id := (SELECT id FROM size WHERE value = $5);
    gender_id := (SELECT id FROM size WHERE value = $8);
    INSERT INTO animals (
        user_id
        state,
        species,
        breeds,
        size,
        color,
        name,
        gender,
        age,
        lat,
        lng,
        images
    ) 
    VALUES (
        $1,
        state_id, 
        species_id,
        breeds_id, 
        size_id,
        $6,
        $7,
        gender_id,
        $9,
        $10,
        $11,
        $12
    )
END $$
    


