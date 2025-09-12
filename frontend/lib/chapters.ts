export function toYouTubeChapters(timestamps: string[]): string {
  // expects ["01:20 - Intro", "05:10 - Topic", ...]
  return timestamps
    .map(line => {
      const m = line.match(/^(\d{1,2}:\d{2})(?:\s*-\s*)?(.*)$/);
      if (!m) return line;
      const [_, mmss, title] = m;
      return `${mmss} ${title || ""}`.trim();
    })
    .join("\n");
}
