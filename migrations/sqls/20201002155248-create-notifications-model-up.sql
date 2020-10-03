create TABLE notifications
(
    id serial PRIMARY KEY,
    user_id int NOT NULL REFERENCES users(id),
    message VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    publication_date timestamptz(6) DEFAULT now() NOT NULL
)