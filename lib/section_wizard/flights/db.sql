INSERT INTO `wp_itinerary_sections` (`id`, `time_created`, `time_updated`, `properties`, `name`) VALUES
(2, '2021-10-27 15:52:51', '2021-10-27 15:52:51', '{\"jsonName\":\"flights\"}', 'Flights');

INSERT INTO `wp_itinerary_fields` (`id`, `section`, `position`, `field_type`, `field_name`, `parent`, `type_properties`) VALUES
(15, 2, 1, 'list', 'Flight', NULL, '{\"json_key\":\"flights\",\"key_fields\":[\"16\",\"79\",\"80\"]}'),
(16, 2, 0, 'date', 'Flight Date', 15, '{\"json_key\":\"flightDate\"}'),
(17, 2, 2, 'select', 'Passengers', 15, '{\"data_source\":\"users\",\"data_transform\":\"selectWithKey\",\"data_transform_properties\":\"passenger\",\"json_key\":\"passengers\",\"showOnDashboard\":true}'),
(18, 2, 7, 'list', 'Bus Leader', 15, '{\"json_key\":\"busLeaders\",\"key_fields\":[\"19\"]}'),
(19, 2, 0, 'text', 'Name', 18, '{\"json_key\":\"name\",\"data_source\":\"users\"}'),
(20, 2, 0, 'text', 'Event Id', 18, '{\"json_key\":\"eventId\"}'),
(21, 2, 8, 'list', 'Event', 15, '{\"json_key\":\"events\"}'),
(22, 2, 0, 'dateTime', 'Time', 21, '{\"json_key\":\"time\"}'),
(23, 2, 1, 'text', 'Description', 21, '{\"json_key\":\"description\",\"data_source\":\"events\"}'),
(24, 2, 1, 'select', 'Applies For', 21, '{\"json_key\":\"appliesFor\",\"data_source\":\"parent\",\"data_source_properties\":{\"source\":\"17\"}}'),
(79, 2, 3, 'text', 'Outbound Airport Abr', 15, '{\"json_key\":\"outboundAirportAbr\",\"required\":false}'),
(80, 2, 3, 'text', 'Inbound Airport Abr', 15, '{\"json_key\":\"inboundAirportAbr\"}'),
(81, 2, 4, 'text', 'Duration', 15, '{\"json_key\":\"duration\",\"required\":false}'),
(83, 2, 0, 'text', 'Time Zone', 21, '{\"json_key\":\"timezone\",\"data_source\":\"timezones\"}'),
(109, 2, 9, 'costingTable', 'Costing Table', 15, '{\"json_key\":\"costingTable\",\"data_source\":\"parent\",\"data_source_properties\":{\"source\":\"17\"}}'),
(185, 2, 0, 'text', 'Flight Number', 15, '{\"json_key\":\"bookref\",\"field_description\":\"Number given to each flight\",\"required\":true}'),
(186, 2, 2, 'text', 'Departure Terminal', 195, '{\"json_key\":\"dep_terminal\"}'),
(187, 2, 2, 'text', 'Departure Gate', 195, '{\"json_key\":\"dep_gate\"}'),
(188, 2, 2, 'text', 'Arrival Terminal', 196, '{\"json_key\":\"arr_terminal\"}'),
(189, 2, 2, 'text', 'Arrival Gate', 196, '{\"json_key\":\"arr_gate\"}'),
(190, 2, 0, 'dateTime', 'Departure Time Estimate ', 195, '{\"json_key\":\"dep_estimated\"}'),
(191, 2, 1, 'dateTime', 'Arrival Time Estimate ', 196, '{\"json_key\":\"arr_estimated\"}'),
(194, 2, 1, 'dateTime', 'Arrival Time', 196, '{\"json_key\":\"arr_time\"}'),
(195, 2, 5, 'group', 'Departure ', 15, '{\"json_key\":\"departure\"}'),
(196, 2, 5, 'group', 'Arrival', 15, '{\"json_key\":\"arrival\"}');

