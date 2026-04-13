import fileExplorerIcon from "../../../assets/file-explorer.svg";
import projectsIcon from "../../../assets/projects.svg";
import workExpIcon from "../../../assets/work-experience.svg";
import type { StartMenuApp, StartMenuTile } from "./start-menu.types";

export const apps: StartMenuApp[] = [
  { name: "File Explorer", icon: fileExplorerIcon, action: "open-file-explorer" },
  { name: "Projects", icon: projectsIcon, action: "open-projects" },
  { name: "Work Experience", icon: workExpIcon, action: "open-work-experience" },
];

export const tiles: StartMenuTile[] = [
  { id: "document-mode", name: "Document Mode", color: "#0078d4", wide: false, href: "/" },
  { id: "claude-mode", name: "Claude Mode", color: "#5a5a5a", wide: false, href: "/claude" },
  { id: "printable-resume", name: "Printable Resume", color: "#d44a4a", wide: true },
];

export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
