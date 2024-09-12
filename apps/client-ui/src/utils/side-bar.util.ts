const SIDEBAR_ID = "sidebar";

const open = () => {
  const sidebar = document.getElementById(SIDEBAR_ID);
  sidebar?.classList.remove("-translate-x-full");
};

const close = () => {
  const sidebar = document.getElementById(SIDEBAR_ID);
  sidebar?.classList.add("-translate-x-full");
};

const toggle = () => {
  const sidebar = document.getElementById(SIDEBAR_ID);
  sidebar?.classList.toggle("-translate-x-full");
};

const isOpen = () => {
  const sidebar = document.getElementById(SIDEBAR_ID);
  return !sidebar?.classList.contains("-translate-x-full");
};

export const sidebarUtil = Object.freeze({
  SIDEBAR_ID,
  open,
  close,
  toggle,
  isOpen,
});

export default sidebarUtil;
