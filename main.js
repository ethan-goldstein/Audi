// Initialize GSAP
const { gsap } = window;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

// Camera setup
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('webgl').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x222222);
gridHelper.position.y = -0.48;
scene.add(gridHelper);

// Create Audi rings
const createAudiRings = () => {
    const group = new THREE.Group();
    const ringGeometry = new THREE.TorusGeometry(1, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    const rings = [
        { x: 0, y: 0, scale: 1 },
        { x: 2.2, y: 0, scale: 1 },
        { x: -2.2, y: 0, scale: 1 },
        { x: 1.1, y: -1.1, scale: 0.8 },
        { x: -1.1, y: -1.1, scale: 0.8 }
    ];

    rings.forEach((ring, i) => {
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial.clone());
        ringMesh.position.set(ring.x, ring.y, 0);
        ringMesh.scale.set(ring.scale, ring.scale, ring.scale);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.rotation.z = i < 3 ? 0 : Math.PI / 4;
        group.add(ringMesh);
    });

    return group;
};

// Display error on page
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '10px';
    errorDiv.style.background = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.zIndex = '10000';
    errorDiv.textContent = `ERROR: ${message}`;
    document.body.appendChild(errorDiv);
    console.error(message);
}

// Load the Audi R8 model
const loadCarModel = () => {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        
        // Try to load the model
        const modelPath = 'Audi_R8.glb';
        showError(`Trying to load model from: ${modelPath}`);
        
        loader.load(
            modelPath,
            (gltf) => {
                showError('Model loaded successfully!');
                const model = gltf.scene;
                
                // Simple material setup
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                model.scale.set(0.5, 0.5, 0.5);
                model.position.set(0, 0, 0);
                model.rotation.set(0, Math.PI, 0);
                
                resolve(model);
            },
            (xhr) => {
                // Show loading progress
                const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                showError(`Loading: ${percent}%`);
            },
            (error) => {
                const errorMsg = `Failed to load model: ${error.message || 'Unknown error'}`;
                showError(errorMsg);
                reject(new Error(errorMsg));
            }
        );
    });
};

// Create scene elements
const audiRings = createAudiRings();
audiRings.position.y = 1.5;
audiRings.position.z = -2;
scene.add(audiRings);

let car; // Will hold our car model

// Animation timeline
const tl = gsap.timeline({ defaults: { duration: 2, ease: 'power3.inOut' } });

// Loading screen elements
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.querySelector('.loading-progress');
const loadingText = document.querySelector('.loading-text');

// Load the car model and initialize the scene
async function init() {
    try {
        // Start loading the car model
        car = await loadCarModel();
        car.position.set(0, 0, 10); // Start off-screen
        scene.add(car);
        
        // Complete the loading progress
        loadingBar.style.width = '100%';
        loadingText.textContent = 'Ready';
        
        // Hide loading screen
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            delay: 0.5,
            onComplete: () => {
                loadingScreen.style.display = 'none';
                
                // Start animations
                animateScene();
            }
        });
        
    } catch (error) {
        console.error('Failed to load the car model:', error);
        loadingText.textContent = 'Error loading model. Please refresh the page.';
        loadingBar.style.backgroundColor = '#ff4444';
    }
}

// Start the initialization
init();

// Animate the scene
function animateScene() {
    // Animate rings
    gsap.to(audiRings.rotation, {
        y: Math.PI * 2,
        duration: 25,
        repeat: -1,
        ease: 'none'
    });
    
    // Initial camera position (bird's eye view)
    camera.position.set(0, 8, 10);
    camera.lookAt(0, 0, 0);
    
    // Animation timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    
    // Car drives in from the distance
    tl.to(car.position, {
        z: 0,
        duration: 3,
        ease: 'power2.out'
    })
    // Camera zooms in
    .to(camera.position, {
        x: 3,
        y: 1.5,
        z: 5,
        duration: 2.5,
        onUpdate: () => camera.lookAt(0, 0.5, 0)
    }, '-=2')
    // Rotate car slightly for better view
    .to(car.rotation, {
        y: Math.PI * 1.2,
        duration: 2
    }, '-=1.5');
    
    // Hero text animation
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const ctaButtons = document.querySelector('.cta-buttons');
    const audiLogo = document.querySelector('.audi-logo');
    
    // Text animations with slight stagger
    gsap.to(heroTitle, {
        y: 0,
        opacity: 1,
        duration: 1.5,
        delay: 1.5,
        ease: 'power3.out'
    });
    
    gsap.to(heroSubtitle, {
        y: 0,
        opacity: 1,
        duration: 1.5,
        delay: 1.8,
        ease: 'power3.out'
    });
    
    gsap.to(ctaButtons, {
        y: 0,
        opacity: 1,
        duration: 1.5,
        delay: 2.1,
        ease: 'power3.out'
    });
    
    // Logo fade in
    gsap.to(audiLogo, {
        opacity: 1,
        duration: 1.5,
        delay: 1,
        ease: 'power3.out'
    });
    
    // Show scroll indicator after animations
    gsap.to('.scroll-indicator', {
        opacity: 1,
        duration: 1,
        delay: 3.5,
        ease: 'power2.out',
        onComplete: () => {
            // Add subtle hover effect to the car
            gsap.to(car.rotation, {
                y: car.rotation.y + (Math.PI / 16),
                duration: 4,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut'
            });
        }
    });
    
    // Add auto-rotation to the car
    function animateCar() {
        requestAnimationFrame(animateCar);
        if (car) {
            // Subtle up and down animation
            car.position.y = Math.sin(Date.now() * 0.001) * 0.05;
        }
    }
    animateCar();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLeft = document.querySelector('.nav-left');
    const navLinks = document.querySelectorAll('.nav-left .nav-button');
    const body = document.body;
    let isMenuOpen = false;

    // Toggle menu function
    const toggleMenu = (e) => {
        if (e) e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        
        if (navLeft) {
            navLeft.classList.toggle('active', isMenuOpen);
            navLeft.setAttribute('aria-hidden', !isMenuOpen);
        }
        
        if (menuToggle) {
            menuToggle.classList.toggle('active', isMenuOpen);
            menuToggle.setAttribute('aria-expanded', isMenuOpen);
            
            // Update icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = `fas fa-${isMenuOpen ? 'times' : 'bars'}`;
            }
        }
        
        // Toggle body scroll
        body.style.overflow = isMenuOpen ? 'hidden' : '';
    };

    // Initialize menu state
    const initMenu = () => {
        if (window.innerWidth > 992) {
            // Always show menu on desktop
            if (navLeft) {
                navLeft.classList.add('active');
                navLeft.setAttribute('aria-hidden', 'false');
            }
            if (menuToggle) {
                menuToggle.style.display = 'none';
                menuToggle.setAttribute('aria-expanded', 'true');
            }
        } else {
            // Hide menu by default on mobile
            if (navLeft) {
                navLeft.classList.remove('active');
                navLeft.setAttribute('aria-hidden', 'true');
            }
            if (menuToggle) {
                menuToggle.style.display = 'flex';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    };

    // Initialize menu on load and window resize
    initMenu();
    window.addEventListener('resize', initMenu);

    // Toggle menu on button click
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking on a nav link (mobile only)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                toggleMenu();
            }
        });
    });

        // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && 
            navLeft && menuToggle &&
            !e.target.closest('.nav-left') && 
            !e.target.closest('.menu-toggle') &&
            navLeft.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Update cart count from localStorage if available
    updateCartCount();
});

// Function to update cart count badge
function updateCartCount() {
    const cartCounts = document.querySelectorAll('.cart-count');
    if (cartCounts.length) {
        const cart = JSON.parse(localStorage.getItem('audiCart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const displayCount = totalItems > 99 ? '99+' : totalItems;
        
        cartCounts.forEach(cartCount => {
            cartCount.textContent = displayCount;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            
            // Add animation class when count changes
            cartCount.classList.add('cart-updated');
            setTimeout(() => cartCount.classList.remove('cart-updated'), 300);
        });
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Listen for cart updates across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'audiCart') {
            updateCartCount();
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLeft = document.querySelector('.nav-left');
        
        if (window.innerWidth <= 992 && 
            !e.target.closest('.nav-left') && 
            !e.target.closest('.menu-toggle') &&
            navLeft && navLeft.classList.contains('active')) {
            
            menuToggle.click(); // Trigger click to close menu
        }
    });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the car wheels
    car.children.forEach((child, i) => {
        if (i >= 4) { // Wheels are the last 4 children
            child.rotation.z += 0.02;
        }
    });
    
    renderer.render(scene, camera);
}

// Start animation loop
animate();
