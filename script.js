/* =========================================================
   ProTech — script.js
   ملحوظة: ده ملف مبني من الصفر عشان محضرش الملف الأصلي.
   لو عندك دوال تانية في نسخة قديمة (زي نظام ترجمة i18n)،
   ابعتهالي عشان أدمجها هنا بدل ما تتكرر أو تتعارض.
   ========================================================= */

let WHATSAPP_ADMIN = "201000000000"; // قيمة افتراضية — بتتغير تلقائيًا لو فيه رقم محفوظ في إعدادات الأدمن

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

/* ---------- السلة (localStorage) ----------
   ملحوظة مهمة: السلة هنا بتستخدم نفس مخزن البيانات اللي بيستخدمه
   protech-core.js بالظبط (المفتاح "protech_cart" وشكل العنصر
   {title, price, qty})، عشان يبقى مصدر بيانات واحد بس للسلة في
   كل الموقع. دالة addToCart نفسها اتسابت في protech-core.js فقط
   ومتعرفتش هنا تاني عشان منتلغيش بعض. */
function getCart(){
  return JSON.parse(localStorage.getItem('protech_cart') || '[]');
}
function saveCart(cart){
  localStorage.setItem('protech_cart', JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge(){
  const cart = getCart();
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
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
    const price = item.price || 0;
    const qty = item.qty || 1;
    total += price * qty;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px;';
    row.innerHTML = `
      <span>${item.title} × ${qty}</span>
      <span style="display:flex;align-items:center;gap:10px">
        <b>${price * qty} ج.م</b>
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
    const price = item.price || 0;
    const qty = item.qty || 1;
    total += price * qty;
    text += `${item.title} × ${qty} = ${price * qty} ج.م\n`;
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
    const price = item.price || 0;
    const qty = item.qty || 1;
    total += price * qty;
    message += `${encodeURIComponent(item.title)} × ${qty} = ${price * qty} ج.م%0A`;
  });
  message += `%0Aالإجمالي: ${total} ج.م`;
  window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${message}`, '_blank');
}

updateCartBadge();
/* السلة بتتغير أحيانًا من تبويب تاني (لو فيه أكتر من صفحة مفتوحة) */
window.addEventListener('storage', (e) => { if (e.key === 'protech_cart') updateCartBadge(); });

/* ---------- إعدادات الموقع العامة (من صفحة الأدمن) ----------
   بتتقرا من مستند واحد في فايربيز: settings/site_config
   وتتطبق على أي صفحة فيها فايربيز مُهيّأ بالفعل (بعد
   firebase.initializeApp). الصفحات اللي مفيهاش فايربيز أصلاً
   (زي index.html القديمة) هتحتاج تحميل مكتبات فايربيز الأول. */
function applySiteSettings(){
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;

  firebase.firestore().collection('settings').doc('site_config').get().then((doc) => {
    if (!doc.exists) return;
    const s = doc.data();

    if (s.phone1) document.querySelectorAll('[data-wa="phone1"]').forEach(el => updateWaLink(el, s.phone1));
    if (s.phone2) document.querySelectorAll('[data-wa="phone2"]').forEach(el => updateWaLink(el, s.phone2));

    // الرقم المستخدم لطلبات الصيانة وإتمام الشراء من السلة
    if (s.cartPhone || s.phone1) WHATSAPP_ADMIN = s.cartPhone || s.phone1;

    const statusEl = document.querySelector('.topbar-status');
    if (statusEl && s.topbarStatus) statusEl.innerHTML = `<span class="dot"></span> ${s.topbarStatus}`;

    const hoursEl = document.querySelector('.topbar-hours');
    if (hoursEl && s.topbarHours) hoursEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${s.topbarHours}`;

    if (s.promoEnabled && s.promoText) injectPromoBanner(s.promoText, s.promoLink);
  }).catch(() => {});
}

function updateWaLink(el, phone){
  el.href = el.href.replace(/wa\.me\/\d+/, 'wa.me/' + phone);
}

function injectPromoBanner(text, link){
  if (document.getElementById('promoBanner')) return;
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const bar = document.createElement('div');
  bar.id = 'promoBanner';
  bar.className = 'promo-banner';
  bar.innerHTML = `
    <span><i class="fa-solid fa-bullhorn"></i> ${text}</span>
    ${link ? `<a href="${link}" target="_blank">التفاصيل</a>` : ''}
    <button aria-label="إغلاق" onclick="this.parentElement.remove()">&times;</button>`;
  header.insertAdjacentElement('afterend', bar);
}

document.addEventListener('DOMContentLoaded', () => {
  // بعض الصفحات (زي المكن) بتهيّئ فايربيز في سكريبت خاص بيها بعد
  // ما الصفحة تحمّل، فبنستنى شوية صغيرة كمان بعد DOMContentLoaded
  // تحسبًا لده. الصفحات اللي فيها protech-core.js بتنادي الدالة
  // دي بنفسها فور ما تتهيأ.
  setTimeout(applySiteSettings, 300);
});

/* ---------- بانر الصفحة (من تبويب "البانرات" في الأدمن) ----------
   بتجيب أول مستند في site_media بنفس اسم القسم (banner_index/
   banner_videos/banner_inks) وتبعته لدالة apply الخاصة بكل صفحة
   عشان كل صفحة تحدّث العناصر بتاعتها بالشكل المناسب ليها. */
function loadPageBanner(categoryName, applyFn){
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;
  firebase.firestore().collection('site_media').where('category', '==', categoryName).limit(1).get()
    .then(snap => { if (!snap.empty) applyFn(snap.docs[0].data()); })
    .catch(() => {});
}

/* ---------- معرض الشهادات في الصفحة الرئيسية (Firestore) ---------- */
function loadCertificatesGallery(){
  const track = document.getElementById('galleryTrack');
  if (!track || typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;

  firebase.firestore().collection('site_media').where('category', '==', 'certificates').onSnapshot((snapshot) => {
    if (snapshot.empty){
      track.innerHTML = '<p style="color:var(--muted);padding:16px 4px;font-size:13.5px">لا توجد شهادات مضافة بعد.</p>';
      return;
    }
    track.innerHTML = '';
    snapshot.forEach((doc) => {
      const item = doc.data();
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.onclick = () => openLightbox(item.imageUrl);
      div.innerHTML = `
        <img src="${item.imageUrl || ''}" alt="${item.title || 'شهادة'}" loading="lazy" onerror="this.closest('.gallery-item').classList.add('img-missing')">
        <span class="cap">${item.title || ''}</span>`;
      track.appendChild(div);
    });
  });
}

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
