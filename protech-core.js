// ==========================================
// ملف التحكم المركزي لشركة بروتك (ProTech Core)
// ==========================================

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
    const cartBtn = document.getElementById('cartIndicator');
    if(cartBtn) {
        let totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        cartBtn.innerText = `🛒 السلة (${totalItems})`;
    }
}

// إضافة منتج للسلة
function addToCart(title, price) {
    let cart = JSON.parse(localStorage.getItem('protech_cart')) || [];
    cart.push({ title: title, price: price || 0, qty: 1 });
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

// دالة جلب وعرض البيانات ديناميكياً حسب القسم المطلوب في الصفحة
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

                // شرط دقيق جداً لكل قسم عشان مفيش حاجة تدخل مكان التانية
                let match = false;
                if (targetCat === 'inks') {
                    match = (itemCat === 'inks' || itemCat === 'حبر' || itemCat === 'أحبار');
                } else if (targetCat === 'machines') {
                    match = (itemCat === 'machines' || itemCat === 'مكن' || itemCat === 'ماكينات' || (itemCat !== 'inks' && itemCat !== 'حبر' && itemCat !== 'أحبار' && itemCat !== 'team' && itemCat !== 'certificates' && itemCat !== 'شهادات'));
                } else if (targetCat === 'team') {
                    match = (itemCat === 'team' || itemCat === 'فريق');
                } else if (targetCat === 'certificates') {
                    match = (itemCat === 'certificates' || itemCat === 'شهادة' || itemCat === 'شهادات');
                }

                if (match) {
                    found++;
                    const card = document.createElement('div');
                    card.className = cardTemplateType === 'team' ? 'card' : 'ink-card';
                    
                    if (cardTemplateType === 'team') {
                        card.innerHTML = `
                            <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="عضو">
                            <h3>${item.title || 'بدون اسم'}</h3>
                            <p>${item.desc || 'مهندس صيانة'}</p>
                        `;
                    } else {
                        card.innerHTML = `
                            <div>
                                <img src="${item.imageUrl || 'https://via.placeholder.com/200'}" alt="صورة">
                                <h3>${item.title || 'بدون عنوان'}</h3>
                                <p>${item.desc || 'لا يوجد وصف.'}</p>
                            </div>
                            <button class="btn-add-cart" onclick="addToCart('${item.title || 'منتج'}', 150)">إضافة للسلة 🛒</button>
                        `;
                    }
                    container.appendChild(card);
                }
            });

            if (found === 0) {
                container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: #777;">لا توجد عناصر مضافة في هذا القسم حالياً.</p>`;
            }
        }, (error) => {
            console.error("Firestore Error: ", error);
            container.innerHTML = `<p style="text-align: center; color: red;">خطأ في تحميل البيانات.</p>`;
        });
    });
}
