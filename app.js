(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme preference is stored locally so the site remembers a visitor's choice.
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const applyTheme = (theme) => {
    const isLight = theme === "light";
    root.dataset.theme = isLight ? "light" : "dark";
    themeToggle?.setAttribute("aria-pressed", String(isLight));
    themeToggle?.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
    const label = themeToggle?.querySelector(".theme-label");
    if (label) label.textContent = isLight ? "Dark mode" : "Light mode";
    themeIcon?.classList.toggle("is-moon", isLight);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", isLight ? "#f3f2eb" : "#10120f");
  };

  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem("portfolio-theme") || "dark"; } catch (_) { /* Storage may be disabled. */ }
  applyTheme(savedTheme);
  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try { localStorage.setItem("portfolio-theme", nextTheme); } catch (_) { /* The theme still works for this visit. */ }
  });

  // Mobile navigation: keep the button state in sync and close after navigation.
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".nav-links");
  const closeMenu = () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
    navigation?.classList.remove("is-open");
  };
  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    navigation?.classList.toggle("is-open", isOpen);
  });
  navigation?.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

  // The animated title is decorative; a static equivalent is provided to screen readers.
  const typedRole = document.querySelector(".typed-role");
  if (typedRole && !reducedMotion) {
    const roles = ["Python Developer", "Frontend Developer", "Full Stack Developer"];
    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;
    const typeNext = () => {
      const current = roles[roleIndex];
      characterIndex += deleting ? -1 : 1;
      typedRole.textContent = current.slice(0, characterIndex);
      let delay = deleting ? 43 : 72;
      if (deleting && characterIndex <= 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 280;
      } else if (!deleting && characterIndex >= roles[roleIndex].length) {
        deleting = true;
        delay = 1450;
      }
      window.setTimeout(typeNext, delay);
    };
    window.setTimeout(typeNext, 1550);
  }

  // Progressive reveal: content stays visible if IntersectionObserver is unavailable.
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.body.classList.add("motion-enabled");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
  }

  // Project filters match the technology labels in each card's data-tags list.
  const filters = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-tags]");
  const filterCount = document.querySelector(".filter-count");
  const filterNames = { all: "all", react: "React", python: "Python / AI", data: "data & backend" };
  const setFilter = (filter) => {
    let visible = 0;
    projectCards.forEach((card) => {
      const tags = (card.dataset.tags || "").split(/\s+/);
      const matches = filter === "all" || (filter === "data" ? tags.some((tag) => ["mongodb", "node", "fastapi", "sql"].includes(tag)) : tags.includes(filter));
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    if (filterCount) filterCount.textContent = `${visible} ${filter === "all" ? "projects" : `${filterNames[filter] || filter} projects`}`;
  };
  filters.forEach((button) => button.addEventListener("click", () => {
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    setFilter(button.dataset.filter || "all");
  }));
  setFilter("all");

  // Native required/type/length constraints provide validation. A valid message
  // is prepared in the visitor's mail app because this static site has no server.
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`Hi Sunilvishwa,\n\n${message}\n\n— ${name}\n${email}`);
    if (formStatus) formStatus.textContent = "Your email app should open with the message ready. Please send it from there.";
    window.location.href = `mailto:sunilvishwa200@gmail.com?subject=${subject}&body=${body}`;
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
