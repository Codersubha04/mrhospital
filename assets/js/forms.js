const departmentDoctorDirectory = [
  { department: "Oncology", doctors: ["Dr. Hari Har Nath", "Dr. S.P. SINGH", "Dr. SHEKHAR KESHRI", "Dr. S. PAWAR"] },
  { department: "General Surgery", doctors: ["Dr. MANISH KUMAR"] },
  { department: "Orthopedic Surgery", doctors: ["Dr. PRABHAT KUMAR", "Dr. TAZADAR HAMESH", "Dr. NAVEEN UPADHYAY"] },
  { department: "Urology", doctors: ["Dr. Md. FAIZUL HAQUE", "Dr. ROHIT KUMAR"] },
  { department: "Neurosurgery", doctors: ["Dr. S K SINGH", "Dr. B. Kumar Singh"] },
  { department: "Neurology", doctors: ["Dr. A K JHA", "Dr. Hemant Kumar"] },
  { department: "Nephrology", doctors: ["Dr. JAMSED ANWER"] },
  { department: "Gastroenterology", doctors: ["Dr. T.N RAJ", "Dr. AMITESH KUMAR", "Dr. Md. SHAHID SIDDIQUI"] },
  { department: "Cardiology", doctors: ["Dr. S.N. SINGH", "Dr. ABHINASH KUMAR", "Dr. RAM SAGAR RAY", "Dr. Pramod Kumar", "Dr. Neeraj Kumar"] },
  { department: "ENT", doctors: ["Dr. S.S PRASAD", "Dr. DEEPAK RAMAN"] },
  { department: "General Medicine", doctors: ["Dr. RAVI RAMAN", "Dr. RAVI KUMAR RAMAN"] },
  { department: "Gynecology", doctors: ["Dr. SONALI GUPTA", "Dr. REKHA KUMARI"] },
  { department: "Anesthesia", doctors: ["Dr. SATISH KUMAR", "Dr. ANIL KUMAR"] },
  { department: "Plastic & Cosmetic Surgery", doctors: ["Dr. SANJAY KUMAR"] },
  { department: "Pediatric Surgery", doctors: ["Dr. OM PURVE"] },
  { department: "Oral & Maxillofacial Surgery", doctors: ["Dr. MANDEEP", "Dr. Wasim"] },
  { department: "Pediatrics", doctors: ["Dr. R AHMAR", "Dr. ANSUMAN"] },
  { department: "Pulmonary Medicine", doctors: ["Dr. A. Ejaji", "Dr. KUMAR ABHISHEK"] },
  { department: "Ophthalmology", doctors: ["Dr. Binod Kumar"] },
  { department: "Radiology", doctors: [] },
  { department: "Critical Care", doctors: [] },
  { department: "Emergency Medicine", doctors: [] },
];

const departmentDoctorLookup = new Map(
  departmentDoctorDirectory.map(({ department, doctors }) => [department, doctors]),
);

const forms = document.querySelectorAll("[data-form-validate]");

const setSelectOptions = (select, options, placeholder) => {
  if (!select) {
    return;
  }

  select.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.appendChild(placeholderOption);

  options.forEach((optionLabel) => {
    const option = document.createElement("option");
    option.value = optionLabel;
    option.textContent = optionLabel;
    select.appendChild(option);
  });
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

const syncDoctorOptions = (departmentSelect, doctorSelect, note) => {
  if (!departmentSelect || !doctorSelect) {
    return;
  }

  const selectedDepartment = departmentSelect.value;

  if (!selectedDepartment) {
    setSelectOptions(doctorSelect, [], "Select department first");
    doctorSelect.disabled = true;
    doctorSelect.required = false;

    if (note) {
      note.textContent = "";
    }
    return;
  }

  const doctors = departmentDoctorLookup.get(selectedDepartment) || [];

  if (doctors.length === 0) {
    setSelectOptions(doctorSelect, ["Hospital team will assign doctor"], "Select Doctor");
    doctorSelect.disabled = false;
    doctorSelect.required = true;
    doctorSelect.value = "Hospital team will assign doctor";

    if (note) {
      note.textContent = "A specialist from this department will be assigned by the hospital team.";
      note.style.color = "#0d59ca";
    }
    return;
  }

  setSelectOptions(doctorSelect, doctors, "Select Doctor");
  doctorSelect.disabled = false;
  doctorSelect.required = true;

  if (note && note.textContent === "A specialist from this department will be assigned by the hospital team.") {
    note.textContent = "";
  }
};

forms.forEach((form) => {
  const note = form.querySelector(".form-note");
  const departmentSelect = form.querySelector('select[name="department"]');
  const doctorSelect = form.querySelector('select[name="doctor"]');
  const preferredDateInput = form.querySelector('input[name="preferred_date"]');

  setMinDate(preferredDateInput);

  if (departmentSelect && doctorSelect) {
    setSelectOptions(
      departmentSelect,
      departmentDoctorDirectory.map(({ department }) => department),
      "Select Department",
    );

    syncDoctorOptions(departmentSelect, doctorSelect, note);

    departmentSelect.addEventListener("change", () => {
      syncDoctorOptions(departmentSelect, doctorSelect, note);
    });
  }

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
