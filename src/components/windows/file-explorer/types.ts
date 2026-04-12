export interface NavNode {
  label: string;
  icon: "pin" | "folder" | "pc" | "drive";
  path: string | null;
  expanded: boolean;
  loaded: boolean;
  children?: NavNode[];
}

export interface FlatNavItem {
  node: NavNode;
  depth: number;
}

export interface PathSegment {
  label: string;
  path: string;
}

export type HistoryEntry =
  | { view: "thispc" }
  | { view: "drive" }
  | { view: "directory"; repo: string; path: string }
  | { view: "file"; repo: string; path: string; name: string };
