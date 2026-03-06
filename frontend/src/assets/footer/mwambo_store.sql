-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 21, 2026 at 09:53 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mwambo_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','manager','staff') DEFAULT 'staff',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@mwambo.store', '$2a$10$YourHashedPasswordHere', 'super_admin', 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `admin_permissions`
--

CREATE TABLE `admin_permissions` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `permission` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_permissions`
--

INSERT INTO `admin_permissions` (`id`, `admin_id`, `permission`) VALUES
(7, 1, 'manage_admins'),
(4, 1, 'manage_discounts'),
(3, 1, 'manage_inventory'),
(2, 1, 'manage_orders'),
(1, 1, 'manage_products'),
(6, 1, 'manage_settings'),
(5, 1, 'view_analytics');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_order` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`id`, `code`, `type`, `value`, `min_order`, `max_discount`, `start_date`, `end_date`, `usage_limit`, `used_count`, `is_active`, `created_at`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 5000.00, 5000.00, '2026-02-20 21:03:45', '2026-03-22 21:03:45', 100, 0, 1, '2026-02-21 05:03:45'),
(2, 'FIRST20', 'percentage', 20.00, 10000.00, 10000.00, '2026-02-20 21:03:45', '2026-04-21 21:03:45', 50, 0, 1, '2026-02-21 05:03:45'),
(3, 'FLASH15', 'percentage', 15.00, 0.00, 7500.00, '2026-02-20 21:03:45', '2026-02-27 21:03:45', 200, 0, 1, '2026-02-21 05:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `guest_token` varchar(100) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `delivery_area` varchar(255) NOT NULL,
  `delivery_landmark` varchar(255) DEFAULT NULL,
  `delivery_instructions` text DEFAULT NULL,
  `delivery_method` enum('standard','express','scheduled') DEFAULT 'standard',
  `delivery_date` date DEFAULT NULL,
  `delivery_time` varchar(50) DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','airtel_money','tnm_mpamba','card') NOT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_reference` varchar(255) DEFAULT NULL,
  `status` enum('pending','confirmed','processing','ready_for_delivery','out_for_delivery','delivered','cancelled','refunded') DEFAULT 'pending',
  `tracking_number` varchar(100) DEFAULT NULL,
  `estimated_delivery` datetime DEFAULT NULL,
  `customer_notes` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sold_count` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `num_reviews` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_best_seller` tinyint(1) DEFAULT 0,
  `is_on_sale` tinyint(1) DEFAULT 0,
  `is_new` tinyint(1) DEFAULT 0,
  `sale_ends` datetime DEFAULT NULL,
  `organic` tinyint(1) DEFAULT 0,
  `local_product` tinyint(1) DEFAULT 0,
  `min_order` int(11) DEFAULT 1,
  `max_order` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `original_price`, `unit`, `category`, `subcategory`, `stock`, `sold_count`, `rating`, `num_reviews`, `is_featured`, `is_best_seller`, `is_on_sale`, `is_new`, `sale_ends`, `organic`, `local_product`, `min_order`, `max_order`, `created_at`, `updated_at`) VALUES
(1, 'Fresh Tomatoes', 'Juicy, ripe tomatoes perfect for salads and cooking', 2500.00, NULL, '1 kg', 'Fresh Produce', NULL, 150, 0, 4.50, 0, 1, 1, 0, 0, NULL, 1, 1, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(2, 'Farm Fresh Eggs', 'Free-range eggs from local farms', 6000.00, 6500.00, 'Tray of 30', 'Dairy & Eggs', NULL, 200, 0, 5.00, 0, 1, 1, 0, 0, NULL, 1, 1, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(3, 'White Rice', 'Premium quality long-grain rice', 8500.00, 9500.00, '5 kg', 'Pantry Essentials', NULL, 300, 0, 4.00, 0, 0, 1, 0, 0, NULL, 0, 0, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(4, 'Cooking Oil', 'Pure vegetable cooking oil', 4500.00, 5000.00, '2L', 'Pantry Essentials', NULL, 150, 0, 4.00, 0, 0, 0, 0, 0, NULL, 0, 0, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(5, 'Fresh Milk', 'Pasteurized fresh milk', 2800.00, NULL, '2L', 'Dairy & Eggs', NULL, 80, 0, 4.50, 0, 1, 0, 0, 0, NULL, 0, 1, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(6, 'Brown Bread', 'Freshly baked whole wheat bread', 1500.00, NULL, '1 loaf', 'Bakery', NULL, 45, 0, 4.00, 0, 0, 0, 0, 0, NULL, 0, 1, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(7, 'Organic Bananas', 'Sweet and nutritious bananas', 2500.00, NULL, '1 bunch', 'Fresh Produce', NULL, 100, 0, 5.00, 0, 1, 1, 0, 0, NULL, 1, 1, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(8, 'Whole Chicken', 'Fresh farm chicken', 8500.00, NULL, '1.5-2 kg', 'Meat & Chicken', NULL, 50, 0, 4.50, 0, 0, 0, 0, 0, NULL, 1, 1, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(9, 'Sugar', 'Pure white sugar', 3500.00, NULL, '2kg', 'Pantry Essentials', NULL, 200, 0, 4.00, 0, 0, 0, 0, 0, NULL, 0, 0, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(10, 'Potatoes', 'Fresh Irish potatoes', 2000.00, NULL, '2kg', 'Fresh Produce', NULL, 180, 0, 4.00, 0, 0, 0, 0, 0, NULL, 1, 1, 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `created_at`) VALUES
(1, 1, '/uploads/products/tomatoes.jpg', 1, '2026-02-21 05:03:45'),
(2, 2, '/uploads/products/eggs.jpg', 1, '2026-02-21 05:03:45'),
(3, 3, '/uploads/products/rice.jpg', 1, '2026-02-21 05:03:45'),
(4, 4, '/uploads/products/oil.jpg', 1, '2026-02-21 05:03:45'),
(5, 5, '/uploads/products/milk.jpg', 1, '2026-02-21 05:03:45'),
(6, 6, '/uploads/products/bread.jpg', 1, '2026-02-21 05:03:45'),
(7, 7, '/uploads/products/bananas.jpg', 1, '2026-02-21 05:03:45'),
(8, 8, '/uploads/products/chicken.jpg', 1, '2026-02-21 05:03:45'),
(9, 9, '/uploads/products/sugar.jpg', 1, '2026-02-21 05:03:45'),
(10, 10, '/uploads/products/potatoes.jpg', 1, '2026-02-21 05:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `product_tags`
--

CREATE TABLE `product_tags` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `tag` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_tags`
--

INSERT INTO `product_tags` (`id`, `product_id`, `tag`) VALUES
(1, 1, 'organic'),
(2, 1, 'fresh'),
(3, 1, 'local'),
(4, 2, 'free-range'),
(5, 2, 'fresh'),
(6, 2, 'local'),
(7, 3, 'bulk'),
(8, 3, 'staple'),
(9, 4, 'essential'),
(10, 4, 'cooking'),
(11, 5, 'fresh'),
(12, 5, 'local'),
(13, 6, 'fresh'),
(14, 6, 'bakery'),
(15, 7, 'organic'),
(16, 7, 'fresh'),
(17, 7, 'local'),
(18, 8, 'fresh'),
(19, 8, 'local'),
(20, 8, 'halal'),
(21, 9, 'staple'),
(22, 9, 'bulk'),
(23, 10, 'fresh'),
(24, 10, 'local');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_admin_permission` (`admin_id`,`permission`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_session` (`session_id`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD UNIQUE KEY `guest_token` (`guest_token`),
  ADD KEY `idx_email` (`customer_email`),
  ADD KEY `idx_guest_token` (`guest_token`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `products` ADD FULLTEXT KEY `search_idx` (`name`,`description`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `product_tags`
--
ALTER TABLE `product_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD CONSTRAINT `product_tags_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
