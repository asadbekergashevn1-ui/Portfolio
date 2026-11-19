/**
 * Splits a headline into words that rise into place on load (CSS only, see
 * `.words` in globals.css). The heading keeps its full text as its accessible
 * name, so screen readers hear one sentence, not a list of fragments.
 */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className="words" aria-hidden="true">
      {words.map((w, i) => (
        <span key={i}>
          <span className="w">
            <span style={{ ['--i' as string]: i }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}
