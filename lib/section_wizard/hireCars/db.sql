INSERT INTO `wp_itinerary_sections` (`id`, `time_created`, `time_updated`, `properties`, `name`) VALUES
(4, '2021-10-27 16:16:42', '2021-10-27 16:16:42', '{\"jsonName\":\"hireCars\"}', 'Hire Cars');

INSERT INTO `wp_itinerary_fields` (`id`, `section`, `position`, `field_type`, `field_name`, `parent`, `type_properties`) VALUES
(42, 4, 0, 'list', 'Car', NULL, '{\"json_key\":\"hireCars\",\"excelDisplayType\":\"table\",\"key_fields\":[\"44\"]}'),
(86, 4, 6, 'text', 'Comments', 42, 'null'),
(90, 4, 0, 'text', 'Vehicle Type', 42, 'null'),
(111, 4, 1, 'costingTable', 'Costing Table', NULL, '{\"json_key\":\"costingTable\",\"data_source\":\"element\",\"data_source_properties\":{\"source\":\"44\"}}'),
(200112, 4, 0, 'text', 'Provider', 42, 'null'),
(200113, 4, 1, 'text', 'Booking Reference', 42, 'null'),
(200114, 4, 1, 'text', 'Team', 42, 'null'),
(200115, 4, 2, 'dateTime', 'Pick-up', 42, 'null'),
(200116, 4, 2, 'text', 'Pick-up Location', 42, 'null'),
(200117, 4, 3, 'dateTime', 'Drop-off', 42, 'null'),
(200118, 4, 3, 'text', 'Drop-off Location', 42, 'null'),
(200119, 4, 4, 'text', 'Seats Inc. Driver', 42, 'null'),
(200120, 4, 4, 'text', 'Car Alias', 42, 'null'),
(200121, 4, 5, 'select', 'Driver(s)', 42, '{\"data_source\":\"users\"}'),
(200122, 4, 5, 'select', 'Passengers', 42, '{\"data_source\":\"users\"}');
