CREATE TABLE Joueur (
	id INT PRIMARY KEY NOT NULL,
	First_name VARCHAR (100),
	Last_name VARCHAR(100),
	email VARCHAR(255),
	date_naissance DATE,
	pays VARCHAR(255),
	ville VARCHAR(255),
	code_postal VARCHAR(5),
	nombre_achat INT
);

CREATE TABLE IF NOT EXISTS score
(
    score_id bigint NOT NULL DEFAULT nextval('score_score_id_seq'::regclass),
    user_id bigint NOT NULL DEFAULT '0'::bigint,
    points bigint NOT NULL DEFAULT '0'::bigint,
    CONSTRAINT "PK_757ddc90313d9e3cf1f49d6857a" PRIMARY KEY (score_id)
);
