/**
 * Masks a name for on-screen privacy while a draw is broadcast — winners are
 * actually identified by license plate number, not by name, so the name
 * shown is a partially-redacted hint rather than the authoritative ID.
 * Each word keeps its first 2 characters and the tail, masking a small
 * chunk (~25% of the word, min 1 char) right after the visible head.
 */
function maskWord(word: string): string {
  const len = word.length;
  if (len <= 2) return word;

  const maskLen = Math.max(1, Math.round(len / 4));
  const head = 2;
  const tail = len - head - maskLen;

  if (tail < 0) {
    return word[0] + "*".repeat(len - 1);
  }
  return word.slice(0, head) + "*".repeat(maskLen) + word.slice(head + maskLen);
}

export function maskFullName(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map(maskWord)
    .join(" ");
}
