document.addEventListener('DOMContentLoaded', function() {
    // Car specifications data for each model
    const carSpecs = {
        'R8': {
            speed: '201 MPH TOP SPEED',
            acceleration: '0-60 IN 3.2S',
            power: '562 HP',
            separator: '•',
            price: 169900,
            model: 'R8',
            image: 'assets/img/r8.png'
        },
        'A4': {
            speed: '130 MPH TOP SPEED',
            acceleration: '0-60 IN 5.2S',
            power: '201 HP',
            separator: '•',
            price: 39900,
            model: 'A4',
            image: 'assets/img/a4.png'
        },
        'RS7': {
            speed: '190 MPH TOP SPEED',
            acceleration: '0-60 IN 3.5S',
            power: '591 HP',
            separator: '•',
            price: 114900,
            model: 'RS7',
            image: 'assets/img/rs7.png'
        }
    };

    // Initialize Swiper
    const swiper = document.querySelector('.swiper');
    if (swiper) {
        const swiperInstance = new Swiper(swiper, {
            on: {
                slideChange: function() {
                    updateCarSpecs(this.activeIndex);
                },
                init: function() {
                    // Initialize specs on page load
                    updateCarSpecs(this.activeIndex);
                    // Initialize cart buttons after swiper is ready
                    setTimeout(initializeCartButtons, 100);
                }
            }
        });
    }

    // Initialize cart buttons with click handlers
    function initializeCartButtons() {
        document.querySelectorAll('.home__button').forEach((button, index) => {
            const span = button.querySelector('span');
            const icon = button.querySelector('i');
            
            if (span && span.textContent.trim() === 'Discover More') {
                // Update button appearance
                span.textContent = 'ADD TO CART';
                if (icon) {
                    icon.className = 'ri-shopping-cart-line';
                }
                
                // Add click handler for adding to cart
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const slide = button.closest('.swiper-slide');
                    if (slide) {
                        const model = slide.querySelector('.home__subtitle')?.textContent.trim();
                        if (model && carSpecs[model]) {
                            addToCart(carSpecs[model]);
                            // Visual feedback
                            const originalText = span.textContent;
                            span.textContent = 'ADDED!';
                            setTimeout(() => {
                                span.textContent = originalText;
                            }, 1500);
                        }
                    }
                });
            }
        });
    }
    
    // Add item to cart
    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
        
        // Check if item already in cart
        const existingItem = cart.find(cartItem => cartItem.model === item.model);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                model: item.model,
                price: item.price,
                image: item.image,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('audiCart', JSON.stringify(cart));
        
        // Update cart count in navigation
        updateCartCount();
        
        // Dispatch event for other components to update
        window.dispatchEvent(new Event('cartUpdated'));
    }
    
    // Update cart count in navigation
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const displayCount = totalItems > 99 ? '99+' : totalItems;
        
        document.querySelectorAll('.cart-count').forEach(counter => {
            counter.textContent = displayCount;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
            
            // Add animation
            counter.classList.add('cart-updated');
            setTimeout(() => counter.classList.remove('cart-updated'), 300);
        });
    }
    
    // Listen for cart updates from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'audiCart') {
            updateCartCount();
        }
    });
    
    // Initial cart count update
    updateCartCount();
});

// Function to update car specs based on active slide
function updateCarSpecs(slideIndex) {
    const slides = document.querySelectorAll('.swiper-slide');
    const activeSlide = slides[slideIndex];
    
    if (!activeSlide) return;
    
    // Get the car model from the subtitle
    const subtitle = activeSlide.querySelector('.home__subtitle');
    if (!subtitle) return;
    
    const model = subtitle.textContent.trim();
    const specs = carSpecs[model];
    
    if (!specs) return;
    
    // Update the specs in the DOM
    const specsContainer = activeSlide.querySelector('.home__specs');
    if (specsContainer) {
        specsContainer.innerHTML = `
            <span>${specs.speed}</span>
            <span>${specs.separator}</span>
            <span>${specs.acceleration}</span>
            <span>${specs.separator}</span>
            <span>${specs.power}</span>
        `;
    }
}
