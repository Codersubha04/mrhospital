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

const mountFloatingContact = () => {
  if (!document.body || document.querySelector("[data-floating-contact]")) {
    return;
  }

  const floatingContact = document.createElement("div");
  floatingContact.className = "floating-contact";
  floatingContact.setAttribute("data-floating-contact", "");
  floatingContact.setAttribute("aria-label", "Quick contact actions");

  floatingContact.innerHTML = `
    <a class="floating-contact__link floating-contact__link--call" href="tel:+919135351111" aria-label="Call MR Hospital">
      <span class="floating-contact__badge">Call Us</span>
      <i class="fa-solid fa-phone-volume" aria-hidden="true"></i>
    </a>
    <a class="floating-contact__link floating-contact__link--whatsapp" href="https://wa.me/919135351111" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <span class="floating-contact__badge">WhatsApp</span>
      <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
    </a>
  `;

  document.body.appendChild(floatingContact);
};

mountFloatingContact();

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
  "Kidney Transplant": [],
  "Aesthetic Sciences": [],
  "Minimal Access Surgery": [],
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
  "Endocrinology": [],
  "Rheumatology": [],
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

const normalizeDoctorName = (value = "") =>
  value
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const appointmentDoctorDirectory = Object.entries(appointmentDoctorOptions).reduce((directory, [department, doctors]) => {
  doctors.forEach((doctor) => {
    directory.set(normalizeDoctorName(doctor), { doctor, department });
  });

  return directory;
}, new Map());

document.querySelectorAll(".doctor-action[href='appointment.html'], .doctor-search-card__book[href='appointment.html']").forEach((link) => {
  const doctorCard = link.closest(".doctor-card");
  const doctorName = doctorCard?.querySelector("h3")?.textContent?.trim();

  if (!doctorName) {
    return;
  }

  const appointmentUrl = new URL(link.getAttribute("href"), window.location.href);
  appointmentUrl.searchParams.set("doctor", doctorName);
  link.setAttribute("href", `${appointmentUrl.pathname}${appointmentUrl.search}`);
});

document.querySelectorAll(".department-showcase-card a").forEach((link) => {
  const departmentCard = link.closest(".department-showcase-card");
  const departmentName = departmentCard?.querySelector("h3")?.textContent?.trim();

  if (!departmentName) {
    return;
  }

  const appointmentUrl = new URL("appointment.html", window.location.href);
  appointmentUrl.searchParams.set("department", departmentName);
  link.setAttribute("href", `${appointmentUrl.pathname}${appointmentUrl.search}`);
});

const appointmentForms = document.querySelectorAll(
  '.appointment-banner__form, [data-appointment-form]'
);

const appointmentQueryParams = new URLSearchParams(window.location.search);
const requestedDoctorName = appointmentQueryParams.get("doctor");
const requestedDepartmentName = appointmentQueryParams.get("department");
const matchedRequestedDoctor = requestedDoctorName
  ? appointmentDoctorDirectory.get(normalizeDoctorName(requestedDoctorName))
  : null;
const requestedAppointmentPrefill = {
  patientName: appointmentQueryParams.get("name") || "",
  patientPhone: appointmentQueryParams.get("phone") || "",
  patientEmail: appointmentQueryParams.get("email") || "",
  appointmentDate: appointmentQueryParams.get("date") || "",
  department: matchedRequestedDoctor?.department || requestedDepartmentName || "",
  doctor: matchedRequestedDoctor?.doctor || requestedDoctorName || "",
};

appointmentForms.forEach((form) => {
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

  if (requestedAppointmentPrefill.department) {
    departmentSelect.value = requestedAppointmentPrefill.department;
    renderDoctorOptions(requestedAppointmentPrefill.department);
  }

  if (requestedAppointmentPrefill.doctor) {
    doctorSelect.value = requestedAppointmentPrefill.doctor;
  }

  departmentSelect.addEventListener("change", () => {
    renderDoctorOptions(departmentSelect.value);
    doctorSelect.value = "";
  });

  if (form.classList.contains("appointment-banner__form")) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const redirectUrl = new URL("appointment.html", window.location.href);
      const name = String(formData.get("full_name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const department = String(formData.get("department") || "").trim();
      const doctor = String(formData.get("doctor") || "").trim();
      const date = String(formData.get("preferred_date") || "").trim();

      if (name) {
        redirectUrl.searchParams.set("name", name);
      }

      if (phone) {
        redirectUrl.searchParams.set("phone", phone);
      }

      if (department) {
        redirectUrl.searchParams.set("department", department);
      }

      if (doctor) {
        redirectUrl.searchParams.set("doctor", doctor);
      }

      if (date) {
        redirectUrl.searchParams.set("date", date);
      }

      window.location.href = `${redirectUrl.pathname}${redirectUrl.search}`;
    });
  }
});

const appointmentTabButtons = document.querySelectorAll("[data-appointment-tab]");
const appointmentTabPanels = document.querySelectorAll("[data-appointment-panel]");

if (appointmentTabButtons.length && appointmentTabPanels.length) {
  const setActiveAppointmentTab = (targetTab) => {
    appointmentTabButtons.forEach((button) => {
      const isActive = button.dataset.appointmentTab === targetTab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    appointmentTabPanels.forEach((panel) => {
      const isActive = panel.dataset.appointmentPanel === targetTab;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  };

  appointmentTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveAppointmentTab(button.dataset.appointmentTab);
    });
  });

  const defaultActiveTab =
    (requestedAppointmentPrefill.patientName ||
      requestedAppointmentPrefill.patientPhone ||
      requestedAppointmentPrefill.patientEmail ||
      requestedAppointmentPrefill.appointmentDate ||
      requestedAppointmentPrefill.department ||
      requestedAppointmentPrefill.doctor)
      ? "new-patient"
      : Array.from(appointmentTabButtons).find((button) => button.classList.contains("is-active"))
          ?.dataset.appointmentTab || appointmentTabButtons[0].dataset.appointmentTab;

  setActiveAppointmentTab(defaultActiveTab);
}

const appointmentPrefillForms = document.querySelectorAll("[data-appointment-form]");

appointmentPrefillForms.forEach((form) => {
  if (!requestedAppointmentPrefill.patientName &&
      !requestedAppointmentPrefill.patientPhone &&
      !requestedAppointmentPrefill.patientEmail &&
      !requestedAppointmentPrefill.appointmentDate &&
      !requestedAppointmentPrefill.department &&
      !requestedAppointmentPrefill.doctor) {
    return;
  }

  const patientType = form.querySelector('input[name="patient_type"]')?.value || "";

  if (patientType !== "new") {
    return;
  }

  const patientNameField = form.querySelector('input[name="patient_name"]');
  const patientPhoneField = form.querySelector('input[name="patient_phone"]');
  const patientEmailField = form.querySelector('input[name="patient_email"]');
  const appointmentDateField = form.querySelector('input[name="appointment_date"]');
  const departmentField = form.querySelector('select[name="department"]');
  const doctorField = form.querySelector('select[name="doctor"]');

  if (patientNameField && requestedAppointmentPrefill.patientName) {
    patientNameField.value = requestedAppointmentPrefill.patientName;
  }

  if (patientPhoneField && requestedAppointmentPrefill.patientPhone) {
    patientPhoneField.value = requestedAppointmentPrefill.patientPhone;
  }

  if (patientEmailField && requestedAppointmentPrefill.patientEmail) {
    patientEmailField.value = requestedAppointmentPrefill.patientEmail;
  }

  if (appointmentDateField && requestedAppointmentPrefill.appointmentDate) {
    appointmentDateField.value = requestedAppointmentPrefill.appointmentDate;
  }

  if (departmentField && requestedAppointmentPrefill.department) {
    departmentField.value = requestedAppointmentPrefill.department;
  }

  if (doctorField && requestedAppointmentPrefill.doctor) {
    doctorField.value = requestedAppointmentPrefill.doctor;
  }
});

const doctorFinderForm = document.querySelector("[data-doctor-finder-form]");
const doctorFinderResults = document.querySelector("[data-doctor-results]");
const doctorFinderCount = document.querySelector("[data-doctor-results-count]");
const doctorFinderEmpty = document.querySelector("[data-doctor-empty]");
const doctorFinderReset = document.querySelector("[data-doctor-finder-reset]");
const doctorFinderLoadMore = document.querySelector("[data-doctor-load-more]");
const doctorFinderActions = document.querySelector("[data-doctor-results-actions]");

if (doctorFinderForm && doctorFinderResults) {
  const departmentField = doctorFinderForm.querySelector('select[name="department"]');
  const specializationField = doctorFinderForm.querySelector('select[name="specialization"]');
  const availabilityField = doctorFinderForm.querySelector('select[name="availability"]');
  const keywordField = doctorFinderForm.querySelector('input[name="keyword"]');

  const doctorDepartmentMeta = {
    "Neurosciences": {
      specialization: "Neurology & Neuro Care",
      description: "Focused consultation for brain, spine, and advanced neurological care.",
      keywords: ["brain", "spine", "neurology", "neuro"],
    },
    "Orthopaedics & Joint Replacement": {
      specialization: "Orthopaedic Surgery",
      description: "Comprehensive care for bones, joints, mobility, and replacement surgery.",
      keywords: ["bone", "joint", "orthopaedic", "replacement"],
    },
    "Cancer Treatment & Radiotherapy": {
      specialization: "Oncology",
      description: "Integrated cancer treatment support with radiotherapy and guided care planning.",
      keywords: ["cancer", "oncology", "radiotherapy", "tumor"],
    },
    "Urology": {
      specialization: "Urology Care",
      description: "Specialized care for urinary tract, kidney, and men's health conditions.",
      keywords: ["urology", "urinary", "kidney", "men"],
    },
    "Nephrology": {
      specialization: "Kidney Care",
      description: "Trusted kidney care, disease management, and long-term renal support.",
      keywords: ["kidney", "renal", "nephrology"],
    },
    "Obstetrics & Gynaecology": {
      specialization: "Women's Health",
      description: "Personalized consultation for women's wellness, maternity, and gynec care.",
      keywords: ["women", "gynaecology", "maternity", "obstetrics"],
    },
    "Neonatology & Pediatrics": {
      specialization: "Child Care",
      description: "Compassionate care for newborns, infants, children, and growing families.",
      keywords: ["child", "pediatric", "newborn", "infant"],
    },
    "Cardiology & Cardiac Surgery": {
      specialization: "Cardiac Care",
      description: "Heart consultation, diagnosis, intervention support, and surgical expertise.",
      keywords: ["heart", "cardiac", "cardiology", "cardio"],
    },
    "General Surgery": {
      specialization: "General Surgery",
      description: "Safe and dependable surgical care with coordinated pre and post-op support.",
      keywords: ["surgery", "general", "procedure"],
    },
    "Gastroenterology": {
      specialization: "Digestive Care",
      description: "Diagnosis and treatment planning for digestive and gastrointestinal concerns.",
      keywords: ["digestive", "gastro", "stomach", "liver"],
    },
    "ENT": {
      specialization: "ENT Care",
      description: "Expert consultation for ear, nose, throat, sinus, and voice conditions.",
      keywords: ["ent", "ear", "nose", "throat", "sinus"],
    },
    "Pulmonary Medicine": {
      specialization: "Respiratory Care",
      description: "Advanced respiratory consultation for lungs, breathing, and pulmonary health.",
      keywords: ["lung", "breathing", "pulmonary", "respiratory"],
    },
    "Anaesthesia": {
      specialization: "Critical Care Support",
      description: "Specialist support for safe anaesthesia, procedure planning, and recovery care.",
      keywords: ["anaesthesia", "critical care", "procedure", "surgery"],
    },
    "Plastic & Cosmetic Surgery": {
      specialization: "Cosmetic Surgery",
      description: "Aesthetic and reconstructive care tailored to each patient’s treatment goals.",
      keywords: ["cosmetic", "plastic", "aesthetic", "reconstructive"],
    },
    "Pediatric Surgery": {
      specialization: "Pediatric Surgery",
      description: "Dedicated surgical consultation and care pathways for children and infants.",
      keywords: ["pediatric", "child", "surgery", "infant"],
    },
    "Oral & Maxillofacial Surgery": {
      specialization: "Maxillofacial Surgery",
      description: "Specialist care for oral, facial, jaw, and dental surgical conditions.",
      keywords: ["oral", "jaw", "facial", "maxillofacial"],
    },
    "Ophthalmology": {
      specialization: "Eye Care",
      description: "Comprehensive consultation for vision, eye health, and ophthalmic concerns.",
      keywords: ["eye", "vision", "ophthalmology"],
    },
  };

  const availabilityOptions = ["Available Today", "Consultation Hours", "On Call"];
  const opdSlots = [
    "OPD: Mon - Sat 09:00 AM - 01:00 PM",
    "OPD: Mon - Sat 10:00 AM - 02:00 PM",
    "OPD: Mon - Sat 11:00 AM - 03:00 PM",
    "OPD: Mon - Sat 04:00 PM - 07:00 PM",
    "OPD: Tue, Thu, Sat 05:00 PM - 07:00 PM",
  ];
  const doctorFinderData = Object.entries(appointmentDoctorOptions).flatMap(([department, doctors], departmentIndex) => {
    const departmentMeta = doctorDepartmentMeta[department] || {
      specialization: department,
      description: "Trusted specialist consultation with compassionate and modern patient care.",
      keywords: [department.toLowerCase()],
    };

    return doctors.map((doctorName, doctorIndex) => ({
      id: `${departmentIndex + 1}-${doctorIndex + 1}`,
      name: doctorName,
      department,
      specialization: departmentMeta.specialization,
      availability: availabilityOptions[(departmentIndex + doctorIndex) % availabilityOptions.length],
      description: departmentMeta.description,
      qualifications: doctorIndex % 2 === 0 ? `MBBS, MD (${departmentMeta.specialization})` : `MBBS, MS (${departmentMeta.specialization})`,
      role: departmentMeta.specialization,
      opd: opdSlots[(departmentIndex + doctorIndex) % opdSlots.length],
      keywords: [doctorName, department, departmentMeta.specialization, ...(departmentMeta.keywords || [])].join(" ").toLowerCase(),
      image: "assets/images/doctors/doctor-default.png",
      phone: "+919135351111",
    }));
  });

  let filteredDoctorResults = [...doctorFinderData];
  let visibleDoctorCount = 10;

  const uniqueDepartments = [...new Set(doctorFinderData.map((doctor) => doctor.department))];
  const uniqueSpecializations = [...new Set(doctorFinderData.map((doctor) => doctor.specialization))];

  const fillSelectOptions = (select, values, placeholder) => {
    if (!select) {
      return;
    }

    select.innerHTML = `<option value="">${placeholder}</option>`;
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  const renderDoctorCard = (doctor) => `
    <article class="doctor-search-card doctor-card doctor-card--specialist">
      <div class="doctor-search-card__media doctor-card__media">
        <img class="doctor-search-card__image doctor-portrait doctor-portrait--default" src="${doctor.image}" alt="Doctor profile illustration for ${doctor.name}" width="626" height="626" loading="lazy">
      </div>
      <div class="doctor-search-card__body">
        <h3>${doctor.name}</h3>
        <p class="doctor-search-card__qualifications">${doctor.qualifications}</p>
        <p class="doctor-search-card__speciality">${doctor.role}</p>
        <p class="doctor-search-card__description">${doctor.description}</p>
        <p class="doctor-search-card__opd">${doctor.opd}</p>
        <div class="doctor-search-card__actions">
          <a class="btn btn-primary doctor-search-card__book" href="appointment.html">
            <i class="fa-regular fa-calendar-check" aria-hidden="true"></i>
            <span>Book Appointment</span>
          </a>
        </div>
      </div>
    </article>
  `;

  const updateCount = (count) => {
    if (!doctorFinderCount) {
      return;
    }

    doctorFinderCount.textContent = `${count} doctor${count === 1 ? "" : "s"} found`;
  };

  const updateLoadMoreState = () => {
    if (!doctorFinderLoadMore || !doctorFinderActions) {
      return;
    }

    if (filteredDoctorResults.length <= 10 || visibleDoctorCount >= filteredDoctorResults.length) {
      doctorFinderActions.hidden = filteredDoctorResults.length <= 10 || filteredDoctorResults.length === 0;
      if (visibleDoctorCount >= filteredDoctorResults.length) {
        doctorFinderActions.hidden = true;
      }
      return;
    }

    doctorFinderActions.hidden = false;

    if (visibleDoctorCount < 30 && filteredDoctorResults.length > 10) {
      doctorFinderLoadMore.querySelector("span").textContent = "View More Doctors";
    } else {
      doctorFinderLoadMore.querySelector("span").textContent = "View All Doctors";
    }
  };

  const renderDoctors = (doctors) => {
    filteredDoctorResults = [...doctors];
    const visibleDoctors = filteredDoctorResults.slice(0, visibleDoctorCount);

    doctorFinderResults.innerHTML = visibleDoctors.map(renderDoctorCard).join("");
    updateCount(filteredDoctorResults.length);
    updateLoadMoreState();

    if (doctorFinderEmpty) {
      doctorFinderEmpty.hidden = filteredDoctorResults.length !== 0;
    }
  };

  const applyDoctorFilters = () => {
    const keyword = (keywordField?.value || "").trim().toLowerCase();
    const department = departmentField?.value || "";
    const specialization = specializationField?.value || "";
    const availability = availabilityField?.value || "";

    const filteredDoctors = doctorFinderData.filter((doctor) => {
      const matchesKeyword = !keyword || doctor.keywords.includes(keyword);
      const matchesDepartment = !department || doctor.department === department;
      const matchesSpecialization = !specialization || doctor.specialization === specialization;
      const matchesAvailability = !availability || doctor.availability === availability;

      return matchesKeyword && matchesDepartment && matchesSpecialization && matchesAvailability;
    });

    visibleDoctorCount = 10;
    renderDoctors(filteredDoctors);
  };

  fillSelectOptions(departmentField, uniqueDepartments, "All Departments");
  fillSelectOptions(specializationField, uniqueSpecializations, "All Specializations");
  renderDoctors(doctorFinderData);

  doctorFinderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyDoctorFilters();
  });

  [departmentField, specializationField, availabilityField].forEach((field) => {
    field?.addEventListener("change", applyDoctorFilters);
  });

  keywordField?.addEventListener("input", applyDoctorFilters);

  doctorFinderLoadMore?.addEventListener("click", () => {
    if (visibleDoctorCount < 10) {
      visibleDoctorCount = 10;
    } else if (visibleDoctorCount < 30 && filteredDoctorResults.length > 10) {
      visibleDoctorCount = 30;
    } else {
      visibleDoctorCount = filteredDoctorResults.length;
    }

    renderDoctors(filteredDoctorResults);
  });

  doctorFinderReset?.addEventListener("click", () => {
    doctorFinderForm.reset();
    visibleDoctorCount = 10;
    renderDoctors(doctorFinderData);
  });
}

const galleryTabs = document.querySelector("[data-gallery-tabs]");
const galleryFilterButtons = document.querySelectorAll("[data-gallery-filter]");
const galleryCards = document.querySelectorAll("[data-gallery-card]");

if (galleryTabs && galleryFilterButtons.length && galleryCards.length) {
  const setGalleryFilter = (filterValue) => {
    galleryFilterButtons.forEach((button) => {
      const isActive = button.dataset.galleryFilter === filterValue;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    galleryCards.forEach((card) => {
      if (filterValue === "all") {
        card.hidden = false;
        return;
      }

      const categories = (card.dataset.category || "").split(" ").filter(Boolean);
      card.hidden = !categories.includes(filterValue);
    });
  };

  galleryTabs.addEventListener("click", (event) => {
    const selectedButton = event.target.closest("[data-gallery-filter]");

    if (!selectedButton) {
      return;
    }

    setGalleryFilter(selectedButton.dataset.galleryFilter || "all");
  });

  setGalleryFilter("all");
}
