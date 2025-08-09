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


// Ngân JS 
// Mảng dữ liệu khóa học
  const courses = [
    {
      title: "Khóa Học HTML CSS Cơ Bản",
      img: "assets/images/product-1.png",
      discount: "-30%",
      oldPrice: "2.000.000",
      newPrice: "1.200.000",
      lessons: 30,
      exercises: "300 bài",
      year: 2025,
      bought: "500+",
      stock: 10
    },
    {
      title: "Khóa Học JavaScript Nâng Cao",
      img: "assets/images/product-2.png",
      discount: "-40%",
      oldPrice: "3.000.000",
      newPrice: "1.800.000",
      lessons: 40,
      exercises: "450 bài",
      year: 2025,
      bought: "800+",
      stock: 7
    },
    {
      title: "Khóa Học ReactJS",
      img: "assets/images/product-3.png",
      discount: "-50%",
      oldPrice: "4.000.000",
      newPrice: "2.500.000",
      lessons: 50,
      exercises: "500 bài",
      year: 2025,
      bought: "1000+",
      stock: 5
    },
  ];
  const list = document.querySelector(".section-2 .inner-list");

  let html = "";
  courses.forEach(course => {
    html += `
      <div class="product-item">
        <div class="inner-image">
          <a href="#">
            <img src="${course.img}" alt="${course.title}">
          </a>
        </div>
        <div class="inner-discount">
          <i class="fa-solid fa-bolt"></i> Giảm ${course.discount}
        </div>
        <div class="inner-content">
          <h3 class="inner-title">
            <a href="#">${course.title}</a>
          </h3>
          <div class="inner-prices">
            <div class="inner-price-old">
              ${course.oldPrice}<span class="inner-unit">đ</span>
            </div>
            <div class="inner-price-new">
              ${course.newPrice}<span class="inner-unit">đ</span>
            </div>
          </div>
          <div class="inner-desc">
            <div>Số bài giảng: <b>${course.lessons}</b></div>
            <div>Số lượng bài tập : <b>${course.exercises}</b></div>
            <div>Khóa Năm: <b>${course.year}</b></div>
          </div>
          <div class="inner-meta">
            <div class="inner-rating">
              <div class="inner-number">
                Số lượt đã mua (${course.bought})
              </div>
            </div>
            <div class="inner-stock">
              <div class="inner-label">
                Số chỗ còn:
              </div>
              <div class="inner-number">
                ${course.stock}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  list.innerHTML = html;