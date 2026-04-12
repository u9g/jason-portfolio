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
