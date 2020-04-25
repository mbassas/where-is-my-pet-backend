CREATE TABLE animal_images (
    id  serial,
    animal_id int NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    image oid,
    mimetype VARCHAR(255),
    image_name VARCHAR(255)
)