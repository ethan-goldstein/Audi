// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Mobile menu toggle
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelector('.nav-links');

if (navMenu && navLinks) {
    navMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Global variables
let models = {};
let currentActiveModel = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeHeroAnimations();
    initializeModels();
    initializeScrollAnimations();
    initializeInteractions();
});

// Hero section animations
function initializeHeroAnimations() {
    // Page load animations
    const tl = gsap.timeline();
    
    tl.from('.futuristic-nav', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    })
    .from('.title-word', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out'
    }, 0.3)
    .from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    }, 0.8)
    .from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    }, 1.0)
    .from('.spline-container', {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: 'back.out(1.7)'
    }, 0.5);

    // Add subtle hover effect to Spline container
    const splineContainer = document.querySelector('.spline-container');
    if (splineContainer) {
        splineContainer.addEventListener('mouseenter', () => {
            gsap.to(splineContainer, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        splineContainer.addEventListener('mouseleave', () => {
            gsap.to(splineContainer, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }
}

// Initialize 3D models for each card with enhanced configurations
function initializeModels() {
    const modelConfigs = [
        { 
            id: 'sedan-model', 
            type: 'sedan', 
            color: 0x3498db,  // Blue
            name: 'Audi A8',
            description: 'Luxury sedan with cutting-edge technology',
            price: '$85,200',
            specs: ['3.0L V6', '335 HP', '0-60 in 5.2s']
        },
        { 
            id: 'suv-model', 
            type: 'suv', 
            color: 0xe74c3c,  // Red
            name: 'Audi Q8',
            description: 'Bold SUV with premium performance',
            price: '$72,800',
            specs: ['3.0L V6', '335 HP', '0-60 in 5.6s']
        },
        { 
            id: 'electric-model', 
            type: 'electric', 
            color: 0x2ecc71,  // Green
            name: 'Audi e-tron GT',
            description: 'Fully electric with stunning performance',
            price: '$99,900',
            specs: ['Dual Motor', '522 HP', '0-60 in 3.9s']
        },
        { 
            id: 'coming-soon-model', 
            type: 'coming-soon', 
            color: 0x9b59b6,  // Purple
            name: 'Coming Soon',
            description: 'The future of Audi innovation',
            price: 'TBA',
            specs: ['Revolutionary Design', 'Cutting-Edge Tech', 'Coming 2024']
        }
    ];

    modelConfigs.forEach(config => {
        const container = document.getElementById(config.id);
        if (container) {
            // Create model container if it doesn't exist
            const modelContainer = document.createElement('div');
            modelContainer.className = 'model-3d-container';
            container.querySelector('.model-image').appendChild(modelContainer);
            
            // Create model with the container
            const model = createModel(modelContainer, config);
            models[config.type] = model;
            
            // Update model info
            const title = container.querySelector('h3');
            const description = container.querySelector('.model-description');
            const price = container.querySelector('.model-price');
            
            if (title) title.textContent = config.name;
            if (description) description.textContent = config.description;
            if (price) price.textContent = config.price;
            
            // Add hover effect
            container.addEventListener('mouseenter', () => {
                gsap.to(model.mesh.rotation, {
                    y: model.mesh.rotation.y + Math.PI/2,
                    duration: 1.5,
                    ease: 'power2.inOut'
                });
                
                // Highlight card
                gsap.to(container, {
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            container.addEventListener('mouseleave', () => {
                // Reset card shadow
                gsap.to(container, {
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        }
    });
}

// Create individual 3D model with enhanced visuals
function createModel(container, config) {
    // Create loading state
    const loadingElement = document.createElement('div');
    loadingElement.className = 'model-loading';
    container.innerHTML = '';
    container.appendChild(loadingElement);
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    
    // Enhanced camera setup
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    
    // Create renderer with better defaults
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance',
        antialias: true
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    
    // Clear container and add renderer
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    // Add subtle background gradient
    const gradient = document.createElement('div');
    gradient.className = 'model-gradient';
    container.appendChild(gradient);
    
    // Add subtle reflection effect
    const reflection = document.createElement('div');
    reflection.className = 'model-reflection';
    container.appendChild(reflection);
    
    // Advanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Main key light
    const keyLight = new THREE.DirectionalLight(config.color, 1.5);
    keyLight.position.set(10, 10, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);
    
    // Fill light
    const fillLight = new THREE.PointLight(0xffffff, 0.8, 50);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-5, 5, 5);
    scene.add(rimLight);
    
    // Create more sophisticated geometry based on type
    let geometry, mesh;
    const material = new THREE.MeshPhysicalMaterial({
        color: config.color,
        roughness: 0.2,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: config.color,
        emissiveIntensity: 0.1,
        envMapIntensity: 1.0
    });
    
    // Create a group to hold all model parts
    const modelGroup = new THREE.Group();
    
    // Different model types with more complex geometries
    switch(config.type) {
        case 'sedan':
            // Car body
            const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
            const body = new THREE.Mesh(bodyGeometry, material);
            body.position.y = 0.1;
            
            // Car top
            const topGeometry = new THREE.BoxGeometry(1.8, 0.6, 2.5);
            const top = new THREE.Mesh(topGeometry, material);
            top.position.y = 0.6;
            top.position.z = -0.3;
            
            modelGroup.add(body, top);
            break;
            
        case 'suv':
            // SUV body
            const suvBody = new THREE.BoxGeometry(2.2, 1, 4);
            const suv = new THREE.Mesh(suvBody, material);
            
            // SUV top
            const suvTop = new THREE.BoxGeometry(2, 1.2, 2.5);
            const topSuv = new THREE.Mesh(suvTop, material);
            topSuv.position.y = 0.6;
            topSuv.position.z = -0.2;
            
            modelGroup.add(suv, topSuv);
            break;
            
        case 'electric':
            // Futuristic electric car
            const carLength = 3.5;
            const carWidth = 1.8;
            const carHeight = 1;
            
            // Main body
            const carBody = new THREE.BoxGeometry(carWidth, carHeight, carLength);
            const car = new THREE.Mesh(carBody, material);
            
            // Rounded top
            const topGeo = new THREE.SphereGeometry(carWidth * 0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI/2);
            const topMesh = new THREE.Mesh(topGeo, material);
            topMesh.scale.set(1, 0.6, 1.5);
            topMesh.position.y = carHeight * 0.5;
            topMesh.rotation.x = Math.PI / 2;
            
            modelGroup.add(car, topMesh);
            break;
            
        case 'coming-soon':
            // Abstract futuristic shape
            const torus = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            const knot = new THREE.Mesh(torus, material);
            knot.scale.set(1.2, 1.2, 1.2);
            modelGroup.add(knot);
            break;
    }
    
    // Add subtle animation to the model
    modelGroup.rotation.y = Math.PI / 4; // Initial rotation
    scene.add(modelGroup);
    
    // Position camera based on model type
    camera.position.z = config.type === 'coming-soon' ? 4 : 6;
    camera.lookAt(0, 0, 0);
    
    // Animation loop with smooth rotation and transitions
    let time = 0;
    let targetRotation = 0;
    let currentRotation = 0;
    let isHovered = false;
    
    // Handle mouse move for interactive rotation
    const onMouseMove = (event) => {
        if (!isHovered) return;
        
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        targetRotation = x * Math.PI * 0.5;
    };
    
    // Add hover interaction
    container.addEventListener('mouseenter', () => {
        isHovered = true;
        gsap.to(modelGroup.scale, { 
            x: 1.1, 
            y: 1.1, 
            z: 1.1, 
            duration: 0.5,
            ease: 'power2.out'
        });
    });
    
    container.addEventListener('mouseleave', () => {
        isHovered = false;
        targetRotation = 0;
        gsap.to(modelGroup.scale, { 
            x: 1, 
            y: 1, 
            z: 1, 
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)'
        });
    });
    
    container.addEventListener('mousemove', onMouseMove);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.01;
        
        // Smooth rotation towards target
        currentRotation += (targetRotation - currentRotation) * 0.05;
        
        // Update model group
        modelGroup.rotation.y = currentRotation;
        
        // Subtle floating animation when not hovered
        if (!isHovered) {
            modelGroup.position.y = Math.sin(time * 0.5) * 0.05;
            modelGroup.rotation.x = Math.sin(time * 0.3) * 0.05;
        }
        
        // Update camera position based on model bounds
        if (modelGroup.children.length > 0) {
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Position camera based on model size
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
            
            // Add some padding
            cameraZ *= 0.8;
            
            // Smooth camera movement
            camera.position.z = cameraZ * 1.5;
            camera.lookAt(center);
        }
        
        renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    // Handle window resize
    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    // Debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            onWindowResize();
        }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    const cleanup = () => {
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animate);
        if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement = null;
        }
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    };
    
    // Remove loading state after a short delay for smoother transition
    setTimeout(() => {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                if (loadingElement.parentNode) {
                    loadingElement.parentNode.removeChild(loadingElement);
                }
            }, 300);
        }
    }, 500);
    
    return {
        scene,
        camera,
        renderer,
        mesh: modelGroup,
        container,
        config,
        onWindowResize: handleResize,
        cleanup
    };
}

// Initialize models with error handling
function initializeModels() {
    const modelConfigs = [
        { 
            id: 'sedan-model', 
            type: 'sedan', 
            color: 0x3498db,
            name: 'AUDI A8',
            description: 'Luxury sedan with cutting-edge technology',
            price: '$85,200',
            specs: ['3.0L V6', '335 HP', '5.2s 0-60']
        },
        { 
            id: 'suv-model', 
            type: 'suv', 
            color: 0xe74c3c,
            name: 'AUDI Q8',
            description: 'Bold SUV with premium performance',
            price: '$72,800',
            specs: ['3.0L V6', '335 HP', '5.6s 0-60']
        },
        { 
            id: 'electric-model', 
            type: 'electric', 
            color: 0x2ecc71,
            name: 'AUDI E-TRON GT',
            description: 'Fully electric with stunning performance',
            price: '$99,900',
            specs: ['Dual Motor', '522 HP', '3.9s 0-60']
        },
        { 
            id: 'coming-soon-model', 
            type: 'coming-soon', 
            color: 0x9b59b6,
            name: 'AUDI GRAND SPHERE',
            description: 'The future of Audi innovation',
            price: 'Coming 2024',
            specs: ['Fully Electric', 'Level 4 Autonomous', '400+ Miles']
        }
    ];

    modelConfigs.forEach(config => {
        try {
            const container = document.getElementById(config.id);
            if (!container) return;
            
            // Create model container if it doesn't exist
            const modelContainer = document.createElement('div');
            modelContainer.className = 'model-3d-container';
            container.innerHTML = '';
            container.appendChild(modelContainer);
            
            // Initialize model
            const model = createModel(modelContainer, config);
            models[config.type] = model;
            
            // Add error handling for model creation
            if (!model) {
                console.error(`Failed to create model: ${config.type}`);
                return;
            }
            
            // Add click handler for mobile devices
            modelContainer.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) { // Only for mobile
                    e.stopPropagation();
                    const card = container.closest('.model-card');
                    if (card) {
                        // Toggle active state
                        document.querySelectorAll('.model-card').forEach(c => {
                            if (c !== card) c.classList.remove('active');
                        });
                        card.classList.toggle('active');
                    }
                }
            });
            
        } catch (error) {
            console.error(`Error initializing model ${config.type}:`, error);
        }
    });
    
    // Handle window resize after all models are loaded
    window.dispatchEvent(new Event('resize'));
}

// Handle browser back/forward button with URL hash changes
function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const section = document.getElementById(hash);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // Scroll to top if no hash
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update URL hash without adding to history
function updateHash(hash) {
    if (history.pushState) {
        history.pushState(null, null, '#' + hash);
    } else {
        location.hash = '#' + hash;
    }
}

// Initialize the application with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeHeroAnimations();
        initializeModels();
        initializeScrollAnimations();
        initializeInteractions();
        
        // Set up event listeners for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        // Update URL with hash
                        updateHash(targetId);
                        // Smooth scroll to section
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
        
        // Handle initial hash
        if (window.location.hash) {
            handleHashChange();
        }
        
        // Listen for hash changes (back/forward buttons)
        window.addEventListener('popstate', handleHashChange);
        
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

// Enhanced scroll-based animations with parallax and 3D effects
function initializeScrollAnimations() {
    // Parallax effect for hero background
    gsap.to('.hero-background', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: (i, target) => ScrollTrigger.maxScroll(window) * 0.2,
        ease: 'none'
    });

    // Animate section title with 3D tilt and scale
    gsap.from('.section-title', {
        scrollTrigger: {
            trigger: '.section-title',
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            markers: false
        },
        duration: 1.2,
        y: 100,
        opacity: 0,
        rotationX: 45,
        transformOrigin: 'center bottom',
        ease: 'back.out(1.4)'
    });

    // Staggered card animations with 3D perspective
    document.querySelectorAll('.model-card').forEach((card, index) => {
        // Initial card animation on scroll into view
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'bottom 10%',
                toggleActions: 'play none none none',
                once: true
            },
            duration: 1.2,
            y: 100 + (index * 20),
            opacity: 0,
            rotationY: index % 2 === 0 ? -30 : 30,
            transformPerspective: 1000,
            transformOrigin: index % 2 === 0 ? 'left center' : 'right center',
            ease: 'back.out(1.4)',
            delay: index * 0.1
        });

        // 3D tilt effect on hover
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * 10;
            const rotateY = ((centerX - x) / centerX) * 10;
            
            gsap.to(card, {
                duration: 0.5,
                rotateX: -rotateX,
                rotateY: -rotateY,
                ease: 'power2.out',
                transformPerspective: 1000,
                transformOrigin: 'center center',
                z: 50
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.8,
                rotateX: 0,
                rotateY: 0,
                z: 0,
                ease: 'elastic.out(1, 0.5)'
            });
        });

        // Scroll-based scale and rotation
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            scale: 0.95,
            rotationY: index % 2 === 0 ? -5 : 5,
            y: (i, target) => ScrollTrigger.maxScroll(window) * 0.1,
            ease: 'none'
        });
    });

    // Floating elements animation
    gsap.utils.toArray('.model-card').forEach((card, i) => {
        gsap.to(card, {
            y: i % 2 === 0 ? '-=20' : '+=20',
            duration: 3 + i,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
        });
    });

    // Subtle background elements animation
    const bgElements = document.querySelectorAll('.model-card::before');
    bgElements.forEach((el, i) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            x: (i % 2 === 0 ? -1 : 1) * 100,
            rotation: (i % 2 === 0 ? -1 : 1) * 5,
            ease: 'none'
        });
    });
}

// Card enter animation
function animateCardEnter(card) {
    const category = card.dataset.category;
    const model = models[category];
    
    if (model) {
        gsap.to(model.mesh.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 0.6,
            ease: 'power2.out'
        });
        
        gsap.to(model.mesh.material, {
            emissiveIntensity: 0.2,
            duration: 0.6,
            ease: 'power2.out'
        });
    }
}

// Card leave animation
function animateCardLeave(card) {
    const category = card.dataset.category;
    const model = models[category];
    
    if (model) {
        gsap.to(model.mesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.4,
            ease: 'power2.out'
        });
        
        gsap.to(model.mesh.material, {
            emissiveIntensity: 0.1,
            duration: 0.4,
            ease: 'power2.out'
        });
    }
}

// Interactive features
function initializeInteractions() {
    // Model card hover effects
    document.querySelectorAll('.model-card').forEach(card => {
        const category = card.dataset.category;
        const model = models[category];
        
        card.addEventListener('mouseenter', () => {
            if (model) {
                gsap.to(model.mesh.rotation, {
                    x: model.mesh.rotation.x + Math.PI * 0.1,
                    y: model.mesh.rotation.y + Math.PI * 0.1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                gsap.to(model.camera.position, {
                    z: 2.5,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (model) {
                gsap.to(model.camera.position, {
                    z: 3,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
        });
    });

    // Explore button interactions
    document.querySelectorAll('.explore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Button click animation
            gsap.to(btn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            });
            
            // Add ripple effect
            createRippleEffect(btn, e);
            
            // Navigate based on button's parent card
            const card = btn.closest('.model-card');
            const category = card?.dataset.category;
            
            if (category) {
                console.log(`Navigating to ${category} models...`);
                // Add navigation logic here
            }
        });
    });

    // CTA button interaction
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Smooth scroll to models section
            gsap.to(window, {
                scrollTo: '.models',
                duration: 1.5,
                ease: 'power2.inOut'
            });
        });
    }

    // Menu toggle
    const menuToggle = document.querySelector('.nav-menu');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            // Add menu animation here if needed
            console.log('Menu clicked');
        });
    }
}

// Create ripple effect on button click
function createRippleEffect(button, event) {
    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        transform: scale(0);
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    Object.values(models).forEach(model => {
        if (model.renderer) {
            model.camera.aspect = 280 / 200;
            model.camera.updateProjectionMatrix();
            model.renderer.setSize(280, 200);
        }
    });
});

// Smooth scroll enhancement
document.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-background');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});
