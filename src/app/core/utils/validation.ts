/**
 * Validates whether the given name consists of at least two words
 * (first name and last name), each containing only alphabetic characters.
 * Supports German umlauts, ß and hyphens.
 *
 * @param input - The full name string to validate.
 * @returns True if the name contains at least two valid alphabetic words, otherwise false.
 */
export function isValidName(input: string): boolean {
  if (!input) return false;

  const trimmed = input.trim();

  const regex =
    /^[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*(?:\s+[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*)+$/;

  return regex.test(trimmed) && trimmed.length <= 30;
}

/**
 * Validates whether the given string is a properly formatted email address.
 * @param input - The email string to validate.
 * @returns True if the email format is valid, otherwise false.
 */
export function isValidEmail(input: string): boolean {
  if (!input) return false;

  const trimmed = input.trim();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 35;
}

/**
 * Validates whether the given string is a valid phone number.
 * Accepts numbers with or without a leading "+" and requires at least 10 digits and maximum 15 digits.
 * @param input - The phone number string to validate.
 * @returns True if the phone number is valid, otherwise false.
 */
export function isValidPhone(input: string): boolean {
  if (!input) return false;

  if (input.startsWith('+')) {
    const digits = input.slice(1);
    return /^\d+$/.test(digits) && digits.length >= 10 && digits.length <= 15;
  }

  return /^\d+$/.test(input) && input.length >= 10 && input.length <= 15;
}

/**
 * Validates whether the given password meets the minimum length requirement.
 * @param input - The password string to validate.
 * @returns True if the password is at least 8 characters long, otherwise false.
 */
export function isValidPassword(input: string): boolean {
  if (!input) return false;
  return input.length >= 8;
}

/**
 * Validates the given title
 *
 * @param input - The full name string to validate.
 * @returns True if the name contains at least two valid alphabetic words, otherwise false.
 */
export function isValidTitle(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  return trimmed.length <= 40;
}

/**
 * Validates the given description (optional field).
 *
 * @param input - The description string to validate.
 * @returns True if empty or up to 200 characters, otherwise false.
 */
export function isValidDescription(input: string): boolean {
  if (!input) return true;
  return input.trim().length <= 200;
}

/**
 * Validates the given due date.
 *
 * @param input - The date string to validate (expected format: YYYY-MM-DD).
 * @returns True if the date is valid and not in the past, otherwise false.
 */
export function isValidDueDate(input: string): boolean {
  if (!input) return false;
  const date = new Date(input + 'T00:00:00');
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Validates the given category (required field).
 *
 * @param input - The category string to validate.
 * @returns True if a category is selected (non-empty), otherwise false.
 */
export function isValidCategory(input: string): boolean {
  if (!input) return false;
  return input.trim().length > 0;
}
