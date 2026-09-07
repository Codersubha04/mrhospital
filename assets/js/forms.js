const forms = document.querySelectorAll("[data-form-validate]");

const getQueryStatus = () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("contact_status");
  const message = params.get("contact_message");

  if (!status || !message) {
    return null;
  }

  return { status, message };
};

const applyStatusMessage = (note, message, color) => {
  if (!note) {
    return;
  }

  note.textContent = message;
  note.style.color = color;
};

const setMinDate = (input) => {
  if (!input) {
    return;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  input.min = `${year}-${month}-${day}`;
};

forms.forEach((form) => {
  const note = form.querySelector("[data-form-status]") || form.querySelector(".form-note");
  const preferredDateInput = form.querySelector('input[name="preferred_date"]');
  const isContactForm = form.matches(".contact-form");

  setMinDate(preferredDateInput);

  if (isContactForm) {
    const queryStatus = getQueryStatus();

    if (queryStatus?.status === "success") {
      applyStatusMessage(note, queryStatus.message, "#16a34a");
      form.reset();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (queryStatus?.status === "error") {
      applyStatusMessage(note, queryStatus.message, "#e53935");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      applyStatusMessage(note, "Please complete the required fields before submitting the form.", "#e53935");
      form.reportValidity();
      return;
    }

    const message = form.classList.contains("appointment-banner__form")
      ? "Opening the appointment page with your details."
      : "Submitting your request. The hospital team will review it shortly.";
    applyStatusMessage(note, message, "#16a34a");
  });
});
