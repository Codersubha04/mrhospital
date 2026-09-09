// Transcribed from the two supplied hospital brochures. Preserve printed names
// and credentials; do not infer qualifications, availability or OPD hours.
const hospitalDoctorGroups = [
  ["Orthopedic Surgery", "Orthopaedics", [
    ["Dr. Prabhat Kumar", "MBBS, D. Ortho, MS"], ["Dr. Naveen Upadhyay", "MBBS, MS, M.Ch, Ortho"], ["Dr. Jameel", ""]]],
  ["General Surgery", "General & Laparoscopic Surgery", [
    ["Dr. Manish Kumar", "MBBS, MS"], ["Dr. Rakesh Kumar", "MBBS, MS"]]],
  ["Urology", "Urology", [
    ["Dr. R.K. Roushan", "MBBS, MS"], ["Dr. Faizul Hasan", "MBBS, MS, M.Ch"], ["Dr. Ravi Kant", "MS, M.Ch"]]],
  ["Neuro Surgery", "Neurosurgery", [
    ["Dr. S.K. Singh", "MBBS, MS, M.Ch"], ["Dr. A. Kumar", "MBBS, MD, M.Ch"], ["Dr. B. Kumar", "MBBS, MS, M.Ch"]]],
  ["Neurologist", "Neuro Medicine", [["Dr. H. Kumar", "MBBS, MD, DM"]]],
  ["Nephrologist", "Nephrology", [["Dr. J. Anwer", "MBBS, MD, DM"]]],
  ["Gastroenterologist", "Gastroenterology", [
    ["Dr. T.N. Raj", "MBBS, MD"], ["Dr. Manish Kr. Bhaskar", "GASTRO, DM"], ["Dr. Awadesh", ""]]],
  ["Cardiologist", "Cardiology", [
    ["Dr. Neeraj Kumar", "MBBS, MD, DM"], ["Dr. Ram Sagar Ray", "MBBS, MD, DM"], ["Dr. Parmod Kumar", "MBBS, MD, DM"]]],
  ["C.T.V.S. Surgery", "C.T.V.S Surgery", [
    ["Dr. Kunal Kumar", "MBBS, MS, M.Ch"], ["Dr. Ghazanafar Khan", "MBBS, MS, M.Ch"]]],
  ["Radiology", "Radiology", [["Dr. U. Kumar", "MBBS, MD"]]],
  ["Oncologist", "Oncology Medicine", [
    ["Dr. Shekhar Keshri", "MBBS, DM"]]],
  ["Onco Surgery", "Oncology Surgery", [["Dr. S. Pawar", "MS, M.Ch"]]],
  ["Dermatology", "Dermatology", [["Dr. Chandan", "MBBS, MD"]]],
  ["ENT", "ENT", [["Dr. S.S. Prasad", "MBBS, MS"], ["Dr. Deepak Raman", "MBBS, MS"]]],
  ["General Physician", "General Medicine", [["Dr. Ravi Kumar", "MD (Medicine)"]]],
  ["Obs. & Gynecologist", "Gynaecology", [
    ["Dr. Rekha Kumari", "MBBS, MS (Gold Medalist)"], ["Dr. Sonali Gupta", "MBBS, MS (Gold Medalist)"]]],
  ["Anaesthesia", "Anaesthesia", [["Dr. Satish Kumar", "MBBS, MD"], ["Dr. Anil Kumar", "MBBS, MD"]]],
  ["Plastic & Cosmetic Surgery", "Plastic & Cosmetic Surgery", [["Dr. Sanjay Kumar", "MBBS, MD, M.Ch"]]],
  ["Pedia & Neonatal Surgery", "Pediatric Surgery", [["Dr. Om Purve", "MBBS, MS, M.Ch"], ["Dr. Digamber Kumar", "MBBS, MS, M.Ch"]]],
  ["Pediatrician", "Pediatrics", [["Dr. R. Anwer", "MBBS, MD"]]],
  ["Endocrinology", "Endocrinology", []],
  ["Maxillofacial Surgery", "Maxillofacial Surgery", [["Dr. Mandeep", "BDS, MDS"], ["Dr. Wasim", "BDS, MDS"]]],
  ["Ophthalmology", "Ophthalmology", [["Dr. Gautam Kumar", "MBBS, MS"]]],
  ["Dietician", "Dietetics", [["Dt. Anita Kumari", "N & D Ad. (M.Sc.)"]]],
];

const femaleDoctorNames = new Set(["Dr. Rekha Kumari", "Dr. Sonali Gupta", "Dt. Anita Kumari"]);

const hospitalDoctors = hospitalDoctorGroups.flatMap(([department, specialization, doctors]) =>
  doctors.map(([name, qualifications]) => ({ name, qualifications, department, specialization,
    image: femaleDoctorNames.has(name)
      ? "assets/images/doctors/doctor-female.png"
      : "assets/images/doctors/doctor-default.png" })));
const doctorBookingHref = (doctor) => `appointment.html?${new URLSearchParams({ doctor: doctor.name, department: doctor.department })}`;
const escapeDoctorHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const homeDoctorTrack = document.querySelector("[data-doctors-carousel] .doctors-preview__grid");
if (homeDoctorTrack) {
  homeDoctorTrack.innerHTML = hospitalDoctors.map((doctor) => `
    <article class="doctor-card doctor-card--specialist">
      <div class="doctor-card__media">
        <img class="doctor-portrait doctor-portrait--default" src="${doctor.image}" alt="Doctor illustration for ${escapeDoctorHtml(doctor.name)}" width="626" height="626" loading="lazy">
      </div>
      <div class="doctor-card__body">
        <h3>${escapeDoctorHtml(doctor.name)}</h3>
        <p class="doctor-meta doctor-meta--qualifications">${escapeDoctorHtml(doctor.qualifications)}</p>
        <p class="doctor-meta doctor-meta--speciality">${escapeDoctorHtml(doctor.specialization)}</p>
        <div class="doctor-card__actions">
          <a class="doctor-action" href="${escapeDoctorHtml(doctorBookingHref(doctor))}" aria-label="Book appointment with ${escapeDoctorHtml(doctor.name)}"><i class="fa-regular fa-calendar-check" aria-hidden="true"></i></a>
          <a class="doctor-action" href="doctors.html?doctor=${encodeURIComponent(doctor.name)}" aria-label="View ${escapeDoctorHtml(doctor.name)} profile"><i class="fa-regular fa-user" aria-hidden="true"></i></a>
        </div>
      </div>
    </article>`).join("");
}
