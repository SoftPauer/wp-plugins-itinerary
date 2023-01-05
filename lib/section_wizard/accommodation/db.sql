INSERT INTO `wp_itinerary_sections` (`id`, `time_created`, `time_updated`, `properties`, `name`) VALUES
(3, '2021-10-27 16:01:36', '2021-10-27 16:01:36', '{\"jsonName\":\"hotels\"}', 'Accommodation');

INSERT INTO `wp_itinerary_fields` (`id`, `section`, `position`, `field_type`, `field_name`, `parent`, `type_properties`) VALUES
(25, 3, 0, 'list', 'Hotels', NULL, '{\"key_fields\":[\"26\"],\"json_key\":\"hotels\"}'),
(26, 3, 0, 'text', 'Name', 25, '{\"json_key\":\"name\"}'),
(27, 3, 1, 'text', 'Address Line One', 25, '{\"json_key\":\"addressLineOne\"}'),
(28, 3, 1, 'text', 'Address Line Two', 25, '{\"json_key\":\"addressLineTwo\"}'),
(29, 3, 2, 'text', 'City', 25, '{\"json_key\":\"city\"}'),
(30, 3, 2, 'text', 'Postcode', 25, '{\"json_key\":\"postcode\"}'),
(31, 3, 3, 'text', 'Country', 25, '{\"json_key\":\"country\"}'),
(32, 3, 4, 'text', 'Telephone Number', 25, '{\"json_key\":\"telephoneNumber\"}'),
(33, 3, 4, 'text', 'Website', 25, '{\"json_key\":\"website\"}'),
(34, 3, 5, 'text', 'Contact Name', 25, '{\"json_key\":\"contactName\"}'),
(35, 3, 5, 'text', 'Notes', 25, '{\"json_key\":\"notes\"}'),
(36, 3, 7, 'list', 'Guest', 25, '{\"json_key\":\"guests\",\"excelDisplayType\":\"table\",\"key_fields\":[\"37\",\"39\",\"40\"],\"data_transform\":\"selectWithKey\",\"data_transform_properties\":\"guests\"}'),
(37, 3, 0, 'text', 'Name', 36, '{\"json_key\":\"guestName\",\"data_source\":\"users\",\"showOnDashboard\":true,\"data_transform\":\"selectWithKey\",\"data_transform_properties\":\"guests\"}'),
(38, 3, 0, 'text', 'Room Type', 36, '{\"json_key\":\"roomType\"}'),
(39, 3, 1, 'date', 'Check In', 36, '{\"json_key\":\"checkIn\"}'),
(40, 3, 1, 'date', 'Check Out', 36, '{\"json_key\":\"checkOut\"}'),
(77, 3, 2, 'text', 'Comments', 36, '{\"json_key\":\"comments\"}'),
(107, 3, 2, 'text', 'Second Guest', 36, '{\"json_key\":\"second_guest\",\"data_source\":\"users\"}'),
(110, 3, 6, 'costingTable', 'Costing table', 25, '{\"json_key\":\"costingTable\",\"data_source\":\"element\",\"data_source_properties\":{\"source\":\"37\"}}');

