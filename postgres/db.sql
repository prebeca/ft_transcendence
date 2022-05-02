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
