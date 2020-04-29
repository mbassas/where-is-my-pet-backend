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
    al.location,
    al.lng,
    al.lat,
    ai.image_name
    
from animals a
    left join animal_species aspec on a.species = aspec.id
    left join animal_breed ab on a.breed = ab.id
    left join animal_status astat on a.status = astat.id
    left join animal_size asize on a.size = asize.id
    left join animal_gender ag on a.gender = ag.id
    left join animal_images ai on ai.animal_id = a.id
    left join animal_location al on a.location_id = al.id

where
	a.id=$1