// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart in localStorage if it doesn't exist
    if (!localStorage.getItem('audiCart')) {
        localStorage.setItem('audiCart', JSON.stringify([]));
    }

    // Update cart count on page load
    updateCartCount();

    // Add event listeners to all Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;
            
            const model = this.getAttribute('data-model');
            const price = parseFloat(this.getAttribute('data-price')) || 0;
            const image = this.getAttribute('data-image') || getModelImage(model);
            
            addToCart(model, price, image);
            
            // Visual feedback
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.backgroundColor = '#4CAF50';
            
            // Revert after animation
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.backgroundColor = '';
                updateCartCount();
            }, 1000);
        });
    });

    // If we're on the cart page, load the cart items
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
});

// Add item to cart
function addToCart(model, price, image) {
    const cart = JSON.parse(localStorage.getItem('audiCart'));
    const existingItem = cart.find(item => item.model === model && item.price === price);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            model: model,
            quantity: 1,
            price: price,
            image: image
        });
    }
    
    localStorage.setItem('audiCart', JSON.stringify(cart));
    updateCartCount();
    
    // If we're on the cart page, reload the items to update the display
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
    
    // Notify other tabs
    localStorage.setItem('cartUpdated', Date.now().toString());
}

// Get price based on model (fallback function if data-price is not set)
function getModelPrice(model) {
    // This is now just a fallback - we should be using data-price from the button
    const prices = {
        'e-tron GT': 99900,
        'Q4 e-tron': 43900,
        'Grandsphere': 0,
        'R8': 197000,
        'A4': 45000,
        'RS7': 114000
    };
    return prices[model] || 0;
}

// Get image path based on model
function getModelImage(model) {
    const images = {
        'R8': 'assets/img/r8-white.png',
        'A4': 'assets/img/a4-black.png',
        'RS7': 'assets/img/rs7-blue.png'
    };
    return images[model] || 'assets/img/placeholder.jpg';
}

// Update cart count in the header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart count in the header
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(count => {
        count.textContent = totalItems;
        count.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Load cart items on the cart page
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Browse our models and add some items to your cart</p>
                <a href="shop.html" class="btn">Shop Now</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    // Generate cart items HTML
    let itemsHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        
        itemsHTML += `
            <div class="cart-item" data-model="${item.model}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.model}" onerror="this.onerror=null; this.src='assets/img/placeholder.jpg';">
                </div>
                <div class="item-details">
                    <h3>Audi ${item.model}</h3>
                    <p class="item-price">${formatCurrency(item.price)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-index="${index}" aria-label="Decrease quantity">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <div class="item-total">
                    ${formatCurrency(itemTotal)}
                    <button class="remove-item" data-index="${index}" aria-label="Remove item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = itemsHTML;
    if (cartSummary) cartSummary.style.display = 'block';
    
    // Update the summary with calculated values
    updateCartSummary();
    
    // Add event listeners for quantity controls
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const isPlus = this.classList.contains('plus');
            updateCartItem(index, isPlus ? 1 : -1);
        });
    });
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Update item quantity in cart
function updateCartItem(index, change) {
    const cart = JSON.parse(localStorage.getItem('audiCart'));
    
    if (index >= 0 && index < cart.length) {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        
        // Update the cart in localStorage
        localStorage.setItem('audiCart', JSON.stringify(cart));
        
        // Update the cart display
        updateCartDisplay();
        
        // Notify other tabs
        localStorage.setItem('cartUpdated', Date.now().toString());
    }
}

// Update cart display (prices, quantities, etc.)
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
    
    // Update item quantities and prices
    cart.forEach((item, index) => {
        const itemElement = document.querySelector(`.cart-item[data-model="${item.model}"]`);
        if (itemElement) {
            // Update quantity display
            const quantityElement = itemElement.querySelector('.quantity');
            if (quantityElement) {
                quantityElement.textContent = item.quantity;
            }
            
            // Ensure price and quantity are numbers before calculation
            const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity;
            const itemTotal = (price * quantity).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            const itemTotalElement = itemElement.querySelector('.item-total');
            if (itemTotalElement) {
                // Keep the remove button
                const removeButton = itemTotalElement.querySelector('button');
                itemTotalElement.innerHTML = itemTotal;
                if (removeButton) {
                    itemTotalElement.appendChild(removeButton);
                }
            }
        }
    });
    
    // Update summary
    updateCartSummary();
}

// Remove item from cart
function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('audiCart'));
    
    if (index >= 0 && index < cart.length) {
        // Add animation class before removing
        const itemElement = document.querySelectorAll('.cart-item')[index];
        if (itemElement) {
            itemElement.classList.add('removing');
            
            // Remove after animation completes
            setTimeout(() => {
                cart.splice(index, 1);
                localStorage.setItem('audiCart', JSON.stringify(cart));
                
                if (cart.length === 0) {
                    loadCartItems(); // Show empty cart message
                } else {
                    updateCartDisplay();
                }
                
                updateCartCount();
                
                // Notify other tabs
                localStorage.setItem('cartUpdated', Date.now().toString());
            }, 300);
        } else {
            // Fallback if animation element not found
            cart.splice(index, 1);
            localStorage.setItem('audiCart', JSON.stringify(cart));
            loadCartItems();
            updateCartCount();
            localStorage.setItem('cartUpdated', Date.now().toString());
        }
    }
}

// Update cart summary (subtotal, tax, total)
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
    
    // Ensure all prices are numbers and calculate subtotal
    const subtotal = cart.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity;
        return sum + (price * quantity);
    }, 0);
    
    // Calculate tax and total
    const tax = Math.round(subtotal * 0.1); // 10% tax, rounded to nearest cent
    const total = subtotal + tax;
    
    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };
    
    // Update summary in the DOM
    const summaryElement = document.querySelector('.cart-summary');
    if (summaryElement) {
        summaryElement.innerHTML = `
            <h3 class="summary-title">Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%)</span>
                <span>${formatCurrency(tax)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>${formatCurrency(total)}</span>
            </div>
            <button class="checkout-btn">Proceed to Checkout</button>
        `;
    }
}

// Listen for cart updates from other tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'cartUpdated') {
        updateCartCount();
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
        }
    }
});
