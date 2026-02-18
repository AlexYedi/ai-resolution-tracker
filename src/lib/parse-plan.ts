export interface ParsedChecklistItem {
  phase_label: string | null;
  label: string;
  sort_order: number;
}

export function parsePlanMarkdown(markdown: string): ParsedChecklistItem[] {
  const lines = markdown.split("\n");
  const items: ParsedChecklistItem[] = [];
  let currentPhase: string | null = null;
  let sortOrder = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip blank lines
    if (!trimmed) continue;

    // Check for headers (## or ### or deeper) → set phase label
    const headerMatch = trimmed.match(/^#{2,}\s+(.+)$/);
    if (headerMatch) {
      currentPhase = headerMatch[1].trim();
      continue;
    }

    // Check for numbered list items (1. , 2. , etc.)
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      items.push({
        phase_label: currentPhase,
        label: numberedMatch[1].trim(),
        sort_order: sortOrder++,
      });
      continue;
    }

    // Check for bullet list items (- or *)
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      items.push({
        phase_label: currentPhase,
        label: bulletMatch[1].trim(),
        sort_order: sortOrder++,
      });
      continue;
    }

    // Any other line → skip silently
  }

  return items;
}
