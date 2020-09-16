const updateAnimalQuery =
    "UPDATE animals SET recovered = $2 WHERE id = $1";

export default updateAnimalQuery;
