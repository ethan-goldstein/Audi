// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart in localStorage if it doesn't exist
    if (!localStorage.getItem('audiCart')) {
        localStorage.setItem('audiCart', JSON.stringify([]));
    }

    // Update cart count on page load
    updateCartCount();

    // Add event delegation for Add to Cart buttons
    document.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (!addToCartBtn) return;
        
        e.preventDefault();
        if (addToCartBtn.disabled) return;
        
        const model = addToCartBtn.getAttribute('data-model');
        const price = parseFloat(addToCartBtn.getAttribute('data-price')) || getModelPrice(model);
        const image = addToCartBtn.getAttribute('data-image') || 'assets/img/placeholder.jpg';
        
        addToCart(model, price, image);
        
        // Visual feedback
        const originalHTML = addToCartBtn.innerHTML;
        const originalBg = addToCartBtn.style.backgroundColor;
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i>';
        addToCartBtn.style.backgroundColor = '#4CAF50';
        addToCartBtn.disabled = true;
        
        // Revert after animation
        setTimeout(() => {
            addToCartBtn.innerHTML = originalHTML;
            addToCartBtn.style.backgroundColor = originalBg;
            addToCartBtn.disabled = false;
            updateCartCount();
        }, 1000);
    });

    // If we're on the cart page, initialize cart functionality
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
        
        // Add event delegation for cart controls
        document.addEventListener('click', function(e) {
            // Handle quantity buttons
            const qtyBtn = e.target.closest('.quantity-btn');
            if (qtyBtn && !qtyBtn.disabled) {
                const index = parseInt(qtyBtn.getAttribute('data-index'));
                const isPlus = qtyBtn.classList.contains('plus');
                updateCartItem(index, isPlus ? 1 : -1);
            }
            
            // Handle remove buttons
            const removeBtn = e.target.closest('.remove-item');
            if (removeBtn) {
                const index = parseInt(removeBtn.getAttribute('data-index'));
                removeFromCart(index);
            }
        });
    }
});

/**
 * Add item to cart
 * @param {string} model - The model name of the car
 * @param {number} price - The price of the car
 * @param {string} image - The image URL of the car
 */
function addToCart(model, price, image) {
    try {
        const cart = JSON.parse(localStorage.getItem('audiCart')) || [];
        const existingItem = cart.find(item => item.model === model);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                model: model,
                quantity: 1,
                price: price,
                image: image || 'assets/img/placeholder.jpg',
                addedAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem('audiCart', JSON.stringify(cart));
        updateCartCount();
        
        // If we're on the cart page, reload the items
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
        }
        
        // Show notification
        showNotification(`Added ${model} to cart`);
        
        // Notify other tabs
        localStorage.setItem('cartUpdated', Date.now().toString());
        
        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding item to cart', 'error');
        return false;
    }
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

/**
 * Update cart count in the header
 */
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('audiCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update cart count in the header
        const cartCounts = document.querySelectorAll('.cart-count');
        cartCounts.forEach(count => {
            // Add animation class when count changes
            const currentCount = parseInt(count.textContent) || 0;
            if (totalItems > currentCount) {
                count.classList.add('bump');
                setTimeout(() => count.classList.remove('bump'), 300);
            }
            
            count.textContent = totalItems;
            count.style.display = totalItems > 0 ? 'flex' : 'none';
        });
        
        return totalItems;
    } catch (error) {
        console.error('Error updating cart count:', error);
        return 0;
    }
}

/**
 * Load cart items on the cart page
 */
function loadCartItems() {
    try {
        const cart = JSON.parse(localStorage.getItem('audiCart')) || [];
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartSummary = document.querySelector('.cart-summary');
        const checkoutBtn = document.querySelector('.checkout-btn');
        
        if (!cartItemsContainer) return;
        
        // Show loading state
        cartItemsContainer.innerHTML = `
            <div class="loading-cart">
                <div class="spinner"></div>
                <p>Loading your cart...</p>
            </div>
        `;
        
        // Generate cart items HTML
        let itemsHTML = '';
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            const imageUrl = item.image || 'assets/img/placeholder.jpg';
            
            itemsHTML += `
                <div class="cart-item" data-model="${escapeHtml(item.model)}">
                    <button class="cart-item-remove" data-index="${index}" aria-label="Remove ${escapeHtml(item.model)}">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="item-image">
                        <img src="${escapeHtml(imageUrl)}" 
                             alt="${escapeHtml(item.model)}" 
                             loading="lazy"
                             onerror="this.onerror=null; this.src='assets/img/placeholder.jpg';">
                    </div>
                    <div class="item-details">
                        <h3>Audi ${escapeHtml(item.model)}</h3>
                        <p class="item-price">${formatCurrency(item.price)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-index="${index}" 
                                    aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}" 
                                    aria-label="Increase quantity">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-total">
                        ${formatCurrency(itemTotal)}
                    </div>
                </div>
            `;
        });
        
        // Update the DOM
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any Audi vehicles to your cart yet.</p>
                    <a href="shop.html" class="shop-btn">
                        <i class="fas fa-car"></i> Browse Vehicles
                    </a>
                </div>
            `;
            if (cartSummary) cartSummary.style.display = 'none';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cartItemsContainer.innerHTML = itemsHTML;
            if (cartSummary) cartSummary.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = false;
        }
        
        // Update the summary with calculated values
        updateCartSummary();
        
    } catch (error) {
        console.error('Error loading cart items:', error);
        const cartItemsContainer = document.querySelector('.cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load your cart</h3>
                    <p>There was an error loading your cart. Please try refreshing the page.</p>
                    <button class="btn" onclick="window.location.reload()">
                        <i class="fas fa-sync-alt"></i> Refresh Page
                    </button>
                </div>
            `;
        }
    }
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

/**
 * Update item quantity in cart
 * @param {number} index - The index of the item in the cart
 * @param {number} change - The amount to change the quantity by (1 or -1)
 */
function updateCartItem(index, change) {
    try {
        const cart = JSON.parse(localStorage.getItem('audiCart')) || [];
        
        if (index >= 0 && index < cart.length) {
            const item = cart[index];
            const newQuantity = Math.max(1, item.quantity + change);
            
            // If quantity didn't change, do nothing
            if (newQuantity === item.quantity) return;
            
            // Update quantity
            item.quantity = newQuantity;
            
            // Update the cart in localStorage
            localStorage.setItem('audiCart', JSON.stringify(cart));
            
            // Update the display
            const quantityElement = document.querySelector(`.cart-item[data-model="${escapeHtml(item.model)}"] .quantity`);
            const totalElement = document.querySelector(`.cart-item[data-model="${escapeHtml(item.model)}"] .item-total`);
            
            if (quantityElement) {
                quantityElement.textContent = newQuantity;
                
                // Disable minus button if quantity is 1
                const minusBtn = quantityElement.previousElementSibling;
                if (minusBtn) {
                    minusBtn.disabled = newQuantity <= 1;
                }
            }
            
            if (totalElement) {
                totalElement.textContent = formatCurrency(item.price * newQuantity);
            }
            
            // Update the summary
            updateCartSummary();
            
            // Update the cart count in the header
            updateCartCount();
            
            // Show notification
            showNotification(`Updated ${item.model} quantity to ${newQuantity}`);
            
            // Notify other tabs
            localStorage.setItem('cartUpdated', Date.now().toString());
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        showNotification('Error updating cart item', 'error');
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

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} [type='success'] - The type of notification (success, error, info, warning)
 */
function showNotification(message, type = 'success') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto-remove after delay
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
