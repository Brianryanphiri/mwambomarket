-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 22, 2026 at 11:29 AM
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
(1, 'Super Admin', 'admin@mwambo.store', '$2a$10$YourHashedPasswordHere', 'super_admin', 1, NULL, '2026-02-21 05:03:45', '2026-02-21 05:03:45'),
(2, 'Brian Phiri', 'ryanjuniorphiri@gmail.com', '$2a$10$UyhKoB43BdWwMnU3CgD4Key7pcKze3.HUfeOaRwCKm6Pe2cc3j9K2', 'super_admin', 1, '2026-02-22 00:28:46', '2026-02-21 09:39:00', '2026-02-22 08:28:46');

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
(5, 1, 'view_analytics'),
(14, 2, 'cancel_orders'),
(9, 2, 'create_products'),
(22, 2, 'customer_support'),
(11, 2, 'delete_products'),
(10, 2, 'edit_products'),
(29, 2, 'manage_admins'),
(21, 2, 'manage_customers'),
(23, 2, 'manage_discounts'),
(28, 2, 'manage_payment'),
(26, 2, 'manage_settings'),
(27, 2, 'manage_shipping'),
(18, 2, 'manage_suppliers'),
(13, 2, 'process_orders'),
(15, 2, 'refund_orders'),
(24, 2, 'send_newsletters'),
(19, 2, 'stock_alerts'),
(17, 2, 'update_stock'),
(25, 2, 'view_analytics'),
(20, 2, 'view_customers'),
(16, 2, 'view_inventory'),
(12, 2, 'view_orders'),
(8, 2, 'view_products');

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
-- Table structure for table `inventory_log`
--

CREATE TABLE `inventory_log` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `previous_stock` int(11) NOT NULL,
  `new_stock` int(11) NOT NULL,
  `change_amount` int(11) NOT NULL,
  `change_type` enum('sale','purchase','return','adjustment','restock') NOT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `weight` decimal(10,2) DEFAULT NULL,
  `is_taxable` tinyint(1) DEFAULT 1,
  `tax_rate` varchar(20) DEFAULT NULL,
  `is_physical` tinyint(1) DEFAULT 1,
  `requires_shipping` tinyint(1) DEFAULT 1,
  `status` enum('active','draft','out_of_stock') DEFAULT 'active',
  `category` varchar(100) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `low_stock_alert` int(11) DEFAULT 10,
  `sold_count` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `num_reviews` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_best_seller` tinyint(1) DEFAULT 0,
  `is_on_sale` tinyint(1) DEFAULT 0,
  `is_new` tinyint(1) DEFAULT 0,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `sale_ends` datetime DEFAULT NULL,
  `organic` tinyint(1) DEFAULT 0,
  `local_product` tinyint(1) DEFAULT 0,
  `min_order` int(11) DEFAULT 1,
  `max_order` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `original_price`, `unit`, `weight`, `is_taxable`, `tax_rate`, `is_physical`, `requires_shipping`, `status`, `category`, `category_id`, `sku`, `barcode`, `subcategory`, `stock`, `low_stock_alert`, `sold_count`, `rating`, `num_reviews`, `is_featured`, `is_best_seller`, `is_on_sale`, `is_new`, `seo_title`, `seo_description`, `seo_keywords`, `sale_ends`, `organic`, `local_product`, `min_order`, `max_order`, `created_at`, `created_by`, `updated_by`, `updated_at`) VALUES
(5, 'Fresh Milk', 'Pasteurized fresh milk', 2800.00, 0.00, '2L', 0.00, 1, '16', 1, 1, NULL, 'Dairy & Eggs', 2, 'SKU-000005', '', '', 80, 10, 0, NULL, 0, 1, 0, 0, 0, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, '2026-02-21 05:03:45', NULL, NULL, '2026-02-22 10:24:55'),
(11, 'Fresh Milk (Copy)', 'Pasteurized fresh milk', 2800.00, 0.00, '2L', 0.00, 1, '16', 1, 1, NULL, 'Dairy & Eggs', NULL, 'SKU-000005-COPY', '', '', 80, 10, 0, 0.00, 0, 1, 0, 0, 0, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, '2026-02-22 10:25:21', NULL, NULL, '2026-02-22 10:25:54');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `name`, `slug`, `description`, `parent_id`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Fresh Produce', 'fresh-produce', 'Fresh fruits and vegetables', NULL, NULL, 1, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(2, 'Dairy & Eggs', 'dairy-eggs', 'Fresh dairy products and eggs', NULL, NULL, 2, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(3, 'Meat & Chicken', 'meat-chicken', 'Fresh meat and poultry', NULL, NULL, 3, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(4, 'Pantry Essentials', 'pantry-essentials', 'Essential pantry items', NULL, NULL, 4, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(5, 'Bakery', 'bakery', 'Fresh bread and baked goods', NULL, NULL, 5, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(6, 'Beverages', 'beverages', 'Drinks and beverages', NULL, NULL, 6, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(7, 'Household', 'household', 'Household essentials', NULL, NULL, 7, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `alt`, `is_primary`, `sort_order`, `created_at`) VALUES
(5, 5, '/uploads/products/milk.jpg', NULL, 1, 0, '2026-02-21 05:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_suppliers`
--

CREATE TABLE `product_suppliers` (
  `product_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `supplier_sku` varchar(100) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `lead_time_days` int(11) DEFAULT NULL,
  `is_preferred` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_suppliers`
--

INSERT INTO `product_suppliers` (`product_id`, `supplier_id`, `supplier_sku`, `cost_price`, `lead_time_days`, `is_preferred`, `created_at`) VALUES
(5, 1, NULL, 1960.00, 2, 1, '2026-02-22 08:54:55');

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
(336, 5, 'f'),
(337, 5, ','),
(338, 5, ' '),
(339, 5, 'r'),
(340, 5, ','),
(341, 5, ' '),
(342, 5, 'e'),
(343, 5, ','),
(344, 5, ' '),
(345, 5, 's'),
(346, 5, ','),
(347, 5, ' '),
(348, 5, 'h'),
(349, 5, ','),
(350, 5, ' '),
(351, 5, ','),
(352, 5, ','),
(353, 5, ' '),
(354, 5, ' '),
(355, 5, ','),
(356, 5, ' '),
(357, 5, 'l'),
(358, 5, ','),
(359, 5, ' '),
(360, 5, 'o'),
(361, 5, ','),
(362, 5, ' '),
(363, 5, 'c'),
(364, 5, ','),
(365, 5, ' '),
(366, 5, 'a'),
(367, 5, ','),
(368, 5, ' '),
(369, 5, 'l'),
(404, 11, 'f'),
(405, 11, ','),
(406, 11, ' '),
(407, 11, ','),
(408, 11, ','),
(409, 11, ' '),
(410, 11, ' '),
(411, 11, ','),
(412, 11, ' '),
(413, 11, 'r'),
(414, 11, ','),
(415, 11, ' '),
(416, 11, ','),
(417, 11, ','),
(418, 11, ' '),
(419, 11, ' '),
(420, 11, ','),
(421, 11, ' '),
(422, 11, 'e'),
(423, 11, ','),
(424, 11, ' '),
(425, 11, ','),
(426, 11, ','),
(427, 11, ' '),
(428, 11, ' '),
(429, 11, ','),
(430, 11, ' '),
(431, 11, 's'),
(432, 11, ','),
(433, 11, ' '),
(434, 11, ','),
(435, 11, ','),
(436, 11, ' '),
(437, 11, ' '),
(438, 11, ','),
(439, 11, ' '),
(440, 11, 'h'),
(441, 11, ','),
(442, 11, ' '),
(443, 11, ','),
(444, 11, ','),
(445, 11, ' '),
(446, 11, ' '),
(447, 11, ','),
(448, 11, ' '),
(449, 11, ','),
(450, 11, ','),
(451, 11, ' '),
(452, 11, ','),
(453, 11, ','),
(454, 11, ' '),
(455, 11, ' '),
(456, 11, ','),
(457, 11, ' '),
(458, 11, ' '),
(459, 11, ','),
(460, 11, ' '),
(461, 11, ','),
(462, 11, ','),
(463, 11, ' '),
(464, 11, ' '),
(465, 11, ','),
(466, 11, ' '),
(467, 11, 'l'),
(468, 11, ','),
(469, 11, ' '),
(470, 11, ','),
(471, 11, ','),
(472, 11, ' '),
(473, 11, ' '),
(474, 11, ','),
(475, 11, ' '),
(476, 11, 'o'),
(477, 11, ','),
(478, 11, ' '),
(479, 11, ','),
(480, 11, ','),
(481, 11, ' '),
(482, 11, ' '),
(483, 11, ','),
(484, 11, ' '),
(485, 11, 'c'),
(486, 11, ','),
(487, 11, ' '),
(488, 11, ','),
(489, 11, ','),
(490, 11, ' '),
(491, 11, ' '),
(492, 11, ','),
(493, 11, ' '),
(494, 11, 'a'),
(495, 11, ','),
(496, 11, ' '),
(497, 11, ','),
(498, 11, ','),
(499, 11, ' '),
(500, 11, ' '),
(501, 11, ','),
(502, 11, ' '),
(503, 11, 'l');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `payment_terms` text DEFAULT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `city`, `payment_terms`, `tax_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Dedza Farmers Co-op', 'John Banda', 'info@dedzafarmers.mw', '+265 999 123 456', NULL, 'Dedza', NULL, NULL, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(2, 'Lilongwe Fresh Produce', 'Mary Phiri', 'sales@lilongwefresh.mw', '+265 888 789 012', NULL, 'Lilongwe', NULL, NULL, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55'),
(3, 'Blantyre Wholesalers', 'David Chibwana', 'orders@blantyrewholesale.mw', '+265 777 345 678', NULL, 'Blantyre', NULL, NULL, 1, '2026-02-22 08:54:55', '2026-02-22 08:54:55');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indexes for table `inventory_log`
--
ALTER TABLE `inventory_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_type` (`change_type`),
  ADD KEY `idx_created` (`created_at`);

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
  ADD KEY `idx_order_items_product` (`product_id`);

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_price` (`price`),
  ADD KEY `idx_products_created` (`created_at`),
  ADD KEY `idx_products_status` (`status`);
ALTER TABLE `products` ADD FULLTEXT KEY `search_idx` (`name`,`description`);
ALTER TABLE `products` ADD FULLTEXT KEY `idx_search` (`name`,`description`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_parent` (`parent_id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_sort` (`sort_order`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_sort` (`product_id`,`sort_order`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_approved` (`is_approved`),
  ADD KEY `idx_rating` (`rating`);

--
-- Indexes for table `product_suppliers`
--
ALTER TABLE `product_suppliers`
  ADD PRIMARY KEY (`product_id`,`supplier_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_tags_product` (`product_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_sku` (`sku`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist_item` (`session_id`,`product_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_session` (`session_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admin_permissions`
--
ALTER TABLE `admin_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

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
-- AUTO_INCREMENT for table `inventory_log`
--
ALTER TABLE `inventory_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_tags`
--
ALTER TABLE `product_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=504;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `inventory_log`
--
ALTER TABLE `inventory_log`
  ADD CONSTRAINT `inventory_log_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_log_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_log_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_suppliers`
--
ALTER TABLE `product_suppliers`
  ADD CONSTRAINT `product_suppliers_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_suppliers_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD CONSTRAINT `product_tags_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
