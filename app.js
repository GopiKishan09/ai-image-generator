const themeToggle = document.querySelector(".theme-toggele");

const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark-theme");

  themeToggle.querySelector("i").className = isDark
    ? "fas fa-sun"
    : "fas fa-moon"; // FA7 uses "fas"
};

themeToggle.addEventListener("click", toggleTheme);
