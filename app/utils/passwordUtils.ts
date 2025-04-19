import bcrypt from "bcrypt";

/**
 * Hashes a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a password against a hash
 * @param password The plain text password to verify
 * @param hash The hash to verify against
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a default password based on date of birth
 * @param dateOfBirth The date of birth string in ISO format (YYYY-MM-DD)
 * @returns A password in DDMMYYYY format, or a fallback password if date is invalid
 */
export function generatePasswordFromDOB(
  dateOfBirth: string | null | undefined
): string {
  if (!dateOfBirth) {
    return "Welcome123"; // Fallback password if no DOB provided
  }

  try {
    const dob = new Date(dateOfBirth);

    // Check if date is valid
    if (isNaN(dob.getTime())) {
      return "Welcome123";
    }

    // Format as DDMMYYYY
    const day = String(dob.getDate()).padStart(2, "0");
    const month = String(dob.getMonth() + 1).padStart(2, "0");
    const year = dob.getFullYear();

    return `${day}${month}${year}`;
  } catch (error) {
    console.error("Error generating password from DOB:", error);
    return "Welcome123";
  }
}

/**
 * Generates a secure random password
 * @param length The length of the password to generate (default: 10)
 * @returns A random password
 */
export function generateSecurePassword(length: number = 10): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";

  // Ensure at least one character from each category
  password += charset.substring(0, 26).charAt(Math.floor(Math.random() * 26)); // lowercase
  password += charset.substring(26, 52).charAt(Math.floor(Math.random() * 26)); // uppercase
  password += charset.substring(52, 62).charAt(Math.floor(Math.random() * 10)); // number
  password += charset
    .substring(62)
    .charAt(Math.floor(Math.random() * (charset.length - 62))); // special

  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

/**
 * Generates a secure token for password reset
 * @returns A secure token
 */
export function generateSecureToken(): string {
  return Array(40)
    .fill(0)
    .map(() => Math.random().toString(36).charAt(2))
    .join("");
}
