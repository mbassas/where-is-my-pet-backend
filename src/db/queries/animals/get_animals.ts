export interface IGetAnimalQueryParams {
    start?: number;
    count?: number;
    species?: number;
    breed?: number;
    lat?: number;
    lng?: number;
    status?: string;
}

function getAnimalsQuery({
    start = 0,
    count = 10,
    species = undefined,
    breed = undefined,
    lat = undefined,
    lng = undefined,
    status = undefined
}: IGetAnimalQueryParams) {
    let query = `
select
    a.id,
    a.user_id,
    astat.value as status,
    aspec.value as species,
    ab.value as breed,
    asize.value as size,
    a.color,
    a.name,
    ag.value as gender,
    a.age,
    a.publication_date,
    al.id as location_id,
    al.location,
    al.lng,
    al.lat,
    ai.image_name,
    a.recovered
    ${(lat && lng) ? `, calculate_distance(al.lat, al.lng, ${lat}, ${lng}) as distance` : ""}
from animals a
    left join animal_species aspec on a.species = aspec.id
    left join animal_breed ab on a.breed = ab.id
    left join animal_status astat on a.status = astat.id
    left join animal_size asize on a.size = asize.id
    left join animal_gender ag on a.gender = ag.id
    left join animal_images ai on ai.animal_id = a.id
    left join animal_location al on a.location_id = al.id
WHERE
    a.published = TRUE`;

    const hasWhere = species || breed || status;
    if (hasWhere) {
        query += `\nAND`;
    }

    if (species) {
        query += `\n  aspec.value = '${species}' AND`;
    }

    if (breed) {
        query += `\n  ab.value = '${breed}' AND`;
    }

    if (status) {
        query += `\n  astat.value = '${status}' AND`;
    }

    if (hasWhere) {
        query = query.replace(/AND$/, "");
    }

    if (lat && lng) {
        query += `\nORDER BY distance ASC`
    }

    query += `\nLIMIT ${count} OFFSET ${start}`;

    return query;
};
export default getAnimalsQuery;