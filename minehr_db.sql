-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 02, 2026 at 07:48 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `minehr_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ActivityLog`
--

CREATE TABLE `ActivityLog` (
  `id` int(11) NOT NULL,
  `action` varchar(191) NOT NULL,
  `entity_type` varchar(191) NOT NULL,
  `entity_name` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ActivityLog`
--

INSERT INTO `ActivityLog` (`id`, `action`, `entity_type`, `entity_name`, `details`, `user_id`, `createdAt`) VALUES
(1, 'CREATED', 'ZONE', 'Test Notification Zone', NULL, NULL, '2026-02-27 12:21:34.805'),
(2, 'DELETED', 'ZONE', 'Test Notification Zone', NULL, NULL, '2026-02-27 12:23:15.710'),
(3, 'DELETED', 'USER', 'User #5', NULL, NULL, '2026-02-27 12:25:29.373'),
(4, 'DELETED', 'COMPANY', 'Company #2', NULL, NULL, '2026-02-27 12:25:44.039'),
(5, 'DELETED', 'ZONE', '1dd', NULL, NULL, '2026-02-27 12:25:58.937'),
(6, 'DELETED', 'DEPARTMENT', 'Department #5', NULL, NULL, '2026-02-27 12:26:18.674'),
(7, 'DELETED', 'BRANCH', 'ad', NULL, NULL, '2026-02-27 12:26:21.771'),
(8, 'CREATED', 'DESIGNATION', 'admin', NULL, NULL, '2026-02-27 12:26:45.121'),
(9, 'CREATED', 'ZONE', '1', NULL, NULL, '2026-02-27 12:27:34.790'),
(10, 'CREATED', 'ZONE', '4', NULL, NULL, '2026-02-27 12:27:34.790'),
(11, 'CREATED', 'ZONE', '3', NULL, NULL, '2026-02-27 12:27:34.790'),
(12, 'CREATED', 'ZONE', '5', NULL, NULL, '2026-02-27 12:27:34.790'),
(13, 'CREATED', 'ZONE', '2', NULL, NULL, '2026-02-27 12:27:34.790'),
(14, 'DELETED', 'ZONE', 'North Zone', NULL, NULL, '2026-02-27 12:27:49.470'),
(15, 'DELETED', 'ZONE', '1', NULL, NULL, '2026-02-27 12:28:00.702'),
(16, 'DELETED', 'ZONE', '2', NULL, NULL, '2026-02-27 12:28:01.853'),
(17, 'DELETED', 'ZONE', '3', NULL, NULL, '2026-02-27 12:28:03.036'),
(18, 'DELETED', 'ZONE', '4', NULL, NULL, '2026-02-27 12:28:04.385'),
(19, 'CREATED', 'USER', 'employee', '{\"role\":\"Employee\",\"email\":\"employee@minehr.com\"}', NULL, '2026-03-02 07:22:02.771'),
(20, 'CREATED', 'PARKING_SLOT', 'Created Slot 1', NULL, NULL, '2026-03-02 07:24:03.159');

-- --------------------------------------------------------

--
-- Table structure for table `AdminBranchRestriction`
--

CREATE TABLE `AdminBranchRestriction` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `AdminDepartmentRestriction`
--

CREATE TABLE `AdminDepartmentRestriction` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `AttendanceRecord`
--

CREATE TABLE `AttendanceRecord` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `in_time` datetime(3) DEFAULT NULL,
  `out_time` datetime(3) DEFAULT NULL,
  `break_minutes` int(11) NOT NULL DEFAULT 0,
  `total_working_hours` double NOT NULL DEFAULT 0,
  `late_by_minutes` int(11) NOT NULL DEFAULT 0,
  `early_leaving_mins` int(11) NOT NULL DEFAULT 0,
  `overtime_hours` double NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'Absent',
  `source` varchar(191) NOT NULL DEFAULT 'Web',
  `remarks` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `AttendanceRequest`
--

CREATE TABLE `AttendanceRequest` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `request_type` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `requested_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`requested_data`)),
  `reason` text NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Pending',
  `approver_id` int(11) DEFAULT NULL,
  `approver_remarks` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `modifiedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Branch`
--

CREATE TABLE `Branch` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'Metro',
  `order_index` int(11) NOT NULL DEFAULT 0,
  `zone_id` int(11) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Branch`
--

INSERT INTO `Branch` (`id`, `name`, `code`, `type`, `order_index`, `zone_id`, `company_id`) VALUES
(4, 'TEST BRANCH', 'TB-01', 'Metro', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Company`
--

CREATE TABLE `Company` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `website` varchar(191) DEFAULT NULL,
  `logo_url` varchar(191) DEFAULT NULL,
  `tax_info` varchar(191) DEFAULT NULL,
  `code` varchar(191) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Company`
--

INSERT INTO `Company` (`id`, `name`, `website`, `logo_url`, `tax_info`, `code`, `order_index`, `status`) VALUES
(1, 'New Company', NULL, NULL, NULL, NULL, 0, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `CompanySetting`
--

CREATE TABLE `CompanySetting` (
  `id` int(11) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CompanySetting`
--

INSERT INTO `CompanySetting` (`id`, `key`, `value`, `createdAt`, `updatedAt`) VALUES
(1, 'ADMIN_MENU_ORDER', '{\"value\":[{\"id\":\"1\",\"name\":\"Dashboard\",\"iconName\":\"LayoutDashboard\",\"order\":1},{\"id\":\"2\",\"name\":\"Company Settings\",\"iconName\":\"Settings\",\"order\":2},{\"id\":\"3\",\"name\":\"Core HRMS\",\"iconName\":\"Users\",\"order\":3},{\"id\":\"4\",\"name\":\"Finance & Accounting\",\"iconName\":\"Calculator\",\"order\":4},{\"id\":\"5\",\"name\":\"Productivity & Tracking\",\"iconName\":\"Activity\",\"order\":5},{\"id\":\"6\",\"name\":\"CRM\",\"iconName\":\"RefreshCcw\",\"order\":6},{\"id\":\"7\",\"name\":\"Effective Communication\",\"iconName\":\"Megaphone\",\"order\":7},{\"id\":\"8\",\"name\":\"Orders & Visits\",\"iconName\":\"ClipboardList\",\"order\":8},{\"id\":\"9\",\"name\":\"Analytics & Reports\",\"iconName\":\"BarChart2\",\"order\":9},{\"id\":\"10\",\"name\":\"Industry Modules\",\"iconName\":\"Factory\",\"order\":10},{\"id\":\"11\",\"name\":\"Knowledge Center\",\"iconName\":\"BookOpen\",\"order\":11},{\"id\":\"12\",\"name\":\"Assets & Resources\",\"iconName\":\"Monitor\",\"order\":12},{\"id\":\"13\",\"name\":\"Other Utilities\",\"iconName\":\"Grid\",\"order\":13},{\"id\":\"14\",\"name\":\"Contact Support Team\",\"iconName\":\"Headphones\",\"order\":14}]}', '2026-03-02 06:25:08.003', '2026-03-02 07:21:12.891');

-- --------------------------------------------------------

--
-- Table structure for table `DailyAttendanceEmail`
--

CREATE TABLE `DailyAttendanceEmail` (
  `id` int(11) NOT NULL,
  `report_name` varchar(191) NOT NULL,
  `recipient_type` varchar(191) NOT NULL DEFAULT 'Manager',
  `filter_value` varchar(191) DEFAULT NULL,
  `schedule_time` varchar(191) NOT NULL,
  `email_template` text DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `DailyAttendanceEmail`
--

INSERT INTO `DailyAttendanceEmail` (`id`, `report_name`, `recipient_type`, `filter_value`, `schedule_time`, `email_template`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'a', 'Manager', 'All Branches', '18:00:00', 'Hello {Employee Name},\n\nHere is the attendance report for {Date}.\n\nIn Time: {In Time}\nOut Time: {Out Time}\nStatus: {Status}', 'Active', '2026-03-02 07:45:57.864', '2026-03-02 07:45:57.864');

-- --------------------------------------------------------

--
-- Table structure for table `Department`
--

CREATE TABLE `Department` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Department`
--

INSERT INTO `Department` (`id`, `name`, `branch_id`, `order_index`) VALUES
(4, 'Engineering', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `Designation`
--

CREATE TABLE `Designation` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `sub_department_id` int(11) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Designation`
--

INSERT INTO `Designation` (`id`, `name`, `sub_department_id`, `order_index`) VALUES
(1, 'Senior Editor', 1, 1),
(4, 'admin', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `EmergencyNumber`
--

CREATE TABLE `EmergencyNumber` (
  `id` int(11) NOT NULL,
  `contact_name` varchar(191) NOT NULL,
  `number` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'Medical',
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `EmployeeGrade`
--

CREATE TABLE `EmployeeGrade` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `EmployeeGrade`
--

INSERT INTO `EmployeeGrade` (`id`, `name`, `code`, `status`) VALUES
(1, 'a', 'a', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `EmployeeGradeHistory`
--

CREATE TABLE `EmployeeGradeHistory` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `grade_id` int(11) NOT NULL,
  `effective_from` datetime(3) NOT NULL,
  `effective_to` datetime(3) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `EmployeeLevel`
--

CREATE TABLE `EmployeeLevel` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `EmployeeLevel`
--

INSERT INTO `EmployeeLevel` (`id`, `name`, `parent_id`, `order_index`) VALUES
(1, 'ab', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `IdCardTemplate`
--

CREATE TABLE `IdCardTemplate` (
  `id` int(11) NOT NULL,
  `template_name` varchar(191) NOT NULL,
  `template_type` varchar(191) NOT NULL DEFAULT 'Employee',
  `branch_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `IdCardTemplate`
--

INSERT INTO `IdCardTemplate` (`id`, `template_name`, `template_type`, `branch_id`, `department_id`, `status`, `createdAt`, `updatedAt`) VALUES
(4, '111', 'Employee', NULL, NULL, 'Active', '2026-03-02 07:27:55.619', '2026-03-02 07:54:32.177');

-- --------------------------------------------------------

--
-- Table structure for table `ParkingSlot`
--

CREATE TABLE `ParkingSlot` (
  `id` int(11) NOT NULL,
  `slot_number` varchar(191) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `vehicle_number` varchar(191) DEFAULT NULL,
  `access_type` varchar(191) NOT NULL DEFAULT 'QR',
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ParkingSlot`
--

INSERT INTO `ParkingSlot` (`id`, `slot_number`, `user_id`, `vehicle_number`, `access_type`, `status`, `createdAt`, `updatedAt`) VALUES
(1, '1', NULL, 'sdabdjdb', 'QR', 'Active', '2026-03-02 07:24:03.155', '2026-03-02 07:24:03.155');

-- --------------------------------------------------------

--
-- Table structure for table `Shift`
--

CREATE TABLE `Shift` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `start_time` varchar(191) NOT NULL,
  `end_time` varchar(191) NOT NULL,
  `grace_time_minutes` int(11) NOT NULL DEFAULT 0,
  `half_day_min_hours` double NOT NULL DEFAULT 4,
  `full_day_min_hours` double NOT NULL DEFAULT 8,
  `break_duration_mins` int(11) NOT NULL DEFAULT 60,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SubDepartment`
--

CREATE TABLE `SubDepartment` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `department_id` int(11) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `SubDepartment`
--

INSERT INTO `SubDepartment` (`id`, `name`, `department_id`, `order_index`) VALUES
(1, 'Engineering Team Alpha', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'Admin',
  `branch_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `employee_grade_id` int(11) DEFAULT NULL,
  `employee_level_id` int(11) DEFAULT NULL,
  `resetPasswordOtp` varchar(191) DEFAULT NULL,
  `resetPasswordOtpExpiry` datetime(3) DEFAULT NULL,
  `shift_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`id`, `name`, `email`, `password_hash`, `role`, `branch_id`, `department_id`, `createdAt`, `updatedAt`, `employee_grade_id`, `employee_level_id`, `resetPasswordOtp`, `resetPasswordOtpExpiry`, `shift_id`) VALUES
(1, 'System Admin', 'admin@minehr.com', '$2b$10$OLU3UctHX.bdYKS1CFlQs..pHH2vxoUWtRecMg3KMcnbR61.DHU1u', 'Admin', NULL, NULL, '2026-02-25 14:41:20.292', '2026-02-25 14:41:20.292', NULL, NULL, NULL, NULL, NULL),
(2, 'Vraj Amin', 'vraj@minehr.com', '$2b$10$E6tYJJLFspcd4nzZNHZZHuftcipUotHmAB9q7Fc7iA4h/kbV1zcQC', 'Admin', NULL, NULL, '2026-02-25 14:54:09.544', '2026-02-25 14:54:09.544', NULL, NULL, NULL, NULL, NULL),
(3, 'Admin User', 'verify@test.com', '$2b$10$5Tdigj6XpBvS7FkmtZCa5OuXuoZFdLULrLWkawB1iLsND8.3wUzH2', 'Admin', NULL, NULL, '2026-02-27 11:57:45.594', '2026-02-27 11:57:45.594', NULL, NULL, NULL, NULL, NULL),
(6, 'employee', 'employee@minehr.com', '$2b$10$/PYX7q3Lyr1eIWa6SzJTseeGZFG/AXz9Gd4jI.VujByi/ug1ECqli', 'Employee', NULL, NULL, '2026-03-02 07:22:02.766', '2026-03-02 07:22:02.766', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `WhatsAppAlert`
--

CREATE TABLE `WhatsAppAlert` (
  `id` int(11) NOT NULL,
  `alert_name` varchar(191) NOT NULL,
  `trigger_event` varchar(191) NOT NULL,
  `recipient_type` varchar(191) NOT NULL DEFAULT 'Individual',
  `message_template` text NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `WhatsAppAlert`
--

INSERT INTO `WhatsAppAlert` (`id`, `alert_name`, `trigger_event`, `recipient_type`, `message_template`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'LEAVE', 'Leave Approved', 'Individual', 'Hello {Vraj},\n\nYour alert message here for absent.', 'Active', '2026-03-02 07:20:18.774', '2026-03-02 07:20:18.774');

-- --------------------------------------------------------

--
-- Table structure for table `Zone`
--

CREATE TABLE `Zone` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Zone`
--

INSERT INTO `Zone` (`id`, `name`, `order_index`) VALUES
(9, '5', 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ActivityLog`
--
ALTER TABLE `ActivityLog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ActivityLog_user_id_idx` (`user_id`),
  ADD KEY `ActivityLog_createdAt_idx` (`createdAt`),
  ADD KEY `ActivityLog_entity_type_idx` (`entity_type`);

--
-- Indexes for table `AdminBranchRestriction`
--
ALTER TABLE `AdminBranchRestriction`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AdminBranchRestriction_user_id_branch_id_key` (`user_id`,`branch_id`),
  ADD KEY `AdminBranchRestriction_user_id_idx` (`user_id`),
  ADD KEY `AdminBranchRestriction_branch_id_idx` (`branch_id`);

--
-- Indexes for table `AdminDepartmentRestriction`
--
ALTER TABLE `AdminDepartmentRestriction`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AdminDepartmentRestriction_user_id_department_id_key` (`user_id`,`department_id`),
  ADD KEY `AdminDepartmentRestriction_user_id_idx` (`user_id`),
  ADD KEY `AdminDepartmentRestriction_department_id_idx` (`department_id`);

--
-- Indexes for table `AttendanceRecord`
--
ALTER TABLE `AttendanceRecord`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AttendanceRecord_user_id_date_key` (`user_id`,`date`),
  ADD KEY `AttendanceRecord_user_id_idx` (`user_id`),
  ADD KEY `AttendanceRecord_date_idx` (`date`),
  ADD KEY `AttendanceRecord_status_idx` (`status`);

--
-- Indexes for table `AttendanceRequest`
--
ALTER TABLE `AttendanceRequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AttendanceRequest_user_id_idx` (`user_id`),
  ADD KEY `AttendanceRequest_approver_id_idx` (`approver_id`),
  ADD KEY `AttendanceRequest_status_idx` (`status`);

--
-- Indexes for table `Branch`
--
ALTER TABLE `Branch`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Branch_code_key` (`code`),
  ADD KEY `Branch_zone_id_fkey` (`zone_id`),
  ADD KEY `Branch_company_id_idx` (`company_id`);

--
-- Indexes for table `Company`
--
ALTER TABLE `Company`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Company_code_key` (`code`);

--
-- Indexes for table `CompanySetting`
--
ALTER TABLE `CompanySetting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CompanySetting_key_key` (`key`);

--
-- Indexes for table `DailyAttendanceEmail`
--
ALTER TABLE `DailyAttendanceEmail`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Department`
--
ALTER TABLE `Department`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Department_branch_id_fkey` (`branch_id`);

--
-- Indexes for table `Designation`
--
ALTER TABLE `Designation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Designation_name_sub_department_id_key` (`name`,`sub_department_id`),
  ADD KEY `Designation_sub_department_id_fkey` (`sub_department_id`);

--
-- Indexes for table `EmergencyNumber`
--
ALTER TABLE `EmergencyNumber`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `EmployeeGrade`
--
ALTER TABLE `EmployeeGrade`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `EmployeeGrade_code_key` (`code`);

--
-- Indexes for table `EmployeeGradeHistory`
--
ALTER TABLE `EmployeeGradeHistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `EmployeeGradeHistory_user_id_idx` (`user_id`),
  ADD KEY `EmployeeGradeHistory_grade_id_idx` (`grade_id`);

--
-- Indexes for table `EmployeeLevel`
--
ALTER TABLE `EmployeeLevel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `EmployeeLevel_parent_id_idx` (`parent_id`);

--
-- Indexes for table `IdCardTemplate`
--
ALTER TABLE `IdCardTemplate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IdCardTemplate_branch_id_idx` (`branch_id`),
  ADD KEY `IdCardTemplate_department_id_idx` (`department_id`);

--
-- Indexes for table `ParkingSlot`
--
ALTER TABLE `ParkingSlot`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ParkingSlot_slot_number_key` (`slot_number`),
  ADD UNIQUE KEY `ParkingSlot_user_id_key` (`user_id`),
  ADD KEY `ParkingSlot_user_id_idx` (`user_id`);

--
-- Indexes for table `Shift`
--
ALTER TABLE `Shift`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `SubDepartment`
--
ALTER TABLE `SubDepartment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SubDepartment_name_department_id_key` (`name`,`department_id`),
  ADD KEY `SubDepartment_department_id_fkey` (`department_id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_branch_id_fkey` (`branch_id`),
  ADD KEY `User_department_id_fkey` (`department_id`),
  ADD KEY `User_employee_level_id_idx` (`employee_level_id`),
  ADD KEY `User_employee_grade_id_idx` (`employee_grade_id`),
  ADD KEY `User_shift_id_idx` (`shift_id`);

--
-- Indexes for table `WhatsAppAlert`
--
ALTER TABLE `WhatsAppAlert`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Zone`
--
ALTER TABLE `Zone`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Zone_name_key` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ActivityLog`
--
ALTER TABLE `ActivityLog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `AdminBranchRestriction`
--
ALTER TABLE `AdminBranchRestriction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `AdminDepartmentRestriction`
--
ALTER TABLE `AdminDepartmentRestriction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `AttendanceRecord`
--
ALTER TABLE `AttendanceRecord`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `AttendanceRequest`
--
ALTER TABLE `AttendanceRequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Branch`
--
ALTER TABLE `Branch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Company`
--
ALTER TABLE `Company`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `CompanySetting`
--
ALTER TABLE `CompanySetting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `DailyAttendanceEmail`
--
ALTER TABLE `DailyAttendanceEmail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Department`
--
ALTER TABLE `Department`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Designation`
--
ALTER TABLE `Designation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `EmergencyNumber`
--
ALTER TABLE `EmergencyNumber`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `EmployeeGrade`
--
ALTER TABLE `EmployeeGrade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `EmployeeGradeHistory`
--
ALTER TABLE `EmployeeGradeHistory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `EmployeeLevel`
--
ALTER TABLE `EmployeeLevel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `IdCardTemplate`
--
ALTER TABLE `IdCardTemplate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ParkingSlot`
--
ALTER TABLE `ParkingSlot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Shift`
--
ALTER TABLE `Shift`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SubDepartment`
--
ALTER TABLE `SubDepartment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `WhatsAppAlert`
--
ALTER TABLE `WhatsAppAlert`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Zone`
--
ALTER TABLE `Zone`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ActivityLog`
--
ALTER TABLE `ActivityLog`
  ADD CONSTRAINT `ActivityLog_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `AdminBranchRestriction`
--
ALTER TABLE `AdminBranchRestriction`
  ADD CONSTRAINT `AdminBranchRestriction_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `Branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AdminBranchRestriction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AdminDepartmentRestriction`
--
ALTER TABLE `AdminDepartmentRestriction`
  ADD CONSTRAINT `AdminDepartmentRestriction_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `AdminDepartmentRestriction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AttendanceRecord`
--
ALTER TABLE `AttendanceRecord`
  ADD CONSTRAINT `AttendanceRecord_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AttendanceRequest`
--
ALTER TABLE `AttendanceRequest`
  ADD CONSTRAINT `AttendanceRequest_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `AttendanceRequest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Branch`
--
ALTER TABLE `Branch`
  ADD CONSTRAINT `Branch_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Company` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Branch_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `Zone` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Department`
--
ALTER TABLE `Department`
  ADD CONSTRAINT `Department_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `Branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Designation`
--
ALTER TABLE `Designation`
  ADD CONSTRAINT `Designation_sub_department_id_fkey` FOREIGN KEY (`sub_department_id`) REFERENCES `SubDepartment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `EmployeeGradeHistory`
--
ALTER TABLE `EmployeeGradeHistory`
  ADD CONSTRAINT `EmployeeGradeHistory_grade_id_fkey` FOREIGN KEY (`grade_id`) REFERENCES `EmployeeGrade` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `EmployeeGradeHistory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `EmployeeLevel`
--
ALTER TABLE `EmployeeLevel`
  ADD CONSTRAINT `EmployeeLevel_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `EmployeeLevel` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `IdCardTemplate`
--
ALTER TABLE `IdCardTemplate`
  ADD CONSTRAINT `IdCardTemplate_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `Branch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `IdCardTemplate_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `ParkingSlot`
--
ALTER TABLE `ParkingSlot`
  ADD CONSTRAINT `ParkingSlot_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `SubDepartment`
--
ALTER TABLE `SubDepartment`
  ADD CONSTRAINT `SubDepartment_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `User`
--
ALTER TABLE `User`
  ADD CONSTRAINT `User_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `Branch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_employee_grade_id_fkey` FOREIGN KEY (`employee_grade_id`) REFERENCES `EmployeeGrade` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_employee_level_id_fkey` FOREIGN KEY (`employee_level_id`) REFERENCES `EmployeeLevel` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_shift_id_fkey` FOREIGN KEY (`shift_id`) REFERENCES `Shift` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
