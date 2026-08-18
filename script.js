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
