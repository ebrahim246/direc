DROP DATABASE IF EXISTS employeetrackerdb;
CREATE database employeetrackerdb;

USE employeetrackerdb;

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NULL,
  last_name VARCHAR(30) NULL,
  role_id INT NULL,
  manager_id INT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NULL,
  salary DECIMAL(10,2) NULL,
  department_id INT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NULL,
  PRIMARY KEY (id)
);

SELECT * FROM employeetrackerdb;

USE employeetrackerdb;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Mark", 3, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("William", "Smith", 11, 4);

INSERT INTO role (title, salary, department_id)
VALUES ("Director", 60000.00, 1);
INSERT INTO role (title, salary, department_id)
VALUES ("Inspection Junior", 85000.00, 1);
INSERT INTO role (title, salary, department_id)
VALUES ("Sales Reporter", 120000.00, 1);

INSERT INTO department (name)
VALUES ("Medical");
INSERT INTO department (name)
VALUES ("Engineering");
INSERT INTO department (name)
VALUES ("Finance");
