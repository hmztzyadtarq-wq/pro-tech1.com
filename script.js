// ==========================================
// ملف الجافاسكريبت الشامل - موقع ProTech
// ==========================================

// مصفوفة تخزين المنتجات داخل السلة
let cartItems = [];

// دالة فتح نافذة السلة وتحديث بيانات الفاتورة
function openCartModal() {
    let modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.style.display = 'flex';
        updateCartUI(); // تحديث عناصر الفاتورة فور فتحها
    }
}

// دالة إغلاق نافذة السلة
function closeCartModal() {
    let modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// دالة إضافة منتج إلى السلة من أي صفحة
function addToCart(name, price) {
    let existingItem = cartItems.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }
    updateCartUI();
    openCartModal(); // تفتح السلة تلقائياً ليرى العميل فاتورته بعد الإضافة
}

// دالة تحديث واجهة السلة (حساب الإجمالي، الكميات، وعدد العناصر في الـ Header)
function updateCartUI() {
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');

    let totalCount = 0;
    let totalPrice = 0;

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-color); padding: 20px;">السلة فارغة حالياً</p>';
        } else {
            cartItems.forEach((item, index) => {
                totalCount += item.quantity;
                totalPrice += item.price * item.quantity;

                let row = document.createElement('div');
                row.className = 'cart-item-row';
                row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); font-size: 14px;';
                
                row.innerHTML = `
                    <div style="flex: 2;"><strong>${item.name}</strong></div>
                    <div style="flex: 1; text-align: center;">${item.price} ج.م</div>
                    <div style="flex: 1; text-align: center;">
                        <button onclick="changeQuantity(${index}, -1)" style="padding: 2px 6px; cursor:pointer;">-</button>
                        <span style="margin: 0 6px;">${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)" style="padding: 2px 6px; cursor:pointer;">+</button>
                    </div>
                    <div style="flex: 1; text-align: left; font-weight: bold; color: var(--secondary-color);">${item.price * item.quantity} ج.م</div>
                `;
                cartItemsContainer.appendChild(row);
            });
        }
    }

    if (cartCountSpan) {
        cartCountSpan.innerText = totalCount;
    }
    if (cartTotalPrice) {
        cartTotalPrice.innerText = totalPrice + ' ج.م';
    }
}

// دالة تعديل الكميات داخل السلة (زيادة أو نقصان)
function changeQuantity(index, delta) {
    cartItems[index].quantity += delta;
    if (cartItems[index].quantity <= 0) {
        cartItems.splice(index, 1);
    }
    updateCartUI();
}

// دالة تنزيل وحفظ الفاتورة (طباعة أو حفظ كملف PDF عبر المتصفح)
function downloadInvoice() {
    if (cartItems.length === 0) {
        alert('السلة فارغة لتنزيل الفاتورة!');
        return;
    }
    window.print();
}

// دالة إتمام الشراء وإرسال الطلب للأدمن عبر الواتساب (بأسعار ومنتجات ثابتة لا يمكن للعميل التلاعب بها)
function checkoutToWhatsApp() {
    if (cartItems.length === 0) {
        alert('السلة فارغة، أضف منتجات أولاً!');
        return;
    }

    let adminPhoneNumber = "201000000000"; // رقم الواتساب الخاص بالأدمن
    let message = "مرحباً ProTech، أريد إتمام طلب الشراء التالي:\n\n------------------\n";
    
    let grandTotal = 0;
    cartItems.forEach((item, idx) => {
        let itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;
        message += `${idx + 1}- ${item.name} | الكمية: ${item.quantity} | السعر: ${itemTotal} ج.م\n`;
    });

    message += `------------------\nإجمالي المبلغ المطلوب: ${grandTotal} ج.م\nفي انتظار تأكيد الطلب.`;

    let encodedMessage = encodeURIComponent(message);
    let whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}