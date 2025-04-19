document.addEventListener('DOMContentLoaded', function() {
  // Hamburger menu toggle
  const hamMenu = document.querySelector('.ham-menu');
  const offscreenMenu = document.querySelector('.offscreen-menu');
  
  if (hamMenu && offscreenMenu) {
      hamMenu.addEventListener('click', () => {
          hamMenu.classList.toggle('active');
          offscreenMenu.classList.toggle('active');
      });
  }

  // GSAP animations
  if (typeof ScrollMagic !== 'undefined') {
      const controller = new ScrollMagic.Controller();
      const timeline = gsap.timeline();

      timeline
          .to(".rock", { y: -300, duration: 10 })
          .to(".girl", { y: -400, duration: 10 }, "-=10")
          .fromTo(".bg1", { y: -50 }, { y: 0, duration: 10 }, "-=10")
          .to(".content", { top: "0%", duration: 10 }, "-=10")
          .fromTo(".content-images", { opacity: 0 }, { opacity: 1, duration: 3 })
          .fromTo(".text", { opacity: 0 }, { opacity: 1, duration: 3 });

      new ScrollMagic.Scene({
          triggerElement: "section",
          duration: "300%",
          triggerHook: 0,
      })
      .setTween(timeline)
      .setPin("section")
      .addTo(controller);
  }

  // Coin hover effect
  const coin = document.querySelector('.mine-coin img');
  if (coin) {
      coin.addEventListener('mouseenter', () => {
          gsap.to(coin, { scale: 1.1, duration: 0.3 });
      });
      coin.addEventListener('mouseleave', () => {
          gsap.to(coin, { scale: 1, duration: 0.3 });
      });
  }
});