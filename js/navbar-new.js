document.addEventListener('DOMContentLoaded', function() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Navigation configuration - Only SHOP and CONTACT
    const navConfig = {
        'index.html': {
            showBack: false,
            showNav: true,
            links: [
                { text: 'SHOP', href: 'shop.html' },
                { text: 'CONTACT', href: 'contact.html' }
            ]
        },
        'shop.html': {
            showBack: true,
            backHref: 'index.html',
            showNav: true,
            links: []
        },
        'sedans.html': {
            showBack: true,
            backHref: 'shop.html',
            showNav: true,
            links: []
        },
        'suvs.html': {
            showBack: true,
            backHref: 'shop.html',
            showNav: true,
            links: []
        },
        'electric.html': {
            showBack: true,
            backHref: 'shop.html',
            showNav: true,
            links: []
        },
        'contact.html': {
            showBack: true,
            backHref: 'index.html',
            showNav: true,
            links: [
                { text: 'SHOP', href: 'shop.html' }
            ]
        },
        'cart.html': {
            showBack: true,
            backHref: 'shop.html',
            showNav: true,
            links: []
        }
    };

    // Get navigation elements
    const navBackContainer = document.getElementById('navBackContainer');
    const mainNavLinks = document.getElementById('mainNavLinks');
    let cartCountBadge = null;

    // Update cart count
    function updateCartCount() {
        if (!cartCountBadge) {
            cartCountBadge = document.querySelector('.cart-count');
            if (!cartCountBadge && document.querySelector('.nav-link[href="cart.html"]')) {
                const cartLink = document.querySelector('.nav-link[href="cart.html"]');
                cartLink.innerHTML += '<span class="cart-count">0</span>';
                cartCountBadge = document.querySelector('.cart-count');
            }
        }
        
        if (cartCountBadge) {
            const cart = JSON.parse(localStorage.getItem('audiCart')) || [];
            const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
            cartCountBadge.textContent = totalItems;
            cartCountBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Create navigation HTML
    function createNavigation() {
        const config = navConfig[currentPage] || navConfig['index.html'];
        const container = document.getElementById('navbar-container');
        if (!container || !config.showNav) return;

        let navHTML = '';
        if (config.showBack) {
            // For pages with back button (not home page)
            navHTML = `
                <nav class="futuristic-nav">
                    <div class="nav-container" style="justify-content: center;">
                        <a href="${config.backHref}" class="nav-back">
                            <i class="fas fa-arrow-left"></i>
                            <span>Back</span>
                        </a>
                    </div>
                </nav>
            `;
        } else {
            // For home page with navigation links
            navHTML = `
                <nav class="futuristic-nav">
                    <div class="nav-container">
                        <div class="nav-links">
                            ${config.links.map(link => `
                                <a href="${link.href}" class="nav-link">
                                    ${link.text}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </nav>
            `;
        }
        
        container.innerHTML = navHTML;
        mainNavLinks = document.getElementById('mainNavLinks');
    }

    // Initialize navigation
    function initNavigation() {
        createNavigation();
        
        // Initialize cart count
        updateCartCount();
        
        // Add mobile menu toggle
        const menuToggle = document.querySelector('.nav-menu');
        if (menuToggle && mainNavLinks) {
            menuToggle.addEventListener('click', function() {
                mainNavLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }
    }

    // Listen for cart updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'audiCart') {
            updateCartCount();
        }
    });
    
    // Also update cart when the page loads in case it was modified in the same window
    window.addEventListener('load', updateCartCount);

    // Initialize everything when DOM is loaded
    initNavigation();
});
