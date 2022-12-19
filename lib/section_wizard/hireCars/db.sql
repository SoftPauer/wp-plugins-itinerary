INSERT INTO `wp_itinerary_sections` (`id`, `time_created`, `time_updated`, `properties`, `name`) VALUES
(4, '2021-10-27 16:16:42', '2021-10-27 16:16:42', '{\"jsonName\":\"hireCars\"}', 'Hire Cars');

INSERT INTO `wp_itinerary_fields` (`id`, `section`, `position`, `field_type`, `field_name`, `parent`, `type_properties`) VALUES
(41, 4, 0, 'text', 'Notes', NULL, '{\"json_key\":\"notes\"}'),
(42, 4, 2, 'list', 'Car', NULL, '{\"json_key\":\"hireCars\",\"excelDisplayType\":\"table\",\"key_fields\":[\"44\"]}'),
(43, 4, 3, 'text', 'Car Type', 42, '{\"json_key\":\"carType\"}'),
(44, 4, 2, 'text', 'Main Driver', 42, '{\"json_key\":\"mainDriver\",\"data_source\":\"users\",\"showOnDashboard\":true}'),
(45, 4, 2, 'text', 'Second Driver', 42, '{\"json_key\":\"secondDriver\",\"data_source\":\"users\"}'),
(46, 4, 4, 'text', 'Pick Up', 42, '{\"json_key\":\"pickUp\"}'),
(47, 4, 4, 'text', 'Return', 42, '{\"json_key\":\"return\"}'),
(84, 4, 1, 'text', 'Alpine ref', 42, '{\"json_key\":\"alpine_ref\"}'),
(85, 4, 7, 'text', 'Arrival Flight', 42, 'null'),
(86, 4, 7, 'text', 'Comments', 42, 'null'),
(87, 4, 8, 'text', 'Reservation No', 42, 'null'),
(88, 4, 8, 'text', 'Rental Days', 42, 'null'),
(89, 4, 9, 'text', 'Rental Price', 42, 'null'),
(90, 4, 0, 'text', 'Supplier', 42, 'null'),
(92, 4, 1, 'text', 'Team', 42, 'null'),
(111, 4, 1, 'costingTable', 'Costing Table', NULL, '{\"json_key\":\"costingTable\",\"data_source\":\"element\",\"data_source_properties\":{\"source\":\"44\"}}');

