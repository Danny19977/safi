-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 27, 2026 at 05:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cafeblog`
--

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE `authors` (
  `author_id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `bio` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `profile_picture` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `social_links` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 COLLATE=armscii8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blogposts`
--

CREATE TABLE `blogposts` (
  `post_id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `users_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `published_at` datetime NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=armscii8 COLLATE=armscii8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coffeeorder`
--

CREATE TABLE `coffeeorder` (
  `uuid` varchar(225) NOT NULL,
  `created_at` varchar(50) NOT NULL,
  `updated_at` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `quntity` varchar(50) NOT NULL,
  `ordernumber` varchar(50) NOT NULL,
  `ordername` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coffeeorder`
--

INSERT INTO `coffeeorder` (`uuid`, `created_at`, `updated_at`, `name`, `phone`, `address`, `type`, `quntity`, `ordernumber`, `ordername`, `status`) VALUES
('0100dfc3-b616-442d-9f65-8ef5a82678f5', '2026-04-20 14:19:02', '2026-04-20 14:19:02', 'Danny', '842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'pack', '1', 'SAFI-6BF579-20260420', '1', 'pending'),
('02a2bdb1-3029-4456-98dd-8be6c4f624d3', '', '', 'Danny', '842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'pack', '1', 'SAFI-12A66A-20260420', '0', 'pending'),
('56471f59-04db-40d4-8aba-2ed7f993c15b', '', '2026-04-20 14:50:39', 'Danny', '629764761', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'hot_drink', '1', 'SAFI-89389D-20260420', 'Capuccino x1', 'not_delivered'),
('56bc01d9-b3ab-49a0-9825-bb51f4953ce4', '2026-04-27 16:57:42', '2026-04-27 16:57:42', 'Danny', '0842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'hot_drink', '1', 'SAFI-639996-20260427', '1', 'pending'),
('6af28942-27d7-4422-b352-558bc22b73f1', '', '', 'Danny', '842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'hot_drink', '1', 'SAFI-E02A1C-20260420', '0', 'pending'),
('7c956179-f27b-45ea-a279-1ebfdae6b0da', '', '', 'Danny', '842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'hot_drink', '2', 'SAFI-EEA4CC-20260420', '0', 'pending'),
('aed8ce9e-43da-4341-bcf2-ad57e2bf8e4a', '2026-04-20 17:45:07', '2026-04-20 17:45:29', 'Danny', '0842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'pack', '10', 'SAFI-366CB1-20260420', '1', 'delivered'),
('bd4b6bd1-60e8-45d1-937b-a3c8eef48c37', '2026-04-23 12:19:52', '2026-04-23 12:19:52', 'Danny', '0842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'hot_drink', '2', 'SAFI-8A5158-20260423', '2', 'pending'),
('ee226383-e08e-4226-a771-ec7c9f28b0ab', '2026-04-20 14:17:57', '2026-04-20 14:50:36', 'Danny', '842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'hot_drink', '1', 'SAFI-5DA536-20260420', '1', 'not_delivered'),
('f331153b-5117-44eb-b620-829dba258596', '', '', 'Danny', '842129419', 'Avenue: Croisement des Aviateur et de la Paix  - N', 'pack', '1', 'SAFI-DC6E67-20260420', '0', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `Comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `uuid` char(36) NOT NULL,
  `fullname` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `export`
--

CREATE TABLE `export` (
  `uuid` varchar(50) NOT NULL,
  `exponumber` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  `orderitem_uuid` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `export`
--

INSERT INTO `export` (`uuid`, `exponumber`, `country`, `orderitem_uuid`) VALUES
('6727cb21-67f5-4acf-8de4-a47a0af5ba69', 'EXP-12ADFE-20260420', 'Congo (DRC)', 'bc26fb47-92f3-40ff-ae05-61c86eee6ad7'),
('364205bf-912d-4a09-96e5-9322fdcf7ebc', 'EXP-DC7542-20260420', 'Congo (DRC)', '5faf4e7c-bfda-48a0-958f-168e8325c03c'),
('fad98aa2-13c4-4267-8325-c15426e4768a', 'EXP-6C0FB1-20260420', 'Angola', 'bae21ca0-38a3-4daf-83ea-86d4610e9fa2'),
('0286ac8c-9081-48b2-9b2e-bb0c1eb8b340', 'EXP-367BBD-20260420', 'South Africa', '4096a9c2-14d3-4503-a284-fb606405b7f8');

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `uuid` varchar(50) NOT NULL,
  `created_at` varchar(50) NOT NULL,
  `updated_at` varchar(50) NOT NULL,
  `coffeeorder_uuid` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `quantity` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_item`
--

INSERT INTO `order_item` (`uuid`, `created_at`, `updated_at`, `coffeeorder_uuid`, `name`, `type`, `quantity`) VALUES
('16ab84cc-7505-4e1c-ad40-621e383e2344', '', '', '7c956179-f27b-45ea-a279-1ebfdae6b0da', 'Americano', 'hot_drink', '1'),
('1ede13e6-a684-424e-8d1c-ca720572a6e3', '2026-04-20 14:17:57', '2026-04-20 14:17:57', 'ee226383-e08e-4226-a771-ec7c9f28b0ab', 'Cafe glace', 'hot_drink', '1'),
('4096a9c2-14d3-4503-a284-fb606405b7f8', '2026-04-20 17:45:07', '2026-04-20 17:45:07', 'aed8ce9e-43da-4341-bcf2-ad57e2bf8e4a', 'Pack 250g', 'pack', '10'),
('4d661ef3-be05-4425-ad6e-3210cd003c8c', '', '', '7c956179-f27b-45ea-a279-1ebfdae6b0da', 'Espresso', 'hot_drink', '1'),
('5c6dfc96-b1b2-44f7-b129-d84fc19cd09a', '', '', '6af28942-27d7-4422-b352-558bc22b73f1', 'Capuccino', 'hot_drink', '1'),
('5faf4e7c-bfda-48a0-958f-168e8325c03c', '', '', 'f331153b-5117-44eb-b620-829dba258596', 'Pack 250g', 'pack', '1'),
('6d0a53e6-e9d3-4732-8dc4-72a8942e6c42', '', '', '56471f59-04db-40d4-8aba-2ed7f993c15b', 'Capuccino', 'hot_drink', '1'),
('924c4021-6a84-498a-abec-feca8a3a0a6e', '2026-04-23 12:19:52', '2026-04-23 12:19:52', 'bd4b6bd1-60e8-45d1-937b-a3c8eef48c37', 'Americano', 'hot_drink', '1'),
('bae21ca0-38a3-4daf-83ea-86d4610e9fa2', '2026-04-20 14:19:02', '2026-04-20 14:19:02', '0100dfc3-b616-442d-9f65-8ef5a82678f5', 'Pack 500g', 'pack', '1'),
('bc26fb47-92f3-40ff-ae05-61c86eee6ad7', '', '', '02a2bdb1-3029-4456-98dd-8be6c4f624d3', 'Pack 500g', 'pack', '1'),
('deeab205-8f0d-4a49-a332-74fdf1dd57ec', '2026-04-23 12:19:52', '2026-04-23 12:19:52', 'bd4b6bd1-60e8-45d1-937b-a3c8eef48c37', 'The au citron', 'hot_drink', '1'),
('f3ff5514-1610-4f59-bd69-4a116c8b80f3', '2026-04-27 16:57:42', '2026-04-27 16:57:42', '56bc01d9-b3ab-49a0-9825-bb51f4953ce4', 'The au gingembre +miel', 'hot_drink', '1');

-- --------------------------------------------------------

--
-- Table structure for table `posttags`
--

CREATE TABLE `posttags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `tag_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `users_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`users_id`, `name`, `email`, `password`, `profile_picture`, `created_at`) VALUES
(1, 'Admin', 'admin@gmail.com', '$2y$10$BH4dfWFAN9PPxB/NkGTmR.8JiY3H0uZH30VBFKTwATiUXjBGGj.5G', '', '2025-07-11 16:32:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`author_id`);

--
-- Indexes for table `blogposts`
--
ALTER TABLE `blogposts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `author_id` (`users_id`,`category_id`);

--
-- Indexes for table `coffeeorder`
--
ALTER TABLE `coffeeorder`
  ADD PRIMARY KEY (`uuid`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`Comment_id`),
  ADD KEY `Users` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`uuid`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`uuid`);

--
-- Indexes for table `posttags`
--
ALTER TABLE `posttags`
  ADD KEY `post_id` (`post_id`,`tag_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`tag_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`users_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `author_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blogposts`
--
ALTER TABLE `blogposts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `Comment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `users_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
