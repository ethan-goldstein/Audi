/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close'),
      body = document.body;

  /* Disable scroll when menu is open */
  const disableScroll = () => {
    body.style.overflow = 'hidden';
  };

  const enableScroll = () => {
    body.style.overflow = '';
  };

  /* Menu show */
  if(navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.add('show-menu');
      disableScroll();
    });
  }

  /* Menu hidden */
  if(navClose) {
    navClose.addEventListener('click', () => {
      navMenu.classList.remove('show-menu');
      enableScroll();
    });
  }

  /* Close menu when clicking outside */
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('show-menu') && 
        !e.target.closest('.nav__menu') && 
        !e.target.closest('.nav__toggle')) {
      navMenu.classList.remove('show-menu');
      enableScroll();
    }
  });

  /*=============== REMOVE MENU MOBILE ===============*/
  const navLinks = document.querySelectorAll('.nav__link');
  const linkAction = () => {
    navMenu.classList.remove('show-menu');
    enableScroll();
  };
  navLinks.forEach(n => n.addEventListener('click', linkAction));

  /*=============== SWIPER CAR ===============*/
  const swiperHome = new Swiper('.home__swiper', {
    speed: 1200,
    effect: 'fade',
    direction: 'vertical',
    mousewheel: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: (index, className) => {
        const suvModels = ['Q8', 'RS Q8', 'e-tron'];
        return `<span class="${className}">${suvModels[index] || String(index + 1).padStart(2, '0')}</span>`;
      },
    },
    on: {
      init: function() {
        // Set initial panel colors
        const activeSlide = document.querySelector('.swiper-slide-active');
        if (activeSlide) {
          const color = getComputedStyle(activeSlide).getPropertyValue('--color-car');
          document.documentElement.style.setProperty('--active-color', color);
        }
      },
      slideChange: function() {
        // Update colors on slide change
        const activeSlide = document.querySelector('.swiper-slide-active');
        if (activeSlide) {
          const color = getComputedStyle(activeSlide).getPropertyValue('--color-car');
          document.documentElement.style.setProperty('--active-color', color);
        }
      }
    }
  });

  /*=============== GSAP ANIMATION ===============*/
  // Initial animations
  const tl = gsap.timeline();
  
  tl.from('.home__panel-1', { y: '-100%', duration: 1.2, ease: 'power3.out' })
    .from('.home__panel-2', { y: '100%', duration: 1.2, ease: 'power3.out' }, '-=1.0')
    .from('.home__image', { x: '100%', opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
    .from('.home__titles', { y: 50, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')
    .from('.home__specs', { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .from('.home__button', { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

  // Animation on slide change
  swiperHome.on('slideChangeTransitionStart', function() {
    const activeSlide = document.querySelector('.swiper-slide-active');
    if (!activeSlide) return;
    
    const image = activeSlide.querySelector('.home__image');
    const titles = activeSlide.querySelector('.home__titles');
    const specs = activeSlide.querySelector('.home__specs');
    const button = activeSlide.querySelector('.home__button');
    
    // Reset animations
    gsap.set([image, titles, specs, button].filter(Boolean), { opacity: 0, y: 30 });
    
    // Animate in new slide
    const slideTl = gsap.timeline();
    
    if (image) slideTl.to(image, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    if (titles) slideTl.to(titles, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');
    if (specs) slideTl.to(specs, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    if (button) slideTl.to(button, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  });

  /*=============== ADD BLUR HEADER ===============*/
  const header = document.getElementById('header');
  let lastScroll = 0;
  
  const handleScroll = () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      header.classList.remove('blur-header');
      return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('blur-header')) {
      // Scrolling down
      header.classList.add('blur-header');
    } else if (currentScroll < lastScroll && header.classList.contains('blur-header')) {
      // Scrolling up
      header.classList.remove('blur-header');
    }
    
    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
  };
  
  // Disable scroll event since we don't want any scrolling
  // window.addEventListener('scroll', handleScroll);
  
  /*=============== ADD BLUR HEADER ===============*/
  const blurHeader = () => {
    const header = document.getElementById('header');
    // Add a class if the bottom offset is greater than 50 of the viewport
    window.scrollY >= 50 ? header.classList.add('blur-header') 
                         : header.classList.remove('blur-header');
  };
  
  window.addEventListener('scroll', blurHeader);
