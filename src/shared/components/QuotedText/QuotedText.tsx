import { extractQuotedText } from "../../utils/utils.ts";

export function QuotedText({ text }: { text: string }) {
  const parts = extractQuotedText(text);
  return (
    <>
      {parts.map((part, i) =>
        part.quoted ? (
          <span key={i} className="quoted-code">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}
