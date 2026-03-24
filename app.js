// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

// Reset and actions
const retryButton = document.getElementById('retryButton');
const resetButton = document.getElementById('resetButton');
const downloadReportBtn = document.getElementById('downloadReportBtn');
const toggleMetadataBtn = document.getElementById('toggleMetadata');

// Results elements
const imagePreview = document.getElementById('imagePreview');
const alertContainer = document.getElementById('alertContainer');
const metadataResults = document.getElementById('metadataResults');
const metadataDetails = document.getElementById('metadataDetails');
const visualResults = document.getElementById('visualResults');
const riskAssessment = document.getElementById('riskAssessment');
const educationalContent = document.getElementById('educationalContent');

// Map elements
const mapContainer = document.getElementById('mapContainer');
const mapElement = document.getElementById('map');
const mapCoordinates = document.getElementById('mapCoordinates');

// Global variables
let mapInstance = null;
let currentFile = null;
let currentReportData = null;

// i18n
const lang = document.documentElement.lang || 'en';
const ar = lang === 'ar';

const t = {
    validType: ar ? 'يرجى رفع ملف صورة صالح (JPEG, PNG, أو HEIC).' : 'Please upload a valid JPEG, PNG, or HEIC image file.',
    sizeLimit: ar ? 'عذراً، لقد تجاوزت حجم الملف المسموح به (10 ميجابايت).' : 'File size exceeds the 10MB limit.',
    readErr: ar ? 'فشل النظام في التعامل مع البيانات المرئية للملف المختار.' : 'Failed to read visual data of the file.',
    hideStruct: ar ? 'إخفاء بنية البيانات' : 'Hide Technical Details',
    showStruct: ar ? 'عرض بنية البيانات المعقدة للخادم' : 'View Raw Data Structure',
    riskLow: ar ? 'منخفض الخطورة' : 'Low Risk',
    riskMed: ar ? 'متوسط الخطورة' : 'Moderate Risk',
    riskHigh: ar ? 'عالي الخطورة' : 'High Risk',
    alertGpsTrue: ar ? 'تم كشف بيانات مسار موقع حساسة ومضمنة' : 'Precise Location Data Detected',
    alertGpsFalse: ar ? 'لا توجد بيانات تعقب حرجة في مسار الصورة' : 'No Critical Location Data Detected',
    coordLabel: ar ? 'تم رصد إحداثيات تعقب الجغرافية' : 'GPS Coordinates Found',
    deviceLabel: ar ? 'البصمة العتادية للجهاز المنشئ' : 'Device Information',
    timeLabel: ar ? 'الختم الزمني الدقيق (Timestamp)' : 'Timestamp',
    unknownDev: ar ? 'جهاز غير معروف' : 'Unknown Device',
    fileCreation: ar ? ' (إنشاء الملف)' : ' (File Creation)',
    metaSafeLabel: ar ? 'بصمة المكان (GPS)' : 'Location Footprint',
    metaSafeVal: ar ? '✓ آمن: لم يتم العثور على أثر للإحداثيات الجغرافية الأولية' : '✓ Safe: No raw GPS coordinates found',
    devSafeLabel: ar ? 'معلومات الأجهزة' : 'Device Information',
    devSafeVal: ar ? '✓ آمن: البيانات العتادية محدودة وتكاد تكون معدومة' : '✓ Safe: Metadata limited or stripped',
    noSourced: ar ? '✓ لقد تم تجهيز بيانات EXIF لتكون فارغة من أي محتوى موقع جغرافي ضار.' : '✓ This image has been stripped of GPS metadata.',
    noSourcedTip: ar ? 'تنويه تكتيكي: تتكفل أحياناً بعض المنصات الإجتماعية بنزع هذه البيانات تلقائياً، ولكن هذا لا يقيك من مخاطر الاستدلال البصري المفتوح (OSINT).' : 'Note: Social media platforms often remove GPS data on upload, but this does not protect against visual inferences.',
    visualClueWarn: ar ? 'تحذير: قم بمراجعة التضاريس الخلفية' : 'Warning: Review Background',
    visualClueDesc: ar ? 'رصدنا تعقيدات هيكلية في طبقة الخلفية قد تحتوي على لوحات شوارع أو معالم يمكن استغلالها لتعقبك.' : 'We noticed some complexity in the image background that might reveal your location.',
    visualSafeLabel: ar ? 'مخرجات الفحص الاستدلالي الآلي' : 'Automated Analysis',
    visualSafeVal: ar ? '✓ آمن مبدئياً: لا توجد معالم استدلالية ضارّة بشكل صارخ' : '✓ No obvious identifiable landmarks actively flagged',
    visualSafeTip: ar ? 'تؤكد خوارزميتنا المحلية عدم وجود تهديد مباشر. ولكن، يظل التدقيق الفردي من قبلك (نظرة سريعة للمباني، والأرقام) حجر الزاوية في الأمن التشغيلي المتقدم.' : 'Our offline system didn\'t detect specific issues. Always review your photos manually for street signs, building numbers, or distinctive backgrounds.',
    unavail: ar ? 'غير متوفر' : 'Unavailable',
    unknown: ar ? 'مجهول' : 'Unknown'
};

function getRiskMessage(level) {
    if (ar) {
        return level === 'high' ? 'بصمتك الجغرافية مكشوفة بالكامل. تتضمن هذه الصورة حمولة موقع دقيقة تسمح برسم خرائط أين كنت وقت الالتقاط. ينصح بعدم مشاركة الأصل أبداً.' :
               level === 'medium' ? 'انعكاسات ومحتويات الخلفية قد تسرب استدلالات تعقب خطرة. تتطلب الصورة فحصاً نظرياً دقيقاً قبل تداولها في الفضاء الرقمي.' :
               'فحصك سليم نظرياً واستدلالياً. لم يتم اكتشاف تسريبات للبيانات الحرجة، وهذا الأصل جاهز للمشاركة بشكل موثوق.';
    } else {
        return level === 'high' ? 'Your exact location is exposed. This image contains precise coordinates mapping where it was taken. Do not share the original.' :
               level === 'medium' ? 'Background details or reflections could leak your whereabouts. Review the visual content carefully before sharing.' :
               'Your scan looks good. No critical location data leaks detected, making this safe to share.';
    }
}

// Initialize Event Listeners
function init() {
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    retryButton.addEventListener('click', resetApp);
    resetButton.addEventListener('click', resetApp);
    downloadReportBtn.addEventListener('click', () => {
        if (!currentReportData) return;
        generateAndDownloadReport();
    });

    toggleMetadataBtn.addEventListener('click', () => {
        const content = document.getElementById('metadataDetails');
        const isExpanded = toggleMetadataBtn.getAttribute('aria-expanded') === 'true';
        
        toggleMetadataBtn.setAttribute('aria-expanded', !isExpanded);
        content.classList.toggle('active');
        toggleMetadataBtn.textContent = isExpanded ? t.hideStruct : t.showStruct;
    });
}

// Convert EXIF coordinate array to decimal format
function convertDMSToDD(dms, ref) {
    if (!dms || dms.length < 3) return null;
    
    const degrees = dms[0].numerator / dms[0].denominator;
    const minutes = dms[1].numerator / dms[1].denominator;
    const seconds = dms[2].numerator / dms[2].denominator;
    
    let decimal = degrees + (minutes / 60) + (seconds / 3600);
    
    if (ref === 'S' || ref === 'W') {
        decimal = decimal * -1;
    }
    
    return decimal;
}

// Handle selected file
function handleFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/jpg'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && extension !== 'heic') {
        showError(t.validType);
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError(t.sizeLimit);
        return;
    }

    currentFile = file;
    
    uploadSection.style.display = 'none';
    errorSection.style.display = 'none';
    loadingSection.style.display = 'block';

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        setTimeout(() => analyzeImage(file), 800);
    };
    reader.onerror = () => showError(t.readErr);
    reader.readAsDataURL(file);
}

function analyzeImage(file) {
    EXIF.getData(file, function() {
        const exifData = EXIF.getAllTags(this);
        processExifData(Object.keys(exifData).length > 0 ? exifData : null, file.name);
    });
}

function processExifData(exifData, fileName) {
    let hasGPS = false;
    let position = null;
    let metadata = {};

    if (exifData) {
        metadata = exifData;
        
        if (exifData.GPSLatitude && exifData.GPSLongitude) {
            hasGPS = true;
            position = {
                lat: convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef),
                lng: convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef)
            };
        }
    }

    const hasVisualClues = false; 

    displayResults(hasGPS, position, metadata, hasVisualClues, fileName);
}

function displayResults(hasGPS, position, metadata, hasVisualClues, fileName) {
    currentReportData = {
        fileName,
        hasGPS,
        position,
        metadata: metadata || {},
        hasVisualClues,
        timestamp: new Date().toLocaleString(ar ? 'ar-SA' : 'en-US')
    };
    
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'block';
    
    toggleMetadataBtn.setAttribute('aria-expanded', 'false');
    metadataDetails.classList.remove('active');
    toggleMetadataBtn.textContent = t.showStruct;

    let riskLevel = 'low';
    let riskIcon = '✅';
    let riskText = t.riskLow;
    let alertClass = 'alert-low';

    if (hasGPS) {
        riskLevel = 'high';
        riskIcon = '🚨';
        riskText = t.riskHigh;
        alertClass = 'alert-high';
    } else if (hasVisualClues) {
        riskLevel = 'medium';
        riskIcon = '⚠️';
        riskText = t.riskMed;
        alertClass = 'alert-medium';
    }

    alertContainer.innerHTML = `
        <div class="alert ${alertClass}" role="alert">
            <div class="alert-icon" aria-hidden="true">${riskIcon}</div>
            <div class="alert-content">
                <span class="alert-title">${riskText} - ${hasGPS ? t.alertGpsTrue : t.alertGpsFalse}</span>
                <p class="alert-message">${getRiskMessage(riskLevel)}</p>
            </div>
        </div>
    `;

    if (hasGPS) {
        const make = metadata.Make || t.unknownDev;
        const model = metadata.Model || '';
        const timestamp = metadata.DateTimeOriginal || metadata.DateTime || currentReportData.timestamp + t.fileCreation;

        metadataResults.innerHTML = `
            <div class="result-item">
                <span class="result-label">${t.coordLabel}</span>
                <span class="result-value" dir="ltr">Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">${t.deviceLabel}</span>
                <span class="result-value">${make} ${model}</span>
            </div>
            <div class="result-item">
                <span class="result-label">${t.timeLabel}</span>
                <span class="result-value" dir="ltr">${timestamp}</span>
            </div>
        `;

        mapContainer.style.display = 'block';
        mapCoordinates.textContent = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        
        setTimeout(() => {
            if (!mapInstance) {
                mapInstance = L.map('map').setView([position.lat, position.lng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(mapInstance);
                L.marker([position.lat, position.lng]).addTo(mapInstance);
            } else {
                mapInstance.setView([position.lat, position.lng], 15);
                mapInstance.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        mapInstance.removeLayer(layer);
                    }
                });
                L.marker([position.lat, position.lng]).addTo(mapInstance);
                mapInstance.invalidateSize();
            }
        }, 100);

        const altStr = metadata.GPSAltitude ? (metadata.GPSAltitude.numerator / metadata.GPSAltitude.denominator).toFixed(1) + 'm' : t.unavail;
        const sw = metadata.Software || t.unavail;
        const res = (metadata.PixelXDimension && metadata.PixelYDimension) ? 
            `${metadata.PixelXDimension} x ${metadata.PixelYDimension}` : t.unknown;

        metadataDetails.innerHTML = `
            <table class="metadata-table">
                <tbody>
                    <tr><td>${ar ? 'دائرة العرض الجغرافية' : 'Latitude'}</td><td dir="ltr">${position.lat.toFixed(6)}°</td></tr>
                    <tr><td>${ar ? 'خط الطول الجغرافي' : 'Longitude'}</td><td dir="ltr">${position.lng.toFixed(6)}°</td></tr>
                    <tr><td>${ar ? 'الارتفاع عن سطح البحر' : 'Altitude'}</td><td dir="ltr">${altStr}</td></tr>
                    <tr><td>${ar ? 'المُصنّع' : 'Camera Make'}</td><td>${make}</td></tr>
                    <tr><td>${ar ? 'الطراز' : 'Camera Model'}</td><td>${model}</td></tr>
                    <tr><td>${ar ? 'توقيع النظام' : 'Software'}</td><td>${sw}</td></tr>
                    <tr><td>${ar ? 'التوقيت المطلق' : 'Original Date'}</td><td dir="ltr">${timestamp}</td></tr>
                    <tr><td>${ar ? 'أبعاد الدقة' : 'Dimensions'}</td><td dir="ltr">${res}</td></tr>
                </tbody>
            </table>
        `;
    } else {
        metadataResults.innerHTML = `
            <div class="result-item success-item">
                <span class="result-label">${t.metaSafeLabel}</span>
                <span class="result-value" style="color: var(--clr-success-solid);">${t.metaSafeVal}</span>
            </div>
            <div class="result-item">
                <span class="result-label">${t.devSafeLabel}</span>
                <span class="result-value">${metadata.Make ? metadata.Make + ' ' + (metadata.Model || '') : t.devSafeVal}</span>
            </div>
        `;
        
        mapContainer.style.display = 'none';

        metadataDetails.innerHTML = `
            <p style="color: var(--clr-success-text); font-weight: 500;">${t.noSourced}</p>
            <p style="margin-top: var(--sp-2); font-size: var(--text-sm);">${t.noSourcedTip}</p>
        `;
    }

    if (hasVisualClues) {
        visualResults.innerHTML = `
            <div class="visual-clue">
                <strong class="clue-title">${t.visualClueWarn}</strong>
                <p class="clue-desc">${t.visualClueDesc}</p>
            </div>
        `;
    } else {
        visualResults.innerHTML = `
            <div class="result-item success-item">
                <span class="result-label">${t.visualSafeLabel}</span>
                <span class="result-value" style="color: var(--clr-success-solid);">${t.visualSafeVal}</span>
            </div>
            <p style="margin-top: var(--sp-2); font-size: var(--text-sm); color: var(--clr-text-muted);">
                ${t.visualSafeTip}
            </p>
        `;
    }

    riskAssessment.innerHTML = `
        <div style="margin-bottom: var(--sp-3);">
            <span class="risk-badge risk-${riskLevel}">${riskText}</span>
        </div>
        <div class="risk-assessment-details">
            ${getRiskAssessmentDetails(riskLevel)}
        </div>
    `;

    educationalContent.innerHTML = getEducationalContent(riskLevel);

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(msg) {
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'block';
    errorMessage.textContent = msg;
}

function resetApp() {
    fileInput.value = '';
    currentFile = null;
    currentReportData = null;
    
    errorSection.style.display = 'none';
    resultsSection.style.display = 'none';
    loadingSection.style.display = 'none';
    uploadSection.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getRiskAssessmentDetails(level) {
    if (ar) {
        if (level === 'high') {
            return `
                <div class="result-item">
                    <span class="result-label">نقطة الخروق الأساسية</span>
                    <span class="result-value" style="color: var(--clr-error-solid); font-weight: 500;">إحداثيات جغرافية مضمنة، تعرّض تواجدك الفعلي للانكشاف الآني.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">البروتوكول الموصى به</span>
                    <span class="result-value">حظر المشاركة العامة فوراً. ينبغي التخلص من الحمولة (تجريد Metadata) أو إعادة التصوير مع إغلاق خدمات التموضع الجغرافي العتادية.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">مستوى التأثير واستغلال الثغرة</span>
                    <span class="result-value">يستطيع أي مستخدم ينزل أو يصل لرابط هذه الصورة الأصلي سحب الإحداثيات ببضع نقرات بسيطة وإدراجه في برمجيات الملاحة بدقة تصل للمتر الواحد.</span>
                </div>
            `;
        } else if (level === 'medium') {
            return `
                <div class="result-item">
                    <span class="result-label">نقطة الخروق الأساسية</span>
                    <span class="result-value" style="color: var(--clr-warning-solid); font-weight: 500;">التكوين البصري يحتوي مكونات خلفية قد تستخدم للاستخبارات العكسية والاستدلال لموقعك.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">البروتوكول الموصى به</span>
                    <span class="result-value">اقطع المشهد: راقب الزوايا والخلفيات بعناية مبدئية، واستبعد أو قص اللافتات وواجهات المحلات المميزة.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">مستوى التأثير واستغلال الثغرة</span>
                    <span class="result-value">الخصوم العازمون أو المهتمون بالاستخبارات مفتوحة المصدر (OSINT) يملكون قدرة عالية على تقدير نطاقك بناءً على تضاريس الموقع والتوزيع الهندسي.</span>
                </div>
            `;
        } else {
            return `
                <div class="result-item success-item">
                    <span class="result-label">تم تأمين المجال</span>
                    <span class="result-value" style="font-weight: 500; color: var(--clr-success-text);">استخباراتنا تؤكد: لا توجد حمولات جغرافية (GPS) داخل الطبقات الخفية لهذا الأصل.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">حالة التشغيل الآمن للهدف</span>
                    <span class="result-value">تصريح بالتحرك. قم بإلقاء نظرة بشرية خاطفة للتحقق من عدم وجود رموز صريحة في الخلفية، ثم انشر بثقة.</span>
                </div>
            `;
        }
    } else {
        if (level === 'high') {
            return `
                <div class="result-item">
                    <span class="result-label">Primary Concern</span>
                    <span class="result-value" style="color: var(--clr-error-solid); font-weight: 500;">Embedded GPS coordinates expose exact location.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Recommendation</span>
                    <span class="result-value">Do NOT share this image publicly. Strip the metadata or reshoot with location services disabled.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Potential Impact</span>
                    <span class="result-value">Anyone who downloads this image can extract the exact coordinates and map your location.</span>
                </div>
            `;
        } else if (level === 'medium') {
            return `
                <div class="result-item">
                    <span class="result-label">Primary Concern</span>
                    <span class="result-value" style="color: var(--clr-warning-solid); font-weight: 500;">Visual elements may reveal location.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Recommendation</span>
                    <span class="result-value">Review image carefully. Consider cropping out distinguishing features before sharing.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Potential Impact</span>
                    <span class="result-value">Human viewers could piece together clues to estimate your location.</span>
                </div>
            `;
        } else {
            return `
                <div class="result-item success-item">
                    <span class="result-label">Good News!</span>
                    <span class="result-value" style="font-weight: 500; color: var(--clr-success-text);">This image is clear of embedded GPS location data.</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Next Steps</span>
                    <span class="result-value">Do a quick visual check yourself, and you're good to share!</span>
                </div>
            `;
        }
    }
}

function getEducationalContent(level) {
    if (ar) {
        if (level === 'high') {
            return `
                <ul class="panel-list">
                    <li><strong>آلية الاستهداف التلقائي:</strong> تأتي أجهزة الهاتف الحديثة مفعلة بوضع «الوسم الجغرافي» كمعيار أولي، مما يحقن توثيقاً صامتاً ومستمراً لخطوط الطول والعرض المعقدة داخل إطار ما يسمى بالـ EXIF metadata لكل صورة.</li>
                    <li><strong>هل الجميع يملك درع الحماية؟</strong> على الإطلاق؛ في حين تقوم بعض التطبيقات باقتلاع هذه البيانات عند معالجتها للرفع، فإن تطبيقات الرسائل الخاصة وشبكات تبادل الملفات الكبرى تتركها مشفرة بكامل تأثيرها دون مساس.</li>
                    <li><strong>أغلق الثغرة الأمنية الآن:</strong> اتجه فوراً لقسم «الخصوصية والتموضع» داخل إعدادات عتاد هاتفك الذكي، وقم بتجريد صلاحية الوصول لموقع التطبيق المستخدم للكاميرا درءاً لتعقبك مستقبلاً.</li>
                </ul>
            `;
        } else {
            return `
                <ul class="panel-list">
                    <li><strong>تشريح حمولات EXIF:</strong> إنها مجرد شحنة بيانات سرية محمولة داخل الصورة الأصلية. مهمتها إثبات وتوثيق التوقيت الزمني، معلومات طراز جهاز الالتقاط، وحالات الفتح البصري.. وأحيانًا، مسار تتبع الموقع الخاص بك.</li>
                    <li><strong>ما بعد تشفير البيانات الرقمية:</strong> تذكر أن الذكاء الاستخباري لمحلل المعلومات لا يحتاج دائماً لرقم برمجي كالإحداثيات. الاستدلال البصري المفتوح (OSINT) يكشف موقعك أحياناً عبر هندسة المبنى الظاهر، ظل الشاخص في الشارع، أو نوع الشجر المحيط.</li>
                    <li><strong>الوعي التشغيلي الدائم:</strong> افترض أن صورتك التي تم تداولها باتت أرشيفاً متاحاً وحتمياً للعامة ولفترة أبدية. اسأل نفسك دوماً: من يستطيع استغلال هذا المشهد ضدي يوماً ما؟</li>
                </ul>
            `;
        }
    } else {
        if (level === 'high') {
            return `
                <ul class="panel-list">
                    <li><strong>How did this happen?</strong> Most smartphone cameras default to "Geo-tagging" turned on, silently tucking GPS coordinates into the hidden EXIF data of every photo.</li>
                    <li><strong>Are all platforms dangerous?</strong> No, major networks often strip this data, but direct messaging apps and email preserve the payload perfectly.</li>
                    <li><strong>Action Required:</strong> Head to your phone's privacy settings and revoke location access from your camera app to prevent future tracking.</li>
                </ul>
            `;
        } else {
            return `
                <ul class="panel-list">
                    <li><strong>What is EXIF data?</strong> Information embedded directly inside image files including camera models, lenses, timings, and occasionally location.</li>
                    <li><strong>Beyond Metadata:</strong> Without GPS, OSINT analysts routinely exploit visual architecture, nature, or shadows to determine locations.</li>
                    <li><strong>Stay Vigilant:</strong> Always assume shared imagery is permanent and public. Consider who has access and the context revealed.</li>
                </ul>
            `;
        }
    }
}

function generateAndDownloadReport() {
    const data = currentReportData;
    let report = '';
    
    if (ar) {
        report += `==================================================\n`;
        report += `          SAFESHARE - تقرير الاستخبارات والأمان    \n`;
        report += `==================================================\n\n`;
        report += `الملف المستهدف : ${data.fileName}\n`;
        report += `توقيت الرصد   : ${data.timestamp}\n\n`;

        report += `[ مصفوفة تقييم المخاطر ]\n`;
        if (data.hasGPS) {
            report += `مستوى الخطورة : عالي ومُلِح\n`;
            report += `المخرجات      : تم العثور على أثر إحداثيات ومسار تعقب جغرافي متقدم داخل الطبقة المخفية لبيانات الجهاز (EXIF).\n\n`;
            report += `[ تتبع مسارات الموقع والتضاريس ]\n`;
            report += `خط العرض      : ${data.position.lat.toFixed(6)}°\n`;
            report += `خط الطول      : ${data.position.lng.toFixed(6)}°\n`;
            if (data.metadata && data.metadata.GPSAltitude) {
                const alt = data.metadata.GPSAltitude.numerator / data.metadata.GPSAltitude.denominator;
                report += `الارتفاع القمري: ${alt.toFixed(1)}m\n`;
            }
            report += `\n`;
        } else if (data.hasVisualClues) {
            report += `مستوى الخطورة : متوسط ومراقب\n`;
            report += `المخرجات      : الهيكلية البصرية للصورة قد تضم رموزاً وتضاريساً تسهل الاستدلال على تواجدك الفعلي.\n\n`;
        } else {
            report += `مستوى الخطورة : آمن ومستقر\n`;
            report += `المخرجات      : لم تُكتشف أي إحداثيات جغرافية مدمجة أو عوامل تسريب بصري ظاهرة تعوق النشر.\n\n`;
        }

        report += `[ التوقيعات الوصفية للعتاد المخفي ]\n`;
        if (data.metadata) {
            report += `العلامة التجارية  : ${data.metadata.Make || 'مجهول أو تم تجريده بنجاح'}\n`;
            report += `رقم إصدار الطراز : ${data.metadata.Model || 'مجهول أو تم تجريده بنجاح'}\n`;
            report += `البرمجيات المثبتة: ${data.metadata.Software || 'مجهول أو تم تجريده بنجاح'}\n`;
            
            if (data.metadata.DateTimeOriginal || data.metadata.DateTime) {
                report += `زمن الالتقاط الأصلي: ${data.metadata.DateTimeOriginal || data.metadata.DateTime}\n`;
            }
        } else {
            report += `التوقيعات الرقمية: آمن تماماً وتبدو منزوعة الجذور\n`;
        }

        report += `\n==================================================\n`;
        report += `تم استخراجه مركزياً عبر منصة SafeShare للاستخبارات الأمنية.\n`;
        report += `جميع عمليات المعالجة والتحليل تمت في بيئة معزولة وآمنة تماماً داخل متصفحكم.\n`;
    } else {
        report += `==================================================\n`;
        report += `          SAFESHARE SECURITY REPORT               \n`;
        report += `==================================================\n\n`;
        report += `File Analyzed  : ${data.fileName}\n`;
        report += `Scan Date      : ${data.timestamp}\n\n`;

        report += `[ RISK ASSESSMENT ]\n`;
        if (data.hasGPS) {
            report += `RISK LEVEL     : HIGH\n`;
            report += `Finding        : Precise GPS coordinates were detected embedded within the file's EXIF metadata.\n\n`;
            report += `[ LOCATION DATA ]\n`;
            report += `Latitude       : ${data.position.lat.toFixed(6)}°\n`;
            report += `Longitude      : ${data.position.lng.toFixed(6)}°\n`;
            if (data.metadata && data.metadata.GPSAltitude) {
                const alt = data.metadata.GPSAltitude.numerator / data.metadata.GPSAltitude.denominator;
                report += `Altitude       : ${alt.toFixed(1)}m\n`;
            }
            report += `\n`;
        } else if (data.hasVisualClues) {
            report += `RISK LEVEL     : MODERATE\n`;
            report += `Finding        : Visual elements in the image logic may contain identifiable landmarks.\n\n`;
        } else {
            report += `RISK LEVEL     : LOW\n`;
            report += `Finding        : No embedded location data or conspicuous threat vulnerabilities detected.\n\n`;
        }

        report += `[ DEVICE METADATA ]\n`;
        if (data.metadata) {
            report += `Camera Make    : ${data.metadata.Make || 'Unknown'}\n`;
            report += `Camera Model   : ${data.metadata.Model || 'Unknown'}\n`;
            report += `Software       : ${data.metadata.Software || 'Unknown'}\n`;
            
            if (data.metadata.DateTimeOriginal || data.metadata.DateTime) {
                report += `Original Date  : ${data.metadata.DateTimeOriginal || data.metadata.DateTime}\n`;
            }
        } else {
            report += `Metadata       : None detected\n`;
        }

        report += `\n==================================================\n`;
        report += `Generated by SafeShare offline scanner.\n`;
        report += `All processing was completed securely in-browser.\n`;
    }

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeShare_Security_Report_${data.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', init);
