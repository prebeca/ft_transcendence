CREATE TABLE player (
	id INT PRIMARY KEY NOT NULL,
	first_name VARCHAR (100),
	last_name VARCHAR(100),
	email VARCHAR(255),
);

CREATE TABLE IF NOT EXISTS score
(
    score_id bigint NOT NULL DEFAULT nextval('score_score_id_seq'::regclass),
    user_id bigint NOT NULL DEFAULT '0'::bigint,
    points bigint NOT NULL DEFAULT '0'::bigint,
    CONSTRAINT "PK_757ddc90313d9e3cf1f49d6857a" PRIMARY KEY (score_id)
);
