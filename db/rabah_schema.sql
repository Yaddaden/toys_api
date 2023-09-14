-- Active: 1682280022454@@127.0.0.1@3306@rabah_schema


CREATE TABLE IF NOT EXISTS publications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255),
  marque VARCHAR(255),
  age INT,
  description TEXT,
  etat VARCHAR(255),
  email VARCHAR(255),
  telephone VARCHAR(255),
  prix DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE publications
ADD COLUMN user_id INT,
ADD FOREIGN KEY (user_id) REFERENCES users(id);


CREATE TABLE IF NOT EXISTS images (
  image_id INT PRIMARY KEY AUTO_INCREMENT,
  publication_id INT,
  image_path VARCHAR(255),
  FOREIGN KEY (publication_id) REFERENCES publications (id)
);

ALTER TABLE publications
ADD COLUMN image_id INT,
ADD CONSTRAINT fk_publication_image
FOREIGN KEY (image_id)
REFERENCES images (image_id);

ALTER TABLE publications
CHANGE COLUMN email wilaya VARCHAR(255);
