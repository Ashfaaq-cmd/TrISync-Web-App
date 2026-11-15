export const THEME_STORAGE_KEY = "theme"

// Runs before the first paint, so the page never flashes the wrong theme.
// With no saved choice it follows the device setting.
export const THEME_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (error) {}
})();`