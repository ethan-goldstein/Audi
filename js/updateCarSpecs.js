// Car specifications data for each model
const carSpecs = {
    'Q4 e-tron': {
        acceleration: '0-60 IN 5.7S',
        power: '295 HP',
        separator: '•',
        price: 54900,
        model: 'Q4 e-tron',
        image: 'assets/img/ELECTRIC/AudiQ4ELECTRIC.avif.png'
    },
    'Q6 e-tron': {
        acceleration: '0-60 IN 5.0S',
        power: '375 HP',
        separator: '•',
        price: 72900,
        model: 'Q6 e-tron',
        image: 'assets/img/ELECTRIC/AudiQ6ELECTRIC.avif.png'
    },
    'RS e-tron GT': {
        acceleration: '0-60 IN 3.1S',
        power: '590 HP',
        separator: '•',
        price: 125900,
        model: 'RS e-tron GT',
        image: 'assets/img/ELECTRIC/AudiRS-GTELECTRIC.png'
    }
};

// Function to update a single slide's specs
function updateSlideSpecs(slide) {
    if (!slide) return;
    
    // Get the car model from the subtitle
    const subtitle = slide.querySelector('.home__subtitle');
    if (!subtitle) return;
    
    const model = subtitle.textContent.trim();
    const specs = carSpecs[model];
    if (!specs) return;
    
    // Update the specs in the DOM
    const specsContainer = slide.querySelector('.home__specs');
    if (specsContainer) {
        specsContainer.innerHTML = [
            `<span>${specs.acceleration}</span>`,
            `<span>${specs.separator}</span>`,
            `<span>${specs.power}</span>`
        ].join(' ');
    }
    
    // Update the image if it exists
    const image = slide.querySelector('.home__img');
    if (image && specs.image) {
        image.src = specs.image;
        image.alt = `Audi ${model}`;
    }
}

// Function to update all slides (including duplicates in loop mode)
function updateAllSlides() {
    console.log('Updating all slides');
    const allSlides = document.querySelectorAll('.swiper-slide');
    allSlides.forEach(slide => updateSlideSpecs(slide));
}

// Function to update the active slide's specs
function updateCarSpecs() {
    console.log('--- Updating Active Slide ---');
    const activeSlide = document.querySelector('.swiper-slide-active');
    updateSlideSpecs(activeSlide);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper
    const swiper = document.querySelector('.swiper');
    if (swiper) {
        // First update all slides before initializing Swiper
        updateAllSlides();
        
        const swiperInstance = new Swiper(swiper, {
            // Enable loop for infinite scrolling
            loop: true,
            // Enable keyboard and mousewheel for better UX
            keyboard: true,
            mousewheel: true,
            // Smooth transitions
            speed: 500,
            // Callbacks
            on: {
                init: function() {
                    console.log('Swiper initialized');
                    // Initialize cart buttons after swiper is ready
                    setTimeout(initializeCartButtons, 100);
                    // Update all slides after Swiper has initialized
                    setTimeout(updateAllSlides, 100);
                },
                slideChange: function() {
                    console.log('Slide changed to:', this.activeIndex);
                    // Update all slides to ensure looped slides are correct
                    updateAllSlides();
                },
                slideChangeTransitionStart: function() {
                    console.log('Slide transition started');
                },
                slideChangeTransitionEnd: function() {
                    console.log('Slide transition ended');
                    // Final update to ensure everything is in sync
                    updateAllSlides();
                },
                // This ensures slides are updated when loop creates duplicates
                beforeLoopFix: function() {
                    console.log('Before loop fix');
                    updateAllSlides();
                },
                loopFix: function() {
                    console.log('Loop fix');
                    updateAllSlides();
                }
            }
        });
        
        // Also update on window resize in case layout changes
        window.addEventListener('resize', updateAllSlides);
        
        // Update all slides one more time to be safe
        setTimeout(updateAllSlides, 500);
    }

    // Initialize cart buttons with click handlers
    function initializeCartButtons() {
        const cartButtons = document.querySelectorAll('.add-to-cart');
        cartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const model = this.getAttribute('data-model');
                if (model) {
                    addToCart(carSpecs[model]);
                }
            });
        });
    }

    // Add item to cart
    function addToCart(item) {
        if (!item) return;
        
        let cart = JSON.parse(localStorage.getItem('audiCart')) || [];
        cart.push(item);
        localStorage.setItem('audiCart', JSON.stringify(cart));
        updateCartCount();
        
        // Dispatch event to notify other tabs
        window.dispatchEvent(new Event('storage'));
    }

    // Update cart count in navigation
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('audiCart')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.length;
            cartCount.style.display = cart.length > 0 ? 'inline-block' : 'none';
        }
    }
    
    // Listen for cart updates from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'audiCart') {
            updateCartCount();
        }
    });
    
    // Initialize cart count on page load
    updateCartCount();
});
