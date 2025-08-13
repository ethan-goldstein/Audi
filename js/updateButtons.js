document.addEventListener('DOMContentLoaded', function() {
    // Convert Discover More buttons into Add to Cart and attach accurate data attributes
    // Works across sedans, suvs, and customs pages without hardcoding DOM order

    // Known prices (fallbacks). If a model isn't here, price attribute will be omitted and cart.js fallback may apply.
    const priceByModel = {
        // Sedans
        'R8': 135000,
        'A4': 55000,
        'RS7': 145000,
        // SUVs
        'Q8': 74400,
        'RS Q8': 136200,
        'Q7': 60500,
        // Customs / Electric
        'RS e-tron GT': 168300,
        'Q4 e-tron': 49800,
        'Q6 e-tron': 74000
    };

    // Helper to safely get text
    const getText = (el) => (el && el.textContent ? el.textContent.trim() : '');

    function processArticle(article) {
        if (!article) return;
        const btn = article.querySelector('.home__button');
        if (!btn) return;

        // Avoid double-processing
        if (btn.classList.contains('add-to-cart')) return;

        const span = btn.querySelector('span');
        if (!span) return;

        const isDiscover = getText(span) === 'Discover More';
        if (!isDiscover) return;

        // Extract model and image from the card
        const modelEl = article.querySelector('.home__subtitle');
        const imgEl = article.querySelector('.home__img');

        const model = getText(modelEl);
        const image = imgEl && imgEl.getAttribute('src') ? imgEl.getAttribute('src') : 'assets/img/placeholder.jpg';
        const price = priceByModel[model];

        // Build the new button (prefer <button> semantics)
        const newButton = document.createElement('button');
        newButton.className = btn.className;
        newButton.classList.add('add-to-cart');
        newButton.innerHTML = `
            <span>Add to Cart</span>
            <i class="ri-shopping-cart-line"></i>
        `;
        if (model) newButton.setAttribute('data-model', model);
        if (image) newButton.setAttribute('data-image', image);
        if (typeof price === 'number') newButton.setAttribute('data-price', String(price));

        // Replace existing element (anchor or button) with new functional button
        if (btn.parentNode) btn.parentNode.replaceChild(newButton, btn);
    }

    // Initial pass
    document.querySelectorAll('.home__article').forEach(processArticle);

    // Observe for Swiper's cloned slides or dynamic updates
    const wrapper = document.querySelector('.swiper-wrapper');
    if (wrapper && 'MutationObserver' in window) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes && m.addedNodes.forEach(node => {
                    if (!(node instanceof Element)) return;
                    if (node.classList && node.classList.contains('home__article')) {
                        processArticle(node);
                    } else {
                        // If a subtree contains articles
                        node.querySelectorAll && node.querySelectorAll('.home__article').forEach(processArticle);
                    }
                });
            });
        });
        observer.observe(wrapper, { childList: true, subtree: true });
    }
});
