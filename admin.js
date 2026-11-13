/* ===================== تسجيل الدخول ===================== */
function isAdminUser(user){
    // لو ADMIN_EMAILS (في firebase.js) فيها إيميلات، بس أصحابها يدخلوا اللوحة
    if (!ADMIN_EMAILS.length) return true;
    return ADMIN_EMAILS.map(e => e.toLowerCase()).includes((user.email || '').toLowerCase());
}

function handleAuthChange(user){
    if (user && !isAdminUser(user)){
        auth.signOut();
        document.getElementById('loginError').textContent = 'الحساب ده مش مسموح له بدخول لوحة التحكم.';
        return;
    }
    document.getElementById('loginScreen').style.display = user ? 'none' : 'flex';
    if (user){
        loadAllData(); loadSettings(); loadOrders(); loadUsers();
        if (!ADMIN_EMAILS.length) showToast('تنبيه: ضيف إيميلك في ADMIN_EMAILS داخل firebase.js عشان تقفل اللوحة على حسابك بس', 'error');
    }
}
// بنأجّل التنفيذ لحد ما باقي الملف يتحمّل بالكامل
auth.onAuthStateChanged((user) => setTimeout(() => handleAuthChange(user), 0));

function doLogin(event){
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginInfo').textContent = '';
    auth.signInWithEmailAndPassword(email, password).catch(() => {
        document.getElementById('loginError').textContent = 'بيانات الدخول غير صحيحة أو الحساب غير موجود.';
    });
    return false;
}

// نسيت كلمة المرور: بيبعت رابط إعادة تعيين على الإيميل المكتوب
function forgotPassword(){
    const email = document.getElementById('loginEmail').value.trim();
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginInfo').textContent = '';
    if (!email){ document.getElementById('loginError').textContent = 'اكتب إيميلك في الخانة الأولى وبعدين دوس "نسيت كلمة المرور".'; return false; }
    auth.sendPasswordResetEmail(email)
        .then(() => { document.getElementById('loginInfo').textContent = 'تم إرسال رابط تغيير كلمة المرور لإيميلك (شوف الـ Spam كمان).'; })
        .catch(() => { document.getElementById('loginError').textContent = 'تعذر الإرسال — تأكد إن الإيميل مسجّل.'; });
    return false;
}
function doLogout(){ auth.signOut(); }

/* ===================== التنقل بين التبويبات ===================== */
const TAB_TITLES = {
    overview: 'نظرة عامة', slider: 'سلايدر الصفحة الرئيسية', machines: 'إدارة المكن والماكينات', inks: 'قسم الأحبار والمواد',
    banners: 'بانرات الصفحات', certificates: 'شهادات التقدير والصور',
    team: 'فريق العمل', orders: 'طلبات الصيانة والشراء', users: 'المستخدمون المسجلون', settings: 'الإعدادات العامة'
};
function switchTab(tabId, btnElement){
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu button').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
    document.getElementById('pageTitleHeader').innerText = TAB_TITLES[tabId];
}
function switchTabById(tabId){
    const btn = [...document.querySelectorAll('.sidebar-menu button')].find(b => b.getAttribute('onclick').includes(`'${tabId}'`));
    if (btn) switchTab(tabId, btn);
}

/* ===================== توست ===================== */
function showToast(msg, type = 'success'){
    const box = document.getElementById('toastBox');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${msg}`;
    box.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

/* ===================== معاينة الصورة ===================== */
function previewImage(inputId, previewId){
    const url = document.getElementById(inputId).value.trim();
    const img = document.getElementById(previewId);
    if (!img) return;
    if (!url){ img.style.display = 'none'; return; }
    img.src = url;
    img.style.display = 'block';
}

/* ===================== رفع صورة/فيديو من الجهاز ===================== */
function uploadFile(inputEl, targetFieldId, previewId, progressId){
    const file = inputEl.files[0];
    if (!file) return;
    const progressEl = progressId ? document.getElementById(progressId) : null;
    if (progressEl){ progressEl.style.display = 'inline'; progressEl.textContent = 'جاري الرفع... 0%'; }

    uploadMedia(file, (pct) => { if (progressEl) progressEl.textContent = `جاري الرفع... ${pct}%`; })
        .then((url) => {
            document.getElementById(targetFieldId).value = url;
            if (previewId) previewImage(targetFieldId, previewId);
            if (progressEl) progressEl.style.display = 'none';
            showToast('تم رفع الملف بنجاح');
        })
        .catch((err) => {
            if (progressEl) progressEl.style.display = 'none';
            showToast('فشل رفع الملف: ' + err.message, 'error');
        })
        .finally(() => { inputEl.value = ''; });
}

/* ===================== حالة التعديل ===================== */
let editingId = null;
let editingType = null;

const FIELD_MAP = {
    machine: { title:'machineTitle', desc:'machineDesc', image:'machineImage', category:'machineCategory', price:'machinePrice', video:'machineVideo', submitBtn:'machineSubmitBtn', banner:'machineEditBanner', preview:'machinePreview' },
    inks: { type:'inkType', title:'inkTitle', desc:'inkDesc', image:'inkImage', price:'inkPrice', video:'inkVideo', submitBtn:'inksSubmitBtn', banner:'inksEditBanner', preview:'inkPreview' },
    banners: { title:'bannerTitle', desc:'bannerDesc', image:'bannerImage', category:'bannerCategory', submitBtn:'bannersSubmitBtn', banner:'bannersEditBanner', preview:'bannerPreview' },
    certificates: { title:'certTitle', desc:'certDesc', image:'certImage', submitBtn:'certificatesSubmitBtn', banner:'certificatesEditBanner', preview:'certPreview' },
    team: { title:'teamTitle', desc:'teamDesc', image:'teamImage', submitBtn:'teamSubmitBtn', banner:'teamEditBanner', preview:'teamPreview', phone:'teamPhone', whatsapp:'teamWhatsapp', extraLink:'teamExtraLink', extraLinkLabel:'teamExtraLinkLabel' }
};

function editItem(id, type){
    const item = itemsCache[id];
    if (!item) return;
    const f = FIELD_MAP[type];
    editingId = id;
    editingType = type;

    document.getElementById(f.title).value = item.title || '';
    document.getElementById(f.desc).value = item.desc || '';
    document.getElementById(f.image).value = item.imageUrl || '';
    if (f.category) document.getElementById(f.category).value = item.category || '';
    if (f.type) document.getElementById(f.type).value = item.category || 'inks';
    if (f.price) document.getElementById(f.price).value = item.price || '';
    if (f.video) document.getElementById(f.video).value = item.videoUrl || '';
    if (f.phone) document.getElementById(f.phone).value = item.phone || '';
    if (f.whatsapp) document.getElementById(f.whatsapp).value = item.whatsapp || '';
    if (f.extraLink) document.getElementById(f.extraLink).value = item.extraLink || '';
    if (f.extraLinkLabel) document.getElementById(f.extraLinkLabel).value = item.extraLinkLabel || '';
    previewImage(f.image, f.preview);

    document.getElementById(f.submitBtn).innerHTML = '<i class="fa-solid fa-rotate"></i> تحديث العنصر';
    document.getElementById(f.banner).style.display = 'flex';
    switchTabById(type === 'machine' ? 'machines' : type);
    document.getElementById(f.title).scrollIntoView({ behavior:'smooth', block:'center' });
}

function cancelEdit(type){
    editingId = null;
    editingType = null;
    const f = FIELD_MAP[type];
    document.getElementById(type === 'machine' ? 'machineForm' : type + 'Form').reset();
    document.getElementById(f.submitBtn).innerHTML = '<i class="fa-solid fa-check"></i> حفظ';
    document.getElementById(f.banner).style.display = 'none';
    document.getElementById(f.preview).style.display = 'none';
}

/* ===================== إضافة / تحديث عنصر ===================== */
function saveItem(event, type){
    event.preventDefault();
    let data = {};

    if (type === 'machine'){
        const machineImage = document.getElementById('machineImage').value.trim();
        const machineVideo = document.getElementById('machineVideo').value.trim();
        if (!machineImage && !machineVideo){
            showToast('لازم تضيف صورة أو فيديو على الأقل', 'error');
            return false;
        }
        data = {
            category: document.getElementById('machineCategory').value,
            title: document.getElementById('machineTitle').value.trim(),
            desc: document.getElementById('machineDesc').value.trim(),
            imageUrl: machineImage,
            price: Number(document.getElementById('machinePrice').value) || 0,
            videoUrl: machineVideo
        };
    } else if (type === 'inks'){
        if (!document.getElementById('inkImage').value.trim()){ showToast('اختار صورة للمنتج من جهازك', 'error'); return false; }
        data = {
            category: document.getElementById('inkType').value,
            title: document.getElementById('inkTitle').value.trim(),
            desc: document.getElementById('inkDesc').value.trim(),
            imageUrl: document.getElementById('inkImage').value.trim(),
            price: Number(document.getElementById('inkPrice').value) || 0,
            videoUrl: document.getElementById('inkVideo').value.trim()
        };
    } else if (type === 'banners'){
        data = {
            category: document.getElementById('bannerCategory').value,
            title: document.getElementById('bannerTitle').value.trim(),
            desc: document.getElementById('bannerDesc').value.trim(),
            imageUrl: document.getElementById('bannerImage').value.trim()
        };
    } else if (type === 'certificates'){
        if (!document.getElementById('certImage').value.trim()){ showToast('اختار صورة الشهادة من جهازك', 'error'); return false; }
        data = {
            category: 'certificates',
            title: document.getElementById('certTitle').value.trim(),
            desc: document.getElementById('certDesc').value.trim(),
            imageUrl: document.getElementById('certImage').value.trim()
        };
    } else if (type === 'team'){
        if (!document.getElementById('teamImage').value.trim()){ showToast('اختار الصورة الشخصية من جهازك', 'error'); return false; }
        data = {
            category: 'team',
            title: document.getElementById('teamTitle').value.trim(),
            desc: document.getElementById('teamDesc').value.trim(),
            imageUrl: document.getElementById('teamImage').value.trim(),
            phone: document.getElementById('teamPhone').value.trim(),
            whatsapp: document.getElementById('teamWhatsapp').value.trim(),
            extraLink: document.getElementById('teamExtraLink').value.trim(),
            extraLinkLabel: document.getElementById('teamExtraLinkLabel').value.trim()
        };
    }

    const isUpdating = editingId && editingType === type;
    const promise = isUpdating
        ? db.collection('site_media').doc(editingId).update(data)
        : db.collection('site_media').add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });

    promise.then(() => {
        showToast(isUpdating ? 'تم تحديث العنصر بنجاح' : 'تم الحفظ وتحديث الموقع');
        cancelEdit(type);
    }).catch(err => showToast('حصل خطأ: ' + err.message, 'error'));

    return false;
}

/* ===================== حذف عنصر ===================== */
function deleteItem(id){
    if (!confirm('هل أنت متأكد من الحذف نهائيًا؟')) return;
    db.collection('site_media').doc(id).delete().then(() => showToast('تم الحذف بنجاح'))
      .catch(err => showToast('حصل خطأ أثناء الحذف: ' + err.message, 'error'));
}

/* ===================== تصنيف العناصر وجلبها ===================== */
const MACHINE_CATS = [
    'Bloprint 5.3',
    'Bloprint 5.3 - قطع غيار',
    'Bloprint 3.2',
    'Bloprint 3.2 - قطع غيار',
    'G2 5.3',
    'G2 5.3 - قطع غيار',
    'G2 3.2',
    'G2 3.2 - قطع غيار',
    'STP 5.3',
    'STP 5.3 - قطع غيار',
    'STP 3.2',
    'STP 3.2 - قطع غيار',
    'Aprint 5.3',
    'Aprint 5.3 - قطع غيار',
    'Aprint 3.2',
    'Aprint 3.2 - قطع غيار',
    'إيكو Bloprint 5.3',
    'إيكو Bloprint 5.3 - قطع غيار',
    'إيكو Bloprint 3.2',
    'إيكو Bloprint 3.2 - قطع غيار',
    'إيكو G2 5.3',
    'إيكو G2 5.3 - قطع غيار',
    'إيكو G2 3.2',
    'إيكو G2 3.2 - قطع غيار',
    'إيكو STP 5.3',
    'إيكو STP 5.3 - قطع غيار',
    'إيكو STP 3.2',
    'إيكو STP 3.2 - قطع غيار',
    'إيكو Aprint 5.3',
    'إيكو Aprint 5.3 - قطع غيار',
    'إيكو Aprint 3.2',
    'إيكو Aprint 3.2 - قطع غيار',
    'UV Bloprint فلات بد',
    'UV Bloprint فلات بد - قطع غيار',
    'UV Bloprint رول تو رول',
    'UV Bloprint رول تو رول - قطع غيار',
    'UV Bloprint هيبرد',
    'UV Bloprint هيبرد - قطع غيار',
    'UV Bloprint DTF',
    'UV Bloprint DTF - قطع غيار',
    'UV Bloprint 7 في 1',
    'UV Bloprint 7 في 1 - قطع غيار',
    'UV G2 فلات بد',
    'UV G2 فلات بد - قطع غيار',
    'UV G2 رول تو رول',
    'UV G2 رول تو رول - قطع غيار',
    'UV G2 هيبرد',
    'UV G2 هيبرد - قطع غيار',
    'UV G2 DTF',
    'UV G2 DTF - قطع غيار',
    'UV G2 7 في 1',
    'UV G2 7 في 1 - قطع غيار',
    'UV STP فلات بد',
    'UV STP فلات بد - قطع غيار',
    'UV STP رول تو رول',
    'UV STP رول تو رول - قطع غيار',
    'UV STP هيبرد',
    'UV STP هيبرد - قطع غيار',
    'UV STP DTF',
    'UV STP DTF - قطع غيار',
    'UV STP 7 في 1',
    'UV STP 7 في 1 - قطع غيار',
    'UV Aprint فلات بد',
    'UV Aprint فلات بد - قطع غيار',
    'UV Aprint رول تو رول',
    'UV Aprint رول تو رول - قطع غيار',
    'UV Aprint هيبرد',
    'UV Aprint هيبرد - قطع غيار',
    'UV Aprint DTF',
    'UV Aprint DTF - قطع غيار',
    'UV Aprint 7 في 1',
    'UV Aprint 7 في 1 - قطع غيار',
    'لمينيشن',
    'بلوتر / ولتريلوتر'
];
let itemsCache = {};

function classify(category){
    if (MACHINE_CATS.includes(category)) return 'machines';
    if (category === 'inks' || category === 'متجر_مكن') return 'inks';
    if ((category || '').startsWith('banner_')) return 'banners';
    if (category === 'hero_slide') return 'slider';
    if (category === 'certificates') return 'certificates';
    if (category === 'team') return 'team';
    return null;
}

function setText(id, v){ const el = document.getElementById(id); if (el) el.textContent = v; }

function loadAllData(){
    db.collection('site_media').onSnapshot((snapshot) => {
        itemsCache = {};
        const counts = { machines:0, inks:0, banners:0, certificates:0, team:0, slider:0 };
        snapshot.forEach(doc => {
            itemsCache[doc.id] = doc.data();
            const bucket = classify(doc.data().category);
            if (bucket) counts[bucket]++;
        });
        setText('statMachines', counts.machines);
        setText('statInks', counts.inks);
        setText('statCerts', counts.certificates);
        setText('statTeam', counts.team);

        renderTable('machines'); renderTable('inks'); renderTable('banners');
        renderTable('certificates'); renderTable('team');
        renderSlider(); renderChecklist();
    }, (err) => {
        document.getElementById('connectionStatus').className = 'status-badge offline';
        document.getElementById('connectionStatus').innerHTML = '<i class="fa-solid fa-circle"></i> تعذر الاتصال';
    });
}

function bannerCategoryLabel(cat){
    return {
        banner_index:'الرئيسية (قديم — الموقع بيتجاهله، استخدم السلايدر)',
        banner_videos:'المكن',
        banner_inks:'الأحبار',
        banner_team:'الفريق',
        banner_outdoor_bloprint_53:'أوت دور - Bloprint 5.3',
        banner_outdoor_bloprint_32:'أوت دور - Bloprint 3.2',
        banner_outdoor_g2_53:'أوت دور - G2 5.3',
        banner_outdoor_g2_32:'أوت دور - G2 3.2',
        banner_outdoor_stp_53:'أوت دور - STP 5.3',
        banner_outdoor_stp_32:'أوت دور - STP 3.2',
        banner_outdoor_aprint_53:'أوت دور - Aprint 5.3',
        banner_outdoor_aprint_32:'أوت دور - Aprint 3.2',
        banner_eco_bloprint_53:'إيكو - Bloprint 5.3',
        banner_eco_bloprint_32:'إيكو - Bloprint 3.2',
        banner_eco_g2_53:'إيكو - G2 5.3',
        banner_eco_g2_32:'إيكو - G2 3.2',
        banner_eco_stp_53:'إيكو - STP 5.3',
        banner_eco_stp_32:'إيكو - STP 3.2',
        banner_eco_aprint_53:'إيكو - Aprint 5.3',
        banner_eco_aprint_32:'إيكو - Aprint 3.2',
        banner_uv_bloprint:'UV - Bloprint',
        banner_uv_g2:'UV - G2',
        banner_uv_stp:'UV - STP',
        banner_uv_aprint:'UV - Aprint'
    }[cat] || cat;
}

function renderTable(bucket, searchTerm){
    searchTerm = (searchTerm || document.querySelector(`#${bucket} .table-toolbar input`)?.value || '').trim().toLowerCase();
    const rows = Object.entries(itemsCache).filter(([id, item]) => classify(item.category) === bucket)
        .filter(([id, item]) => !searchTerm || (item.title || '').toLowerCase().includes(searchTerm));

    document.getElementById(bucket + 'Count').textContent = `${rows.length} عنصر`;
    const tbody = document.getElementById(bucket + 'TableBody');
    const formType = bucket === 'machines' ? 'machine' : bucket;

    if (!rows.length){
        const colspan = { machines:5, inks:4, banners:4, certificates:3, team:4 }[bucket];
        tbody.innerHTML = `<tr class="empty-row"><td colspan="${colspan}">لا توجد عناصر بعد.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(([id, item]) => {
        const img = `<img src="${item.imageUrl || 'https://via.placeholder.com/44'}" alt="">`;
        const actions = `<button class="btn-edit-sm" onclick="editItem('${id}','${formType}')"><i class="fa-solid fa-pen"></i> تعديل</button><button class="btn-danger-sm" onclick="deleteItem('${id}')"><i class="fa-solid fa-trash"></i> حذف</button>`;

        if (bucket === 'machines') return `<tr><td>${img}</td><td><strong>${item.title || ''}</strong></td><td><span class="cat-chip">${item.category}</span></td><td class="price-chip">${item.price ? item.price + ' ج.م' : '—'}</td><td>${actions}</td></tr>`;
        if (bucket === 'inks') return `<tr><td>${img}</td><td><strong>${item.title || ''}</strong>${item.category === 'متجر_مكن' ? ' <span class="cat-chip">ماكينة للبيع</span>' : ''}</td><td class="price-chip">${item.price || 0} ج.م</td><td>${actions}</td></tr>`;
        if (bucket === 'banners') return `<tr><td>${img}</td><td><span class="cat-chip">${bannerCategoryLabel(item.category)}</span></td><td>${item.title || ''}</td><td>${actions}</td></tr>`;
        if (bucket === 'certificates') return `<tr><td>${img}</td><td>${item.title || ''}</td><td>${actions}</td></tr>`;
        if (bucket === 'team') return `<tr><td>${img}</td><td><strong>${item.title || ''}</strong></td><td>${item.desc || ''}</td><td>${actions}</td></tr>`;
    }).join('');
}

/* ===================== الإعدادات العامة ===================== */
let currentSettings = {};

function loadSettings(){
    db.collection('settings').doc('site_config').get().then(doc => {
        currentSettings = doc.exists ? doc.data() : {};
        const s = currentSettings;
        document.getElementById('setPhone1').value = s.phone1 || '';
        document.getElementById('setPhone2').value = s.phone2 || '';
        document.getElementById('setCartPhone').value = s.cartPhone || '';
        document.getElementById('setWalletVodafone').value = s.walletVodafone || '';
        document.getElementById('setWalletEtisalat').value = s.walletEtisalat || '';
        document.getElementById('setWalletOrange').value = s.walletOrange || '';
        document.getElementById('setTopbarStatus').value = s.topbarStatus || '';
        document.getElementById('setTopbarHours').value = s.topbarHours || '';
        document.getElementById('setPromoEnabled').checked = !!s.promoEnabled;
        document.getElementById('setPromoText').value = s.promoText || '';
        document.getElementById('setPromoLink').value = s.promoLink || '';
        for (let i = 1; i <= 4; i++){
            document.getElementById('setStat' + i + 'Value').value = s['stat' + i + 'Value'] ?? '';
            document.getElementById('setStat' + i + 'Label').value = s['stat' + i + 'Label'] || '';
        }
        document.getElementById('heroInterval').value = s.heroInterval || 3;
        renderChecklist();
        renderConsultManager();
        renderSocialManager();
        renderAdsManager();
        renderCategoryImagesManager();
    });
}

/* ---------- أرقام الاستشارة الفنية ---------- */
function renderConsultManager(){
    const list = currentSettings.consultationNumbers || [];
    const box = document.getElementById('consultNumbersManager');
    box.innerHTML = list.length ? list.map((c, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--paper);padding:10px 14px;border-radius:var(--radius-sm);border:1px solid var(--line)">
            <span><i class="fa-brands fa-whatsapp" style="color:var(--success)"></i> ${c.name} — ${c.phone}</span>
            <button type="button" class="btn-danger-sm" onclick="removeConsultationNumber(${i})"><i class="fa-solid fa-trash"></i></button>
        </div>`).join('') : `<p style="color:var(--muted);font-size:13px">مفيش أرقام مخصصة مضافة لسه.</p>`;
}
function addConsultationNumber(){
    const name = document.getElementById('newConsultName').value.trim();
    const phone = document.getElementById('newConsultPhone').value.trim();
    if (!name || !phone){ showToast('اكتب الاسم والرقم الأول', 'error'); return; }
    currentSettings.consultationNumbers = currentSettings.consultationNumbers || [];
    currentSettings.consultationNumbers.push({ name, phone });
    db.collection('settings').doc('site_config').set({ consultationNumbers: currentSettings.consultationNumbers }, { merge:true })
      .then(() => { showToast('تمت إضافة الرقم'); document.getElementById('newConsultName').value=''; document.getElementById('newConsultPhone').value=''; renderConsultManager(); })
      .catch(err => showToast('خطأ: ' + err.message, 'error'));
}
function removeConsultationNumber(i){
    currentSettings.consultationNumbers.splice(i, 1);
    db.collection('settings').doc('site_config').set({ consultationNumbers: currentSettings.consultationNumbers }, { merge:true })
      .then(() => { showToast('تم الحذف'); renderConsultManager(); });
}

/* ---------- روابط الفوتر ---------- */
const PLATFORM_LABELS = { whatsapp:'واتساب', facebook:'فيسبوك', instagram:'إنستجرام', tiktok:'تيك توك', youtube:'يوتيوب', email:'إيميل', website:'موقع' };
function renderSocialManager(){
    const list = currentSettings.socialLinks || [];
    const box = document.getElementById('socialLinksManager');
    box.innerHTML = list.length ? list.map((l, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--paper);padding:10px 14px;border-radius:var(--radius-sm);border:1px solid var(--line)">
            <span>${PLATFORM_LABELS[l.platform] || l.platform} — ${l.url}</span>
            <button type="button" class="btn-danger-sm" onclick="removeSocialLink(${i})"><i class="fa-solid fa-trash"></i></button>
        </div>`).join('') : `<p style="color:var(--muted);font-size:13px">مفيش روابط مخصصة مضافة لسه.</p>`;
}
function addSocialLink(){
    const platform = document.getElementById('newSocialPlatform').value;
    const url = document.getElementById('newSocialUrl').value.trim();
    if (!url){ showToast('اكتب الرابط الأول', 'error'); return; }
    currentSettings.socialLinks = currentSettings.socialLinks || [];
    currentSettings.socialLinks.push({ platform, url });
    db.collection('settings').doc('site_config').set({ socialLinks: currentSettings.socialLinks }, { merge:true })
      .then(() => { showToast('تمت إضافة الرابط'); document.getElementById('newSocialUrl').value=''; renderSocialManager(); })
      .catch(err => showToast('خطأ: ' + err.message, 'error'));
}
function removeSocialLink(i){
    currentSettings.socialLinks.splice(i, 1);
    db.collection('settings').doc('site_config').set({ socialLinks: currentSettings.socialLinks }, { merge:true })
      .then(() => { showToast('تم الحذف'); renderSocialManager(); });
}

/* ---------- شريط الإعلانات الدوّار ---------- */
function renderAdsManager(){
    const list = currentSettings.ads || [];
    const box = document.getElementById('adsManager');
    box.innerHTML = list.length ? list.map((a, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--paper);padding:10px 14px;border-radius:var(--radius-sm);border:1px solid var(--line)">
            <span>${a.text}${a.link ? ' — <span style="color:var(--muted);font-size:11.5px">' + a.link + '</span>' : ''}</span>
            <button type="button" class="btn-danger-sm" onclick="removeAd(${i})"><i class="fa-solid fa-trash"></i></button>
        </div>`).join('') : `<p style="color:var(--muted);font-size:13px">مفيش إعلانات مضافة لسه.</p>`;
}
function addAd(){
    const text = document.getElementById('newAdText').value.trim();
    const link = document.getElementById('newAdLink').value.trim();
    if (!text){ showToast('اكتب نص الإعلان الأول', 'error'); return; }
    currentSettings.ads = currentSettings.ads || [];
    currentSettings.ads.push({ text, link });
    db.collection('settings').doc('site_config').set({ ads: currentSettings.ads }, { merge:true })
      .then(() => { showToast('تمت إضافة الإعلان'); document.getElementById('newAdText').value=''; document.getElementById('newAdLink').value=''; renderAdsManager(); })
      .catch(err => showToast('خطأ: ' + err.message, 'error'));
}
function removeAd(i){
    currentSettings.ads.splice(i, 1);
    db.collection('settings').doc('site_config').set({ ads: currentSettings.ads }, { merge:true })
      .then(() => { showToast('تم الحذف'); renderAdsManager(); });
}

/* ---------- صور تصنيفات المكن ---------- */
const CAT_IMAGE_LABELS = {
    UV_MAIN:'مربع UV الرئيسي', 'إكو سولفينت':'إكو سولفينت', 'أوت دور':'أوت دور', 'لمينيشن':'لمينيشن',
    'بلوتر / ولتريلوتر':'بلوتر / ولتريلوتر',
    shared_bloprint:'ماركة Bloprint (أوت دور/إيكو/UV)', shared_g2:'ماركة G2 (أوت دور/إيكو/UV)',
    shared_stp:'ماركة STP (أوت دور/إيكو/UV)', shared_aprint:'ماركة Aprint (أوت دور/إيكو/UV)'
};
function renderCategoryImagesManager(){
    const imgs = currentSettings.categoryImages || {};
    const box = document.getElementById('categoryImagesManager');
    const keys = Object.keys(imgs);
    box.innerHTML = keys.length ? keys.map(key => `
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--paper);padding:10px 14px;border-radius:var(--radius-sm);border:1px solid var(--line)">
            <span style="display:flex;align-items:center;gap:10px"><img src="${imgs[key]}" style="width:32px;height:32px;border-radius:6px;object-fit:cover"> ${CAT_IMAGE_LABELS[key] || key}</span>
            <button type="button" class="btn-danger-sm" onclick="removeCategoryImage('${key}')"><i class="fa-solid fa-trash"></i></button>
        </div>`).join('') : `<p style="color:var(--muted);font-size:13px">مفيش صور تصنيفات مضافة لسه — هتفضل الأيقونات الافتراضية ظاهرة.</p>`;
}
function addCategoryImage(){
    const key = document.getElementById('newCatImageKey').value;
    const url = document.getElementById('newCatImageUrl').value.trim();
    if (!url){ showToast('اختار صورة التصنيف الأول', 'error'); return; }
    currentSettings.categoryImages = currentSettings.categoryImages || {};
    currentSettings.categoryImages[key] = url;
    db.collection('settings').doc('site_config').set({ categoryImages: currentSettings.categoryImages }, { merge:true })
      .then(() => { showToast('تم حفظ صورة التصنيف'); document.getElementById('newCatImageUrl').value=''; renderCategoryImagesManager(); })
      .catch(err => showToast('خطأ: ' + err.message, 'error'));
}
function removeCategoryImage(key){
    delete currentSettings.categoryImages[key];
    db.collection('settings').doc('site_config').set({ categoryImages: currentSettings.categoryImages }, { merge:true })
      .then(() => { showToast('تم الحذف'); renderCategoryImagesManager(); });
}

function saveSettings(event){
    if (event && event.preventDefault) event.preventDefault();
    const data = {
        phone1: document.getElementById('setPhone1').value.trim(),
        phone2: document.getElementById('setPhone2').value.trim(),
        cartPhone: document.getElementById('setCartPhone').value.trim(),
        walletVodafone: document.getElementById('setWalletVodafone').value.trim(),
        walletEtisalat: document.getElementById('setWalletEtisalat').value.trim(),
        walletOrange: document.getElementById('setWalletOrange').value.trim(),
        topbarStatus: document.getElementById('setTopbarStatus').value.trim(),
        topbarHours: document.getElementById('setTopbarHours').value.trim(),
        promoEnabled: document.getElementById('setPromoEnabled').checked,
        promoText: document.getElementById('setPromoText').value.trim(),
        promoLink: document.getElementById('setPromoLink').value.trim()
    };
    for (let i = 1; i <= 4; i++){
        const v = document.getElementById('setStat' + i + 'Value').value.trim();
        data['stat' + i + 'Value'] = v === '' ? firebase.firestore.FieldValue.delete() : Number(v);
        data['stat' + i + 'Label'] = document.getElementById('setStat' + i + 'Label').value.trim();
    }
    db.collection('settings').doc('site_config').set(data, { merge:true })
      .then(() => { Object.assign(currentSettings, data); renderChecklist(); showToast('تم حفظ الإعدادات — هتظهر في الموقع خلال لحظات'); })
      .catch(err => showToast('حصل خطأ: ' + err.message, 'error'));
    return false;
}

/* ===================== الطلبات ===================== */
let ordersCache = {};
function loadOrders(){
    db.collection('orders').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        ordersCache = {};
        snapshot.forEach(doc => ordersCache[doc.id] = doc.data());
        renderOrders(); renderOverviewOrders();
    }, (err) => console.error('loadOrders error:', err.message));
}
function renderOrders(searchTerm){
    searchTerm = (searchTerm || document.querySelector('#orders .table-toolbar input')?.value || '').trim().toLowerCase();
    const rows = Object.entries(ordersCache).filter(([id, o]) =>
        !searchTerm || (o.customerName || '').toLowerCase().includes(searchTerm) || (o.phone || '').includes(searchTerm));

    document.getElementById('ordersCount').textContent = `${rows.length} طلب`;
    const tbody = document.getElementById('ordersTableBody');
    if (!rows.length){ tbody.innerHTML = `<tr class="empty-row"><td colspan="8">لا توجد طلبات بعد.</td></tr>`; return; }

    const paymentLabels = { cash:'الدفع عند الاستلام', wallet:'محفظة إلكترونية', card:'فيزا / بطاقة' };
    const walletLabels = { vodafone:'فودافون كاش', etisalat:'اتصالات كاش', orange:'أورانج كاش' };
    tbody.innerHTML = rows.map(([id, o]) => {
        const typeLabel = o.type === 'purchase' ? 'شراء' : 'صيانة';
        let paymentCell = '—';
        if (o.paymentMethod){
            const methodText = paymentLabels[o.paymentMethod] || o.paymentMethod;
            const providerText = o.paymentMethod === 'wallet' && o.walletProvider ? ` (${walletLabels[o.walletProvider] || o.walletProvider})` : '';
            const refText = o.paymentRef ? `<br><span style="font-family:var(--font-mono);font-size:11px;color:var(--muted)">${o.paymentRef}</span>` : '';
            paymentCell = `${methodText}${providerText}${refText}`;
        }
        const statusBadge = o.status === 'approved'
            ? `<span class="status-badge">تمت الموافقة</span>`
            : `<span class="status-badge offline">قيد المراجعة</span>`;
        const approveLabel = (o.paymentMethod && o.paymentMethod !== 'cash' && (o.paymentStatus === 'awaiting_confirmation' || o.paymentStatus === 'awaiting_link')) ? 'تأكيد الدفع' : 'موافقة';
        const approveBtn = o.status === 'approved' ? '' : `<button class="btn-edit-sm" onclick="approveOrder('${id}')"><i class="fa-solid fa-check"></i> ${approveLabel}</button>`;
        return `<tr>
            <td><span class="cat-chip">${typeLabel}</span></td>
            <td><strong>${o.customerName || '—'}</strong></td>
            <td>${o.phone || '—'}</td>
            <td style="max-width:220px">${o.details || ''}</td>
            <td class="price-chip">${o.total ? o.total + ' ج.م' : '—'}</td>
            <td style="font-size:12px">${paymentCell}</td>
            <td>${statusBadge}</td>
            <td>${approveBtn}<button class="btn-danger-sm" onclick="deleteOrder('${id}')"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}
function approveOrder(id){
    const o = ordersCache[id];
    const updates = { status:'approved' };
    if (o && o.paymentMethod && o.paymentMethod !== 'cash') updates.paymentStatus = 'confirmed';
    db.collection('orders').doc(id).update(updates).then(() => showToast('تم تأكيد الطلب'));
}
function deleteOrder(id){
    if (!confirm('حذف هذا الطلب نهائيًا؟')) return;
    db.collection('orders').doc(id).delete().then(() => showToast('تم حذف الطلب'));
}

/* ===================== المستخدمون المسجلون ===================== */
let usersCache = {};
function loadUsers(){
    db.collection('users').onSnapshot((snapshot) => {
        usersCache = {};
        snapshot.forEach(doc => usersCache[doc.id] = doc.data());
        // نعد إعجابات كل مستخدم على حدة (استعلام منفصل خفيف لكل مستخدم)
        Object.keys(usersCache).forEach(uid => {
            db.collection('likes').where('userId', '==', uid).get().then(likesSnap => {
                usersCache[uid].likesCount = likesSnap.size;
                renderUsers();
            });
        });
        renderUsers(); setText('statUsers', Object.keys(usersCache).length);
    }, (err) => console.error('loadUsers error:', err.message));
}
function renderUsers(searchTerm){
    searchTerm = (searchTerm || document.querySelector('#users .table-toolbar input')?.value || '').trim().toLowerCase();
    const rows = Object.entries(usersCache).filter(([id, u]) =>
        !searchTerm || (u.email || '').toLowerCase().includes(searchTerm) || (u.phone || '').includes(searchTerm));

    document.getElementById('usersCount').textContent = `${rows.length} مستخدم`;
    const tbody = document.getElementById('usersTableBody');
    if (!rows.length){ tbody.innerHTML = `<tr class="empty-row"><td colspan="4">لا يوجد مستخدمون مسجلون بعد.</td></tr>`; return; }

    tbody.innerHTML = rows.map(([id, u]) => {
        const date = u.createdAt && u.createdAt.toDate ? u.createdAt.toDate().toLocaleDateString('ar-EG') : '—';
        return `<tr>
            <td><strong>${u.email || '—'}</strong></td>
            <td>${u.phone || '—'}</td>
            <td style="font-family:var(--font-mono);font-size:12px">${date}</td>
            <td>${u.likesCount != null ? u.likesCount : '...'}</td>
        </tr>`;
    }).join('');
}


/* ===================== سلايدر الصفحة الرئيسية ===================== */
function sliderItems(){
    return Object.entries(itemsCache).filter(([id, it]) => it.category === 'hero_slide')
        .sort((a, b) => (a[1].order ?? 1e9) - (b[1].order ?? 1e9) ||
            ((a[1].createdAt && a[1].createdAt.seconds) || 0) - ((b[1].createdAt && b[1].createdAt.seconds) || 0));
}
function renderSlider(){
    const list = sliderItems();
    setText('sliderCount', list.length + ' صورة');
    const grid = document.getElementById('sliderGrid');
    if (!grid) return;
    if (!list.length){
        grid.innerHTML = '<p class="hint">مفيش صور لسه — الموقع بيعرض الصورة الافتراضية. ارفع أول صورة من فوق.</p>';
        return;
    }
    grid.innerHTML = list.map(([id, it], i) => `
        <div class="slide-card">
            <span class="slide-num">${i + 1}</span>
            <img src="${it.imageUrl}" alt="">
            <div class="slide-actions">
                <button type="button" class="icon-btn" title="قدّم" ${i === 0 ? 'disabled' : ''} onclick="moveSlide('${id}', -1)"><i class="fa-solid fa-arrow-right"></i></button>
                <button type="button" class="icon-btn" title="أخّر" ${i === list.length - 1 ? 'disabled' : ''} onclick="moveSlide('${id}', 1)"><i class="fa-solid fa-arrow-left"></i></button>
                <button type="button" class="icon-btn danger" title="حذف" onclick="deleteItem('${id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`).join('');
}
async function uploadSlides(inputEl){
    const files = [...inputEl.files];
    if (!files.length) return;
    const prog = document.getElementById('sliderProgress');
    prog.style.display = 'inline';
    let order = sliderItems().reduce((m, [id, it]) => Math.max(m, it.order ?? 0), 0);
    let done = 0;
    for (let i = 0; i < files.length; i++){
        try {
            const url = await uploadMedia(files[i], (pct) => { prog.textContent = `جاري رفع صورة ${i + 1} من ${files.length}... ${pct}%`; });
            await db.collection('site_media').add({ category:'hero_slide', imageUrl:url, order: ++order, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            done++;
        } catch (err){
            showToast(`صورة ${i + 1}: ${err.message}`, 'error');
        }
    }
    prog.style.display = 'none';
    inputEl.value = '';
    if (done) showToast(`تم رفع ${done} صورة للبانر`);
}
function addSlideUrl(){
    const input = document.getElementById('sliderUrl');
    const url = input.value.trim();
    if (!url){ showToast('الصق رابط الصورة الأول', 'error'); return; }
    const order = sliderItems().reduce((m, [id, it]) => Math.max(m, it.order ?? 0), 0) + 1;
    db.collection('site_media').add({ category:'hero_slide', imageUrl:url, order, createdAt: firebase.firestore.FieldValue.serverTimestamp() })
        .then(() => { input.value = ''; showToast('تمت إضافة الصورة'); })
        .catch(err => showToast('حصل خطأ: ' + err.message, 'error'));
}
function moveSlide(id, dir){
    const ids = sliderItems().map(([i]) => i);
    const from = ids.indexOf(id), to = from + dir;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    const batch = db.batch();
    ids.forEach((i, n) => batch.update(db.collection('site_media').doc(i), { order: n + 1 }));
    batch.commit().catch(err => showToast('حصل خطأ: ' + err.message, 'error'));
}
function saveHeroInterval(){
    const v = Number(document.getElementById('heroInterval').value);
    if (!(v >= 1 && v <= 30)){ showToast('اكتب رقم من 1 لـ 30 ثانية', 'error'); return; }
    db.collection('settings').doc('site_config').set({ heroInterval: v }, { merge:true })
        .then(() => { currentSettings.heroInterval = v; showToast('تم حفظ سرعة التبديل'); })
        .catch(err => showToast('حصل خطأ: ' + err.message, 'error'));
}

/* ===================== نظرة عامة: آخر الطلبات + الجاهزية ===================== */
function renderOverviewOrders(){
    const rows = Object.entries(ordersCache);
    const pending = rows.filter(([id, o]) => o.status !== 'approved').length;
    setText('statOrdersPending', pending);
    const badge = document.getElementById('ordersBadge');
    if (badge){ badge.textContent = pending; badge.style.display = pending ? '' : 'none'; }
    const tbody = document.getElementById('overviewOrders');
    if (!tbody) return;
    if (!rows.length){ tbody.innerHTML = '<tr class="empty-row"><td colspan="4">لا توجد طلبات بعد.</td></tr>'; return; }
    tbody.innerHTML = rows.slice(0, 5).map(([id, o]) => `<tr>
        <td><span class="cat-chip">${o.type === 'purchase' ? 'شراء' : 'صيانة'}</span></td>
        <td><strong>${o.customerName || '—'}</strong></td>
        <td class="price-chip">${o.total ? o.total + ' ج.م' : '—'}</td>
        <td>${o.status === 'approved' ? '<span class="status-badge">تمت الموافقة</span>' : '<span class="status-badge offline">قيد المراجعة</span>'}</td>
    </tr>`).join('');
}
function renderChecklist(){
    const box = document.getElementById('readyList');
    if (!box) return;
    const s = currentSettings || {};
    const count = (cat) => Object.values(itemsCache).filter(it => it.category === cat).length;
    const anyOf = (arr) => Object.values(itemsCache).filter(it => arr.includes(it.category)).length;
    const items = [
        { ok: !!s.phone1, text: 'رقم واتساب المهندس الأول', tab: 'settings' },
        { ok: sliderItems().length >= 2, text: 'صور البانر (2 على الأقل عشان تتبدّل)', tab: 'slider' },
        { ok: anyOf(MACHINE_CATS) > 0, text: 'ماكينات مضافة', tab: 'machines' },
        { ok: count('inks') > 0, text: 'منتجات في المتجر', tab: 'inks' },
        { ok: count('certificates') > 0, text: 'شهادات تقدير', tab: 'certificates' },
        { ok: !!(s.walletVodafone || s.walletEtisalat || s.walletOrange), text: 'رقم محفظة إلكترونية للدفع', tab: 'settings' },
        { ok: Array.isArray(s.socialLinks) && s.socialLinks.length > 0, text: 'روابط التواصل في الفوتر', tab: 'settings' },
        { ok: ADMIN_EMAILS.length > 0, text: 'قفل اللوحة على إيميلك (ADMIN_EMAILS في firebase.js)', tab: null }
    ];
    setText('readyCount', items.filter(i => i.ok).length + '/' + items.length);
    box.innerHTML = items.map(i => `<li class="${i.ok ? 'ok' : 'todo'}">
        <i class="fa-solid ${i.ok ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
        <span>${i.text}</span>
        ${!i.ok && i.tab ? `<a class="link-btn" onclick="switchTabById('${i.tab}')">اضبطها</a>` : ''}
    </li>`).join('');
}

/* ===================== أقسام الإعدادات ===================== */
function switchSettingsSection(sec, btn){
    document.querySelectorAll('#settings .settings-sec').forEach(el => el.classList.toggle('active', el.dataset.sec === sec));
    document.querySelectorAll('#settingsNav button').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
}
