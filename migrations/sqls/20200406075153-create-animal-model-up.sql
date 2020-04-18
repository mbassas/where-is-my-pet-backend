
CREATE TABLE animal_species
(
    id serial PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

INSERT INTO animal_species (value) VALUES ('CAT'), ('DOG'), ('OTHER');

CREATE TABLE animal_breed
(
    id serial PRIMARY KEY,
    species int NOT NULL REFERENCES animal_species(id),
    value VARCHAR(255) NOT NULL
);

DO $$
DECLARE 
    dog_id INT;
    cat_id INT;
BEGIN
    dog_id := (SELECT id FROM animal_species WHERE value = 'DOG');
    cat_id := (SELECT id FROM animal_species WHERE value = 'CAT');

    INSERT INTO animal_breed(species, value) VALUES
        (dog_id, 'Labrador Retriever'),
        (dog_id, 'German Shepherd'),
        (dog_id, 'Golden Retriever'),
        (dog_id, 'Beagle'),
        (dog_id, 'English Bulldog'),
        (dog_id, 'Yorkshire Terrier'),
        (dog_id, 'Boxer'),
        (dog_id, 'Poodle'),
        (dog_id, 'Rottweiler'),
        (dog_id, 'Dachshund'),
        (dog_id, 'Shih Tzu'),
        (dog_id, 'Doberman Pinscher'),
        (dog_id, 'Miniature Schnazuer'),
        (dog_id, 'French Bulldog'),
        (dog_id, 'German Shorthaired Pointer'),
        (dog_id, 'Siberian Husky'),
        (dog_id, 'Great Dane'),
        (dog_id, 'Chihuahua'),
        (dog_id, 'Pomeranian'),
        (dog_id, 'Cavalier King Charles Spaniel'),
        (dog_id, 'Shetland Sheepdog'),
        (dog_id, 'Australian Shepherd'),
        (dog_id, 'Boston Terrier'),
        (dog_id, 'Pembroke Welsh Corgi'),
        (dog_id, 'Maltese'),
        (dog_id, 'English Mastiff'),
        (dog_id, 'Cocker Spaniel'),
        (dog_id, 'Havanese'),
        (dog_id, 'English Springer Spaniel'),
        (dog_id, 'Pug'),
        (dog_id, 'Brittany'),
        (dog_id, 'Weimaraner'),
        (dog_id, 'Bernese Mountain Dog'),
        (dog_id, 'Vizsla'),
        (dog_id, 'Collie'),
        (dog_id, 'West Highland White Terrier'),
        (dog_id, 'Papillon'),
        (dog_id, 'Bichon Frise'),
        (dog_id, 'Bullmastiff'),
        (dog_id, 'Basset Hound'),
        (dog_id, 'Rhodesian Ridgeback'),
        (dog_id, 'Newfoundland'),
        (dog_id, 'Russell Terrier'),
        (dog_id, 'Border Collie'),
        (dog_id, 'Akita'),
        (dog_id, 'Chesapeake Bay Retriever'),
        (dog_id, 'Miniature Pinscher'),
        (dog_id, 'Bloodhound'),
        (dog_id, 'Saint Bernard'),
        (dog_id, 'Shiba Inu'),
        (dog_id, 'Bull Terrier'),
        (dog_id, 'Chinese Shar-Pei'),
        (dog_id, 'Soft Coated Wheaten Terrier'),
        (dog_id, 'Airedale Terrier'),
        (dog_id, 'Portuguese Water Dog'),
        (dog_id, 'Whippet'),
        (dog_id, 'Alaskan Malamute'),
        (dog_id, 'Scottish Terrier'),
        (dog_id, 'Australian Cattle Dog'),
        (dog_id, 'Cane Corso'),
        (dog_id, 'Lhasa Apso'),
        (dog_id, 'Chinese Crested'),
        (dog_id, 'Cairn Terrier'),
        (dog_id, 'English Cocker Spaniel'),
        (dog_id, 'Dalmatian'),
        (dog_id, 'Italian Greyhound'),
        (dog_id, 'Dogue De Bordeaux'),
        (dog_id, 'Samoyed'),
        (dog_id, 'Chow Chow'),
        (dog_id, 'German Wirehaired Pointer'),
        (dog_id, 'Belgian Malinois'),
        (dog_id, 'Great Pyrenees'),
        (dog_id, 'Pekingese'),
        (dog_id, 'Irish Setter'),
        (dog_id, 'Cardigan Welsh Corgi'),
        (dog_id, 'Staffordshire Bull Terrier'),
        (dog_id, 'Irish Wolfhound'),
        (dog_id, 'Old English Sheepdog'),
        (dog_id, 'American Staffordshire Terrier'),
        (dog_id, 'Bouvier Des Flandres'),
        (dog_id, 'Greater Swiss Mountain Dog'),
        (dog_id, 'Japanese Chin'),
        (dog_id, 'Tibetan Terrier'),
        (dog_id, 'Brussles Griffon'),
        (dog_id, 'Wirehaired Pointing Griffon'),
        (dog_id, 'Border Terrier'),
        (dog_id, 'English Setter'),
        (dog_id, 'Basenji'),
        (dog_id, 'Standard Schnauzer'),
        (dog_id, 'Silky Terrier'),
        (dog_id, 'Flat Coated Retriever'),
        (dog_id, 'Norwich Terrier'),
        (dog_id, 'Afghan Hound'),
        (dog_id, 'Giant Schnauzer'),
        (dog_id, 'Borzoi'),
        (dog_id, 'Wire Fox Terrier'),
        (dog_id, 'Jack Russell Terrier'),
        (dog_id, 'Schipperke'),
        (dog_id, 'Gordon Setter'),
        (dog_id, 'Keeshond');
    
    INSERT INTO animal_breed (species, value) VALUES
        (cat_id, 'Tonkinese'),
        (cat_id, 'Turkish Van'),
        (cat_id, 'Himalayan'),
        (cat_id, 'American Shorthair'),
        (cat_id, 'Chartreux'),
        (cat_id, 'Burmilla'),
        (cat_id, 'Russian Blue'),
        (cat_id, 'Nebelung'),
        (cat_id, 'Sphynx'),
        (cat_id, 'Ragamuffin'),
        (cat_id, 'Turkish Angora'),
        (cat_id, 'Burmese'),
        (cat_id, 'Norwegian Forest'),
        (cat_id, 'Abyssinian'),
        (cat_id, 'Snowshoe'),
        (cat_id, 'Birman'),
        (cat_id, 'Bombay'),
        (cat_id, 'Scottish Fold'),
        (cat_id, 'Persian'),
        (cat_id, 'British Shorthair'),
        (cat_id, 'Ragdoll'),
        (cat_id, 'Siberian'),
        (cat_id, 'Siamese'),
        (cat_id, 'Bengal'),
        (cat_id, 'Maine Coon');
END $$;


CREATE TABLE animal_gender
(
    id serial PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

INSERT INTO animal_gender (value) VALUES ('MALE'), ('FEMALE');


CREATE TABLE animal_size
(
    id serial PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

INSERT INTO animal_size (value) VALUES ('SMALL'), ('MEDIUM'), ('BIG');

CREATE TABLE animal_status
(
    id serial PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

INSERT INTO animal_status (value) VALUES ('LOST'), ('FOUND'), ('RECOVERED');

CREATE TABLE animals
(
    id serial PRIMARY KEY,
    user_id int NOT NULL,
    state int NOT NULL REFERENCES animal_status(id),
    species int NOT NULL REFERENCES animal_species(id),
    breed int REFERENCES animal_breed(id),
    size int REFERENCES animal_size(id),
    color VARCHAR(255),
    name VARCHAR(255),
    gender int REFERENCES animal_gender(id),
    age VARCHAR(255),
    publication_date TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    lat int NOT NULL,
    lng int NOT NULL,
    images VARCHAR(255) NOT NULL
);