const heroSlider = document.querySelector("[data-hero-slider]");

if (heroSlider) {
  const slides = [...heroSlider.querySelectorAll("[data-hero-slide]")];
  const dots = [...document.querySelectorAll("[data-hero-dot]")];
  const prevButton = document.querySelector("[data-hero-prev]");
  const nextButton = document.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let autoPlayId;

  const renderHeroSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });

    activeIndex = index;
  };

  const moveHeroSlide = (direction = 1) => {
    const nextIndex = (activeIndex + direction + slides.length) % slides.length;
    renderHeroSlide(nextIndex);
  };

  const startAutoPlay = () => {
    autoPlayId = window.setInterval(() => moveHeroSlide(1), 4500);
  };

  const restartAutoPlay = () => {
    window.clearInterval(autoPlayId);
    startAutoPlay();
  };

  prevButton?.addEventListener("click", () => {
    moveHeroSlide(-1);
    restartAutoPlay();
  });

  nextButton?.addEventListener("click", () => {
    moveHeroSlide(1);
    restartAutoPlay();
  });

  renderHeroSlide(activeIndex);
  startAutoPlay();
}
