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

    const productForm = document.getElementById('productForm');
    const productTableBody = document.getElementById('productTableBody');

    // جلب وعرض المنتجات مباشرة من قاعدة البيانات
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
                    <td><button class="delete-btn" onclick="deleteProduct('${id}')" style="background-color: #dc3545; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">حذف</button></td>
                `;
                productTableBody.appendChild(row);
            });
        });
    }

    // إضافة منتج جديد إلى قاعدة بيانات Firebase
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
                    const imageUrl = event.target.result;
                    
                    db.collection("products").add({
                        name: name,
                        price: price,
                        desc: desc,
                        image: imageUrl,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        productForm.reset();
                        alert("تم إضافة المنتج بنجاح إلى قاعدة البيانات!");
                    })
                    .catch((error) => {
                        console.error("خطأ في الإضافة: ", error);
                    });
                };
                reader.readAsDataURL(imageFile);
            }
        });
    }
});

// دالة الحذف العامة
function deleteProduct(id) {
    if(confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        const db = firebase.firestore();
        db.collection("products").doc(id).delete().then(() => {
            console.log("تم الحذف بنجاح");
        }).catch((error) => {
            console.error("خطأ أثناء الحذف: ", error);
        });
    }
}
