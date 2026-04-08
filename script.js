(function () {
  "use strict";

  var THEME_KEY = "oyk-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (_) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (_) {}
  }

  function getSystemDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    var initial =
      stored === "light" ? "light" : stored === "dark" ? "dark" : null;
    if (!initial) {
      initial = getSystemDark() ? "dark" : "light";
    }
    if (initial === "dark") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      applyTheme("light");
    }
  }

  function toggleTheme() {
    var isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      setStoredTheme("dark");
    } else {
      applyTheme("light");
      setStoredTheme("light");
    }
  }

  function initThemeToggle() {
    var buttons = document.querySelectorAll(".theme-toggle");
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener("click", toggleTheme);
    });
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) {
      el.textContent = String(new Date().getFullYear());
    }
  }

  function initReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;

    if (!window.IntersectionObserver) {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initScrollSpy() {
    var nav = document.getElementById("siteNav");
    if (!nav) return;

    var links = nav.querySelectorAll('a[href^="#"]');
    var ids = [];
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href.length > 1) {
        ids.push(href.slice(1));
      }
    });

    var sections = ids
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (!sections.length) return;

    function setActive(id) {
      links.forEach(function (link) {
        var href = link.getAttribute("href");
        var match = href === "#" + id;
        link.classList.toggle("is-active", match);
      });
    }

    if (!window.IntersectionObserver) {
      return;
    }

    var visible = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute("id");
          if (!id) return;
          visible[id] = entry.isIntersecting
            ? entry.intersectionRatio
            : 0;
        });

        var bestId = null;
        var bestRatio = 0;
        ids.forEach(function (id) {
          var r = visible[id] || 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        });

        if (bestId) {
          setActive(bestId);
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach(function (sec) {
      observer.observe(sec);
    });

    setActive(ids[0]);

    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY < 80 && ids.length) {
          setActive(ids[0]);
        }
      },
      { passive: true }
    );
  }

  initTheme();
  initThemeToggle();
  initYear();

  function initScrollHint() {
    var el = document.getElementById("scrollHint");
    if (!el) return;
    var threshold = 90;
    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var doc = document.documentElement;
      var max = Math.max(0, doc.scrollHeight - window.innerHeight);
      var atBottom = max > 0 && y >= max - 48;
      el.classList.toggle("is-hidden", y > threshold || atBottom);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  }

  function initCustomCursor() {
    var ring = document.getElementById("cursorRing");
    var dot = document.getElementById("cursorDot");
    if (!ring || !dot) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");

    var rx = 0;
    var ry = 0;
    var dx = 0;
    var dy = 0;
    var dtx = 0;
    var dty = 0;

    window.addEventListener(
      "mousemove",
      function (e) {
        rx = e.clientX;
        ry = e.clientY;
        ring.classList.add("is-active");
        dot.classList.add("is-active");
        var t = e.target;
        document.body.classList.toggle(
          "cursor-hover",
          !!t.closest(
            "a, button, input, textarea, select, label, [role='button'], .topbar-icon-btn, .theme-toggle, .social__link, .side-nav__link, .exp-carousel__btn, .exp-carousel__dot"
          )
        );
      },
      { passive: true }
    );

    function tick() {
      dx += (rx - dx) * 0.16;
      dy += (ry - dy) * 0.16;
      dtx += (rx - dtx) * 0.52;
      dty += (ry - dty) * 0.52;
      ring.style.transform =
        "translate3d(" + dx + "px," + dy + "px,0) translate(-50%,-50%)";
      dot.style.transform =
        "translate3d(" + dtx + "px," + dty + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initActivitiesCarousel() {
    var root = document.getElementById("activitiesCarousel");
    if (!root) return;

    root.setAttribute("tabindex", "0");

    var track = document.getElementById("activitiesTrack");
    var prev = document.getElementById("activitiesCarouselPrev");
    var next = document.getElementById("activitiesCarouselNext");
    var currentEl = document.getElementById("activitiesCarouselCurrent");
    var totalEl = document.getElementById("activitiesCarouselTotal");
    var dotsWrap = document.getElementById("activitiesCarouselDots");

    if (!track || !prev || !next) return;

    var slides = track.querySelectorAll(".exp-carousel__slide");
    var n = slides.length;
    var i = 0;

    track.style.setProperty("--exp-n", String(Math.max(1, n)));

    if (totalEl) totalEl.textContent = String(n);

    function buildDots() {
      if (!dotsWrap || !n) return;
      dotsWrap.innerHTML = "";
      for (var d = 0; d < n; d++) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "exp-carousel__dot";
        b.setAttribute("aria-label", "Show activity " + (d + 1) + " of " + n);
        (function (idx) {
          b.addEventListener("click", function () {
            go(idx);
          });
        })(d);
        dotsWrap.appendChild(b);
      }
    }

    function updateDots() {
      if (!dotsWrap) return;
      var buttons = dotsWrap.querySelectorAll(".exp-carousel__dot");
      for (var k = 0; k < buttons.length; k++) {
        buttons[k].classList.toggle("is-active", k === i);
      }
    }

    function go(idx) {
      i = Math.max(0, Math.min(n - 1, idx));
      track.style.setProperty("--exp-i", String(i));
      prev.disabled = i === 0;
      next.disabled = i === n - 1;
      if (currentEl) currentEl.textContent = String(i + 1);
      updateDots();
      root.setAttribute(
        "aria-label",
        "Activities and leadership, slide " + (i + 1) + " of " + n
      );
    }

    buildDots();

    prev.addEventListener("click", function () {
      go(i - 1);
    });
    next.addEventListener("click", function () {
      go(i + 1);
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(i - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(i + 1);
      }
    });

    go(0);
  }

  initReveal();
  initScrollSpy();
  initScrollHint();
  initCustomCursor();
  initActivitiesCarousel();
})();
