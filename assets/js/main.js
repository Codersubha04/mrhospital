const stickyHeader = document.querySelector("[data-sticky-header]");
const navToggle = document.querySelector(".nav-toggle");
const headerNav = document.querySelector(".header-nav");
const siteHeader = document.querySelector(".site-header");
const heroHighlights = document.querySelector("[data-hero-highlights]");
const doctorsCarousel = document.querySelector("[data-doctors-carousel]");
const reviewsCarousel = document.querySelector("[data-reviews-carousel]");
const revealElements = document.querySelectorAll(".reveal");

if (stickyHeader && siteHeader) {
  const toggleStickyClass = () => {
    const hasScrolled = window.scrollY > 64;
    const isHeroState = window.scrollY <= 24;

    stickyHeader.classList.toggle("is-sticky", hasScrolled);
    siteHeader.classList.toggle("is-scrolled", hasScrolled);
    siteHeader.classList.toggle("is-hero-active", isHeroState);
  };

  toggleStickyClass();
  window.addEventListener("scroll", toggleStickyClass, { passive: true });
  window.addEventListener("resize", toggleStickyClass);
}

if (navToggle && headerNav) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    headerNav.classList.toggle("menu-open", !isExpanded);
  });
}

if (heroHighlights) {
  const highlightsGroup = heroHighlights.querySelector("[data-hero-highlights-group]");

  if (highlightsGroup) {
    const setHighlightDistance = () => {
      const groupHeight = `${highlightsGroup.offsetHeight}px`;
      heroHighlights.style.setProperty("--hero-highlights-distance", groupHeight);
      heroHighlights.style.height = groupHeight;
    };

    setHighlightDistance();
    window.addEventListener("load", setHighlightDistance);
    window.addEventListener("resize", setHighlightDistance);
  }
}

if (doctorsCarousel) {
  const doctorsTrack = doctorsCarousel.querySelector(".doctors-preview__grid");
  const doctorsShell = doctorsCarousel.closest(".doctors-preview__shell");
  const prevButton = doctorsShell?.querySelector(".doctors-nav--prev");
  const nextButton = doctorsShell?.querySelector(".doctors-nav--next");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (doctorsTrack && !reducedMotionQuery.matches) {
    const originalCards = Array.from(doctorsTrack.children);
    let animationFrameId = null;
    let lastTimestamp = 0;
    let isPaused = false;
    let loopWidth = 0;
    const speed = 36;

    originalCards.forEach((card) => {
      doctorsTrack.appendChild(card.cloneNode(true));
    });

    const measureLoopWidth = () => {
      if (doctorsTrack.children.length > originalCards.length) {
        loopWidth = doctorsTrack.children[originalCards.length].offsetLeft;
      }
    };

    const step = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (!isPaused && loopWidth > 0) {
        doctorsCarousel.scrollLeft += delta * speed;

        if (doctorsCarousel.scrollLeft >= loopWidth) {
          doctorsCarousel.scrollLeft -= loopWidth;
        }
      }

      animationFrameId = window.requestAnimationFrame(step);
    };

    const nudgeCarousel = (direction) => {
      if (!loopWidth) {
        return;
      }

      const card = doctorsTrack.querySelector(".doctor-card--specialist");
      const cardWidth = card ? card.getBoundingClientRect().width : 240;
      const gap = parseFloat(window.getComputedStyle(doctorsTrack).gap || "0");
      const offset = cardWidth + gap;

      doctorsCarousel.scrollTo({
        left: doctorsCarousel.scrollLeft + (direction * offset),
        behavior: "smooth",
      });
    };

    const pause = () => {
      isPaused = true;
    };

    const resume = () => {
      isPaused = false;
      lastTimestamp = 0;
    };

    measureLoopWidth();
    animationFrameId = window.requestAnimationFrame(step);

    doctorsCarousel.addEventListener("mouseenter", pause);
    doctorsCarousel.addEventListener("mouseleave", resume);
    doctorsCarousel.addEventListener("focusin", pause);
    doctorsCarousel.addEventListener("focusout", resume);

    prevButton?.addEventListener("click", () => nudgeCarousel(-1));
    nextButton?.addEventListener("click", () => nudgeCarousel(1));

    window.addEventListener("resize", measureLoopWidth);

    window.addEventListener("beforeunload", () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    });
  }
}

if (reviewsCarousel) {
  const reviewsTrack = reviewsCarousel.querySelector(".patient-stories__grid");
  const reviewsShell = reviewsCarousel.closest(".patient-stories__body");
  const prevButton = reviewsShell?.querySelector(".stories-nav--prev");
  const nextButton = reviewsShell?.querySelector(".stories-nav--next");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reviewsTrack && !reducedMotionQuery.matches) {
    const originalCards = Array.from(reviewsTrack.children);
    let animationFrameId = null;
    let lastTimestamp = 0;
    let isPaused = false;
    let loopWidth = 0;
    let currentOffset = 0;
    const speed = 26;

    originalCards.forEach((card) => {
      reviewsTrack.appendChild(card.cloneNode(true));
    });

    const measureLoopWidth = () => {
      if (reviewsTrack.children.length > originalCards.length) {
        loopWidth = reviewsTrack.children[originalCards.length].offsetLeft;
      }
    };

    const renderOffset = () => {
      reviewsTrack.style.transform = `translate3d(${-currentOffset}px, 0, 0)`;
    };

    const step = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (!isPaused && loopWidth > 0) {
        currentOffset += delta * speed;

        if (currentOffset >= loopWidth) {
          currentOffset -= loopWidth;
        }

        renderOffset();
      }

      animationFrameId = window.requestAnimationFrame(step);
    };

    const nudgeCarousel = (direction) => {
      if (!loopWidth) {
        return;
      }

      const card = reviewsTrack.querySelector(".story-card--google");
      const cardWidth = card ? card.getBoundingClientRect().width : 280;
      const gap = parseFloat(window.getComputedStyle(reviewsTrack).gap || "0");
      const offset = cardWidth + gap;

      currentOffset += direction * offset;

      if (currentOffset < 0) {
        currentOffset = Math.max(loopWidth + currentOffset, 0);
      }

      if (loopWidth > 0 && currentOffset >= loopWidth) {
        currentOffset -= loopWidth;
      }

      renderOffset();
    };

    const pause = () => {
      isPaused = true;
    };

    const resume = () => {
      isPaused = false;
      lastTimestamp = 0;
    };

    measureLoopWidth();
    renderOffset();
    animationFrameId = window.requestAnimationFrame(step);

    reviewsCarousel.addEventListener("mouseenter", pause);
    reviewsCarousel.addEventListener("mouseleave", resume);
    reviewsCarousel.addEventListener("focusin", pause);
    reviewsCarousel.addEventListener("focusout", resume);

    prevButton?.addEventListener("click", () => nudgeCarousel(-1));
    nextButton?.addEventListener("click", () => nudgeCarousel(1));

    window.addEventListener("resize", measureLoopWidth);

    window.addEventListener("beforeunload", () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    });
  }
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}
