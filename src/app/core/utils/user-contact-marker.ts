const USER_CONTACT_PHONE_PREFIX = '__user_account__|';

/**
 * Encodes a phone value so the contact remains marked as user-linked.
 * @param phone User-facing phone value.
 * @returns Encoded phone value persisted in the contacts table.
 */
export function encodeUserContactPhone(phone: string | null | undefined): string {
  return `${USER_CONTACT_PHONE_PREFIX}${String(phone ?? '').trim()}`;
}

/**
 * Checks whether a stored phone value belongs to a user-linked contact.
 * @param phone Stored phone value.
 * @returns True when the user marker prefix is present.
 */
export function isUserContactPhone(phone: string | null | undefined): boolean {
  return String(phone ?? '').startsWith(USER_CONTACT_PHONE_PREFIX);
}

/**
 * Decodes a stored phone value back to the user-facing phone number.
 * @param phone Stored phone value.
 * @returns Clean phone number without internal marker prefix.
 */
export function decodeUserContactPhone(phone: string | null | undefined): string {
  const raw = String(phone ?? '');
  return isUserContactPhone(raw) ? raw.slice(USER_CONTACT_PHONE_PREFIX.length) : raw;
}
