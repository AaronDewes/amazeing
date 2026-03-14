export function titleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (match) => match.charAt(0).toUpperCase() + match.substring(1).toLowerCase(),
  );
}

export function camelToTitleCase(str: string): string {
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Extracts quoted text from a string,
 * returning an array of objects with the text and whether it was quoted.
 * @param text
 */
export function extractQuotedText(
  text: string,
): { text: string; quoted: boolean }[] {
  const regex = /"(.*?)"/g;
  const parts = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // Text before quote
      parts.push({ text: text.slice(lastIndex, match.index), quoted: false });
    }
    // Quoted text without quotes
    parts.push({ text: match[1], quoted: true });
    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), quoted: false });
  }

  return parts;
}
