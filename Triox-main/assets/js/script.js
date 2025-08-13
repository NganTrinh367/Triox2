document.addEventListener('DOMContentLoaded', function() {
    
    // Xử lý active class cho menu
    const menuLinks = document.querySelectorAll('.header .inner-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Cart system - SIÊU ĐỂN GIẢN
    let cartCount = 0;
    
    // Tìm cart element bằng nhiều cách
    function findCartElement() {
        const selectors = [
            '.header .inner-cart span',
            '.inner-cart span',
            '.header .inner-cart',
            '.inner-cart',
            '[class*="cart"] span'
        ];
        
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                console.log(`✓ Found cart element: ${selector}`, el);
                return el;
            }
        }
        
        console.log('❌ No cart element found');
        return null;
    }

    const cartElement = findCartElement();

    // Update cart count - CHỈ 1 CÁCH DUY NHẤT
    function updateCartCount(newCount) {
        cartCount = Math.max(0, parseInt(newCount) || 0);
        
        console.log(`🛒 Updating cart to: ${cartCount}`);
        
        if (cartElement) {
            // Chỉ thay đổi TEXT, không động gì đến HTML structure
            const originalText = cartElement.textContent;
            const newText = originalText.replace(/\d+/g, cartCount);
            
            // Nếu không có số nào, thêm số vào
            if (!/\d/.test(originalText)) {
                cartElement.textContent = originalText + ' ' + cartCount;
            } else {
                cartElement.textContent = newText;
            }
            
            console.log(`✓ Cart updated: "${originalText}" → "${cartElement.textContent}"`);
        } else {
            console.log('❌ Cart element not found for update');
        }
        
        // Lưu localStorage
        localStorage.setItem('cartCount', cartCount.toString());
    }

    // Khởi tạo
    function initCart() {
        let initial = 0;
        
        try {
            const stored = localStorage.getItem('cartCount');
            if (stored) initial = parseInt(stored, 10) || 0;
        } catch (e) {}
        
        console.log(`🎯 Initializing cart with: ${initial}`);
        updateCartCount(initial);
    }

    // Chờ 500ms để đảm bảo DOM ready
    setTimeout(initCart, 500);

    // ===== PUBLIC FUNCTIONS =====
    
    // Thêm sản phẩm
    window.addToCart = function(quantity = 1) {
        quantity = parseInt(quantity) || 1;
        const newCount = cartCount + quantity;
        
        console.log(`➕ Adding ${quantity} items: ${cartCount} → ${newCount}`);
        updateCartCount(newCount);
        
        showNotification(`Đã thêm ${quantity} sản phẩm! (Tổng: ${newCount})`);
        return newCount;
    };

    // Reset giỏ hàng  
    window.resetCartCount = function() {
        console.log('🔄 Resetting cart to 0');
        updateCartCount(0);
        showNotification('Giỏ hàng đã được làm mới!');
        return 0;
    };

    // Debug function
    window.debugCart = function() {
        console.log('\n=== 🔍 CART DEBUG ===');
        console.log('Current cartCount:', cartCount);
        console.log('Cart element:', cartElement);
        console.log('Cart text:', cartElement ? cartElement.textContent : 'N/A');
        console.log('LocalStorage:', localStorage.getItem('cartCount'));
        
        // List all cart-like elements
        console.log('\n📋 All cart-like elements:');
        const allCarts = document.querySelectorAll('[class*="cart"], [id*="cart"]');
        allCarts.forEach((el, i) => {
            console.log(`${i + 1}:`, el.className, el.textContent);
        });
        
        return {
            count: cartCount,
            element: cartElement,
            storage: localStorage.getItem('cartCount')
        };
    };

    // Notification system
    function showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            font-size: 14px;
            font-weight: bold;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ===== EVENT HANDLERS =====

    // Cart click - CLICK = ADD, SHIFT+CLICK = RESET
    const cartLink = document.querySelector('.header .inner-cart');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // SHIFT + Click = Reset cart
            // Normal Click = Add to cart
            if (e.shiftKey) {
                console.log('🔄 SHIFT+Click detected - Resetting cart!');
                resetCartCount();
            } else {
                console.log('🛒 Adding item to cart via click!');
                addToCart(1);
            }
        });
    }

    // Auto-detect buy buttons - MỞ RỘNG TÌM KIẾM
    function attachBuyButtons() {
        // Tìm theo class và attribute
        const buyButtons = document.querySelectorAll(`
            .buy-btn,
            .add-to-cart,
            [class*="buy"],
            [class*="mua"],
            [class*="them"],
            [class*="add"],
            [class*="cart"]:not(.inner-cart),
            button[onclick*="buy"],
            button[onclick*="mua"],
            .btn-buy,
            .button-buy,
            .btn-primary,
            .btn-success,
            .product-btn,
            .shop-btn
        `);
        
        // Tìm tất cả buttons và filter theo text
        const allButtons = document.querySelectorAll('button, .button, [role="button"], .btn, a[href*="buy"], a[href*="mua"]');
        const textBuyButtons = Array.from(allButtons).filter(btn => {
            const text = btn.textContent.toLowerCase().trim();
            const hasKeyword = text.includes('mua') || 
                              text.includes('buy') || 
                              text.includes('thêm') || 
                              text.includes('add') ||
                              text.includes('cart') ||
                              text.includes('đặt') ||
                              text.includes('order');
            
            const notCartIcon = !btn.closest('.inner-cart');
            
            if (hasKeyword && notCartIcon) {
                console.log(`🎯 Found potential buy button: "${text}"`, btn);
            }
            
            return hasKeyword && notCartIcon;
        });

        const allBuyButtons = [...buyButtons, ...textBuyButtons];
        
        allBuyButtons.forEach(btn => {
            if (!btn.hasAttribute('data-cart-attached')) {
                btn.setAttribute('data-cart-attached', 'true');
                btn.addEventListener('click', function(e) {
                    console.log('🛒 Buy button clicked:', btn.textContent.trim());
                    addToCart(1);
                });
                console.log(`✅ Attached event to: "${btn.textContent.trim()}"`);
            }
        });

        console.log(`🔗 Attached cart events to ${allBuyButtons.length} buy buttons`);
        
        // Nếu không tìm thấy button nào, hiển thị tất cả buttons để debug
        if (allBuyButtons.length === 0) {
            console.log('\n🚨 No buy buttons found! All buttons on page:');
            const allPageButtons = document.querySelectorAll('button, .button, .btn, [role="button"]');
            allPageButtons.forEach((btn, i) => {
                console.log(`${i + 1}. "${btn.textContent.trim()}" - class: ${btn.className}`);
            });
            console.log('\n💡 You can manually call addToCart(1) or use SHIFT+Click on cart icon');
        }
        
        return allBuyButtons.length;
    }

    // Attach buy buttons ngay và sau 2 giây
    setTimeout(attachBuyButtons, 100);
    setTimeout(attachBuyButtons, 2000);

    // Reset cart on successful checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('order') === 'complete' || 
        urlParams.get('checkout') === 'success') {
        setTimeout(() => {
            resetCartCount();
        }, 1000);
    }

    // ===== OTHER FEATURES =====

    // Mobile menu toggle
    const menuButton = document.querySelector('.header .inner-button-menu');
    const menu = document.querySelector('.header .inner-menu');
    
    if (menuButton && menu) {
        menuButton.addEventListener('click', function() {
            menu.classList.toggle('show');
        });
    }

    // Mobile submenu toggle
    const mobileArrows = document.querySelectorAll('.header .inner-menu > ul > li > span.material-symbols-outlined');
    mobileArrows.forEach(arrow => {
        arrow.style.cursor = 'pointer';
        arrow.addEventListener('click', function(e) {
            if (window.matchMedia('(max-width: 991.98px)').matches) {
                e.preventDefault();
                const submenu = this.parentNode.querySelector('.inner-sub');
                if (submenu) {
                    // Close other submenus
                    mobileArrows.forEach(otherArrow => {
                        const otherSubmenu = otherArrow.parentNode.querySelector('.inner-sub');
                        if (otherSubmenu && otherSubmenu !== submenu) {
                            otherSubmenu.style.maxHeight = '0px';
                        }
                    });
                    
                    // Toggle current submenu
                    const isOpen = submenu.style.maxHeight && submenu.style.maxHeight !== '0px';
                    submenu.style.maxHeight = isOpen ? '0px' : submenu.scrollHeight + 'px';
                }
            }
        });
    });

    // Search form
    const searchButton = document.querySelector('.section-1 .inner-button');
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const addressInput = document.querySelector('.inner-address .inner-input');
            const userInput = document.querySelector('.inner-user .inner-input');
            const calendarInput = document.querySelector('.inner-calendar .inner-input');
            
            const searchData = {
                address: addressInput?.value || '',
                users: userInput?.value || '',
                date: calendarInput?.value || ''
            };
            
            console.log('🔍 Search data:', searchData);
            alert(`Tìm kiếm: ${searchData.address || 'Chưa chọn địa điểm'}`);
        });
    }

    // Ready message
    console.log('\n🎉 Cart system ready!');
    console.log('💡 Test methods:');
    console.log('   1. Click cart icon - Add 1 item');
    console.log('   2. SHIFT + Click cart icon - Reset to 0');
    console.log('   3. addToCart(n) - Add n items');
    console.log('   4. resetCartCount() - Reset to 0');
    console.log('   5. debugCart() - Debug info');
    
    // Tự động test sau 3 giây
    setTimeout(() => {
        console.log('\n🧪 AUTO TEST: Adding 1 item...');
        addToCart(1);
    }, 3000);
});

document.addEventListener('DOMContentLoaded'), () => {
      const feedbackBtn = document.getElementById('feedbackBtn');
      const feedbackModal = document.getElementById('feedbackModal');
      const closeBtn = document.getElementById('closeBtn');
      const feedbackForm = document.getElementById('feedbackForm');
      const starRating = document.getElementById('starRating');
      const quickBtns = document.querySelectorAll('.quick-btn');
      const successMessage = document.getElementById('successMessage');

      let selectedRating = 0;
      let selectedQuickFeedback = [];

      // Open modal
      feedbackBtn.addEventListener('click', () => {
        feedbackModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });

      // Close modal
      const closeModal = () => {
        feedbackModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
      };

      closeBtn.addEventListener('click', closeModal);

      // Close when clicking outside
      feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
          closeModal();
        }
      });

      // Star rating
      const stars = document.querySelectorAll('.star');
      stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
          highlightStars(index + 1);
        });

        star.addEventListener('click', () => {
          selectedRating = index + 1;
          highlightStars(selectedRating);
        });
      });

      starRating.addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
      });

      function highlightStars(rating) {
        stars.forEach((star, index) => {
          if (index < rating) {
            star.classList.add('active');
          } else {
            star.classList.remove('active');
          }
        });
      }

      // Quick feedback buttons
      quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const feedback = btn.dataset.feedback;
          if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            selectedQuickFeedback = selectedQuickFeedback.filter(f => f !== feedback);
          } else {
            btn.classList.add('active');
            selectedQuickFeedback.push(feedback);
          }
        });
      });

      // Form submission
      feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
          rating: selectedRating,
          quickFeedback: selectedQuickFeedback,
          type: document.getElementById('feedbackType').value,
          name: document.getElementById('customerName').value.trim(),
          email: document.getElementById('customerEmail').value.trim(),
          message: document.getElementById('feedbackMessage').value.trim(),
          timestamp: new Date().toISOString()
        };

        // Basic validation
        if (!formData.message && selectedQuickFeedback.length === 0) {
          alert('Vui lòng nhập nội dung phản hồi hoặc chọn phản hồi nhanh!');
          return;
        }

        // Simulate sending data
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';

        setTimeout(() => {
          console.log('Feedback Data:', formData);
          
          // Hide form and show success message
          feedbackForm.style.display = 'none';
          successMessage.style.display = 'block';
          
          // Auto close after 3 seconds
          setTimeout(() => {
            closeModal();
          }, 3000);
        }, 1500);
      });

      // Reset form
      function resetForm() {
        feedbackForm.reset();
        feedbackForm.style.display = 'block';
        successMessage.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi Feedback';
        
        selectedRating = 0;
        selectedQuickFeedback = [];
        highlightStars(0);
        
        quickBtns.forEach(btn => btn.classList.remove('active'));
      }

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && feedbackModal.classList.contains('active')) {
          closeModal();
        }
      });

      console.log('Feedback system initialized');
    }

document.addEventListener('DOMContentLoaded'), () =>{
  const khoahoctructuyenBtn = document.getElementById('const khoahoctructuyen.Btn');
  const tienganhtoandienBtn = document.getElementById('tienganhtoandien.Btn');
  const laptrinhchonguoimoiBtn = document.getElementById('laptrinhchonguoimoiBtn');
  const laptrinhnangcaoBtn = document.getElementById('laptrinhchonguoimoiBtn');
  const luyenthithptquocgiaBtn = document.getElementById('luyenthithptquocgiaBtn');

  let openkhoahoctructuyen = 0; // Main
  let tienganhtoandien = 0;     // 1
  let laptrinhchonguoimoi = 0;  // 2
  let laptrinhnangcao = 0;      // 3
  let luyenthithptquocgia = 0;  // 4

  // Click option from main and 1 to 4


}

document.addEventListener('DOMContentLoaded', () => {
  const btnAsc = document.getElementById('sort-asc');
  const list = document.getElementById('product-list');

  // Lấy số từ chuỗi giá, hỗ trợ . , ₫ đ
  const parsePrice = (el) => {
    // Ưu tiên data-price nếu có
    if (el.dataset && el.dataset.price) {
      return Number(el.dataset.price);
    }
    // Nếu không có, đọc text từ .price hoặc chính nó
    const priceNode = el.querySelector?.('.price') || el;
    const raw = (priceNode?.textContent || '').trim();
    // Giữ lại số, dấu . , , và -
    // Chuẩn hóa: đổi dấu . hoặc , ngăn cách nghìn về trống, còn dấu thập phân giữ lại
    // B1: loại ký tự tiền tệ
    let s = raw.replace(/[^\d.,-]/g, '');
    // B2: nếu có cả . và , → giả định dấu thập phân là ký tự xuất hiện SAU CÙNG
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    const decSep = Math.max(lastComma, lastDot);
    if (decSep !== -1) {
      // tách phần thập phân và nguyên
      const intPart = s.slice(0, decSep).replace(/[.,]/g, '');
      const fracPart = s.slice(decSep + 1);
      s = `${intPart}.${fracPart}`;
    } else {
      s = s.replace(/[.,]/g, '');
    }
    return Number(s || 0);
  };

  btnAsc.addEventListener('click', () => {
    // Lấy các item (HTMLCollection -> Array)
    const items = Array.from(list.children);

    items.sort((a, b) => parsePrice(a) - parsePrice(b));

    // Gắn lại theo thứ tự mới
    const frag = document.createDocumentFragment();
    for (const item of items) frag.appendChild(item);
    list.appendChild(frag);
  });
});
