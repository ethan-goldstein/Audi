document.addEventListener('DOMContentLoaded', function() {
    // Update all Discover More buttons to Add to Cart
    const buttons = document.querySelectorAll('.home__button');
    
    // Model names in order of appearance
    const models = ['R8', 'A4', 'RS7'];
    
    buttons.forEach((button, index) => {
        if (button.querySelector('span').textContent.trim() === 'Discover More') {
            button.innerHTML = `
                <span>Add to Cart</span>
                <i class="ri-shopping-cart-line"></i>
            `;
            button.classList.add('add-to-cart');
            button.setAttribute('data-model', models[index % models.length]);
            
            // Change from <a> to <button> if needed
            if (button.tagName === 'A') {
                const newButton = document.createElement('button');
                newButton.className = button.className;
                newButton.innerHTML = button.innerHTML;
                button.parentNode.replaceChild(newButton, button);
            }
        }
    });
});
