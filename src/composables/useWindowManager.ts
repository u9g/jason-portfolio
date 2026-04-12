import { reactive, computed, ref } from "vue";

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  open: boolean;
  minimized: boolean;
  focused: boolean;
  zIndex: number;
}

const windows = reactive(new Map<string, WindowState>());
const registrationOrder = ref<string[]>([]);
let topZ = 15;
let nextId = 0;

export function useWindowManager() {
  function registerWindow(id: string, title: string, icon: string) {
    if (windows.has(id)) return;
    windows.set(id, {
      id,
      title,
      icon,
      open: false,
      minimized: false,
      focused: false,
      zIndex: topZ,
    });
    registrationOrder.value.push(id);
  }

  function createWindow(title: string, icon: string): string {
    const id = `win-${nextId++}`;
    windows.set(id, {
      id,
      title,
      icon,
      open: true,
      minimized: false,
      focused: false,
      zIndex: topZ,
    });
    registrationOrder.value.push(id);
    focusWindow(id);
    return id;
  }

  function focusWindow(id: string) {
    const win = windows.get(id);
    if (!win || !win.open) return;
    topZ++;
    for (const w of windows.values()) {
      w.focused = w.id === id;
    }
    win.zIndex = topZ;
  }

  function openWindow(id: string) {
    const win = windows.get(id);
    if (!win) return;
    win.open = true;
    win.minimized = false;
    focusWindow(id);
  }

  function closeWindow(id: string) {
    const win = windows.get(id);
    if (!win) return;
    win.open = false;
    win.minimized = false;
    win.focused = false;
    windows.delete(id);
    const idx = registrationOrder.value.indexOf(id);
    if (idx !== -1) registrationOrder.value.splice(idx, 1);
    focusNextWindow();
  }

  function minimizeWindow(id: string) {
    const win = windows.get(id);
    if (!win) return;
    win.minimized = true;
    win.focused = false;
    focusNextWindow();
  }

  function focusNextWindow() {
    let best: WindowState | null = null;
    for (const w of windows.values()) {
      if (w.open && !w.minimized) {
        if (!best || w.zIndex > best.zIndex) best = w;
      }
    }
    if (best) {
      best.focused = true;
    }
  }

  function toggleTaskbarWindow(id: string) {
    const win = windows.get(id);
    if (!win) return;
    if (win.focused) {
      minimizeWindow(id);
    } else if (win.minimized) {
      win.minimized = false;
      focusWindow(id);
    } else {
      focusWindow(id);
    }
  }

  const openWindows = computed(() =>
    registrationOrder.value
      .filter((id) => windows.get(id)?.open)
      .map((id) => windows.get(id)!)
  );

  function getWindow(id: string) {
    return windows.get(id);
  }

  return {
    windows,
    registerWindow,
    createWindow,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleTaskbarWindow,
    openWindows,
    getWindow,
  };
}
