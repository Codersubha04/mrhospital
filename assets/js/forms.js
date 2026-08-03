const forms = document.querySelectorAll("[data-form-validate]");

forms.forEach((form) => {
  const note = form.querySelector(".form-note");

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      if (note) {
        note.textContent = "Please complete the required fields before submitting the form.";
        note.style.color = "#e53935";
      }
      form.reportValidity();
      return;
    }

    if (note) {
      note.textContent = "Your request will be reviewed by the hospital team after submission.";
      note.style.color = "#16a34a";
    }
  });
});
