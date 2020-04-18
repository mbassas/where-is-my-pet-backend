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
    a.lat,
    a.lng,
    a.images
    
from animals a
    left join animal_species aspec on a.species = aspec.id
    left join animal_breed ab on a.breed = ab.id
    left join animal_status astat on a.status = astat.id
    left join animal_size asize on a.size = asize.id
    left join animal_gender ag on a.gender = ag.id

where
	a.id=$1