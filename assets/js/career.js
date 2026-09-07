const careerProfileForm = document.querySelector('#career-profile-form');
if (careerProfileForm) {
  const careerArea = careerProfileForm.querySelector('[name="career_area"]');
  document.querySelectorAll('[data-career-role]').forEach((link) => {
    link.addEventListener('click', () => {
      careerArea.value = link.dataset.careerRole;
    });
  });
  const status = new URLSearchParams(window.location.search);
  const statusMessage = status.get('career_message');
  const statusElement = document.querySelector('#career-status');
  if (statusMessage && statusElement) {
    statusElement.textContent = statusMessage;
    statusElement.classList.add(`career-status--${status.get('career_status') === 'success' ? 'success' : 'error'}`);
  }
}
