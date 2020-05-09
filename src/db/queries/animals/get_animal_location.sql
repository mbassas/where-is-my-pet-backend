SELECT *
FROM animal_location
WHERE id = (SELECT id FROM animals WHERE id = $1)