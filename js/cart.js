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
            const model = this.getAttribute('data-model');
            addToCart(model);
            
            // Visual feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<span>Added!</span>';
            this.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                this.innerHTML = originalText;
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
function addToCart(model) {
    const cart = JSON.parse(localStorage.getItem('audiCart'));
    const existingItem = cart.find(item => item.model === model);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            model: model,
            quantity: 1,
            price: getModelPrice(model),
            image: getModelImage(model)
        });
    }
    
    localStorage.setItem('audiCart', JSON.stringify(cart));
    updateCartCount();
    
    // Notify other tabs
    localStorage.setItem('cartUpdated', Date.now().toString());
}

// Get price based on model (you can adjust these prices)
function getModelPrice(model) {
    const prices = {
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
                <a href="sedans.html" class="btn">Shop Now</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    // Generate cart items HTML
    let itemsHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="cart-item" data-model="${item.model}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.model}">
                </div>
                <div class="item-details">
                    <h3>Audi ${item.model}</h3>
                    <p class="item-price">$${item.price.toLocaleString()}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="item-total">
                    $${itemTotal.toLocaleString()}
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = itemsHTML;
    
    // Update summary
    if (cartSummary) {
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        cartSummary.innerHTML = `
            <h3 class="summary-title">Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal</span>
                <span>$${subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%)</span>
                <span>$${tax.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>$${total.toLocaleString()}</span>
            </div>
            <button class="checkout-btn">Proceed to Checkout</button>
        `;
    }
    
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

// Update item quantity in cart
function updateCartItem(index, change) {
    const cart = JSON.parse(localStorage.getItem('audiCart'));
    
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;
        
        // Remove if quantity is 0 or less
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('audiCart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        
        // Notify other tabs
        localStorage.setItem('cartUpdated', Date.now().toString());
    }
}

// Remove item from cart
function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('audiCart'));
    
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        localStorage.setItem('audiCart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        
        // Notify other tabs
        localStorage.setItem('cartUpdated', Date.now().toString());
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
