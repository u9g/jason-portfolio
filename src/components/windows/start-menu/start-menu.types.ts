export type StartMenuAction = "open-file-explorer" | "open-projects" | "open-work-experience";

export interface StartMenuApp {
  name: string;
  icon: string;
  action: StartMenuAction;
}

export type StartMenuTileId = "document-mode" | "claude-mode" | "printable-resume";

export interface StartMenuTile {
  id: StartMenuTileId;
  name: string;
  color: string;
  wide: boolean;
  href?: string;
}

export interface AppSection {
  letter: string;
  entries: StartMenuApp[];
}
