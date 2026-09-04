/* =========================================================
   ProTech — script.js
   ملحوظة: ده ملف مبني من الصفر عشان محضرش الملف الأصلي.
   لو عندك دوال تانية في نسخة قديمة (زي نظام ترجمة i18n)،
   ابعتهالي عشان أدمجها هنا بدل ما تتكرر أو تتعارض.
   ========================================================= */

let WHATSAPP_ADMIN = "201000000000"; // قيمة افتراضية — بتتغير تلقائيًا لو فيه رقم محفوظ في إعدادات الأدمن

/* ---------- الهيدر: ظل عند التمرير ---------- */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

/* ---------- البانل الجانبي في الموبايل (يفتح من زرار الهمبرجر) ---------- */
function openMobilePanel(){ document.getElementById('mobilePanelOverlay')?.classList.add('open'); }
function closeMobilePanel(){ document.getElementById('mobilePanelOverlay')?.classList.remove('open'); }
document.getElementById('navToggle')?.addEventListener('click', openMobilePanel);

/* ---------- الوضع الليلي/النهاري ---------- */
function applySavedTheme(){
  const saved = localStorage.getItem('protech-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeSwitchUI(saved);
}
function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('protech-theme', next);
  updateThemeSwitchUI(next);
}
function updateThemeSwitchUI(theme){
  const sw = document.getElementById('themeSwitch');
  if (sw) sw.classList.toggle('on', theme === 'dark');
}
applySavedTheme();

/* ---------- اللغة (عربي / إنجليزي — الصينية تُضاف لاحقًا) ---------- */
const TRANSLATIONS = {
  ar: {
    nav_home:'الرئيسية', nav_machines:'المكن', nav_store:'المتجر', nav_team:'الفريق', nav_settings:'الإعدادات',
    hero_eyebrow:'ProTech · بيع وصيانة وأحبار أصلية',
    hero_title:'خبرة أكتر من ١٠ سنين في صيانة وتوريد ماكينات الطباعة',
    hero_desc:'بيع ماكينات طباعة رقمية، صيانة ودعم فني متكامل، وتوريد أحبار وتونر أصلي لكل الأنواع — بضمان حقيقي ومتابعة لحد ما تشتغل الماكينة تمام.',
    hero_cta_shop:'تسوق الأحبار الآن', hero_cta_consult:'اطلب استشارة فنية',
    quick_title:'محتاج إيه دلوقتي؟', quick_inks:'تسوق الأحبار', quick_machines:'شوف الماكينات',
    quick_maintenance:'اطلب صيانة دلوقتي', quick_team:'تعرف على فريقنا',
    services_title:'كل احتياجاتك تحت سقف واحد',
    faq_title:'أسئلة شائعة',
    mp_dark_mode:'الوضع الليلي', mp_language:'اللغة', mp_quick_actions:'وصول سريع',
    mp_cart:'السلة', mp_whatsapp:'تواصل واتساب', mp_maintenance:'اطلب صيانة'
  },
  en: {
    nav_home:'Home', nav_machines:'Machines', nav_store:'Store', nav_team:'Team', nav_settings:'Settings',
    hero_eyebrow:'ProTech · Sales, Service & Genuine Ink',
    hero_title:'10+ Years of Experience in Printer Sales & Maintenance',
    hero_desc:'Digital printing machines for sale, full technical support and maintenance, and genuine ink & toner for every type — with real warranty and follow-up until your machine runs perfectly.',
    hero_cta_shop:'Shop Ink Now', hero_cta_consult:'Request Technical Consultation',
    quick_title:'What do you need right now?', quick_inks:'Shop Ink', quick_machines:'View Machines',
    quick_maintenance:'Request Maintenance', quick_team:'Meet Our Team',
    services_title:'Everything You Need Under One Roof',
    faq_title:'Frequently Asked Questions',
    mp_dark_mode:'Dark Mode', mp_language:'Language', mp_quick_actions:'Quick Access',
    mp_cart:'Cart', mp_whatsapp:'WhatsApp Us', mp_maintenance:'Request Maintenance'
  }
};

function applyLanguage(lang){
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'ar');
  document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
  document.querySelectorAll('.mp-lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  localStorage.setItem('protech-lang', lang);
}
function setLanguage(lang){ applyLanguage(lang); }
function applySavedLanguage(){
  const saved = localStorage.getItem('protech-lang') || 'ar';
  applyLanguage(saved);
}
applySavedLanguage();

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

/* ---------- حفظ الطلبات (تظهر لاحقًا في تبويب "الطلبات" بالأدمن) ---------- */
function saveOrder(data){
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return Promise.resolve();
  return firebase.firestore().collection('orders').add({
    ...data, status: 'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch((err) => console.error('saveOrder error:', err.message));
}

function sendMaintenanceRequest(event){
  event.preventDefault();
  const form = event.target;
  const customerName = form.customerName.value.trim();
  const machine = form.machine.value.trim();
  const issue = form.issue.value.trim();
  const phone = form.phone.value.trim();

  saveOrder({
    type: 'maintenance',
    customerName, phone,
    details: `الماكينة: ${machine} — المشكلة: ${issue}`
  });

  const message = `طلب صيانة جديد من موقع ProTech%0A` +
    `اسم العميل: ${encodeURIComponent(customerName)}%0A` +
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
  const count = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
  const badgeMp = document.getElementById('cart-count-mp');
  if (badgeMp) badgeMp.textContent = count;
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
function clearCart(){
  if (!getCart().length) return;
  if (!confirm('تفريغ السلة بالكامل؟')) return;
  saveCart([]);
  renderCart();
}
function openCartModal(){
  renderCart();
  renderPaymentOptions();
  document.getElementById('cartModal').classList.add('open');
}
function closeCartModal(){ document.getElementById('cartModal').classList.remove('open'); }

const PAYMENT_METHOD_LABELS = { cash:'الدفع عند الاستلام', wallet:'محفظة إلكترونية', card:'فيزا / بطاقة' };
const WALLET_LABELS = { vodafone:'فودافون كاش', etisalat:'اتصالات كاش', orange:'أورانج كاش' };

let selectedPaymentMethod = 'cash';
let selectedWalletProvider = null;

function renderPaymentOptions(){
  const box = document.getElementById('paymentMethodBox');
  if (!box) return;
  selectedPaymentMethod = 'cash';
  selectedWalletProvider = null;
  box.innerHTML = `
    <label class="pm-label">طريقة الدفع</label>
    <div class="pm-cards">
      <button type="button" class="pm-card active" data-method="cash" onclick="selectPaymentMethod('cash')">
        <i class="fa-solid fa-truck-fast"></i><span>${PAYMENT_METHOD_LABELS.cash}</span>
      </button>
      <button type="button" class="pm-card" data-method="wallet" onclick="selectPaymentMethod('wallet')">
        <i class="fa-solid fa-wallet"></i><span>${PAYMENT_METHOD_LABELS.wallet}</span>
      </button>
      <button type="button" class="pm-card" data-method="card" onclick="selectPaymentMethod('card')">
        <i class="fa-solid fa-credit-card"></i><span>${PAYMENT_METHOD_LABELS.card}</span>
      </button>
    </div>
    <div id="paymentDetailBox"></div>`;
  renderPaymentDetail();
}

function selectPaymentMethod(method){
  selectedPaymentMethod = method;
  selectedWalletProvider = null;
  document.querySelectorAll('.pm-card').forEach(c => c.classList.toggle('active', c.dataset.method === method));
  renderPaymentDetail();
}

function renderPaymentDetail(){
  const box = document.getElementById('paymentDetailBox');
  if (!box) return;

  if (selectedPaymentMethod === 'cash'){
    box.innerHTML = `<p class="pm-note"><i class="fa-solid fa-circle-check"></i> هتدفع نقدًا وقت الاستلام مباشرة.</p>`;
  } else if (selectedPaymentMethod === 'card'){
    box.innerHTML = `<p class="pm-note"><i class="fa-solid fa-circle-info"></i> بعد تأكيد الطلب، هيتواصل معاك فريقنا على واتساب برابط دفع آمن بالفيزا.</p>`;
  } else if (selectedPaymentMethod === 'wallet'){
    box.innerHTML = `
      <div class="wallet-providers">
        <button type="button" class="wp-chip" data-provider="vodafone" onclick="selectWalletProvider('vodafone')"><i class="fa-solid fa-wallet" style="color:#e60000"></i> فودافون كاش</button>
        <button type="button" class="wp-chip" data-provider="etisalat" onclick="selectWalletProvider('etisalat')"><i class="fa-solid fa-wallet" style="color:#00a651"></i> اتصالات كاش</button>
        <button type="button" class="wp-chip" data-provider="orange" onclick="selectWalletProvider('orange')"><i class="fa-solid fa-wallet" style="color:#ff7900"></i> أورانج كاش</button>
      </div>
      <div id="walletStepsBox"></div>`;
  }
}

function selectWalletProvider(provider){
  selectedWalletProvider = provider;
  document.querySelectorAll('.wp-chip').forEach(c => c.classList.toggle('active', c.dataset.provider === provider));

  const number = SITE_WALLETS[provider];
  const stepsBox = document.getElementById('walletStepsBox');
  if (!number){
    stepsBox.innerHTML = `<p class="pm-note" style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> لسه مفيش رقم ${WALLET_LABELS[provider]} متاح، اختار طريقة تانية.</p>`;
    return;
  }
  stepsBox.innerHTML = `
    <div class="pm-steps">
      <div class="pm-step">
        <span class="step-num">1</span>
        <div>حوّل المبلغ على رقم <b class="mono-num">${number}</b> (${WALLET_LABELS[provider]})
          <button type="button" class="copy-btn" onclick="copyWalletNumber(this,'${number}')"><i class="fa-solid fa-copy"></i> نسخ</button>
        </div>
      </div>
      <div class="pm-step">
        <span class="step-num">2</span>
        <div><input type="tel" id="cartPaymentRef" placeholder="اكتب رقمك اللي حوّلت منه"></div>
      </div>
    </div>`;
}

function copyWalletNumber(btn, number){
  navigator.clipboard.writeText(number).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> اتنسخ';
    setTimeout(() => btn.innerHTML = original, 1800);
  });
}

function clearCartItems(){
  if (!getCart().length) return;
  if (!confirm('هل تريد مسح كل محتويات السلة نهائيًا؟')) return;
  localStorage.removeItem('protech_cart');
  updateCartBadge();
  renderCart();
}

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

  const nameInput = document.getElementById('cartCustomerName');
  const phoneInput = document.getElementById('cartCustomerPhone');
  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerPhone = phoneInput ? phoneInput.value.trim() : '';
  if (nameInput && phoneInput && (!customerName || !customerPhone)){
    alert('من فضلك اكتب اسمك ورقم تليفونك قبل إتمام الطلب.');
    return;
  }

  let paymentRef = '';
  let paymentLabel = PAYMENT_METHOD_LABELS.cash;
  let paymentStatus = 'not_required';

  if (selectedPaymentMethod === 'wallet'){
    if (!selectedWalletProvider){ alert('اختار نوع المحفظة الأول.'); return; }
    const refInput = document.getElementById('cartPaymentRef');
    paymentRef = refInput ? refInput.value.trim() : '';
    if (!paymentRef){ alert('اكتب رقمك اللي حوّلت منه قبل تأكيد الطلب.'); return; }
    paymentLabel = `محفظة إلكترونية — ${WALLET_LABELS[selectedWalletProvider]}`;
    paymentStatus = 'awaiting_confirmation';
  } else if (selectedPaymentMethod === 'card'){
    paymentLabel = 'فيزا / بطاقة (هيتواصل معاك فريقنا برابط دفع آمن)';
    paymentStatus = 'awaiting_link';
  }

  let total = 0;
  const itemsList = [];
  let message = 'طلب شراء جديد من موقع ProTech%0A%0A';
  if (customerName) message += `اسم العميل: ${encodeURIComponent(customerName)}%0A`;
  message += `طريقة الدفع: ${encodeURIComponent(paymentLabel)}%0A`;
  if (paymentRef) message += `رقم التحويل منه: ${encodeURIComponent(paymentRef)}%0A`;
  message += '%0A';
  cart.forEach(item => {
    const price = item.price || 0;
    const qty = item.qty || 1;
    total += price * qty;
    itemsList.push(`${item.title} × ${qty} = ${price * qty} ج.م`);
    message += `${encodeURIComponent(item.title)} × ${qty} = ${price * qty} ج.م%0A`;
  });
  message += `%0Aالإجمالي: ${total} ج.م`;

  saveOrder({
    type: 'purchase',
    customerName, phone: customerPhone,
    details: itemsList.join(' | '),
    total,
    paymentMethod: selectedPaymentMethod,
    walletProvider: selectedWalletProvider,
    paymentRef,
    paymentStatus
  });

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
let SITE_WALLETS = {};

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

    SITE_WALLETS = { vodafone: s.walletVodafone || '', etisalat: s.walletEtisalat || '', orange: s.walletOrange || '' };

    // روابط التواصل في الفوتر — لو الأدمن ضاف قايمة مخصصة بتستبدل الافتراضية
    if (Array.isArray(s.socialLinks) && s.socialLinks.length){
      const box = document.getElementById('footerSocial');
      if (box){
        box.innerHTML = s.socialLinks.map(link => {
          const icon = SOCIAL_ICON_MAP[link.platform] || 'fa-solid fa-link';
          return `<a href="${link.url}" target="_blank"><i class="${icon}"></i></a>`;
        }).join('');
      }
    }

    // أرقام الاستشارة الفنية — لو الأدمن ضاف قايمة مخصصة بتستبدل الافتراضية
    if (Array.isArray(s.consultationNumbers) && s.consultationNumbers.length){
      const list = document.getElementById('consultationNumbersList');
      if (list){
        list.innerHTML = s.consultationNumbers.map(c =>
          `<a class="wa-choice" href="https://wa.me/${c.phone}" target="_blank"><i class="fa-brands fa-whatsapp"></i> ${c.name || 'تواصل معنا'}</a>`
        ).join('');
      }
    }
  }).catch((err) => console.error('applySiteSettings error:', err.message));
}

const SOCIAL_ICON_MAP = {
  whatsapp: 'fa-brands fa-whatsapp', facebook: 'fa-brands fa-facebook-f', instagram: 'fa-brands fa-instagram',
  tiktok: 'fa-brands fa-tiktok', youtube: 'fa-brands fa-youtube', email: 'fa-solid fa-envelope',
  website: 'fa-solid fa-globe', phone: 'fa-solid fa-phone'
};

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
    .catch((err) => console.error('loadPageBanner error:', err.message));
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
  }, (err) => console.error('loadCertificatesGallery error:', err.message));
}

/* ---------- صور تصنيفات المكن (من الأدمن) ---------- */
function applyCategoryImages(){
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;
  firebase.firestore().collection('settings').doc('site_config').get().then((doc) => {
    if (!doc.exists) return;
    const imgs = doc.data().categoryImages || {};
    document.querySelectorAll('[data-cat]').forEach(el => {
      const cat = el.getAttribute('data-cat');
      if (!imgs[cat]) return;
      const iconWrap = el.querySelector('.m-icon');
      if (iconWrap){
        iconWrap.style.backgroundImage = `url('${imgs[cat]}')`;
        iconWrap.style.backgroundSize = 'cover';
        iconWrap.style.backgroundPosition = 'center';
        iconWrap.innerHTML = '';
      }
    });
  }).catch((err) => console.error('applyCategoryImages error:', err.message));
}

/* ---------- شريط إعلانات دوّار (اختياري، يديره الأدمن) ---------- */
function loadAds(elementId){
  const el = document.getElementById(elementId);
  if (!el || typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;
  firebase.firestore().collection('settings').doc('site_config').get().then((doc) => {
    const ads = (doc.exists && Array.isArray(doc.data().ads)) ? doc.data().ads.filter(a => a.text) : [];
    if (!ads.length) return;
    el.style.display = 'flex';
    let i = 0;
    function render(){
      const ad = ads[i];
      el.innerHTML = ad.link
        ? `<a href="${ad.link}" target="_blank">${ad.text}</a>`
        : `<span>${ad.text}</span>`;
    }
    render();
    if (ads.length > 1) setInterval(() => { i = (i + 1) % ads.length; render(); }, 4000);
  }).catch((err) => console.error('loadAds error:', err.message));
}

/* ---------- حساب الزائر (اختياري) — تسجيل دخول/إنشاء حساب ----------
   مطلوب بس لما المستخدم يحب يكتب تعليق أو يسجل إعجاب، عشان نربطهم
   باسمه. أي حد يقدر يستخدم الموقع من غيره عادي. */
function getCurrentUser(){
  return (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
}
function requireLogin(actionLabel){
  if (typeof firebase === 'undefined' || !firebase.auth) return true; // الصفحة دي مفيهاش Auth أصلاً
  if (getCurrentUser()) return true;
  if (confirm(`محتاج تسجل دخولك الأول عشان ${actionLabel || 'تكمل'}. تحب تروح لصفحة الإعدادات دلوقتي؟`)){
    location.href = 'settings.html';
  }
  return false;
}

/* ---------- إعجاب موحّد لأي عنصر (منتج/ماكينة) — مرتبط بالمستخدم ---------- */
function toggleLikeItem(id, title, itemType, onDone){
  if (!requireLogin('تسجل إعجابك')) return;
  const uid = getCurrentUser().uid;
  const likeId = `${uid}_${id}`;
  const db2 = firebase.firestore();
  db2.collection('likes').doc(likeId).get().then((doc) => {
    if (doc.exists){
      db2.collection('likes').doc(likeId).delete();
      db2.collection('site_media').doc(id).update({ likes: firebase.firestore.FieldValue.increment(-1) });
      if (onDone) onDone(false);
    } else {
      db2.collection('likes').doc(likeId).set({
        userId: uid, itemId: id, itemTitle: title || '', itemType: itemType || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      db2.collection('site_media').doc(id).update({ likes: firebase.firestore.FieldValue.increment(1) });
      if (onDone) onDone(true);
    }
  }).catch((err) => console.error('toggleLikeItem error:', err.message));
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
    closeMobilePanel();
  }
});
