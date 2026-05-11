-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: pharmacy_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Tablet','Solid oral dosage form in tablet shape','2026-05-08 11:32:37'),(2,'Capsule','Medicine enclosed in a gelatin shell','2026-05-08 11:32:37'),(3,'Syrup','Liquid oral dosage form with sweetener','2026-05-08 11:32:37'),(4,'Injection','Sterile solution for parenteral use','2026-05-08 11:32:37'),(5,'Cream','Semi-solid topical preparation','2026-05-08 11:32:37'),(6,'Drop','Liquid form for eyes, ears or nose','2026-05-08 11:32:37'),(7,'Inhaler','Device delivering medicine to lungs','2026-05-08 11:32:37'),(8,'Powder','Dry granular form, usually dissolved before use','2026-05-08 11:32:37');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispense_records`
--

DROP TABLE IF EXISTS `dispense_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispense_records` (
  `dispense_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity` int NOT NULL,
  `dispensed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `dispensed_by` varchar(100) NOT NULL DEFAULT 'Pharmacist',
  `notes` text,
  PRIMARY KEY (`dispense_id`),
  KEY `fk_disp_rx` (`prescription_id`),
  KEY `idx_disp_medicine` (`medicine_id`),
  KEY `idx_disp_date` (`dispensed_at`),
  CONSTRAINT `fk_disp_med` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_disp_rx` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `dispense_records_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispense_records`
--

LOCK TABLES `dispense_records` WRITE;
/*!40000 ALTER TABLE `dispense_records` DISABLE KEYS */;
INSERT INTO `dispense_records` VALUES (1,1,1,10,'2026-04-28 10:15:00','Muhammad Hussain','Dispensed complete course'),(2,1,8,5,'2026-04-28 10:16:00','Muhammad Hussain','Vitamin C supplements'),(3,2,12,30,'2026-04-29 11:30:00','Ali Ahmed Mansoor','Monthly cholesterol medication'),(4,2,14,1,'2026-04-29 11:31:00','Ali Ahmed Mansoor','Eye drops dispensed'),(5,3,11,14,'2026-04-30 09:45:00','Muhammad Hussain','Full antibiotic course dispensed'),(6,4,4,30,'2026-05-01 14:20:00','Ali Ahmed Mansoor','Monthly diabetic medication'),(7,5,1,6,'2026-05-02 16:00:00','Muhammad Hussain','Panadol for flu'),(8,5,10,1,'2026-05-02 16:01:00','Muhammad Hussain','Cough syrup dispensed'),(9,6,6,14,'2026-05-03 08:30:00','Ali Ahmed Mansoor','Post-surgery antibiotic'),(10,6,13,1,'2026-05-03 08:31:00','Ali Ahmed Mansoor','Betnovate cream for wound care'),(11,7,12,30,'2026-05-04 13:15:00','Muhammad Hussain','Cholesterol medication'),(12,8,10,1,'2026-05-05 10:00:00','Ali Ahmed Mansoor','Cough syrup for cold'),(13,8,1,6,'2026-05-05 10:01:00','Ali Ahmed Mansoor','Panadol for fever');
/*!40000 ALTER TABLE `dispense_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `doctor_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`doctor_id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,'Dr. Ahmed Raza','General Physician','0300-1110001','ahmed.raza@hospital.pk','2026-05-08 11:34:05'),(2,'Dr. Fatima Malik','Cardiologist','0311-2220002','fatima.malik@hospital.pk','2026-05-08 11:34:05'),(3,'Dr. Usman Tariq','Pulmonologist','0321-3330003','usman.tariq@hospital.pk','2026-05-08 11:34:05'),(4,'Dr. Sadia Hussain','Endocrinologist','0333-4440004','sadia.hussain@hospital.pk','2026-05-08 11:34:05'),(5,'Dr. Bilal Chaudhry','General Surgeon','0345-5550005','bilal.chaudhry@hospital.pk','2026-05-08 11:34:05');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manufacturers`
--

DROP TABLE IF EXISTS `manufacturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manufacturers` (
  `manufacturer_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `country` varchar(100) NOT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`manufacturer_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manufacturers`
--

LOCK TABLES `manufacturers` WRITE;
/*!40000 ALTER TABLE `manufacturers` DISABLE KEYS */;
INSERT INTO `manufacturers` VALUES (1,'GSK Pakistan','Pakistan','info@gsk.com.pk','051-1112223333','2026-05-08 11:32:57'),(2,'Pfizer Pakistan','Pakistan','info@pfizer.com.pk','021-1114445555','2026-05-08 11:32:57'),(3,'Abbott Laboratories','Pakistan','info@abbott.com.pk','042-1116667777','2026-05-08 11:32:57'),(4,'Sanofi Pakistan','Pakistan','info@sanofi.com.pk','021-1118889999','2026-05-08 11:32:57'),(5,'Searle Pakistan','Pakistan','info@searle.com.pk','021-3231001001','2026-05-08 11:32:57'),(6,'Highnoon Labs','Pakistan','info@highnoon.com.pk','042-5781002002','2026-05-08 11:32:57'),(7,'Herbion Pakistan','Pakistan','info@herbion.com.pk','021-3451003003','2026-05-08 11:32:57'),(8,'Otsuka Pakistan','Pakistan','info@otsuka.com.pk','021-1111004004','2026-05-08 11:32:57');
/*!40000 ALTER TABLE `manufacturers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `medicine_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `manufacturer_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `dosage_form` varchar(50) NOT NULL,
  `strength` varchar(50) DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `expiry_date` date NOT NULL,
  `batch_no` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`medicine_id`),
  KEY `fk_med_mfr` (`manufacturer_id`),
  KEY `fk_med_supplier` (`supplier_id`),
  KEY `idx_med_name` (`name`),
  KEY `idx_med_expiry` (`expiry_date`),
  KEY `idx_med_category` (`category_id`),
  CONSTRAINT `fk_med_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_med_mfr` FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`manufacturer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_med_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `medicines_chk_1` CHECK ((`unit_price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES (1,1,1,1,'Panadol','Tablet','500mg',15.00,'2026-08-01','BT-001','Paracetamol pain reliever and fever reducer','2026-05-08 11:33:32'),(2,2,2,2,'Amoxicillin','Capsule','250mg',45.00,'2026-12-15','BT-002','Broad spectrum antibiotic','2026-05-08 11:33:32'),(3,3,6,3,'ORS Sachet','Powder','200ml',20.00,'2027-03-10','BT-003','Oral rehydration salts for dehydration','2026-05-08 11:33:32'),(4,1,4,1,'Metformin','Tablet','500mg',30.00,'2026-11-20','BT-004','Oral diabetes medication','2026-05-08 11:33:32'),(5,1,3,2,'Brufen','Tablet','400mg',25.00,'2025-06-01','BT-005','Ibuprofen anti-inflammatory -- EXPIRED','2026-05-08 11:33:32'),(6,1,5,3,'Flagyl','Tablet','400mg',18.00,'2026-09-15','BT-006','Metronidazole antibiotic','2026-05-08 11:33:32'),(7,7,1,1,'Ventolin Inhaler','Inhaler','100mcg',350.00,'2025-07-05','BT-007','Salbutamol for asthma relief -- EXPIRED','2026-05-08 11:33:32'),(8,1,7,4,'Vitamin C','Tablet','500mg',12.00,'2027-06-30','BT-008','Ascorbic acid immune support','2026-05-08 11:33:32'),(9,4,8,4,'Ringer Lactate','Injection','500ml',120.00,'2026-07-01','BT-009','IV fluid for hydration','2026-05-08 11:33:32'),(10,3,1,2,'Cough Syrup','Syrup','100ml',85.00,'2026-10-20','BT-010','Dextromethorphan cough suppressant','2026-05-08 11:33:32'),(11,2,2,3,'Augmentin','Capsule','625mg',95.00,'2026-05-18','BT-011','Amoxicillin-clavulanate antibiotic','2026-05-08 11:33:32'),(12,1,3,1,'Lipitor','Tablet','20mg',110.00,'2027-01-25','BT-012','Atorvastatin cholesterol medication','2026-05-08 11:33:32'),(13,5,5,5,'Betnovate Cream','Cream','15g',55.00,'2026-04-10','BT-013','Betamethasone topical steroid','2026-05-08 11:33:32'),(14,6,4,4,'Refresh Eye Drop','Drop','10ml',75.00,'2026-08-22','BT-014','Lubricating eye drops','2026-05-08 11:33:32'),(15,1,6,2,'Disprin','Tablet','300mg',10.00,'2026-03-05','BT-015','Aspirin pain and fever relief','2026-05-08 11:33:32');
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,'Muhammad Ali','0300-9991001','1990-05-15','Male','House 12, G-10, Islamabad','2026-05-08 11:34:16'),(2,'Zainab Bibi','0311-9992002','1985-08-22','Female','Flat 3B, F-8, Islamabad','2026-05-08 11:34:16'),(3,'Tariq Jameel','0321-9993003','1978-12-10','Male','Street 4, Saddar, Rawalpindi','2026-05-08 11:34:16'),(4,'Ayesha Khan','0333-9994004','1995-03-30','Female','Block C, Gulberg, Lahore','2026-05-08 11:34:16'),(5,'Hassan Nawaz','0345-9995005','1965-07-18','Male','Plot 22, DHA Phase 2, Islamabad','2026-05-08 11:34:16'),(6,'Nadia Iqbal','0300-9996006','2000-11-05','Female','House 7, I-8, Islamabad','2026-05-08 11:34:16'),(7,'Imran Siddiqui','0311-9997007','1972-09-25','Male','Apartment 5, E-11, Islamabad','2026-05-08 11:34:16'),(8,'Saima Perveen','0321-9998008','1988-01-14','Female','House 33, PWD Colony, Islamabad','2026-05-08 11:34:16');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity` int NOT NULL,
  `instructions` text,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `uq_rx_med` (`prescription_id`,`medicine_id`),
  KEY `fk_rxi_med` (`medicine_id`),
  CONSTRAINT `fk_rxi_med` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rxi_rx` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescription_items_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES (1,1,1,10,'Take 1 tablet every 6 hours after meals'),(2,1,8,5,'Take 1 tablet daily in the morning'),(3,2,12,30,'Take 1 tablet daily at bedtime'),(4,2,14,1,'Apply 2 drops in each eye twice daily'),(5,3,11,14,'Take 1 capsule every 12 hours with water'),(6,4,4,30,'Take 1 tablet twice daily with meals'),(7,5,1,6,'Take 1 tablet every 8 hours as needed'),(8,5,10,1,'Take 10ml three times daily after meals'),(9,6,6,14,'Take 1 tablet three times daily'),(10,6,13,1,'Apply thin layer on affected area twice daily'),(11,7,12,30,'Take 1 tablet daily at bedtime'),(12,7,9,2,'Administer IV as directed by physician'),(13,8,10,1,'Take 10ml every 6 hours'),(14,8,1,6,'Take 1 tablet every 8 hours for fever');
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `prescription_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `prescribed_date` date NOT NULL DEFAULT (curdate()),
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  KEY `idx_rx_patient` (`patient_id`),
  KEY `idx_rx_doctor` (`doctor_id`),
  KEY `idx_rx_date` (`prescribed_date`),
  CONSTRAINT `fk_rx_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rx_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,1,1,'2026-04-28','Fever and mild pain, 5-day course','2026-05-08 11:34:51'),(2,2,2,'2026-04-29','Post-cardiac checkup, cholesterol management','2026-05-08 11:34:51'),(3,3,3,'2026-04-30','Respiratory infection, antibiotic course','2026-05-08 11:34:51'),(4,4,4,'2026-05-01','Type 2 diabetes management, monthly prescription','2026-05-08 11:34:51'),(5,5,1,'2026-05-02','General flu symptoms, supportive treatment','2026-05-08 11:34:51'),(6,6,5,'2026-05-03','Post-surgery wound care and pain management','2026-05-08 11:34:51'),(7,7,2,'2026-05-04','Hypertension and cholesterol combined treatment','2026-05-08 11:34:51'),(8,8,1,'2026-05-05','Cough and cold, symptomatic treatment','2026-05-08 11:34:51');
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `uq_order_med` (`order_id`,`medicine_id`),
  KEY `fk_poi_med` (`medicine_id`),
  CONSTRAINT `fk_poi_med` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_poi_order` FOREIGN KEY (`order_id`) REFERENCES `purchase_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_order_items_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `purchase_order_items_chk_2` CHECK ((`unit_price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_items`
--

LOCK TABLES `purchase_order_items` WRITE;
/*!40000 ALTER TABLE `purchase_order_items` DISABLE KEYS */;
INSERT INTO `purchase_order_items` VALUES (1,1,1,500,14.00),(2,1,12,200,105.00),(3,2,2,300,43.00),(4,2,11,150,90.00),(5,3,3,400,18.00),(6,3,6,250,16.00),(7,4,9,100,115.00),(8,4,14,200,70.00),(9,5,1,300,14.00);
/*!40000 ALTER TABLE `purchase_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `order_date` date NOT NULL DEFAULT (curdate()),
  `expected_delivery` date DEFAULT NULL,
  `actual_delivery` date DEFAULT NULL,
  `status` enum('Pending','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `idx_po_status` (`status`),
  KEY `idx_po_supplier` (`supplier_id`),
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_delivery` CHECK (((`expected_delivery` is null) or (`expected_delivery` >= `order_date`)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (1,1,'2026-04-01','2026-04-08','2026-04-07','Delivered','Monthly restock of Panadol and Lipitor','2026-05-08 11:34:27'),(2,2,'2026-04-10','2026-04-17','2026-04-18','Delivered','Antibiotic restock for April','2026-05-08 11:34:27'),(3,3,'2026-04-20','2026-04-27',NULL,'Pending','ORS and Flagyl reorder','2026-05-08 11:34:27'),(4,4,'2026-04-25','2026-05-02',NULL,'Pending','Injection and eye drop restock','2026-05-08 11:34:27'),(5,1,'2026-03-15','2026-03-22',NULL,'Cancelled','Cancelled due to supplier stock issue','2026-05-08 11:34:27');
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `low_stock_threshold` int NOT NULL DEFAULT '20',
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `medicine_id` (`medicine_id`),
  KEY `idx_stk_quantity` (`quantity`),
  CONSTRAINT `fk_stk_med` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (1,1,150,20,'2026-05-08 11:33:48'),(2,2,8,20,'2026-05-08 11:33:48'),(3,3,200,20,'2026-05-08 11:33:48'),(4,4,12,20,'2026-05-08 11:33:48'),(5,5,90,20,'2026-05-08 11:33:48'),(6,6,75,20,'2026-05-08 11:33:48'),(7,7,40,20,'2026-05-08 11:33:48'),(8,8,300,20,'2026-05-08 11:33:48'),(9,9,60,20,'2026-05-08 11:33:48'),(10,10,5,20,'2026-05-08 11:33:48'),(11,11,45,20,'2026-05-08 11:33:48'),(12,12,80,20,'2026-05-08 11:33:48'),(13,13,30,20,'2026-05-08 11:33:48'),(14,14,55,20,'2026-05-08 11:33:48'),(15,15,7,20,'2026-05-08 11:33:48');
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transactions`
--

DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int NOT NULL,
  `type` enum('IN','OUT') NOT NULL,
  `quantity` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(100) DEFAULT 'System',
  PRIMARY KEY (`transaction_id`),
  KEY `idx_tx_medicine` (`medicine_id`),
  KEY `idx_tx_created` (`created_at`),
  CONSTRAINT `fk_tx_med` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `stock_transactions_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--

LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
INSERT INTO `stock_transactions` VALUES (1,1,'IN',500,'Purchase Order #1 received',NULL,'2026-05-08 11:35:24','System'),(2,12,'IN',200,'Purchase Order #1 received',NULL,'2026-05-08 11:35:24','System'),(3,2,'IN',300,'Purchase Order #2 received',NULL,'2026-05-08 11:35:24','System'),(4,11,'IN',150,'Purchase Order #2 received',NULL,'2026-05-08 11:35:24','System'),(5,1,'OUT',10,'Dispensed - Prescription #1',NULL,'2026-05-08 11:35:24','Muhammad Hussain'),(6,8,'OUT',5,'Dispensed - Prescription #1',NULL,'2026-05-08 11:35:24','Muhammad Hussain'),(7,12,'OUT',30,'Dispensed - Prescription #2',NULL,'2026-05-08 11:35:24','Ali Ahmed Mansoor'),(8,14,'OUT',1,'Dispensed - Prescription #2',NULL,'2026-05-08 11:35:24','Ali Ahmed Mansoor'),(9,11,'OUT',14,'Dispensed - Prescription #3',NULL,'2026-05-08 11:35:24','Muhammad Hussain'),(10,4,'OUT',30,'Dispensed - Prescription #4',NULL,'2026-05-08 11:35:24','Ali Ahmed Mansoor'),(11,1,'OUT',6,'Dispensed - Prescription #5',NULL,'2026-05-08 11:35:24','Muhammad Hussain'),(12,10,'OUT',1,'Dispensed - Prescription #5',NULL,'2026-05-08 11:35:24','Muhammad Hussain'),(13,6,'OUT',14,'Dispensed - Prescription #6',NULL,'2026-05-08 11:35:24','Ali Ahmed Mansoor'),(14,13,'OUT',1,'Dispensed - Prescription #6',NULL,'2026-05-08 11:35:24','Ali Ahmed Mansoor'),(15,5,'IN',90,'Opening stock entry',NULL,'2026-05-08 11:35:24','System'),(16,7,'IN',40,'Opening stock entry',NULL,'2026-05-08 11:35:24','System'),(17,3,'IN',200,'Opening stock entry',NULL,'2026-05-08 11:35:24','System'),(18,9,'IN',60,'Opening stock entry',NULL,'2026-05-08 11:35:24','System');
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(150) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `company_name` (`company_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'MedPlus Distributors','Tariq Mehmood','0300-1234567','tariq@medplus.pk','Islamabad','Blue Area, Islamabad',1,'2026-05-08 11:33:19'),(2,'PharmaCare Supplies','Sana Akhtar','0311-2345678','sana@pharmacare.pk','Lahore','Gulberg III, Lahore',1,'2026-05-08 11:33:19'),(3,'HealthLine Traders','Kamran Bashir','0321-3456789','kamran@healthline.pk','Rawalpindi','Saddar, Rawalpindi',1,'2026-05-08 11:33:19'),(4,'National Med Supplies','Ayesha Noor','0333-4567890','ayesha@natmed.pk','Karachi','PECHS Block 2, Karachi',1,'2026-05-08 11:33:19'),(5,'City Pharma Traders','Usman Qureshi','0345-5678901','usman@citypharma.pk','Islamabad','G-9 Markaz, Islamabad',0,'2026-05-08 11:33:19');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08 11:43:03
