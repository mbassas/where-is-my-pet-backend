CREATE TABLE bookmarks
(
    user_id int NOT NULL REFERENCES users(id),
    animal_id int NOT NULL REFERENCES animals(id),
    CONSTRAINT bookmarks_animal_and_user_unique UNIQUE (user_id, animal_id)
);