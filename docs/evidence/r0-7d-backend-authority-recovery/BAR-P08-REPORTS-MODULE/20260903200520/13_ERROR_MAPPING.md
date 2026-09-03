# Error Mapping

P08_ZOD_TRANSPORT_ERROR_BRIDGE=ENABLED
P08_EXCEPTION_FILTER_TYPES=ReportQueryContractError | ZodValidationException
P08_UNEXPECTED_ERROR_PASSTHROUGH=true
P08_ZOD_ERROR_MAPPING_COMPLETE=true
P08_STATIC_SAFE_MESSAGE_COUNT=9
P08_RAW_VALUE_ERROR_ECHO_COUNT=0

Priority:
1 unrecognized_keys -> UNKNOWN_FILTER
2 allowlisted non-string structure -> INVALID_INVOCATION
3 invalid status -> INVALID_STATUS
4 invalid schemeRef -> INVALID_SCHEME_REF
5 invalid date field -> MALFORMED_DATE
6 otherwise -> INVALID_INVOCATION

400 body shape: { statusCode: 400, code, message }
