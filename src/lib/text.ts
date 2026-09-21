export function textStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = text.length;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]*/g) ?? []).filter((s) => s.trim()).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  return { words, characters, sentences, paragraphs };
}
