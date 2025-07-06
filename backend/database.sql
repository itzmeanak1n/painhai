-- Create database
CREATE DATABASE IF NOT EXISTS transport_db;
USE transport_db;

-- Create tb_user table
CREATE TABLE IF NOT EXISTS tb_user (
  studentId VARCHAR(15) PRIMARY KEY,
  nationalId VARCHAR(13) NOT NULL,
  userFirstname VARCHAR(30) NOT NULL,
  userLastname VARCHAR(30) NOT NULL,
  userEmail VARCHAR(50) NOT NULL UNIQUE,
  userPass VARCHAR(255) NOT NULL,
  userTel VARCHAR(15) NOT NULL,
  userAddress VARCHAR(255) NOT NULL,
  userprofilePic VARCHAR(255),
  studentCard VARCHAR(255),
  userRate DECIMAL(3,2),
  role ENUM('student', 'admin') DEFAULT 'student'
);

-- Insert default admin user
INSERT INTO tb_user (studentId, nationalId, userFirstname, userLastname, userEmail, userPass, userTel, userAddress, role)
VALUES ('ADMIN', '0000000000000', 'Admin', 'System', 'admin@transport.com', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.1MkzX5UxqX5UxqX5UxqX5UxqX5UxqX', '0000000000', 'Transport System', 'admin');

-- Create riders table
CREATE TABLE IF NOT EXISTS riders (
  riderId INT AUTO_INCREMENT PRIMARY KEY,
  riderNationalId VARCHAR(13) NOT NULL,
  riderFirstname VARCHAR(30) NOT NULL,
  riderLastname VARCHAR(30) NOT NULL,
  riderEmail VARCHAR(50) NOT NULL UNIQUE,
  riderPass VARCHAR(255) NOT NULL,
  riderTel VARCHAR(15) NOT NULL,
  riderAddress VARCHAR(255) NOT NULL,
  RiderProfilePic VARCHAR(255),
  RiderStudentCard VARCHAR(255),
  riderLicense VARCHAR(255) NOT NULL,
  QRscan VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  riderRate DECIMAL(3,2)
);

-- Create ridervehical table
CREATE TABLE IF NOT EXISTS ridervehical (
  carId INT AUTO_INCREMENT PRIMARY KEY,
  riderId INT NOT NULL,
  carType VARCHAR(50) NOT NULL,
  plate VARCHAR(20) NOT NULL,
  brand ENUM('Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Other') NOT NULL,
  model VARCHAR(20) NOT NULL,
  insurancePhoto VARCHAR(255),
  carPhoto VARCHAR(255),
  FOREIGN KEY (riderId) REFERENCES riders(riderId)
);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  placeId INT AUTO_INCREMENT PRIMARY KEY,
  placeName VARCHAR(50) NOT NULL,
  link VARCHAR(255),
  pics VARCHAR(255)
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  tripId INT AUTO_INCREMENT PRIMARY KEY,
  studentId VARCHAR(15) NOT NULL,
  placeIdPickUp INT NOT NULL,
  placeIdDestination INT NOT NULL,
  date DATETIME NOT NULL,
  userRate DECIMAL(3,2),
  carType VARCHAR(50) NOT NULL,
  FOREIGN KEY (studentId) REFERENCES tb_user(studentId),
  FOREIGN KEY (placeIdPickUp) REFERENCES places(placeId),
  FOREIGN KEY (placeIdDestination) REFERENCES places(placeId)
);

-- Create tripMatched table
CREATE TABLE IF NOT EXISTS tripMatched (
  tripMatchId INT AUTO_INCREMENT PRIMARY KEY,
  tripId INT NOT NULL,
  studentId VARCHAR(15) NOT NULL,
  riderId INT NOT NULL,
  tripStatus ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (tripId) REFERENCES trips(tripId),
  FOREIGN KEY (studentId) REFERENCES tb_user(studentId),
  FOREIGN KEY (riderId) REFERENCES riders(riderId)
); 