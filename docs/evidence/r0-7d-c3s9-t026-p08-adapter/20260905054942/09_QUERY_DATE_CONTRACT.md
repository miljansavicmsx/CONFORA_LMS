# 09_QUERY_DATE_CONTRACT

P08_RFC3339_PATTERN=OPTIONAL_1_TO_3_DIGITS
CALENDAR_HELPERS=YYYY-MM-DD → day-start/day-end UTC with .000Z/.999Z
SUPPORTED_KEYS=createdFrom,createdTo,submittedFrom,submittedTo
LEGACY_dateFrom_dateTo=forbidden as request params (deny-list presence OK)
