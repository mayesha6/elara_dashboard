export const STRONG_PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special characters.";

export const isStrongPassword = (password: unknown): password is string =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export const requireStrongPassword = (password: unknown): void => {
  if (!isStrongPassword(password)) {
    throw new Error(STRONG_PASSWORD_MESSAGE);
  }
};
