INSERT INTO `wp_itinerary_sections` (`id`, `time_created`, `time_updated`, `properties`, `name`) VALUES
(8, '2021-10-28 10:16:13', '2021-10-28 10:16:13', '{\"jsonName\":\"eventCalendar\"}', 'Activities');

INSERT INTO `wp_itinerary_fields` (`id`, `section`, `position`, `field_type`, `field_name`, `parent`, `type_properties`) VALUES
(203, 8, 1, 'text', 'Event Banner', NULL, '{\"json_key\":\"eventBanner\"}'),
(204, 8, 2, 'list', 'Event Day', NULL, '{\"json_key\":\"eventDays\",\"key_fields\":[\"205\"]}'),
(205, 8, 0, 'text', 'Day', 204, '{\"json_key\":\"day\"}'),
(206, 8, 0, 'date', 'Date', 204, '{\"json_key\":\"date\"}'),
(207, 8, 1, 'list', 'Event', 204, '{\"json_key\":\"events\",\"key_fields\":[\"208\"]}'),
(208, 8, 0, 'text', 'Event Name', 207, '{\"json_key\":\"eventName\"}'),
(209, 8, 1, 'time', 'Event starts', 207, '{\"json_key\":\"eventTime\"}'),
(210, 8, 2, 'select', 'Attendees', 207, '{\"json_key\":\"attendees\",\"data_source\":\"users\"}'),
(211, 8, 2, 'text', 'Event Location', 207, '{\"json_key\":\"eventLocation\"}'),
(212, 8, 1, 'time', 'Event ends', 207, '{\"json_key\":\"eventTimeEnd\"}');