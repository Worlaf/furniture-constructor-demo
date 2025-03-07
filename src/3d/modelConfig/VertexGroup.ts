export const VertexGroups = [
  "Front",
  "Back",
  "Left",
  "Right",
  "Top",
  "Bottom",
] as const;

export type VertexGroup = (typeof VertexGroups)[number];
