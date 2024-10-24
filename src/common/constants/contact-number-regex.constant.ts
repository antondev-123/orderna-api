// Note: This implementation currently supports Philippine contact numbers only.
// For more details, refer to: https://en.wikipedia.org/wiki/Telephone_numbers_in_the_Philippines

// Regex pattern for Philippine country code. The country code should be +63.
export const COUNTRY_CODE_REGEX = /^\+63$/;

// Regex pattern for Philippine mobile numbers. Mobile numbers must be 10 digits long.
export const MOBILE_NUMBER_REGEX = /^\d{10}$/;

// Regex pattern for Philippine landline telephone numbers. Telephone numbers should be 9 digits long.
export const TELEPHONE_NUMBER_REGEX = /^\d{9}$/;
