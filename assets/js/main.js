const stickyHeader = document.querySelector("[data-sticky-header]");
const navToggle = document.querySelector(".nav-toggle");
const headerNav = document.querySelector(".header-nav");
const siteHeader = document.querySelector(".site-header");
const heroHighlights = document.querySelector("[data-hero-highlights]");
const doctorsCarousel = document.querySelector("[data-doctors-carousel]");
const reviewsCarousel = document.querySelector("[data-reviews-carousel]");
const revealElements = document.querySelectorAll(".reveal");
const photoPopup = document.querySelector("[data-photo-popup]");
const photoPopupImage = photoPopup?.querySelector("[data-photo-popup-image]");
const photoPopupName = photoPopup?.querySelector("[data-photo-popup-name]");
const photoPopupRole = photoPopup?.querySelector("[data-photo-popup-role]");
const photoPopupDescription = photoPopup?.querySelector("[data-photo-popup-description]");
const photoPopupLink = photoPopup?.querySelector("[data-photo-popup-link]");
const photoPopupTriggers = document.querySelectorAll("[data-photo-popup-trigger]");
const photoPopupClosers = photoPopup?.querySelectorAll("[data-photo-popup-close]");
let lastPhotoTrigger = null;

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
  if (!navToggle.querySelector(".nav-toggle__line")) {
    const srOnlyLabel = navToggle.querySelector(".sr-only");

    navToggle.innerHTML = "";
    navToggle.insertAdjacentHTML(
      "afterbegin",
      `
        <span class="nav-toggle__line nav-toggle__line--top" aria-hidden="true"></span>
        <span class="nav-toggle__line nav-toggle__line--bottom" aria-hidden="true"></span>
      `
    );

    if (srOnlyLabel) {
      navToggle.appendChild(srOnlyLabel);
    } else {
      navToggle.insertAdjacentHTML("beforeend", '<span class="sr-only">Toggle navigation</span>');
    }
  }

  const closeMenu = () => {
    navToggle.setAttribute("aria-expanded", "false");
    headerNav.classList.remove("menu-open");
    document.body.classList.remove("menu-open-mobile");
  };

  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    headerNav.classList.toggle("menu-open", !isExpanded);
    document.body.classList.toggle("menu-open-mobile", !isExpanded && window.innerWidth <= 1023);
  });

  headerNav.querySelectorAll(".primary-nav a, .header-actions a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1023) {
      closeMenu();
    }
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

if (photoPopup && photoPopupImage && photoPopupTriggers.length > 0) {
  const closePhotoPopup = () => {
    photoPopup.hidden = true;
    document.body.style.overflow = "";

    if (lastPhotoTrigger) {
      lastPhotoTrigger.focus();
      lastPhotoTrigger = null;
    }
  };

  const openPhotoPopup = (trigger) => {
    const imageSrc = trigger.getAttribute("data-photo-src");
    const imageAlt = trigger.getAttribute("data-photo-alt") || "";
    const imageName = trigger.getAttribute("data-photo-name") || "";
    const imageRole = trigger.getAttribute("data-photo-role") || "";
    const imageDescription = trigger.getAttribute("data-photo-description") || "";
    const imageLink = trigger.getAttribute("data-photo-link") || "leadership.html";

    if (!imageSrc) {
      return;
    }

    lastPhotoTrigger = trigger;
    photoPopupImage.src = imageSrc;
    photoPopupImage.alt = imageAlt;
    if (photoPopupName) {
      photoPopupName.textContent = imageName;
    }
    if (photoPopupRole) {
      photoPopupRole.textContent = imageRole;
    }
    if (photoPopupDescription) {
      photoPopupDescription.textContent = imageDescription;
    }
    if (photoPopupLink) {
      photoPopupLink.href = imageLink;
    }
    photoPopup.hidden = false;
    document.body.style.overflow = "hidden";
  };

  photoPopupTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openPhotoPopup(trigger));
  });

  photoPopupClosers?.forEach((closer) => {
    closer.addEventListener("click", closePhotoPopup);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !photoPopup.hidden) {
      closePhotoPopup();
    }
  });
}

const appointmentDoctorOptions = {
  "Neurosciences": [
    "Dr. S K Singh",
    "Dr. B. Kumar Singh",
    "Dr. A K Jha",
    "Dr. Hemant Kumar",
  ],
  "Orthopaedics & Joint Replacement": [
    "Dr. Prabhat Kumar",
    "Dr. Tazadar Hamesh",
    "Dr. Naveen Upadhyay",
  ],
  "Cancer Treatment & Radiotherapy": [
    "Dr. Hari Har Nath",
    "Dr. S.P. Singh",
    "Dr. Shekhar Keshri",
    "Dr. S. Pawar",
  ],
  "Urology": [
    "Dr. Md. Faizul Haque",
    "Dr. Rohit Kumar",
  ],
  "Nephrology": [
    "Dr. Jamsed Anwer",
  ],
  "Obstetrics & Gynaecology": [
    "Dr. Sonali Gupta",
    "Dr. Rekha Kumari",
  ],
  "Neonatology & Pediatrics": [
    "Dr. R Ahmar",
    "Dr. Ansuman",
  ],
  "Cardiology & Cardiac Surgery": [
    "Dr. S.N. Singh",
    "Dr. Abhinash Kumar",
    "Dr. Ram Sagar Ray",
    "Dr. Pramod Kumar",
    "Dr. Neeraj Kumar",
  ],
  "General Surgery": [
    "Dr. Manish Kumar",
  ],
  "Gastroenterology": [
    "Dr. T.N Raj",
    "Dr. Amitesh Kumar",
    "Dr. Md. Shahid Siddiqui",
  ],
  "ENT": [
    "Dr. S.S Prasad",
    "Dr. Deepak Raman",
  ],
  "Pulmonary Medicine": [
    "Dr. A. Ejaji",
    "Dr. Kumar Abhishek",
  ],
  "Anaesthesia": [
    "Dr. Satish Kumar",
    "Dr. Anil Kumar",
  ],
  "Plastic & Cosmetic Surgery": [
    "Dr. Sanjay Kumar",
  ],
  "Pediatric Surgery": [
    "Dr. Om Purve",
  ],
  "Oral & Maxillofacial Surgery": [
    "Dr. Mandeep",
    "Dr. Wasim",
  ],
  "Ophthalmology": [
    "Dr. Binod Kumar",
  ],
};

document.querySelectorAll(".appointment-banner__form").forEach((form) => {
  const departmentSelect = form.querySelector('select[name="department"]');
  const doctorSelect = form.querySelector('select[name="doctor"]');

  if (!departmentSelect || !doctorSelect) {
    return;
  }

  const renderDoctorOptions = (department) => {
    const doctors = appointmentDoctorOptions[department] || [];

    doctorSelect.innerHTML = "";

    if (!department) {
      doctorSelect.insertAdjacentHTML("beforeend", '<option value="">Select Doctor</option>');
      doctorSelect.disabled = true;
      return;
    }

    if (doctors.length === 0) {
      doctorSelect.insertAdjacentHTML("beforeend", '<option value="">Doctor will be assigned</option>');
      doctorSelect.disabled = true;
      return;
    }

    doctorSelect.insertAdjacentHTML("beforeend", '<option value="">Select Doctor</option>');

    doctors.forEach((doctor) => {
      const option = document.createElement("option");
      option.value = doctor;
      option.textContent = doctor;
      doctorSelect.appendChild(option);
    });

    doctorSelect.disabled = false;
  };

  renderDoctorOptions(departmentSelect.value);

  departmentSelect.addEventListener("change", () => {
    renderDoctorOptions(departmentSelect.value);
    doctorSelect.value = "";
  });
});
