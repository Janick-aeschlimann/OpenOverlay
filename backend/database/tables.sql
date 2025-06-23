USE open_overlay;

CREATE TABLE user(
    userId VARCHAR(128) PRIMARY KEY,
    username VARCHAR(128) UNIQUE NOT NULL,
    created_at DATETIME NOT NULL,
    profile_picture VARCHAR(255)
)