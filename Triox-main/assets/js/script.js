// JavaScript cho Triox Website

document.addEventListener('DOMContentLoaded', function() {
    
    // Xử lý active class cho menu
    const menuLinks = document.querySelectorAll('.header .inner-menu a');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Xóa active class khỏi tất cả links
            menuLinks.forEach(l => l.classList.remove('active'));
            // Thêm active class cho link được click
            this.classList.add('active');
        });
    });

    // Xử lý số lượng trong cart (giả lập)
    let cartCount = 1;
    const cartSpan = document.querySelector('.header .inner-cart span');
    const cartCountText = cartSpan.childNodes[2]; // Text node chứa số

    // Function để cập nhật cart count
    function updateCartCount(newCount) {
        cartCount = newCount;
        cartCountText.textContent = cartCount;
    }

    // Giả lập thêm item vào cart khi click vào cart
    document.querySelector('.header .inner-cart').addEventListener('click', function(e) {
        e.preventDefault();
        updateCartCount(cartCount + 1);
    });

    // Xử lý mobile menu toggle
    const menuButton = document.querySelector('.header .inner-button-menu');
    const menu = document.querySelector('.header .inner-menu');
    
    if (menuButton && menu) {
        menuButton.addEventListener('click', function() {
            menu.classList.toggle('show');
        });
    }

    // Xử lý dropdown cho các input trong section-1
    const dropdownInputs = document.querySelectorAll('.section-1 .inner-input');
    
    dropdownInputs.forEach(input => {
        const dropdown = input.parentElement.querySelector('.inner-down');
        
        if (dropdown) {
            dropdown.addEventListener('click', function() {
                // Giả lập dropdown functionality
                console.log('Dropdown clicked for:', input.placeholder);
                // Có thể thêm logic dropdown thực tế ở đây
            });
        }
    });

    // Xử lý form search
    const searchButton = document.querySelector('.section-1 .inner-button');
    
    if (searchButton) { 
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const addressInput = document.querySelector('.inner-address .inner-input');
            const userInput = document.querySelector('.inner-user .inner-input');
            const calendarInput = document.querySelector('.inner-calendar .inner-input');
            
            // Lấy giá trị từ các input
            const searchData = {
                address: addressInput.value,
                users: userInput.value,
                date: calendarInput.value
            };
            
            console.log('Tìm kiếm với dữ liệu:', searchData);
            
            // Hiển thị thông báo tạm thời
            alert(`Tìm kiếm: ${searchData.address || 'Chưa chọn địa điểm'}`);
        });
    }
});