import { ref } from "vue";

interface WindowManager {
  createWindow(title: string, icon: string): string;
  closeWindow(id: string): void;
}

export function useConversationWindows(
  wm: WindowManager,
  title: string,
  icon: string
) {
  const ids = ref<string[]>([]);

  function open() {
    const id = wm.createWindow(title, icon);
    ids.value.push(id);
  }

  function close(windowId: string) {
    wm.closeWindow(windowId);
    ids.value = ids.value.filter((id) => id !== windowId);
  }

  return { ids, open, close };
}
