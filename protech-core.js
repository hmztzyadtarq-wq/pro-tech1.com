// ==========================================
// ملف التحكم المركزي لشركة بروتك (ProTech Core)
// ==========================================
// هذه نسخة مطابقة تمامًا لملفك الأصلي، فيها 5 تعديلات محددة فقط
// (مُعلّمة بتعليق "🔧 تعديل" في مكانها): توحيد عداد وبيانات السلة
// مع باقي الموقع، تصحيح السعر الثابت، منع تكرار مودال السلة، دمج
// الكمية بدل تكرار المنتج في السلة، وجعل كل كارت يفتح صفحة تفاصيل.
// باقي المنطق (Firebase، مطابقة الأقسام، عرض البيانات) لم يتغير.

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
                    // المنتج (بيستخدم رقم الوثيقة في فايربيز)، وزرار "إضافة للسلة"
                    // مستثنى من ده عشان الدوس عليه يضيف للسلة بس من غير ما يفتح الصفحة
                    card.style.cursor = 'pointer';
                    card.setAttribute('onclick', `location.href='product-details.html?id=${doc.id}'`);

                    // التحقق مما إذا كان المحتوى فيديو أو صورة
                    let mediaElement = '';
                    if (item.videoUrl && item.videoUrl.trim() !== '') {
                        mediaElement = `<video controls style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:12px;"><source src="${item.videoUrl}" type="video/mp4">متصفحك لا يدعم عرض الفيديو</video>`;
                    } else {
                        mediaElement = `<img src="${item.imageUrl || 'https://via.placeholder.com/200'}" alt="صورة" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:12px;">`;
                    }

                    // 🔧 تعديل 2: كان في سعر ثابت 150 لكل المنتجات مهما كان سعرها
                    // الحقيقي — بقى ياخد item.price من فايربيز، ولو مش موجود يبقى صفر
                    const priceValue = item.price || 0;
                    const safeTitle = (item.title || 'منتج').replace(/'/g, "\\'");

                    card.innerHTML = `
                        <div>
                            ${mediaElement}
                            <span style="background:#e1f0ff; color:#007bff; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:bold;">${item.category || 'عام'}</span>
                            <h3 style="margin:10px 0 5px; font-size:18px; color:#2c3e50;">${item.title || 'بدون عنوان'}</h3>
                            <p style="color:#666; font-size:14px; margin-bottom:15px; line-height:1.5;">${item.desc || 'لا يوجد وصف.'}</p>
                            ${priceValue ? `<p style="color:#00AEEF; font-weight:800; font-size:15px; margin-bottom:10px;">${priceValue} ج.م</p>` : ''}
                        </div>
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${safeTitle}', ${priceValue})">إضافة للسلة 🛒</button>
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
