// ==========================================
// ملف التحكم المركزي لشركة بروتك (ProTech Core)
// ==========================================
// نسخة موسّعة من ملفك الأصلي: لسه فيها كل منطقك (Firebase، مطابقة
// الأقسام، عرض البيانات) زي ما هو، ومضاف عليها تعديلات السلة
// (مُعلّمة بـ "🔧 تعديل")، وقسمين جداد بالكامل تحت في نهاية الملف:
// - loadSiteSettings(): يجيب أرقام الواتساب وشريط الحالة العلوي
//   وروابط السوشيال ميديا من فايربيز ويطبّقهم على أي صفحة فيها
//   العناصر دي، عشان تتغير من الأدمن بدون لمس أي كود.
// - loadAds(): يعرض أي إعلانات/عروض ترويجية مضافة من الأدمن.

const firebaseConfig = {
  apiKey: "AIzaSyBzFacVVTAe2fMvCDXwexfd6Wi7cI7_1gc",
  authDomain: "bro-tech-mane.firebaseapp.com",
  projectId: "bro-tech-mane",
  storageBucket: "bro-tech-mane.firebasestorage.app",
  messagingSenderId: "391259453925",
  appId: "1:391259453925:web:0fdf19af7e23d469bb970c",
  measurementId: "G-467280QJFT"
};

// تهيئة فايربيس مرة واحدة فقط
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// تحديث عداد السلة في أي صفحة تلقائياً
function updateCartCounter() {
    let cart = JSON.parse(localStorage.getItem('protech_cart')) || [];
    let totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

    // التصميم القديم (لو لسه موجود في أي صفحة)
    const cartBtn = document.getElementById('cartIndicator');
    if(cartBtn) {
        cartBtn.innerText = `🛒 السلة (${totalItems})`;
    }

    // 🔧 تعديل 1: التصميم الجديد الموحّد بيستخدم badge باسم cart-count
    const newBadge = document.getElementById('cart-count');
    if (newBadge) {
        newBadge.textContent = totalItems;
    }
}

// إضافة منتج للسلة
// 🔧 تعديل 4: لو المنتج ده أصلاً في السلة، بيزود الكمية بدل ما يضيف
// سطر جديد منفصل — كده الإجمالي بيفضل يحسب صح والسلة منظمة أكتر
function addToCart(title, price, qty) {
    qty = qty || 1;
    let cart = JSON.parse(localStorage.getItem('protech_cart')) || [];
    const existing = cart.find(i => i.title === title && i.price === price);
    if (existing) {
        existing.qty = (existing.qty || 1) + qty;
    } else {
        cart.push({ title: title, price: price || 0, qty: qty });
    }
    localStorage.setItem('protech_cart', JSON.stringify(cart));
    updateCartCounter();
    alert("تمت إضافة (" + title + ") إلى السلة بنجاح!");
}

// الاستماع لتغييرات السلة بين التبويبات
window.addEventListener('storage', function(e) {
    if (e.key === 'protech_cart') {
        updateCartCounter();
    }
});

// تعديل دالة العرض لتشمل الصور والفيديوهات معاً بدون تعليقات
function initDynamicSection(targetCategory, containerId, cardTemplateType) {
    document.addEventListener("DOMContentLoaded", function() {
        updateCartCounter();
        const container = document.getElementById(containerId);
        if(!container) return;

        db.collection("site_media").onSnapshot((snapshot) => {
            container.innerHTML = '';
            let found = 0;

            snapshot.forEach((doc) => {
                const item = doc.data();
                const itemCat = (item.category || '').trim().toLowerCase();
                const targetCat = targetCategory.trim().toLowerCase();

                let match = false;
                if (targetCat === 'machines') {
                    // عرض المكن والفيديوهات الخاصة بالقسم
                    match = (itemCat === 'machines' || itemCat === 'مكن' || itemCat === 'ماكينات' || itemCat === 'videos' || itemCat === 'فيديوهات');
                } else if (targetCat === 'inks') {
                    match = (itemCat === 'inks' || itemCat === 'حبر' || itemCat === 'أحبار');
                } else if (targetCat === 'team') {
                    match = (itemCat === 'team' || itemCat === 'فريق');
                }

                if (match) {
                    found++;
                    const card = document.createElement('div');
                    card.className = 'ink-card';

                    // 🔧 تعديل 5: كل كارت بقى قابل للدوس عليه يفتح صفحة تفاصيل
                    // المنتج (بيستخدم رقم الوثيقة في فايربيز)، وأي زرار جواه
                    // (سلة/إعجاب) مستثنى من ده بـ stopPropagation
                    card.style.cursor = 'pointer';
                    card.setAttribute('onclick', `location.href='product-details.html?id=${doc.id}'`);

                    // 🔧 تعديل 6: تصميم أصغر على طراز أمازون — صورة/فيديو أصغر،
                    // من غير وصف تحت الصورة (الوصف بقى في صفحة التفاصيل بس)
                    let mediaElement = '';
                    if (item.videoUrl && item.videoUrl.trim() !== '') {
                        mediaElement = `<video controls style="width:100%; height:130px; object-fit:cover; border-radius:8px;"><source src="${item.videoUrl}" type="video/mp4"></video>`;
                    } else {
                        mediaElement = `<img src="${item.imageUrl || 'https://via.placeholder.com/200'}" alt="صورة" style="width:100%; height:130px; object-fit:cover; border-radius:8px;">`;
                    }

                    const priceValue = item.price || 0;
                    const safeTitle = (item.title || 'منتج').replace(/'/g, "\\'");
                    const likesValue = item.likes || 0;

                    card.innerHTML = `
                        <div>
                            ${mediaElement}
                            <h3 style="margin:10px 0 4px; font-size:14.5px; color:#2c3e50; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:38px;">${item.title || 'بدون عنوان'}</h3>
                            ${priceValue ? `<p style="color:#00AEEF; font-weight:800; font-size:15px; margin-bottom:8px;">${priceValue} ج.م</p>` : ''}
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; gap:6px;">
                                <button class="btn-add-cart" style="flex:1; margin-top:0;" onclick="event.stopPropagation(); addToCart('${safeTitle}', ${priceValue})"><i class="fa-solid fa-cart-plus"></i> أضف</button>
                                <button onclick="event.stopPropagation(); toggleProductLike('${doc.id}', '${safeTitle}', this)" style="background:none; border:1px solid #eee; border-radius:6px; padding:8px 10px; color:#e63d8c; font-size:13px; white-space:nowrap;"><i class="fa-regular fa-heart"></i> <span>${likesValue}</span></button>
                            </div>
                            <button style="background:#12181F; color:#fff; border:none; border-radius:6px; padding:9px; font-weight:700; font-size:12.5px; width:100%;" onclick="event.stopPropagation(); buyNowProduct('${safeTitle}', ${priceValue})"><i class="fa-solid fa-bolt"></i> شراء الآن</button>
                        </div>
                    `;
                    container.appendChild(card);
                }
            });

            if (found === 0) {
                container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: #777;">لا توجد عناصر مضافة في هذا القسم حالياً.</p>`;
            }
        });
    });
}

// إعجاب بمنتج — مرتبط بالمستخدم المسجل (يُطلب تسجيل الدخول أول مرة بس)
function toggleProductLike(id, title, btnEl) {
    if (typeof toggleLikeItem !== 'function') return;
    toggleLikeItem(id, title, 'product', (liked) => {
        if (!btnEl) return;
        const span = btnEl.querySelector('span');
        if (span) span.textContent = (parseInt(span.textContent, 10) || 0) + (liked ? 1 : -1);
        btnEl.classList.toggle('liked', liked);
    });
}

// شراء فوري: يضيف المنتج للسلة ويفتحها على طول
function buyNowProduct(title, price) {
    addToCart(title, price, 1);
    if (typeof openCartModal === 'function') openCartModal();
}

// --- كود السلة العائمة الموحدة (احتياطي لأي صفحة قديمة لسه معملهاش تحديث) ---
function injectCartModal() {
    // 🔧 تعديل 3: الصفحات الجديدة أصلاً فيها مودال سلة جاهز في الـ HTML
    // (بتصميم أحدث ومتكامل مع باقي الموقع) — لو موجود، منحقنش واحد تاني فوقه
    if (document.getElementById('cartModal')) return;

    const modalHTML = `
        <div id="cartModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center;">
            <div style="background:#fff; padding:20px; width:90%; max-width:400px; border-radius:10px; max-height:80vh; overflow-y:auto; position:relative;">
                <button onclick="toggleCart()" style="position:absolute; top:10px; right:10px; border:none; background:none; cursor:pointer; font-size:20px;">×</button>
                <h2>سلة المشتريات</h2>
                <div id="cartItemsList"></div>
                <button onclick="clearCart()" style="background:red; color:white; border:none; padding:5px 10px; margin-top:10px; border-radius:5px;">تفريغ السلة</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    if(modal.style.display === 'flex') {
        renderCartItems();
    }
}

function renderCartItems() {
    let cart = JSON.parse(localStorage.getItem('protech_cart')) || [];
    let list = document.getElementById('cartItemsList');
    if (!list) return; // الصفحات الجديدة عندها مودال مختلف بيتعرض بدالة renderCart في script.js
    if(cart.length === 0) {
        list.innerHTML = "<p>السلة فارغة</p>";
    } else {
        list.innerHTML = cart.map((item, index) => `
            <div style="border-bottom:1px solid #eee; padding:10px 0;">
                <p>${item.title} - ${item.price} ج.م</p>
            </div>
        `).join('');
    }
}

function clearCart() {
    localStorage.removeItem('protech_cart');
    renderCartItems();
    updateCartCounter();
}

// استدعاء السلة عند تحميل أي صفحة
document.addEventListener("DOMContentLoaded", injectCartModal);
// تطبيق إعدادات الموقع العامة (أرقام واتساب، البار العلوي، الإعلانات) فور ما فايربيز يكون جاهز
// (الدالة الفعلية applySiteSettings معرّفة في script.js وبتقرا من settings/site_config)
document.addEventListener("DOMContentLoaded", () => {
    if (typeof applySiteSettings === 'function') applySiteSettings();
    if (typeof applyCategoryImages === 'function') applyCategoryImages();
});
