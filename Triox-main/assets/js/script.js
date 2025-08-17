/**
 * Enhanced Course Management System
 * Version: 3.1 - Bug Fixes
 * Features: Course rotation, cart system, feedback, filtering, navigation fixes
 */

// Global state management
const AppState = {
    cart: {
        count: 0,
        items: [],
        element: null
    },
    courseRotation: {
        intervals: new Map(),
        rotationSpeed: 10000, // 10 seconds
        fadeSpeed: 500,
        isEnabled: true
    },
    feedback: {
        rating: 0,
        quickFeedbacks: [],
        isOpen: false
    },
    navigation: {
        activeMenu: null,
        mobileMenuOpen: false
    },
    filters: {
        activeFilters: new Set(),
        priceRange: { min: 0, max: Infinity },
        sortOrder: 'default'
    }
};

// Utility functions
const Utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Parse price from string
    parsePrice(priceString) {
        if (!priceString) return 0;
        const cleanPrice = priceString.toString()
            .replace(/[^\d.,]/g, '')
            .replace(/,/g, '');
        return parseFloat(cleanPrice) || 0;
    },

    // Format price for display
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Check if element is visible
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    smoothScrollTo(element, offset = 0) {
        if (!element) return;
        const top = element.offsetTop - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    },

    // Local storage wrapper with error handling
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn(`Error reading from localStorage: ${key}`, e);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn(`Error writing to localStorage: ${key}`, e);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn(`Error removing from localStorage: ${key}`, e);
                return false;
            }
        }
    }
};

// Enhanced Course Image Rotation System
const CourseRotationManager = {
    init() {
        console.log('🔄 Initializing Enhanced Course Rotation System...');

        // Find all course containers
        const courseContainers = this.findCourseContainers();

        if (courseContainers.length === 0) {
            console.log('❌ No course containers found for rotation');
            return;
        }

        // Initialize rotation for each container
        courseContainers.forEach((container, index) => {
            this.initContainerRotation(container, index);
        });

        // Setup visibility observer for performance
        this.setupVisibilityObserver();

        console.log(`✅ Course rotation initialized for ${courseContainers.length} containers`);
    },

    findCourseContainers() {
        const selectors = [
            '.inner-list',
            '.course-list',
            '.product-list',
            '.section-4 .inner-list',
            '.section-6 .inner-list',
            '.section-8 .inner-list'
        ];

        const containers = [];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Check if this container has programming courses
                if (this.hasProgrammingCourses(el)) {
                    containers.push(el);
                }
            });
        });

        return containers;
    },

    hasProgrammingCourses(container) {
        const courseItems = container.querySelectorAll('.product-item, .course-item, .inner-item');

        const programmingKeywords = [
            'lập trình', 'cấu trúc dữ liệu', 'c++', 'python', 'java',
            'javascript', 'web development', 'mobile', 'database',
            'algorithm', 'data structure', 'programming', 'coding'
        ];

        return Array.from(courseItems).some(item => {
            const titleEl = item.querySelector('.inner-title, .course-title, .product-title, h3, h4');
            if (!titleEl) return false;

            const text = titleEl.textContent.toLowerCase().trim();
            return programmingKeywords.some(keyword => text.includes(keyword));
        });
    },

    initContainerRotation(container, containerIndex) {
        const courseItems = Array.from(container.querySelectorAll('.product-item, .course-item, .inner-item'));

        if (courseItems.length < 2) {
            console.log(`Container ${containerIndex}: Not enough items for rotation`);
            return;
        }

        console.log(`🎯 Setting up rotation for container ${containerIndex} with ${courseItems.length} items`);

        // Create rotation state
        const rotationState = {
            container: container,
            items: courseItems,
            currentOrder: [...courseItems],
            rotationIndex: 0,
            isVisible: true,
            isPaused: false,
            rotationHistory: []
        };

        // Start rotation interval
        const intervalId = setInterval(() => {
            this.performRotation(rotationState, containerIndex);
        }, AppState.courseRotation.rotationSpeed);

        // Store interval ID for cleanup
        AppState.courseRotation.intervals.set(container, intervalId);

        // Add hover pause functionality
        this.addHoverControls(container, rotationState);

        // Add manual navigation controls
        this.addNavigationControls(container, rotationState);

        console.log(`✅ Container ${containerIndex} rotation started`);
    },

    performRotation(rotationState, containerIndex) {
        if (!AppState.courseRotation.isEnabled ||
            rotationState.isPaused ||
            !rotationState.isVisible) {
            return;
        }

        const { container, currentOrder } = rotationState;

        console.log(`🔄 Performing rotation ${rotationState.rotationIndex + 1} for container ${containerIndex}`);

        // Create new rotation order: move last item to first
        const lastItem = currentOrder[currentOrder.length - 1];
        const otherItems = currentOrder.slice(0, currentOrder.length - 1);
        const newOrder = [lastItem, ...otherItems];

        // Store current rotation in history
        rotationState.rotationHistory.push([...currentOrder]);
        if (rotationState.rotationHistory.length > 10) {
            rotationState.rotationHistory.shift(); // Keep only last 10 rotations
        }

        // Perform the rotation with animation
        this.animateRotation(container, currentOrder, newOrder, () => {
            // Update state after animation completes
            rotationState.currentOrder = newOrder;
            rotationState.rotationIndex++;

            console.log(`✅ Rotation ${rotationState.rotationIndex} completed for container ${containerIndex}`);

            // Emit custom event for other systems to listen to
            this.emitRotationEvent(container, rotationState);
        });
    },

    animateRotation(container, oldOrder, newOrder, callback) {
        // Phase 1: Fade out
        oldOrder.forEach(item => {
            item.style.transition = `opacity ${AppState.courseRotation.fadeSpeed}ms ease-in-out, transform ${AppState.courseRotation.fadeSpeed}ms ease-in-out`;
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
        });

        // Phase 2: Rearrange DOM after fade out
        setTimeout(() => {
            // Clear container
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            // Add items in new order
            newOrder.forEach((item, index) => {
                container.appendChild(item);
                // Reset transforms but keep opacity 0
                item.style.transform = 'translateY(10px)';
            });

            // Phase 3: Fade in with staggered animation
            newOrder.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100); // Stagger each item by 100ms
            });

            // Complete callback
            setTimeout(callback, newOrder.length * 100 + 200);

        }, AppState.courseRotation.fadeSpeed);
    },

    addHoverControls(container, rotationState) {
        container.addEventListener('mouseenter', () => {
            rotationState.isPaused = true;
            console.log('⏸️ Rotation paused on hover');
        });

        container.addEventListener('mouseleave', () => {
            rotationState.isPaused = false;
            console.log('▶️ Rotation resumed after hover');
        });
    },

    addNavigationControls(container, rotationState) {
        // Create navigation container
        const navContainer = document.createElement('div');
        navContainer.className = 'course-rotation-nav';
        navContainer.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 8px;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Create control buttons
        const prevBtn = this.createNavButton('⏮️', 'Previous', () => {
            this.manualRotation(rotationState, 'prev');
        });

        const pauseBtn = this.createNavButton('⏸️', 'Pause/Play', () => {
            rotationState.isPaused = !rotationState.isPaused;
            pauseBtn.textContent = rotationState.isPaused ? '▶️' : '⏸️';
            pauseBtn.title = rotationState.isPaused ? 'Play' : 'Pause';
        });

        const nextBtn = this.createNavButton('⏭️', 'Next', () => {
            this.manualRotation(rotationState, 'next');
        });

        navContainer.appendChild(prevBtn);
        navContainer.appendChild(pauseBtn);
        navContainer.appendChild(nextBtn);

        // Make container relative and add navigation
        container.style.position = 'relative';
        container.appendChild(navContainer);

        // Show/hide controls on hover
        container.addEventListener('mouseenter', () => {
            navContainer.style.opacity = '1';
        });

        container.addEventListener('mouseleave', () => {
            navContainer.style.opacity = '0';
        });
    },

    createNavButton(text, title, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = title;
        button.style.cssText = `
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        button.addEventListener('click', onClick);

        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(0,0,0,0.9)';
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(0,0,0,0.7)';
            button.style.transform = 'scale(1)';
        });

        return button;
    },

    manualRotation(rotationState, direction) {
        const { currentOrder } = rotationState;
        let newOrder;

        if (direction === 'next') {
            // Move last to first (same as auto rotation)
            const lastItem = currentOrder[currentOrder.length - 1];
            const otherItems = currentOrder.slice(0, currentOrder.length - 1);
            newOrder = [lastItem, ...otherItems];
        } else {
            // Move first to last
            const firstItem = currentOrder[0];
            const otherItems = currentOrder.slice(1);
            newOrder = [...otherItems, firstItem];
        }

        this.animateRotation(rotationState.container, currentOrder, newOrder, () => {
            rotationState.currentOrder = newOrder;
            rotationState.rotationIndex++;
            this.emitRotationEvent(rotationState.container, rotationState);
        });
    },

    setupVisibilityObserver() {
        if (!window.IntersectionObserver) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const container = entry.target;
                const interval = AppState.courseRotation.intervals.get(container);

                if (interval) {
                    // Find rotation state (would need to store this better in real implementation)
                    const isVisible = entry.isIntersecting;
                    console.log(`Container visibility changed: ${isVisible}`);

                    // You could pause rotation when not visible for performance
                    // This would require storing rotation state in a Map
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% visible
        });

        // Observe all containers
        AppState.courseRotation.intervals.forEach((_, container) => {
            observer.observe(container);
        });
    },

    emitRotationEvent(container, rotationState) {
        const event = new CustomEvent('courseRotated', {
            detail: {
                container,
                rotationIndex: rotationState.rotationIndex,
                currentOrder: rotationState.currentOrder,
                timestamp: Date.now()
            }
        });

        container.dispatchEvent(event);
        document.dispatchEvent(event);
    },

    // Public methods for external control
    pauseAll() {
        AppState.courseRotation.isEnabled = false;
        console.log('⏸️ All course rotations paused');
    },

    resumeAll() {
        AppState.courseRotation.isEnabled = true;
        console.log('▶️ All course rotations resumed');
    },

    setRotationSpeed(speed) {
        AppState.courseRotation.rotationSpeed = speed;
        console.log(`⚡ Rotation speed set to ${speed}ms`);

        // Restart all intervals with new speed
        this.restart();
    },

    restart() {
        console.log('🔄 Restarting course rotation system...');
        this.destroy();
        setTimeout(() => this.init(), 100);
    },

    destroy() {
        console.log('🛑 Destroying course rotation system...');

        // Clear all intervals
        AppState.courseRotation.intervals.forEach((intervalId, container) => {
            clearInterval(intervalId);

            // Remove navigation controls
            const navContainer = container.querySelector('.course-rotation-nav');
            if (navContainer) {
                navContainer.remove();
            }
        });

        AppState.courseRotation.intervals.clear();
        console.log('✅ Course rotation system destroyed');
    }
};

// Enhanced Cart Management System
const CartManager = {
    init() {
        console.log('🛒 Initializing Enhanced Cart System...');

        // Find cart element with multiple strategies
        AppState.cart.element = this.findCartElement();

        if (!AppState.cart.element) {
            console.warn('⚠️ Cart element not found, creating fallback');
            this.createFallbackCart();
        }

        // Load cart state from storage
        this.loadCartState();

        // Setup cart interactions
        this.setupCartInteractions();

        // Setup buy button detection
        this.setupBuyButtons();

        // Setup cart persistence
        this.setupCartPersistence();

        console.log('✅ Enhanced cart system initialized');
    },

    findCartElement() {
        const selectors = [
            '.header .inner-cart span',
            '.inner-cart span',
            '.login-wrap .inner-cart span',
            '.header .inner-cart .cart-count',
            '.cart-badge',
            '.cart-counter',
            '#cart-count',
            '[data-cart-count]'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`✓ Found cart element: ${selector}`, element);
                return element;
            }
        }

        // Try to find by parent cart element
        const cartLinks = document.querySelectorAll('.inner-cart, .cart-link, [href*="cart"], [href*="gio-hang"]');
        for (const link of cartLinks) {
            const span = link.querySelector('span, .count, .badge');
            if (span) {
                console.log('✓ Found cart count in cart link', span);
                return span;
            }
        }

        return null;
    },

    createFallbackCart() {
        // Create a fallback cart indicator
        const cartContainer = document.querySelector('.header, .nav, .navigation');
        if (!cartContainer) return;

        const fallbackCart = document.createElement('div');
        fallbackCart.className = 'fallback-cart';
        fallbackCart.innerHTML = `
            <a href="gio-hang.html" class="inner-cart">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">0</span>
            </a>
        `;

        fallbackCart.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: #007bff;
            color: white;
            padding: 10px;
            border-radius: 50px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        cartContainer.appendChild(fallbackCart);
        AppState.cart.element = fallbackCart.querySelector('.cart-count');

        console.log('✅ Fallback cart created');
    },

    loadCartState() {
        const savedCart = Utils.storage.get('cartState', {
            count: 0,
            items: [],
            lastUpdated: Date.now()
        });

        AppState.cart.count = savedCart.count;
        AppState.cart.items = savedCart.items;

        this.updateCartDisplay();

        console.log(`📦 Loaded cart state: ${AppState.cart.count} items`);
    },

    updateCartDisplay() {
        if (!AppState.cart.element) return;

        const count = AppState.cart.count;

        // Update display with animation
        AppState.cart.element.style.transition = 'all 0.3s ease';
        AppState.cart.element.style.transform = 'scale(1.2)';

        // Update text content
        AppState.cart.element.textContent = count;

        // Reset animation
        setTimeout(() => {
            AppState.cart.element.style.transform = 'scale(1)';
        }, 300);

        // Save to storage
        this.saveCartState();

        // Update cart badge visibility
        this.updateCartBadge(count);

        console.log(`🔄 Cart display updated: ${count}`);
    },

    updateCartBadge(count) {
        if (!AppState.cart.element) return;

        const cartLink = AppState.cart.element.closest('.inner-cart, .cart-link');
        if (!cartLink) return;

        // Add/remove badge class based on count
        if (count > 0) {
            cartLink.classList.add('has-items');
            AppState.cart.element.style.display = 'inline';
        } else {
            cartLink.classList.remove('has-items');
            AppState.cart.element.style.display = count === 0 ? 'none' : 'inline';
        }

        // Add bounce effect for significant changes
        if (count > 0) {
            cartLink.classList.add('cart-bounce');
            setTimeout(() => {
                cartLink.classList.remove('cart-bounce');
            }, 600);
        }
    },

    setupCartInteractions() {
        // Main cart click handler
        const cartLinks = document.querySelectorAll('.inner-cart, .cart-link, [href*="cart"], [href*="gio-hang"]');

        cartLinks.forEach(cartLink => {
            // Fix cart link paths
            this.fixCartLink(cartLink);

            cartLink.addEventListener('click', (e) => {
                // Don't prevent default if we're already on cart page
                if (window.location.pathname.includes('gio-hang') ||
                    window.location.pathname.includes('cart')) {
                    return;
                }

                e.preventDefault();

                if (e.shiftKey) {
                    // SHIFT + Click = Reset cart
                    this.resetCart();
                } else if (e.ctrlKey || e.metaKey) {
                    // CTRL/CMD + Click = Add item without navigation
                    this.addToCart(1, false);
                } else {
                    // Normal click = Add item and navigate
                    this.addToCart(1);
                    setTimeout(() => {
                        window.location.href = 'gio-hang.html';
                    }, 300);
                }
            });
        });

        console.log(`🔗 Setup cart interactions for ${cartLinks.length} cart links`);
    },

    fixCartLink(cartLink) {
        const href = cartLink.getAttribute('href');
        if (href && href.includes('../Triox-main/')) {
            const fixedHref = href.replace('../Triox-main/', '');
            cartLink.setAttribute('href', fixedHref);
            console.log(`Fixed cart link: ${href} → ${fixedHref}`);
        }
    },

    setupBuyButtons() {
        // Comprehensive buy button detection
        const buyButtonSelectors = [
            '.buy-btn', '.add-to-cart', '.btn-buy', '.button-buy',
            '.btn-primary', '.btn-success', '.product-btn', '.shop-btn',
            '[class*="buy"]', '[class*="mua"]', '[class*="them"]',
            '[class*="add"]:not(.add-filter)', 'button[onclick*="buy"]',
            'button[onclick*="mua"]', '.purchase-btn', '.order-btn'
        ];

        const buyButtons = document.querySelectorAll(buyButtonSelectors.join(','));

        // Also find by text content
        const allButtons = document.querySelectorAll('button, .button, [role="button"], .btn, a[href*="buy"], a[href*="mua"]');
        const textBasedButtons = Array.from(allButtons).filter(btn => {
            const text = btn.textContent.toLowerCase().trim();
            const buyKeywords = ['mua', 'buy', 'thêm', 'add', 'cart', 'đặt', 'order', 'purchase'];
            const excludeKeywords = ['xem', 'view', 'chi tiết', 'detail', 'tất cả', 'all'];

            const hasBuyKeyword = buyKeywords.some(keyword => text.includes(keyword));
            const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
            const isNotCartIcon = !btn.closest('.inner-cart');

            return hasBuyKeyword && !hasExcludeKeyword && isNotCartIcon;
        });

        const allBuyButtons = [...new Set([...buyButtons, ...textBasedButtons])];

        allBuyButtons.forEach(btn => {
            if (!btn.hasAttribute('data-cart-enhanced')) {
                btn.setAttribute('data-cart-enhanced', 'true');
                this.enhanceBuyButton(btn);
            }
        });

        console.log(`🔗 Enhanced ${allBuyButtons.length} buy buttons`);

        // Auto-detect new buttons periodically
        this.startBuyButtonDetection();
    },

    enhanceBuyButton(button) {
        // Fix button links
        if (button.tagName === 'A') {
            const href = button.getAttribute('href');
            if (href && href.includes('../Triox-main/')) {
                const fixedHref = href.replace('../Triox-main/', '');
                button.setAttribute('href', fixedHref);
            }
        }

        // Extract product information if available
        const productInfo = this.extractProductInfo(button);

        // Add click handler
        button.addEventListener('click', (e) => {
            if (button.tagName === 'A') {
                e.preventDefault();
            }

            // Determine quantity (could be from data attribute or input)
            const quantity = this.getQuantityForButton(button);

            // Add to cart with product info
            this.addToCart(quantity, true, productInfo);

            // Visual feedback
            this.showButtonFeedback(button);
        });

        // Add hover effects
        this.addButtonHoverEffects(button);

        console.log(`✅ Enhanced buy button: "${button.textContent.trim()}"`);
    },

    extractProductInfo(button) {
        const productContainer = button.closest('.product-item, .course-item, .item, .card');
        if (!productContainer) return null;

        // Fixed: Removed incorrect quote in querySelector
        const titleEl = productContainer.querySelector('.inner-title, .title, .course-title, .product-title, h3, h4');
        const priceEl = productContainer.querySelector('.price, .cost, .amount, [class*="price"]');
        const imageEl = productContainer.querySelector('img');

        return {
            id: Utils.generateId(),
            title: titleEl ? titleEl.textContent.trim() : 'Unknown Product',
            price: priceEl ? Utils.parsePrice(priceEl.textContent) : 0,
            image: imageEl ? imageEl.src : null,
            timestamp: Date.now()
        };
    },

    getQuantityForButton(button) {
        // Check for quantity input near the button
        const container = button.closest('.product-item, .course-item, .item');
        if (container) {
            const quantityInput = container.querySelector('input[type="number"], .quantity-input, [name*="quantity"]');
            if (quantityInput) {
                return parseInt(quantityInput.value) || 1;
            }
        }

        // Check data attribute
        const dataQuantity = button.getAttribute('data-quantity');
        if (dataQuantity) {
            return parseInt(dataQuantity) || 1;
        }

        return 1;
    },

    showButtonFeedback(button) {
        const originalText = button.textContent;
        const originalBg = button.style.background;

        // Change button appearance temporarily
        button.style.background = '#28a745';
        button.style.transition = 'all 0.3s ease';
        button.textContent = '✓ Đã thêm!';
        button.disabled = true;

        // Reset after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
            button.disabled = false;
        }, 2000);
    },

    addButtonHoverEffects(button) {
        const originalTransform = button.style.transform;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
            button.style.transition = 'transform 0.2s ease';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = originalTransform;
        });
    },

    // Fixed: Complete method implementation
    startBuyButtonDetection() {
        // Periodically scan for new buy buttons
        setInterval(() => {
            this.setupBuyButtons();
        }, 5000);

        // Also scan when DOM changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(Utils.debounce(() => {
                this.setupBuyButtons();
            }, 1000));

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    },

    // Public API methods
    addToCart(quantity = 1, showNotification = true, productInfo = null) {
        quantity = Math.max(1, parseInt(quantity) || 1);

        AppState.cart.count += quantity;

        // Add product info to cart items
        if (productInfo) {
            for (let i = 0; i < quantity; i++) {
                AppState.cart.items.push({
                    ...productInfo,
                    cartId: Utils.generateId()
                });
            }
        }

        this.updateCartDisplay();

        if (showNotification && typeof NotificationManager !== 'undefined') {
            NotificationManager.show(
                `Đã thêm ${quantity} sản phẩm vào giỏ hàng! (Tổng: ${AppState.cart.count})`,
                'success'
            );
        }

        // Emit cart update event
        this.emitCartEvent('itemAdded', { quantity, productInfo, newTotal: AppState.cart.count });

        console.log(`➕ Added ${quantity} items to cart. Total: ${AppState.cart.count}`);
        return AppState.cart.count;
    },

    removeFromCart(quantity = 1, productId = null) {
        quantity = Math.max(1, parseInt(quantity) || 1);

        if (productId) {
            // Remove specific product
            const itemIndex = AppState.cart.items.findIndex(item => item.id === productId || item.cartId === productId);
            if (itemIndex !== -1) {
                AppState.cart.items.splice(itemIndex, 1);
                AppState.cart.count = Math.max(0, AppState.cart.count - 1);
            }
        } else {
            // Remove quantity from total
            AppState.cart.count = Math.max(0, AppState.cart.count - quantity);
            // Remove items from end of array
            AppState.cart.items.splice(-quantity, quantity);
        }

        this.updateCartDisplay();
        this.emitCartEvent('itemRemoved', { quantity, productId, newTotal: AppState.cart.count });

        console.log(`➖ Removed ${quantity} items from cart. Total: ${AppState.cart.count}`);
        return AppState.cart.count;
    },

    resetCart() {
        const oldCount = AppState.cart.count;
        AppState.cart.count = 0;
        AppState.cart.items = [];

        this.updateCartDisplay();
        this.emitCartEvent('cartReset', { oldCount, newTotal: 0 });

        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.show('Giỏ hàng đã được làm mới!', 'info');
        }

        console.log('🔄 Cart reset to 0');
        return 0;
    },

    getCartItems() {
        return [...AppState.cart.items];
    },

    getCartTotal() {
        return AppState.cart.items.reduce((total, item) => total + (item.price || 0), 0);
    },

    // Fixed: Added missing saveCartState method
    saveCartState() {
        Utils.storage.set('cartState', {
            count: AppState.cart.count,
            items: AppState.cart.items,
            lastUpdated: Date.now()
        });
    },

    setupCartPersistence() {
        // Save cart state on page unload
        window.addEventListener('beforeunload', () => {
            this.saveCartState();
        });

        // Handle successful checkout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('order') === 'complete' ||
            urlParams.get('checkout') === 'success') {
            setTimeout(() => {
                this.resetCart();
            }, 1000);
        }
    },

    emitCartEvent(eventType, data) {
        const event = new CustomEvent('cartUpdated', {
            detail: {
                type: eventType,
                data: data,
                timestamp: Date.now(),
                cartState: {
                    count: AppState.cart.count,
                    items: AppState.cart.items
                }
            }
        });

        document.dispatchEvent(event);
    },

    // Debug methods
    debugCart() {
        console.log('\n=== 🔍 ENHANCED CART DEBUG ===');
        console.log('Cart State:', AppState.cart);
        console.log('Cart Element:', AppState.cart.element);
        console.log('Cart Text:', AppState.cart.element ? AppState.cart.element.textContent : 'N/A');
        console.log('Storage:', Utils.storage.get('cartState'));
        console.log('Total Value:', this.getCartTotal());
        console.log('Items:', this.getCartItems());

        return {
            state: AppState.cart,
            element: AppState.cart.element,
            storage: Utils.storage.get('cartState'),
            total: this.getCartTotal(),
            items: this.getCartItems()
        };
    }
};

// Enhanced Notification System
const NotificationManager = {
    container: null,
    notifications: new Map(),
    maxNotifications: 5,

    init() {
        this.createContainer();
        this.setupStyles();
        console.log('📢 Notification system initialized');
    },

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            max-width: 350px;
        `;
        document.body.appendChild(this.container);
    },

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                margin-bottom: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                transform: translateX(400px);
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                pointer-events: auto;
                border-left: 4px solid #007bff;
                position: relative;
                overflow: hidden;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left-color: #28a745;
            }
            
            .notification.error {
                border-left-color: #dc3545;
            }
            
            .notification.warning {
                border-left-color: #ffc107;
            }
            
            .notification.info {
                border-left-color: #17a2b8;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .notification-text {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
                color: #333;
            }
            
            .notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                font-size: 18px;
                color: #999;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
            }
            
            .notification-close:hover {
                color: #333;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0,0,0,0.1);
                transform-origin: left;
                transition: transform linear;
            }
            
            .notification.success .notification-progress {
                background: #28a745;
            }
            
            .notification.error .notification-progress {
                background: #dc3545;
            }
            
            .notification.warning .notification-progress {
                background: #ffc107;
            }
            
            .notification.info .notification-progress {
                background: #17a2b8;
            }
            
            @keyframes shrink {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }
        `;
        document.head.appendChild(style);
    },

    show(message, type = 'info', duration = 4000, options = {}) {
        const id = Utils.generateId();
        const notification = this.createNotification(id, message, type, duration, options);

        // Remove oldest notification if we have too many
        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId);
        }

        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    },

    createNotification(id, message, type, duration, options) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <div class="notification-text">${message}</div>
            </div>
            <button class="notification-close" onclick="NotificationManager.remove('${id}')">&times;</button>
            ${duration > 0 ? `<div class="notification-progress" style="animation: shrink ${duration}ms linear forwards;"></div>` : ''}
        `;

        // Add click handler if specified
        if (options.onClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', options.onClick);
        }

        return notification;
    },

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 400);
    },

    clear() {
        this.notifications.forEach((_, id) => {
            this.remove(id);
        });
    }
};

// Enhanced Link Fixer System
const LinkFixerManager = {
    init() {
        console.log('🔗 Initializing Enhanced Link Fixer System...');

        // Fix all existing links immediately
        this.fixAllLinks();

        // Setup observer for dynamically added links
        this.setupLinkObserver();

        // Fix links periodically
        this.startPeriodicFix();

        console.log('✅ Enhanced link fixer system initialized');
    },

    fixAllLinks() {
        // Fix all links with Triox-main paths
        const allLinks = document.querySelectorAll('a[href*="Triox-main"], a[href*="/Triox-main"]');
        let fixedCount = 0;

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                // Remove various forms of Triox-main paths
                const fixedHref = href
                    .replace(/^\.\.\/Triox-main\//, '')
                    .replace(/^\/Triox-main\//, '')
                    .replace(/^Triox-main\//, '')
                    .replace(/^\.\/Triox-main\//, '');

                if (fixedHref !== href) {
                    link.setAttribute('href', fixedHref);
                    console.log(`Fixed link: ${href} → ${fixedHref}`);
                    fixedCount++;
                }
            }
        });

        // Fix form actions
        const forms = document.querySelectorAll('form[action*="Triox-main"]');
        forms.forEach(form => {
            const action = form.getAttribute('action');
            if (action) {
                const fixedAction = action
                    .replace(/^\.\.\/Triox-main\//, '')
                    .replace(/^\/Triox-main\//, '')
                    .replace(/^Triox-main\//, '');

                if (fixedAction !== action) {
                    form.setAttribute('action', fixedAction);
                    console.log(`Fixed form action: ${action} → ${fixedAction}`);
                    fixedCount++;
                }
            }
        });

        // Fix image sources
        const images = document.querySelectorAll('img[src*="Triox-main"]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                const fixedSrc = src
                    .replace(/^\.\.\/Triox-main\//, '')
                    .replace(/^\/Triox-main\//, '')
                    .replace(/^Triox-main\//, '');

                if (fixedSrc !== src) {
                    img.setAttribute('src', fixedSrc);
                    console.log(`Fixed image src: ${src} → ${fixedSrc}`);
                    fixedCount++;
                }
            }
        });

        console.log(`🔧 Fixed ${fixedCount} links/paths total`);
        return fixedCount;
    },

    setupLinkObserver() {
        if (!window.MutationObserver) return;

        const observer = new MutationObserver(Utils.debounce(() => {
            this.fixAllLinks();
        }, 500));

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href', 'src', 'action']
        });

        console.log('👀 Link observer setup complete');
    },

    startPeriodicFix() {
        // Fix links every 3 seconds to catch any missed ones
        setInterval(() => {
            this.fixAllLinks();
        }, 3000);

        console.log('⏰ Periodic link fixing started');
    },

    // Manual fix method for external use
    fixLinksNow() {
        return this.fixAllLinks();
    }
};

// Initialize all systems when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initializing Enhanced Course Management System...');

    try {
        // Initialize core systems
        LinkFixerManager.init(); // Add link fixer first
        NotificationManager.init();
        CourseRotationManager.init();
        CartManager.init();
        PriceSortingManager.init(); // Add price sorting system
        PaginationManager.init(); // Add pagination system

        console.log('✅ All systems initialized successfully!');

        // Show success notification
        setTimeout(() => {
            NotificationManager.show('Hệ thống đã được khởi tạo thành công!', 'success', 3000);
        }, 1000);

    } catch (error) {
        console.error('❌ Error initializing systems:', error);

        // Show error notification if NotificationManager is available
        if (typeof NotificationManager !== 'undefined' && NotificationManager.show) {
            NotificationManager.show('Có lỗi xảy ra khi khởi tạo hệ thống!', 'error', 5000);
        }
    }
});

// Global error handler
window.addEventListener('error', function (event) {
    console.error('Global error:', event.error);

    if (typeof NotificationManager !== 'undefined' && NotificationManager.show) {
        NotificationManager.show('Đã xảy ra lỗi không mong muốn!', 'error', 3000);
    }
});

// Enhanced Price Sorting System
const PriceSortingManager = {
    currentSort: 'none', // 'none', 'asc', 'desc'

    init() {
        console.log('💰 Initializing Enhanced Price Sorting System...');

        // Setup price sorting buttons
        this.setupSortButtons();

        console.log('✅ Enhanced price sorting system initialized');
    },

    setupSortButtons() {
        // Wait for DOM to be ready, then find existing buttons
        setTimeout(() => {
            console.log('🔍 Looking for existing sort buttons in .inner-info-2...');

            // Find existing buttons in inner-info-2
            this.findExistingButtons();

            // Setup event listeners with delay
            setTimeout(() => {
                this.attachSortListeners();
            }, 100);
        }, 1000);
    },

    findExistingButtons() {
        // Look for existing buttons in .inner-info-2
        const innerInfo2 = document.querySelector('.inner-info-2');

        if (innerInfo2) {
            console.log('✅ Found .inner-info-2 container:', innerInfo2);

            // Find all buttons in this container
            const buttons = innerInfo2.querySelectorAll('button, .btn, [role="button"], a');
            console.log('🔍 Found buttons in .inner-info-2:', buttons);

            // Look for buttons that might be price sorting buttons
            buttons.forEach((btn, index) => {
                const text = btn.textContent.toLowerCase().trim();
                console.log(`Button ${index}: "${text}"`);

                // Check if this looks like a price sorting button
                if (text.includes('tăng') || text.includes('asc') || text.includes('up') ||
                    text.includes('giảm') || text.includes('desc') || text.includes('down') ||
                    text.includes('giá') || text.includes('price')) {

                    // Assign IDs based on content
                    if ((text.includes('tăng') || text.includes('asc') || text.includes('up')) &&
                        (text.includes('giá') || text.includes('price'))) {
                        btn.id = 'sort-price-asc';
                        btn.setAttribute('data-sort', 'asc');
                        console.log('🔼 Assigned ascending sort to button:', btn);
                    } else if ((text.includes('giảm') || text.includes('desc') || text.includes('down')) &&
                        (text.includes('giá') || text.includes('price'))) {
                        btn.id = 'sort-price-desc';
                        btn.setAttribute('data-sort', 'desc');
                        console.log('🔽 Assigned descending sort to button:', btn);
                    }
                }
            });

            // If no specific buttons found, try to use any buttons in the container
            if (!document.getElementById('sort-price-asc') && !document.getElementById('sort-price-desc')) {
                console.log('⚠️ No specific price sort buttons found, using first two buttons');

                if (buttons.length >= 2) {
                    buttons[0].id = 'sort-price-asc';
                    buttons[0].setAttribute('data-sort', 'asc');
                    buttons[1].id = 'sort-price-desc';
                    buttons[1].setAttribute('data-sort', 'desc');

                    console.log('🔼 First button assigned as ascending:', buttons[0]);
                    console.log('🔽 Second button assigned as descending:', buttons[1]);
                }
            }

        } else {
            console.warn('❌ Could not find .inner-info-2 container');
        }
    },

    addSortButtonStyles() {
        // Check if styles already exist
        if (document.getElementById('price-sort-styles')) return;

        const style = document.createElement('style');
        style.id = 'price-sort-styles';
        style.textContent = `
            .price-sort-btn {
                background: #007bff !important;
                color: white !important;
                border: 2px solid #007bff !important;
                padding: 12px 24px !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-size: 16px !important;
                font-weight: bold !important;
                transition: all 0.3s ease !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
                text-decoration: none !important;
                user-select: none !important;
                min-width: 150px !important;
                justify-content: center !important;
            }
            
            .price-sort-btn:hover {
                background: #0056b3 !important;
                border-color: #0056b3 !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            }
            
            .price-sort-btn:active {
                transform: translateY(0) !important;
            }
            
            .price-sort-btn:disabled {
                background: #28a745 !important;
                border-color: #28a745 !important;
                cursor: not-allowed !important;
                transform: none !important;
                opacity: 1 !important;
            }
            
            .price-sort-btn:disabled:hover {
                background: #28a745 !important;
                border-color: #28a745 !important;
                transform: none !important;
                box-shadow: none !important;
            }
            
            .price-sort-container {
                z-index: 1000 !important;
                position: relative !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Price sort styles added');
    },

    attachSortListeners() {
        const ascBtn = document.getElementById('sort-price-asc');
        const descBtn = document.getElementById('sort-price-desc');

        console.log('🔗 Attaching listeners to existing buttons:', { ascBtn, descBtn });

        if (ascBtn) {
            ascBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔼 Ascending button clicked!');
                this.sortByPrice('asc');
            });

            // Also add onclick as backup
            ascBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔼 Ascending button onclick!');
                this.sortByPrice('asc');
                return false;
            };

            // Make sure button is clickable
            ascBtn.style.cursor = 'pointer';
            ascBtn.style.pointerEvents = 'auto';

            console.log('✅ Ascending button listener attached to existing button');
        } else {
            console.warn('❌ Ascending button not found in .inner-info-2');
        }

        if (descBtn) {
            descBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔽 Descending button clicked!');
                this.sortByPrice('desc');
            });

            // Also add onclick as backup
            descBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔽 Descending button onclick!');
                this.sortByPrice('desc');
                return false;
            };

            // Make sure button is clickable
            descBtn.style.cursor = 'pointer';
            descBtn.style.pointerEvents = 'auto';

            console.log('✅ Descending button listener attached');
        } else {
            console.warn('❌ Descending button not found');
        }
    },

    sortByPrice(direction) {
        console.log(`💰 Sorting prices: ${direction}`);

        // Find all course/product items
        const containers = document.querySelectorAll('.inner-list, .course-list, .product-list');

        containers.forEach(container => {
            const items = Array.from(container.querySelectorAll('.product-item, .course-item, .inner-item'));

            if (items.length === 0) return;

            // Extract price and sort
            const itemsWithPrices = items.map(item => {
                const priceEl = item.querySelector('.price, .cost, .amount, [class*="price"]');
                const priceText = priceEl ? priceEl.textContent : '0';
                const price = Utils.parsePrice(priceText);

                return {
                    element: item,
                    price: price,
                    originalPrice: priceText
                };
            });

            // Sort based on direction
            itemsWithPrices.sort((a, b) => {
                if (direction === 'asc') {
                    return a.price - b.price;
                } else {
                    return b.price - a.price;
                }
            });

            // Clear container and re-add sorted items
            container.innerHTML = '';
            itemsWithPrices.forEach(item => {
                container.appendChild(item.element);
            });

            console.log(`✅ Sorted ${items.length} items by price ${direction}`);
        });

        // Update button states
        this.updateButtonStates(direction);

        // Update current sort state
        this.currentSort = direction;

        // Show notification
        const message = direction === 'asc' ?
            'Đã sắp xếp theo giá tăng dần!' :
            'Đã sắp xếp theo giá giảm dần!';

        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.show(message, 'success', 2000);
        }

        // Emit sort event
        this.emitSortEvent(direction);
    },

    updateButtonStates(activeDirection) {
        const ascBtn = document.getElementById('sort-price-asc');
        const descBtn = document.getElementById('sort-price-desc');

        if (ascBtn && descBtn) {
            if (activeDirection === 'asc') {
                // Disable ascending button, enable descending
                ascBtn.disabled = true;
                ascBtn.textContent = '✓ Giá tăng dần';
                descBtn.disabled = false;
                descBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Giá giảm dần';
            } else if (activeDirection === 'desc') {
                // Disable descending button, enable ascending  
                descBtn.disabled = true;
                descBtn.textContent = '✓ Giá giảm dần';
                ascBtn.disabled = false;
                ascBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i> Giá tăng dần';
            }
        }
    },

    emitSortEvent(direction) {
        const event = new CustomEvent('priceSort', {
            detail: {
                direction: direction,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    },

    // Public methods
    resetSort() {
        this.currentSort = 'none';

        const ascBtn = document.getElementById('sort-price-asc');
        const descBtn = document.getElementById('sort-price-desc');

        if (ascBtn && descBtn) {
            ascBtn.disabled = false;
            ascBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i> Giá tăng dần';
            descBtn.disabled = false;
            descBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Giá giảm dần';
        }

        console.log('🔄 Price sort reset');
    },

    getCurrentSort() {
        return this.currentSort;
    }
};

// Enhanced Pagination System
const PaginationManager = {
    currentPage: 1,
    itemsPerPage: 12, // Default items per page
    totalItems: 0,
    totalPages: 0,
    allItems: [],

    init() {
        console.log('📄 Initializing Enhanced Pagination System...');

        // Setup pagination
        this.setupPagination();

        console.log('✅ Enhanced pagination system initialized');
    },

    setupPagination() {
        setTimeout(() => {
            console.log('🔍 Setting up pagination...');

            // Find pagination buttons and items
            this.findPaginationElements();

            // Setup event listeners
            this.attachPaginationListeners();

            // Initialize first page
            this.showPage(1);

        }, 1000);
    },

    findPaginationElements() {
        // Find pagination container (usually near .inner-info-2)
        const paginationContainer = document.querySelector('.inner-info-2, .pagination, .page-numbers, .pager');

        if (paginationContainer) {
            console.log('✅ Found pagination container:', paginationContainer);

            // Find all pagination buttons
            const pageButtons = paginationContainer.querySelectorAll('button, .btn, a, [role="button"]');
            console.log('🔍 Found pagination buttons:', pageButtons);

            // Assign page numbers to buttons
            pageButtons.forEach((btn, index) => {
                const text = btn.textContent.trim();
                const pageNum = parseInt(text);

                if (!isNaN(pageNum) && pageNum > 0) {
                    btn.setAttribute('data-page', pageNum);
                    btn.id = `page-btn-${pageNum}`;
                    console.log(`📄 Assigned page ${pageNum} to button:`, btn);
                } else if (text.toLowerCase().includes('next') || text.includes('›') || text.includes('→')) {
                    btn.setAttribute('data-page', 'next');
                    btn.id = 'page-btn-next';
                } else if (text.toLowerCase().includes('prev') || text.includes('‹') || text.includes('←')) {
                    btn.setAttribute('data-page', 'prev');
                    btn.id = 'page-btn-prev';
                }
            });
        }

        // Find all items to paginate
        this.findItemsToPaginate();
    },

    findItemsToPaginate() {
        // Find items in course/product containers
        const containers = document.querySelectorAll('.inner-list, .course-list, .product-list, .section-4');

        containers.forEach(container => {
            const items = container.querySelectorAll('.product-item, .course-item, .inner-item, .item');
            if (items.length > 0) {
                this.allItems = Array.from(items);
                this.totalItems = this.allItems.length;
                this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

                console.log(`📊 Found ${this.totalItems} items, ${this.totalPages} pages`);
                return;
            }
        });
    },

    attachPaginationListeners() {
        // Find all page buttons
        const pageButtons = document.querySelectorAll('[data-page]');

        pageButtons.forEach(btn => {
            const pageData = btn.getAttribute('data-page');

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log(`📄 Page button clicked: ${pageData}`);

                if (pageData === 'next') {
                    this.nextPage();
                } else if (pageData === 'prev') {
                    this.prevPage();
                } else {
                    const pageNum = parseInt(pageData);
                    if (!isNaN(pageNum)) {
                        this.showPage(pageNum);
                    }
                }
            });

            // Also add onclick as backup
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (pageData === 'next') {
                    this.nextPage();
                } else if (pageData === 'prev') {
                    this.prevPage();
                } else {
                    const pageNum = parseInt(pageData);
                    if (!isNaN(pageNum)) {
                        this.showPage(pageNum);
                    }
                }
                return false;
            };

            // Make sure button is clickable
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';

            console.log(`✅ Attached listener to page button: ${pageData}`);
        });
    },

    showPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || this.allItems.length === 0) {
            console.warn(`❌ Invalid page number: ${pageNum}`);
            return;
        }

        console.log(`📄 Showing page ${pageNum} of ${this.totalPages}`);

        // Calculate item range for this page
        const startIndex = (pageNum - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);

        // Hide all items first
        this.allItems.forEach(item => {
            item.style.display = 'none';
        });

        // Show items for current page
        for (let i = startIndex; i < endIndex; i++) {
            if (this.allItems[i]) {
                this.allItems[i].style.display = '';
            }
        }

        // Update current page
        this.currentPage = pageNum;

        // Update button states
        this.updatePaginationButtons();

        // Show notification
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.show(`Đang xem trang ${pageNum}/${this.totalPages}`, 'info', 1500);
        }

        // Scroll to top of content
        const container = document.querySelector('.inner-list, .course-list, .product-list');
        if (container) {
            Utils.smoothScrollTo(container, 100);
        }

        // Emit pagination event
        this.emitPaginationEvent(pageNum);
    },

    updatePaginationButtons() {
        // Remove active class from all buttons
        const allPageButtons = document.querySelectorAll('[data-page]');
        allPageButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.disabled = false;
        });

        // Add active class to current page button
        const currentPageBtn = document.getElementById(`page-btn-${this.currentPage}`);
        if (currentPageBtn) {
            currentPageBtn.classList.add('active');
            currentPageBtn.disabled = true;
        }

        // Disable prev button on first page
        const prevBtn = document.getElementById('page-btn-prev');
        if (prevBtn && this.currentPage === 1) {
            prevBtn.disabled = true;
        }

        // Disable next button on last page
        const nextBtn = document.getElementById('page-btn-next');
        if (nextBtn && this.currentPage === this.totalPages) {
            nextBtn.disabled = true;
        }
    },

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.showPage(this.currentPage + 1);
        }
    },

    prevPage() {
        if (this.currentPage > 1) {
            this.showPage(this.currentPage - 1);
        }
    },

    emitPaginationEvent(pageNum) {
        const event = new CustomEvent('pageChanged', {
            detail: {
                currentPage: pageNum,
                totalPages: this.totalPages,
                itemsPerPage: this.itemsPerPage,
                totalItems: this.totalItems,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    },

    // Public methods
    goToPage(pageNum) {
        this.showPage(pageNum);
    },

    setItemsPerPage(count) {
        this.itemsPerPage = count;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.showPage(1); // Reset to first page
    },

    getCurrentPage() {
        return this.currentPage;
    },

    getTotalPages() {
        return this.totalPages;
    }
};

// Export for global access
window.AppState = AppState;
window.Utils = Utils;
window.CourseRotationManager = CourseRotationManager;
window.CartManager = CartManager;
window.NotificationManager = NotificationManager;
window.LinkFixerManager = LinkFixerManager;
window.PriceSortingManager = PriceSortingManager;
window.PaginationManager = PaginationManager;