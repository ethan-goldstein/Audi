// Car specifications data for each model
const carSpecs = {
    // Sedan Models
    'R8': {
        acceleration: '0-60 IN 3.1S',
        power: '591 HP',
        topSpeed: '205 MPH',
        price: 147900,
        model: 'R8',
        image: 'assets/img/SEDAN\'S/r8-white.png',
        specs: '0-60 IN 3.1S • 591 HP'
    },
    'A4': {
        acceleration: '0-60 IN 5.2S',
        power: '201 HP',
        topSpeed: '130 MPH',
        price: 42900,
        model: 'A4',
        image: 'assets/img/SEDAN\'S/a4-black.png',
        specs: '0-60 IN 5.2S • 201 HP'
    },
    'RS7': {
        acceleration: '0-60 IN 3.5S',
        power: '591 HP',
        topSpeed: '190 MPH',
        price: 114900,
        model: 'RS7',
        image: 'assets/img/SEDAN\'S/rs7-blue.png',
        specs: '0-60 IN 3.5S • 591 HP'
    },
    
    // SUV Models
    'Q8': {
        acceleration: '0-60 IN 5.6S',
        power: '335 HP',
        topSpeed: '130 MPH',
        price: 72900,
        model: 'Q8',
        image: 'assets/img/SUV\'S/AudiQ8SUV.jpg.avif',
        specs: '0-60 IN 5.6S • 335 HP'
    },
    'RS Q8': {
        acceleration: '0-60 IN 3.7S',
        power: '591 HP',
        topSpeed: '190 MPH',
        price: 114900,
        model: 'RS Q8',
        image: 'assets/img/SUV\'S/AudiSQ7SUV.png',
        specs: '0-60 IN 3.7S • 591 HP'
    },
    'e-tron': {
        acceleration: '0-60 IN 5.5S',
        power: '355 HP',
        topSpeed: '124 MPH',
        price: 69900,
        model: 'e-tron',
        image: 'assets/img/SUV\'S/AudiQ7SUV.png',
        specs: '0-60 IN 5.5S • 355 HP • 222 MI RANGE'
    }
};

// Function to update a single slide's specs
function updateSlideSpecs(slide) {
    if (!slide) return;
    
    // Get the car model from the subtitle
    const subtitle = slide.querySelector('.home__subtitle');
    if (!subtitle) return;
    
    const model = subtitle.textContent.trim();
    const car = carSpecs[model];
    if (!car) return;
    
    // Update the specs in the DOM
    const specsContainer = slide.querySelector('.home__specs');
    if (specsContainer && car.specs) {
        // Split the specs string into parts and create spans for each part
        const parts = car.specs.split(' • ');
        specsContainer.innerHTML = '';
        
        parts.forEach((part, index) => {
            const span = document.createElement('span');
            span.textContent = part;
            
            // Add bullet separator between items, but not after the last one
            if (index < parts.length - 1) {
                const bullet = document.createElement('span');
                bullet.textContent = ' • ';
                bullet.style.margin = '0 5px';
                specsContainer.appendChild(span);
                specsContainer.appendChild(bullet);
            } else {
                specsContainer.appendChild(span);
            }
        });
    }
    
    // Update the image if it exists
    const image = slide.querySelector('.home__img');
    if (image && car.image) {
        image.src = car.image;
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
