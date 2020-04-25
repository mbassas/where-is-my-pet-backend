SELECT 
ab.value 
FROM animal_breed ab 
    left join animal_species aspec on ab.species = aspec.id
where 
aspec.value=$1;