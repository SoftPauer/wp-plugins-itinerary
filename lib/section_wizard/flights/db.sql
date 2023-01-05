INSERT INTO `wp_itinerary_sections` (`id`, `time_created`, `time_updated`, `properties`, `name`) VALUES
(2, '2021-10-27 15:52:51', '2021-10-27 15:52:51', '{\"jsonName\":\"flights\"}', 'Flights');

INSERT INTO `wp_itinerary_fields` ( `id`,`section`, `position`, `field_type`, `field_name`, `parent`, `type_properties`) VALUES
(15, 2, 1, 'list', 'Flight', NULL, '{\"json_key\":\"flights\",\"key_fields\":[\"16\",\"79\",\"80\"]}'),
(16, 2, 0, 'date', 'Flight Date', 15, '{\"json_key\":\"flightDate\"}'),
(17, 2, 2, 'select', 'Passengers', 15, '{\"data_source\":\"users\",\"data_transform\":\"selectWithKey\",\"data_transform_properties\":\"passenger\",\"json_key\":\"passengers\",\"showOnDashboard\":true}'),
(79, 2, 3, 'text', 'Outbound Airport Abr', 15, '{\"json_key\":\"outboundAirportAbr\",\"required\":false}'),
(80, 2, 3, 'text', 'Inbound Airport Abr', 15, '{\"json_key\":\"inboundAirportAbr\"}'),
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
(196, 2, 5, 'group', 'Arrival', 15, '{\"json_key\":\"arrival\"}'),
(197, 2, 0, 'dateTime', 'Departure Time', 195, '{\"json_key\":\"dep_time\"}'),
(198, 2, 3, 'text', 'Departure Delay', 195, '{\"json_key\":\"dep_delayed\",\"field_description\":\"Delay in minuets\"}'),
(199, 2, 3, 'text', 'Arrival Delay', 196, '{\"json_key\":\"arr_delayed\",\"field_description\":\"Delay in minuets \"}'),
(200, 2, 3, 'text', 'Status', 196, '{\"json_key\":\"status\"}'),
(201, 2, 2, 'text', 'Booking Reference', 15, '{\"json_key\":\"actualBookingRef\"}'),
(202, 2, 1, 'flightButton', 'Get Flight Data', 15, 'null'),
(215, 2, 3, 'text', 'Outbound Airport', 195, '{\"json_key\":\"dep_name\"}'),
(216, 2, 4, 'text', 'Inbound Airport', 196, '{\"json_key\":\"arr_name\"}');