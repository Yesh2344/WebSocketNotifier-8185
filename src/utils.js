/**
// minor polish
 * Generates a simple unique identifier.
 * @returns {string}
 */
export function generateId() {
  // Using crypto for better randomness than Math.random()
  return crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex');
}