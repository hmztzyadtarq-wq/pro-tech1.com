document.addEventListener("DOMContentLoaded", function() {
    // إعدادات Firebase الخاصة بك
    const firebaseConfig = {
      apiKey: "AIzaSyBzFacVVTAe2fMvCDXwexfd6Wi7cI7_1gc",
      authDomain: "bro-tech-mane.firebaseapp.com",
      projectId: "bro-tech-mane",
      storageBucket: "bro-tech-mane.firebasestorage.app",
      messagingSenderId: "391259453925",
      appId: "1:391259453925:web:0fdf19af7e23d469bb970c",
      measurementId: "G-467280QJFT"
    };

    // تشغيل الفايربيز
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // --- 1. إدارة المنتجات ---
    const productForm = document.getElementById('productForm');
    const productTableBody = document.getElementById('productTableBody');

    if (productTableBody) {
        db.collection("products").onSnapshot((snapshot) => {
            productTableBody.innerHTML = '';
            snapshot.forEach((doc) => {
                const product = doc.data();
                const id = doc.id;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${product.image || ''}" class="product-thumb" alt="صورة" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                    <td>${product.name}</td>
                    <td>${product.price}</td>
                    <td>${product.desc}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteDocument('products', '${id}')" style="background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">حذف</button>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('productName').value;
            const price = document.getElementById('productPrice').value;
            const desc = document.getElementById('productDesc').value;
            const imageFile = document.getElementById('productImage').files[0];

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    db.collection("products").add({
                        name: name,
                        price: price,
                        desc: desc,
                        image: event.target.result,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        productForm.reset();
                        alert("تم إضافة المنتج بنجاح إلى قاعدة البيانات!");
                    })
                    .catch((error) => console.error("خطأ في الإضافة: ", error));
                };
                reader.readAsDataURL(imageFile);
            }
        });
    }

    // --- 2. إدارة الأحبار ---
    const inkForm = document.getElementById('inkForm');
    const inkTableBody = document.getElementById('inkTableBody');

    if (inkTableBody) {
        db.collection("inks").onSnapshot((snapshot) => {
            inkTableBody.innerHTML = '';
            snapshot.forEach((doc) => {
                const ink = doc.data();
                const id = doc.id;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${ink.image || ''}" class="product-thumb" alt="صورة" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                    <td>${ink.name}</td>
                    <td>${ink.price}</td>
                    <td>${ink.desc}</td>
                    <td>
                        <button onclick="deleteDocument('inks', '${id}')" style="background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">حذف</button>
                    </td>
                `;
                inkTableBody.appendChild(row);
            });
        });
    }

    if (inkForm) {
        inkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('inkName').value;
            const price = document.getElementById('inkPrice').value;
            const desc = document.getElementById('inkDesc').value;
            const imageFile = document.getElementById('inkImage').files[0];

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    db.collection("inks").add({
                        name: name,
                        price: price,
                        desc: desc,
                        image: event.target.result,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        inkForm.reset();
                        alert("تم إضافة الحبر بنجاح إلى قاعدة البيانات!");
                    })
                    .catch((error) => console.error("خطأ في الإضافة: ", error));
                };
                reader.readAsDataURL(imageFile);
            }
        });
    }

    // --- 3. إدارة السلة (Cart) والمفضلة (Wishlist) عبر السحابة لعدم الحذف ---
    const cartTableBody = document.getElementById('cartTableBody');
    if (cartTableBody) {
        db.collection("cart").onSnapshot((snapshot) => {
            cartTableBody.innerHTML = '';
            snapshot.forEach((doc) => {
                const item = doc.data();
                const id = doc.id;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.price}</td>
                    <td><button onclick="deleteDocument('cart', '${id}')" style="background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">إزالة من السلة</button></td>
                `;
                cartTableBody.appendChild(row);
            });
        });
    }

    const wishlistContainer = document.getElementById('wishlistContainer');
    if (wishlistContainer) {
        db.collection("wishlist").onSnapshot((snapshot) => {
            wishlistContainer.innerHTML = '';
            snapshot.forEach((doc) => {
                const item = doc.data();
                const id = doc.id;
                const div = document.createElement('div');
                div.style.cssText = "border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;";
                div.innerHTML = `
                    <span>${item.name} - ${item.price}</span>
                    <button onclick="deleteDocument('wishlist', '${id}')" style="background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">حذف من المفضلة</button>
                `;
                wishlistContainer.appendChild(div);
            });
        });
    }
});

// دالة عامة لحذف أي عنصر من أي جدول في Firebase
function deleteDocument(collectionName, id) {
    if(confirm("هل أنت متأكد من الحذف؟")) {
        const db = firebase.firestore();
        db.collection(collectionName).doc(id).delete().catch((error) => {
            console.error("خطأ أثناء الحذف: ", error);
        });
    }
}
/* =========================================================
   ProTech — script.js
   ملحوظة: ده ملف مبني من الصفر عشان محضرش الملف الأصلي.
   لو عندك دوال تانية في نسخة قديمة (زي نظام ترجمة i18n)،
   ابعتهالي عشان أدمجها هنا بدل ما تتكرر أو تتعارض.
   ========================================================= */

const WHATSAPP_ADMIN = "201000000000"; // رقم الأدمن لاستقبال الطلبات والطلبات

/* ---------- الهيدر: ظل عند التمرير + قائمة الموبايل ---------- */
const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

navToggle?.addEventListener('click', () => mainNav.classList.toggle('open'));

/* ---------- الثيم: يقرأ اختيار المستخدم المحفوظ من صفحة الإعدادات ---------- */
(function applySavedTheme(){
  const saved = localStorage.getItem('protech-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- عداد الإحصائيات (Count-up) ---------- */
function animateCounter(el){
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();
  function step(now){
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ---------- سلايدر الهيرو ---------- */
let currentSlide = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const slideDots = document.querySelectorAll('.slide-dot');

function goToSlide(i){
  heroSlides[currentSlide]?.classList.remove('active');
  slideDots[currentSlide]?.classList.remove('active');
  currentSlide = i;
  heroSlides[currentSlide]?.classList.add('active');
  slideDots[currentSlide]?.classList.add('active');
}
function autoSlide(){
  if (heroSlides.length) goToSlide((currentSlide + 1) % heroSlides.length);
}
let slideTimer = setInterval(autoSlide, 4500);
slideDots.forEach((dot, i) => dot.addEventListener('click', () => {
  clearInterval(slideTimer);
  goToSlide(i);
  slideTimer = setInterval(autoSlide, 4500);
}));

/* ---------- أسئلة شائعة (Accordion) ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ---------- Modals: استشارة فنية ---------- */
function openConsultationModal(){ document.getElementById('consultationModal').classList.add('open'); }
function closeConsultationModal(){ document.getElementById('consultationModal').classList.remove('open'); }

/* ---------- Modals: طلب صيانة ---------- */
function openMaintenanceModal(){ document.getElementById('maintenanceModal').classList.add('open'); }
function closeMaintenanceModal(){ document.getElementById('maintenanceModal').classList.remove('open'); }

function sendMaintenanceRequest(event){
  event.preventDefault();
  const form = event.target;
  const machine = form.machine.value.trim();
  const issue = form.issue.value.trim();
  const phone = form.phone.value.trim();

  const message = `طلب صيانة جديد من موقع ProTech%0A` +
    `نوع الماكينة: ${encodeURIComponent(machine)}%0A` +
    `المشكلة: ${encodeURIComponent(issue)}%0A` +
    `رقم التواصل: ${encodeURIComponent(phone)}`;

  window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${message}`, '_blank');
  form.reset();
  closeMaintenanceModal();
  return false;
}

/* ---------- السلة (localStorage) ---------- */
function getCart(){
  return JSON.parse(localStorage.getItem('protech-cart') || '[]');
}
function saveCart(cart){
  localStorage.setItem('protech-cart', JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge(){
  const cart = getCart();
  document.getElementById('cart-count').textContent = cart.reduce((sum, i) => sum + i.qty, 0);
}
function addToCart(name, price){
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty += 1;
  else cart.push({ name, price, qty: 1 });
  saveCart(cart);
}
function renderCart(){
  const cart = getCart();
  const container = document.getElementById('cartItemsContainer');
  container.innerHTML = '';
  let total = 0;

  if (!cart.length){
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:14px 0">السلة فاضية دلوقتي</p>';
  }

  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px;';
    row.innerHTML = `
      <span>${item.name} × ${item.qty}</span>
      <span style="display:flex;align-items:center;gap:10px">
        <b>${item.price * item.qty} ج.م</b>
        <button onclick="removeFromCart(${idx})" style="background:none;border:none;color:#e11d48;font-size:15px">&times;</button>
      </span>`;
    container.appendChild(row);
  });

  document.getElementById('cartTotalPrice').textContent = `${total} ج.م`;
}
function removeFromCart(idx){
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  renderCart();
}
function openCartModal(){
  renderCart();
  document.getElementById('cartModal').classList.add('open');
}
function closeCartModal(){ document.getElementById('cartModal').classList.remove('open'); }

function downloadInvoice(){
  const cart = getCart();
  if (!cart.length){ alert('السلة فاضية، مفيش فاتورة لتنزيلها.'); return; }
  let total = 0;
  let text = 'فاتورة ProTech\n===================\n';
  cart.forEach(item => {
    total += item.price * item.qty;
    text += `${item.name} × ${item.qty} = ${item.price * item.qty} ج.م\n`;
  });
  text += `===================\nالإجمالي: ${total} ج.م`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'protech-invoice.txt';
  link.click();
}

function checkoutToWhatsApp(){
  const cart = getCart();
  if (!cart.length){ alert('السلة فاضية، ضيف منتجات الأول.'); return; }
  let total = 0;
  let message = 'طلب شراء جديد من موقع ProTech%0A%0A';
  cart.forEach(item => {
    total += item.price * item.qty;
    message += `${encodeURIComponent(item.name)} × ${item.qty} = ${item.price * item.qty} ج.م%0A`;
  });
  message += `%0Aالإجمالي: ${total} ج.م`;
  window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${message}`, '_blank');
}

updateCartBadge();

/* ---------- Lightbox ---------- */
function openLightbox(src){
  const box = document.getElementById('myLightbox');
  document.getElementById('lightboxImg').src = src;
  box.classList.add('open');
}
function closeLightbox(){
  document.getElementById('myLightbox').classList.remove('open');
}

/* ---------- إغلاق أي مودال بالضغط على مفتاح Escape ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape'){
    closeConsultationModal();
    closeMaintenanceModal();
    closeCartModal();
    closeLightbox();
  }
});
