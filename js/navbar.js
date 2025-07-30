// Navigation configuration
const navConfig = {
    // Home page navigation
    'index.html': {
        showBack: false,
        links: [
            { text: 'SHOP', href: 'shop.html' },
            { text: 'CONTACT', href: 'contact.html' },
            { 
                isCart: true,
                href: 'cart.html',
                icon: 'shopping-cart',
                badge: true
            }
        ]
    },
    // Shop page navigation
    'shop.html': {
        showBack: true,
        backHref: 'index.html',
        links: [
            { text: 'COMMERCIAL', href: '#', icon: 'briefcase' },
            { 
                isCart: true,
        ]
    },
    'sedans.html': {
        showBack: true,
        backHref: 'shop-backup-20250617.html',
        links: [
            { text: 'HOME', href: 'index.html' },
            { text: 'CART', href: 'cart.html', icon: 'fa-shopping-cart', isCart: true }
        ]
    },
    'suvs.html': {
        showBack: true,
        backHref: 'shop-backup-20250617.html',
        links: [
            { text: 'HOME', href: 'index.html' },
            { text: 'CART', href: 'cart.html', icon: 'fa-shopping-cart', isCart: true }
        ]
    },
    'electric.html': {
        showBack: true,
        backHref: 'shop-backup-20250617.html',
        links: [
            { text: 'HOME', href: 'index.html' },
            { text: 'CART', href: 'cart.html', icon: 'fa-shopping-cart', isCart: true }
        ]
    },
    'cart.html': {
        showBack: true,
        backHref: 'shop-backup-20250617.html',
        links: [
            { text: 'HOME', href: 'index.html' },
            { text: 'SHOP', href: 'shop-backup-20250617.html' }
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Get navigation elements
    const navBackContainer = document.getElementById('navBackContainer');
    const mainNavLinks = document.getElementById('mainNavLinks');
    let cartCountBadge = null;

    if (navMenu && navLinks) {
        navMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.classList.toggle('nav-open');
        });

        // Close menu when clicking on a nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('nav-open');
            });
        });
    }
    
    // Update cart count
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
        const cartCounts = document.querySelectorAll('.cart-count');
        cartCounts.forEach(cartCount => {
            if (cartCount) {
                const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
                cartCount.textContent = itemCount;
                cartCount.style.display = itemCount > 0 ? 'inline-block' : 'none';
            }
        });
    }

    // Initialize cart count
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('storage', (e) => {
        if (e.key === 'audiCart') {
            updateCartCount();
        }
    });
});
