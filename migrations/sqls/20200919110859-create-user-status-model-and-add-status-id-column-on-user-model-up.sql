CREATE TABLE user_status
(
    id serial PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

INSERT INTO user_status (value) VALUES ('Trusted'), ('Suspicious'), ('Banned');

ALTER TABLE users 
ADD COLUMN status_id int NOT NULL REFERENCES user_status(id) DEFAULT 1;