CREATE TABLE roles
(
    id serial PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

INSERT INTO roles (value) VALUES ('User'), ('Admin');


CREATE TABLE user_roles
(
    user_id int NOT NULL REFERENCES users(id),
    role_id int NOT NULL REFERENCES roles(id)
);