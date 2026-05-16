const initLoader = () => {
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
      setTimeout(() => loader.classList.add("gone"), 1800);
    }
  });
};

const initCursor = () => {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursor-ring");
  if (!cursor || !ring) {
    return;
  }

  document.addEventListener("mousemove", event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    setTimeout(() => {
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
    }, 60);
  });

  let cursorActiveTimer;
  const clearCursorActive = () => {
    clearTimeout(cursorActiveTimer);
    document.body.classList.remove("cursor-active");
  };
  const isClickable = target => Boolean(target.closest("button, a"));

  document.addEventListener("pointerdown", event => {
    if (!isClickable(event.target)) {
      return;
    }
    clearTimeout(cursorActiveTimer);
    document.body.classList.add("cursor-active");
  });

  document.addEventListener("pointerup", () => {
    if (!document.body.classList.contains("cursor-active")) {
      return;
    }
    clearTimeout(cursorActiveTimer);
    cursorActiveTimer = setTimeout(clearCursorActive, 220);
  });

  document.addEventListener("pointercancel", clearCursorActive);
  window.addEventListener("blur", clearCursorActive);
};

const initNav = () => {
  const navbar = document.getElementById("navbar");
  if (!navbar) {
    return;
  }
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });
};

const initReveal = () => {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) {
    return null;
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach(node => observer.observe(node));
  return observer;
};

const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
};

const initToast = () => {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  let toastTimer;

  return msg => {
    if (!toast || !toastMsg) {
      return;
    }
    toastMsg.textContent = msg;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.transform = "translateY(80px)";
      toast.style.opacity = "0";
    }, 2800);
  };
};

export { initLoader, initCursor, initNav, initReveal, initSmoothScroll, initToast };
