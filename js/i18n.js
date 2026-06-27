// Tiny i18n layer (no dependencies). Holds all UI strings for the supported
// languages, auto-detects the initial language from the browser, persists the
// user's choice, and fills the DOM via data-i18n* attributes.

const LS_KEY = 'gwviz:lang';
const LINK = '<a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>';

// Language set chosen for broad global reach (Japanese required). `dir` drives
// right-to-left layout for Arabic. `name` is the endonym shown in the switcher.
export const SUPPORTED = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
];

// Example-city coordinates (names are localized below).
export const CITIES = [
  { id: 'tokyo', lat: 35.6895, lon: 139.6917 },
  { id: 'london', lat: 51.5074, lon: -0.1278 },
  { id: 'newyork', lat: 40.7128, lon: -74.006 },
  { id: 'sydney', lat: -33.8688, lon: 151.2093 },
];

const STRINGS = {
  en: {
    'meta.title': 'Is It Getting Hotter Here? — Local Warming Visualizer',
    'meta.description': 'Pick your town and see — at a glance — whether it has been getting hotter over the decades.',
    'hero.titleHTML': 'Is it getting hotter <em>here?</em>',
    'hero.sub': "Pick your place. See your climate's story in one glance.",
    'search.placeholder': 'Search any town or city…',
    'search.aria': 'Search for a town or city',
    'locate.title': 'Use my location',
    'suggestions.aria': 'Suggestions',
    'loading.text': 'Reading the last 70 years of temperatures…',
    'error.retry': 'Try again',
    'error.locate': 'Could not get your location. Try searching for a city instead.',
    'error.generic': 'Something went wrong building the chart. Please try another location.',
    'sample.note': "⚠ Showing sample data (couldn't reach the live archive).",
    'stripes.title': 'Every year, coolest → hottest',
    'stripes.aria': 'Warming stripes: each bar is one year, blue is cooler and red is hotter.',
    'verdict.caption': '{a}–{b} vs {c}–{d} average',
    'trend.title': 'Yearly average temperature',
    'trend.aria': 'Line chart of yearly average temperature with a trend line.',
    'trend.perDecade': '{v}°C per decade',
    'hot.title': 'Scorching days',
    'hot.aria': 'Comparison of the number of hot days then and now.',
    'hot.caption': 'Days at or above 30°C — {a}–{b} vs {c}–{d}',
    'highlight.hottest': 'Hottest year on record',
    'highlight.baseline': '1951–1980 baseline',
    'footer.html': 'Data: {link} (ERA5) · Colors after Ed Hawkins’ #ShowYourStripes · Baseline 1951–1980.',
    'tooltip.vsBaseline': 'vs baseline',
    'place.yourLocation': 'Your location',
  },
  ja: {
    'meta.title': 'ここは暑くなっている？ — 身近な温暖化ビジュアライザー',
    'meta.description': 'あなたの地域を選ぶと、数十年でどれだけ暑くなったかがひと目で分かります。',
    'hero.titleHTML': 'ここは<em>暑く</em>なっている？',
    'hero.sub': 'あなたの地域を選ぶだけ。気候の変化がひと目で分かります。',
    'search.placeholder': '都市や地域を検索…',
    'search.aria': '都市や地域を検索',
    'locate.title': '現在地を使う',
    'suggestions.aria': '候補',
    'loading.text': '過去70年分の気温を読み込み中…',
    'error.retry': 'もう一度試す',
    'error.locate': '現在地を取得できませんでした。都市名で検索してみてください。',
    'error.generic': 'グラフの作成中に問題が発生しました。別の地域でお試しください。',
    'sample.note': '⚠ サンプルデータを表示中（最新データに接続できませんでした）。',
    'stripes.title': '各年の気温（寒い → 暑い）',
    'stripes.aria': 'ウォーミングストライプ：各帯が1年で、青は涼しく赤は暑い。',
    'verdict.caption': '{a}〜{b}年 と {c}〜{d}年 の平均の比較',
    'trend.title': '年平均気温の推移',
    'trend.aria': '年平均気温とトレンド線の折れ線グラフ。',
    'trend.perDecade': '10年あたり {v}°C',
    'hot.title': '猛烈に暑い日',
    'hot.aria': '暑い日の日数の、昔と今の比較。',
    'hot.caption': '30°C以上の日数 — {a}〜{b}年 と {c}〜{d}年',
    'highlight.hottest': '観測史上もっとも暑い年',
    'highlight.baseline': '基準期間 1951〜1980年',
    'footer.html': 'データ: {link}（ERA5再解析）· 配色は Ed Hawkins の #ShowYourStripes に基づく · 基準期間 1951〜1980年。',
    'tooltip.vsBaseline': '基準比',
    'place.yourLocation': '現在地',
  },
  zh: {
    'meta.title': '这里变热了吗？ — 身边的全球变暖可视化',
    'meta.description': '选择你所在的地方，一眼看清几十年来当地是否变得更热。',
    'hero.titleHTML': '这里<em>变热</em>了吗？',
    'hero.sub': '选择你所在的地方，一眼看懂当地气候的变化。',
    'search.placeholder': '搜索任意城市或地区…',
    'search.aria': '搜索城市或地区',
    'locate.title': '使用我的位置',
    'suggestions.aria': '建议',
    'loading.text': '正在读取过去70年的气温数据…',
    'error.retry': '重试',
    'error.locate': '无法获取你的位置。请尝试搜索城市。',
    'error.generic': '生成图表时出错。请尝试其他地点。',
    'sample.note': '⚠ 正在显示示例数据（无法连接实时存档）。',
    'stripes.title': '逐年气温（由冷到热）',
    'stripes.aria': '升温条纹：每条代表一年，蓝色较冷，红色较热。',
    'verdict.caption': '{a}–{b} 与 {c}–{d} 年平均对比',
    'trend.title': '逐年平均气温',
    'trend.aria': '逐年平均气温及趋势线折线图。',
    'trend.perDecade': '每十年 {v}°C',
    'hot.title': '酷热天数',
    'hot.aria': '过去与现在炎热天数的对比。',
    'hot.caption': '达到或超过30°C的天数 — {a}–{b} 与 {c}–{d}',
    'highlight.hottest': '有记录以来最热的一年',
    'highlight.baseline': '1951–1980 基准',
    'footer.html': '数据：{link}（ERA5）· 配色参考 Ed Hawkins 的 #ShowYourStripes · 基准期 1951–1980。',
    'tooltip.vsBaseline': '相对基准',
    'place.yourLocation': '我的位置',
  },
  hi: {
    'meta.title': 'क्या यहाँ गर्मी बढ़ रही है? — स्थानीय वार्मिंग विज़ुअलाइज़र',
    'meta.description': 'अपनी जगह चुनें और एक नज़र में देखें कि दशकों में यहाँ कितनी गर्मी बढ़ी है।',
    'hero.titleHTML': 'क्या यहाँ <em>गर्मी</em> बढ़ रही है?',
    'hero.sub': 'अपनी जगह चुनें। अपने यहाँ की जलवायु की कहानी एक नज़र में देखें।',
    'search.placeholder': 'कोई भी शहर या कस्बा खोजें…',
    'search.aria': 'शहर या कस्बा खोजें',
    'locate.title': 'मेरा स्थान इस्तेमाल करें',
    'suggestions.aria': 'सुझाव',
    'loading.text': 'पिछले 70 वर्षों का तापमान पढ़ा जा रहा है…',
    'error.retry': 'फिर से कोशिश करें',
    'error.locate': 'आपका स्थान नहीं मिल सका। इसके बजाय कोई शहर खोजें।',
    'error.generic': 'चार्ट बनाने में कुछ गड़बड़ी हुई। कृपया कोई और स्थान आज़माएँ।',
    'sample.note': '⚠ नमूना डेटा दिखाया जा रहा है (लाइव डेटा नहीं मिल सका)।',
    'stripes.title': 'हर साल, सबसे ठंडा → सबसे गर्म',
    'stripes.aria': 'वार्मिंग स्ट्राइप्स: हर पट्टी एक साल, नीला ठंडा और लाल गर्म।',
    'verdict.caption': '{a}–{b} बनाम {c}–{d} का औसत',
    'trend.title': 'वार्षिक औसत तापमान',
    'trend.aria': 'वार्षिक औसत तापमान और ट्रेंड लाइन का रेखा-चार्ट।',
    'trend.perDecade': 'प्रति दशक {v}°C',
    'hot.title': 'तपती गर्मी के दिन',
    'hot.aria': 'पहले और अब गर्म दिनों की संख्या की तुलना।',
    'hot.caption': '30°C या उससे ऊपर के दिन — {a}–{b} बनाम {c}–{d}',
    'highlight.hottest': 'रिकॉर्ड पर सबसे गर्म साल',
    'highlight.baseline': '1951–1980 आधार अवधि',
    'footer.html': 'डेटा: {link} (ERA5) · रंग Ed Hawkins के #ShowYourStripes पर आधारित · आधार 1951–1980।',
    'tooltip.vsBaseline': 'आधार से',
    'place.yourLocation': 'आपका स्थान',
  },
  es: {
    'meta.title': '¿Hace más calor aquí? — Visualizador del calentamiento local',
    'meta.description': 'Elige tu localidad y ve de un vistazo cuánto ha aumentado el calor en las últimas décadas.',
    'hero.titleHTML': '¿Está haciendo más <em>calor aquí?</em>',
    'hero.sub': 'Elige tu lugar. Mira la historia de tu clima de un vistazo.',
    'search.placeholder': 'Busca cualquier ciudad o pueblo…',
    'search.aria': 'Buscar una ciudad o pueblo',
    'locate.title': 'Usar mi ubicación',
    'suggestions.aria': 'Sugerencias',
    'loading.text': 'Leyendo las temperaturas de los últimos 70 años…',
    'error.retry': 'Reintentar',
    'error.locate': 'No se pudo obtener tu ubicación. Prueba a buscar una ciudad.',
    'error.generic': 'Algo salió mal al crear el gráfico. Prueba con otro lugar.',
    'sample.note': '⚠ Mostrando datos de ejemplo (no se pudo acceder al archivo en vivo).',
    'stripes.title': 'Cada año, del más frío al más cálido',
    'stripes.aria': 'Franjas de calentamiento: cada barra es un año, azul más frío y rojo más cálido.',
    'verdict.caption': 'Promedio de {a}–{b} vs {c}–{d}',
    'trend.title': 'Temperatura media anual',
    'trend.aria': 'Gráfico de líneas de la temperatura media anual con una línea de tendencia.',
    'trend.perDecade': '{v}°C por década',
    'hot.title': 'Días sofocantes',
    'hot.aria': 'Comparación del número de días calurosos antes y ahora.',
    'hot.caption': 'Días de 30°C o más — {a}–{b} vs {c}–{d}',
    'highlight.hottest': 'Año más caluroso registrado',
    'highlight.baseline': 'Referencia 1951–1980',
    'footer.html': 'Datos: {link} (ERA5) · Colores según #ShowYourStripes de Ed Hawkins · Referencia 1951–1980.',
    'tooltip.vsBaseline': 'vs referencia',
    'place.yourLocation': 'Tu ubicación',
  },
  ar: {
    'meta.title': 'هل يزداد المناخ حرارةً هنا؟ — مُصوِّر الاحترار المحلي',
    'meta.description': 'اختر مكانك وشاهد بلمحة واحدة مدى ارتفاع الحرارة خلال العقود الماضية.',
    'hero.titleHTML': 'هل المناخ <em>يزداد حرارةً</em> هنا؟',
    'hero.sub': 'اختر مكانك. شاهد قصة مناخك في لمحة واحدة.',
    'search.placeholder': 'ابحث عن أي مدينة أو بلدة…',
    'search.aria': 'ابحث عن مدينة أو بلدة',
    'locate.title': 'استخدام موقعي',
    'suggestions.aria': 'اقتراحات',
    'loading.text': 'جارٍ قراءة درجات الحرارة لآخر 70 عامًا…',
    'error.retry': 'حاول مرة أخرى',
    'error.locate': 'تعذّر تحديد موقعك. حاول البحث عن مدينة بدلاً من ذلك.',
    'error.generic': 'حدث خطأ أثناء إنشاء الرسم البياني. جرّب موقعًا آخر.',
    'sample.note': '⚠ يتم عرض بيانات تجريبية (تعذّر الوصول إلى الأرشيف المباشر).',
    'stripes.title': 'كل سنة، من الأبرد إلى الأحرّ',
    'stripes.aria': 'خطوط الاحترار: كل شريط يمثل سنة، الأزرق أبرد والأحمر أحرّ.',
    'verdict.caption': 'متوسط {a}–{b} مقابل {c}–{d}',
    'trend.title': 'متوسط درجة الحرارة السنوي',
    'trend.aria': 'رسم خطي لمتوسط درجة الحرارة السنوي مع خط الاتجاه.',
    'trend.perDecade': '{v}°C لكل عقد',
    'hot.title': 'الأيام شديدة الحرارة',
    'hot.aria': 'مقارنة عدد الأيام الحارّة بين الماضي والحاضر.',
    'hot.caption': 'أيام بحرارة 30°C أو أكثر — {a}–{b} مقابل {c}–{d}',
    'highlight.hottest': 'أحرّ عام مُسجَّل',
    'highlight.baseline': 'خط الأساس 1951–1980',
    'footer.html': 'البيانات: {link} (ERA5) · الألوان مستوحاة من #ShowYourStripes لإد هوكينز · خط الأساس 1951–1980.',
    'tooltip.vsBaseline': 'مقارنةً بخط الأساس',
    'place.yourLocation': 'موقعك',
  },
  fr: {
    'meta.title': 'Fait-il plus chaud ici ? — Visualiseur du réchauffement local',
    'meta.description': 'Choisissez votre commune et voyez d’un coup d’œil de combien il a fait plus chaud au fil des décennies.',
    'hero.titleHTML': 'Fait-il plus <em>chaud ici ?</em>',
    'hero.sub': 'Choisissez votre lieu. Voyez l’évolution de votre climat d’un coup d’œil.',
    'search.placeholder': 'Cherchez une ville ou un village…',
    'search.aria': 'Rechercher une ville',
    'locate.title': 'Utiliser ma position',
    'suggestions.aria': 'Suggestions',
    'loading.text': 'Lecture des températures des 70 dernières années…',
    'error.retry': 'Réessayer',
    'error.locate': 'Impossible d’obtenir votre position. Essayez plutôt de rechercher une ville.',
    'error.generic': 'Une erreur s’est produite lors de la création du graphique. Essayez un autre lieu.',
    'sample.note': '⚠ Données d’exemple affichées (archive en ligne inaccessible).',
    'stripes.title': 'Chaque année, du plus frais au plus chaud',
    'stripes.aria': 'Bandes du réchauffement : chaque barre est une année, bleu plus frais, rouge plus chaud.',
    'verdict.caption': 'Moyenne {a}–{b} vs {c}–{d}',
    'trend.title': 'Température moyenne annuelle',
    'trend.aria': 'Graphique de la température moyenne annuelle avec une ligne de tendance.',
    'trend.perDecade': '{v}°C par décennie',
    'hot.title': 'Journées de forte chaleur',
    'hot.aria': 'Comparaison du nombre de journées chaudes entre hier et aujourd’hui.',
    'hot.caption': 'Jours à 30°C ou plus — {a}–{b} vs {c}–{d}',
    'highlight.hottest': 'Année la plus chaude enregistrée',
    'highlight.baseline': 'Référence 1951–1980',
    'footer.html': 'Données : {link} (ERA5) · Couleurs d’après #ShowYourStripes d’Ed Hawkins · Référence 1951–1980.',
    'tooltip.vsBaseline': 'vs référence',
    'place.yourLocation': 'Votre position',
  },
  pt: {
    'meta.title': 'Está a ficar mais quente aqui? — Visualizador do aquecimento local',
    'meta.description': 'Escolha a sua localidade e veja num relance quanto mais quente ficou ao longo das décadas.',
    'hero.titleHTML': 'Está a ficar mais <em>quente aqui?</em>',
    'hero.sub': 'Escolha o seu lugar. Veja a história do seu clima num relance.',
    'search.placeholder': 'Pesquise qualquer cidade ou vila…',
    'search.aria': 'Pesquisar uma cidade',
    'locate.title': 'Usar a minha localização',
    'suggestions.aria': 'Sugestões',
    'loading.text': 'A ler as temperaturas dos últimos 70 anos…',
    'error.retry': 'Tentar novamente',
    'error.locate': 'Não foi possível obter a sua localização. Tente pesquisar uma cidade.',
    'error.generic': 'Algo correu mal ao criar o gráfico. Tente outro local.',
    'sample.note': '⚠ A mostrar dados de exemplo (não foi possível aceder ao arquivo ao vivo).',
    'stripes.title': 'Cada ano, do mais frio ao mais quente',
    'stripes.aria': 'Faixas do aquecimento: cada barra é um ano, azul mais frio e vermelho mais quente.',
    'verdict.caption': 'Média de {a}–{b} vs {c}–{d}',
    'trend.title': 'Temperatura média anual',
    'trend.aria': 'Gráfico de linhas da temperatura média anual com linha de tendência.',
    'trend.perDecade': '{v}°C por década',
    'hot.title': 'Dias escaldantes',
    'hot.aria': 'Comparação do número de dias quentes entre antes e agora.',
    'hot.caption': 'Dias com 30°C ou mais — {a}–{b} vs {c}–{d}',
    'highlight.hottest': 'Ano mais quente registado',
    'highlight.baseline': 'Referência 1951–1980',
    'footer.html': 'Dados: {link} (ERA5) · Cores baseadas no #ShowYourStripes de Ed Hawkins · Referência 1951–1980.',
    'tooltip.vsBaseline': 'vs referência',
    'place.yourLocation': 'A sua localização',
  },
  ru: {
    'meta.title': 'Здесь становится жарче? — Визуализатор локального потепления',
    'meta.description': 'Выберите своё место и за один взгляд узнайте, насколько потеплело за десятилетия.',
    'hero.titleHTML': 'Здесь становится <em>жарче?</em>',
    'hero.sub': 'Выберите место. Узнайте историю вашего климата с одного взгляда.',
    'search.placeholder': 'Найдите любой город…',
    'search.aria': 'Поиск города',
    'locate.title': 'Использовать моё местоположение',
    'suggestions.aria': 'Подсказки',
    'loading.text': 'Загрузка температур за последние 70 лет…',
    'error.retry': 'Повторить',
    'error.locate': 'Не удалось определить местоположение. Попробуйте найти город.',
    'error.generic': 'Не удалось построить график. Попробуйте другое место.',
    'sample.note': '⚠ Показаны примерные данные (не удалось получить актуальные).',
    'stripes.title': 'Каждый год: от холодного к жаркому',
    'stripes.aria': 'Полосы потепления: каждая полоса — год, синий холоднее, красный жарче.',
    'verdict.caption': 'Среднее {a}–{b} против {c}–{d}',
    'trend.title': 'Среднегодовая температура',
    'trend.aria': 'Линейный график среднегодовой температуры с линией тренда.',
    'trend.perDecade': '{v}°C за десятилетие',
    'hot.title': 'Знойные дни',
    'hot.aria': 'Сравнение числа жарких дней тогда и сейчас.',
    'hot.caption': 'Дни с 30°C и выше — {a}–{b} против {c}–{d}',
    'highlight.hottest': 'Самый жаркий год за всё время',
    'highlight.baseline': 'База 1951–1980',
    'footer.html': 'Данные: {link} (ERA5) · Цвета по #ShowYourStripes Эда Хокинса · База 1951–1980.',
    'tooltip.vsBaseline': 'от базы',
    'place.yourLocation': 'Ваше местоположение',
  },
  id: {
    'meta.title': 'Apakah di sini makin panas? — Visualisasi pemanasan lokal',
    'meta.description': 'Pilih lokasimu dan lihat sekilas seberapa panas perubahannya selama beberapa dekade.',
    'hero.titleHTML': 'Apakah di sini makin <em>panas?</em>',
    'hero.sub': 'Pilih lokasimu. Lihat kisah iklimmu dalam sekejap.',
    'search.placeholder': 'Cari kota atau daerah mana pun…',
    'search.aria': 'Cari kota atau daerah',
    'locate.title': 'Gunakan lokasi saya',
    'suggestions.aria': 'Saran',
    'loading.text': 'Membaca suhu 70 tahun terakhir…',
    'error.retry': 'Coba lagi',
    'error.locate': 'Tidak bisa mendapatkan lokasimu. Coba cari nama kota saja.',
    'error.generic': 'Terjadi kesalahan saat membuat grafik. Coba lokasi lain.',
    'sample.note': '⚠ Menampilkan data contoh (tidak bisa mengakses arsip langsung).',
    'stripes.title': 'Tiap tahun, dari terdingin ke terpanas',
    'stripes.aria': 'Garis pemanasan: tiap batang satu tahun, biru lebih dingin, merah lebih panas.',
    'verdict.caption': 'Rata-rata {a}–{b} vs {c}–{d}',
    'trend.title': 'Suhu rata-rata tahunan',
    'trend.aria': 'Grafik garis suhu rata-rata tahunan dengan garis tren.',
    'trend.perDecade': '{v}°C per dekade',
    'hot.title': 'Hari yang menyengat',
    'hot.aria': 'Perbandingan jumlah hari panas dulu dan sekarang.',
    'hot.caption': 'Hari dengan suhu 30°C ke atas — {a}–{b} vs {c}–{d}',
    'highlight.hottest': 'Tahun terpanas yang tercatat',
    'highlight.baseline': 'Dasar 1951–1980',
    'footer.html': 'Data: {link} (ERA5) · Warna mengikuti #ShowYourStripes oleh Ed Hawkins · Dasar 1951–1980.',
    'tooltip.vsBaseline': 'vs dasar',
    'place.yourLocation': 'Lokasimu',
  },
  bn: {
    'meta.title': 'এখানে কি গরম বাড়ছে? — স্থানীয় উষ্ণায়ন ভিজ্যুয়ালাইজার',
    'meta.description': 'আপনার এলাকা বেছে নিন এবং এক নজরে দেখুন কয়েক দশকে কতটা গরম বেড়েছে।',
    'hero.titleHTML': 'এখানে কি <em>গরম</em> বাড়ছে?',
    'hero.sub': 'আপনার এলাকা বেছে নিন। এক নজরে দেখুন আপনার জলবায়ুর গল্প।',
    'search.placeholder': 'যেকোনো শহর বা এলাকা খুঁজুন…',
    'search.aria': 'শহর বা এলাকা খুঁজুন',
    'locate.title': 'আমার অবস্থান ব্যবহার করুন',
    'suggestions.aria': 'পরামর্শ',
    'loading.text': 'গত ৭০ বছরের তাপমাত্রা পড়া হচ্ছে…',
    'error.retry': 'আবার চেষ্টা করুন',
    'error.locate': 'আপনার অবস্থান পাওয়া যায়নি। বরং একটি শহর খুঁজে দেখুন।',
    'error.generic': 'চার্ট তৈরিতে সমস্যা হয়েছে। অন্য একটি স্থান চেষ্টা করুন।',
    'sample.note': '⚠ নমুনা ডেটা দেখানো হচ্ছে (লাইভ আর্কাইভে পৌঁছানো যায়নি)।',
    'stripes.title': 'প্রতি বছর, শীতলতম → উষ্ণতম',
    'stripes.aria': 'ওয়ার্মিং স্ট্রাইপস: প্রতিটি দণ্ড এক বছর, নীল শীতল ও লাল উষ্ণ।',
    'verdict.caption': '{a}–{b} বনাম {c}–{d} এর গড়',
    'trend.title': 'বার্ষিক গড় তাপমাত্রা',
    'trend.aria': 'বার্ষিক গড় তাপমাত্রা ও ট্রেন্ড লাইনের রেখাচিত্র।',
    'trend.perDecade': 'প্রতি দশকে {v}°C',
    'hot.title': 'প্রচণ্ড গরমের দিন',
    'hot.aria': 'আগে ও এখনের গরম দিনের সংখ্যার তুলনা।',
    'hot.caption': '৩০°C বা তার বেশি দিনের সংখ্যা — {a}–{b} বনাম {c}–{d}',
    'highlight.hottest': 'রেকর্ডে সবচেয়ে উষ্ণ বছর',
    'highlight.baseline': '১৯৫১–১৯৮০ ভিত্তি',
    'footer.html': 'ডেটা: {link} (ERA5) · রং Ed Hawkins-এর #ShowYourStripes অনুসারে · ভিত্তি ১৯৫১–১৯৮০।',
    'tooltip.vsBaseline': 'ভিত্তির তুলনায়',
    'place.yourLocation': 'আপনার অবস্থান',
  },
};

// City names per language: { short (chip), full (result heading) }.
const CITY_NAMES = {
  en: { tokyo: ['Tokyo', 'Tokyo, Japan'], london: ['London', 'London, United Kingdom'], newyork: ['New York', 'New York, United States'], sydney: ['Sydney', 'Sydney, Australia'] },
  ja: { tokyo: ['東京', '東京（日本）'], london: ['ロンドン', 'ロンドン（イギリス）'], newyork: ['ニューヨーク', 'ニューヨーク（アメリカ）'], sydney: ['シドニー', 'シドニー（オーストラリア）'] },
  zh: { tokyo: ['东京', '东京，日本'], london: ['伦敦', '伦敦，英国'], newyork: ['纽约', '纽约，美国'], sydney: ['悉尼', '悉尼，澳大利亚'] },
  hi: { tokyo: ['टोक्यो', 'टोक्यो, जापान'], london: ['लंदन', 'लंदन, यूके'], newyork: ['न्यूयॉर्क', 'न्यूयॉर्क, अमेरिका'], sydney: ['सिडनी', 'सिडनी, ऑस्ट्रेलिया'] },
  es: { tokyo: ['Tokio', 'Tokio, Japón'], london: ['Londres', 'Londres, Reino Unido'], newyork: ['Nueva York', 'Nueva York, EE. UU.'], sydney: ['Sídney', 'Sídney, Australia'] },
  ar: { tokyo: ['طوكيو', 'طوكيو، اليابان'], london: ['لندن', 'لندن، المملكة المتحدة'], newyork: ['نيويورك', 'نيويورك، الولايات المتحدة'], sydney: ['سيدني', 'سيدني، أستراليا'] },
  fr: { tokyo: ['Tokyo', 'Tokyo, Japon'], london: ['Londres', 'Londres, Royaume-Uni'], newyork: ['New York', 'New York, États-Unis'], sydney: ['Sydney', 'Sydney, Australie'] },
  pt: { tokyo: ['Tóquio', 'Tóquio, Japão'], london: ['Londres', 'Londres, Reino Unido'], newyork: ['Nova Iorque', 'Nova Iorque, Estados Unidos'], sydney: ['Sydney', 'Sydney, Austrália'] },
  ru: { tokyo: ['Токио', 'Токио, Япония'], london: ['Лондон', 'Лондон, Великобритания'], newyork: ['Нью-Йорк', 'Нью-Йорк, США'], sydney: ['Сидней', 'Сидней, Австралия'] },
  id: { tokyo: ['Tokyo', 'Tokyo, Jepang'], london: ['London', 'London, Inggris'], newyork: ['New York', 'New York, Amerika Serikat'], sydney: ['Sydney', 'Sydney, Australia'] },
  bn: { tokyo: ['টোকিও', 'টোকিও, জাপান'], london: ['লন্ডন', 'লন্ডন, যুক্তরাজ্য'], newyork: ['নিউ ইয়র্ক', 'নিউ ইয়র্ক, যুক্তরাষ্ট্র'], sydney: ['সিডনি', 'সিডনি, অস্ট্রেলিয়া'] },
};

// Warming-stripes explainer (progressive disclosure). Merged into STRINGS below
// so we don't have to thread two extra keys through every language block.
const STRIPES_EXPLAIN = {
  en: {
    'stripes.whatsThis': 'What do these colors mean?',
    'stripes.explain':
      "Each stripe is one year — oldest on the left, newest on the right. Its color shows that year's average temperature compared with the local 1951–1980 average: blue is cooler, white is about average, red is hotter. When the stripes shift from blue to red, your area has been warming.",
  },
  ja: {
    'stripes.whatsThis': 'この色は何を表しているの？',
    'stripes.explain':
      '各ストライプは1年を表し、左が古い年、右が新しい年です。色は、その年の平均気温を1951〜1980年の地元の平均と比べたもので、青は涼しい、白はほぼ平均、赤は暑いことを示します。青から赤へ変わっていれば、その地域が温暖化しているということです。',
  },
  zh: {
    'stripes.whatsThis': '这些颜色代表什么？',
    'stripes.explain':
      '每条代表一年，左侧最早，右侧最新。颜色表示该年的平均气温与当地1951–1980年平均值的对比：蓝色更冷，白色接近平均，红色更热。当条纹由蓝转红，说明你所在地区正在变暖。',
  },
  hi: {
    'stripes.whatsThis': 'ये रंग क्या दर्शाते हैं?',
    'stripes.explain':
      'हर पट्टी एक साल है — बाईं ओर सबसे पुराना, दाईं ओर सबसे नया। रंग उस साल के औसत तापमान की तुलना स्थानीय 1951–1980 औसत से दिखाता है: नीला ठंडा, सफ़ेद लगभग औसत, और लाल अधिक गर्म। जब पट्टियाँ नीले से लाल होती जाती हैं, तो इसका मतलब है कि आपका क्षेत्र गर्म हो रहा है।',
  },
  es: {
    'stripes.whatsThis': '¿Qué significan estos colores?',
    'stripes.explain':
      'Cada franja es un año: la más antigua a la izquierda y la más reciente a la derecha. El color muestra la temperatura media de ese año frente al promedio local de 1951–1980: azul más frío, blanco cerca del promedio y rojo más cálido. Cuando las franjas pasan de azul a rojo, tu zona se ha ido calentando.',
  },
  ar: {
    'stripes.whatsThis': 'ماذا تعني هذه الألوان؟',
    'stripes.explain':
      'كل شريط يمثل سنة — الأقدم على اليسار والأحدث على اليمين. يوضّح اللون متوسط حرارة تلك السنة مقارنةً بمتوسط الفترة 1951–1980 محليًا: الأزرق أبرد، والأبيض قريب من المتوسط، والأحمر أحرّ. وعندما تتحوّل الخطوط من الأزرق إلى الأحمر، فهذا يعني أن منطقتك تزداد احترارًا.',
  },
  fr: {
    'stripes.whatsThis': 'Que signifient ces couleurs ?',
    'stripes.explain':
      "Chaque bande représente une année — la plus ancienne à gauche, la plus récente à droite. La couleur indique la température moyenne de l'année par rapport à la moyenne locale de 1951–1980 : bleu plus frais, blanc proche de la moyenne, rouge plus chaud. Quand les bandes passent du bleu au rouge, votre région s'est réchauffée.",
  },
  pt: {
    'stripes.whatsThis': 'O que significam estas cores?',
    'stripes.explain':
      'Cada faixa é um ano — a mais antiga à esquerda e a mais recente à direita. A cor mostra a temperatura média desse ano em relação à média local de 1951–1980: azul mais frio, branco perto da média e vermelho mais quente. Quando as faixas passam de azul para vermelho, a sua região tem vindo a aquecer.',
  },
  ru: {
    'stripes.whatsThis': 'Что означают эти цвета?',
    'stripes.explain':
      'Каждая полоса — это год: слева самые ранние, справа самые поздние. Цвет показывает среднюю температуру года относительно местного среднего за 1951–1980 годы: синий холоднее, белый около среднего, красный жарче. Когда полосы меняются с синих на красные, ваш регион теплеет.',
  },
  id: {
    'stripes.whatsThis': 'Apa arti warna-warna ini?',
    'stripes.explain':
      'Setiap garis adalah satu tahun — tertua di kiri, terbaru di kanan. Warnanya menunjukkan suhu rata-rata tahun itu dibandingkan rata-rata lokal 1951–1980: biru lebih dingin, putih sekitar rata-rata, merah lebih panas. Saat garis berubah dari biru ke merah, berarti daerahmu makin menghangat.',
  },
  bn: {
    'stripes.whatsThis': 'এই রংগুলো কী বোঝায়?',
    'stripes.explain':
      'প্রতিটি স্ট্রাইপ এক বছর — বাঁয়ে সবচেয়ে পুরোনো, ডানে সবচেয়ে নতুন। রং দেখায় ওই বছরের গড় তাপমাত্রা স্থানীয় ১৯৫১–১৯৮০ গড়ের তুলনায়: নীল শীতল, সাদা প্রায় গড়, লাল বেশি উষ্ণ। স্ট্রাইপ নীল থেকে লাল হতে থাকলে বুঝবেন আপনার এলাকা উষ্ণ হচ্ছে।',
  },
};
for (const code in STRIPES_EXPLAIN) Object.assign(STRINGS[code], STRIPES_EXPLAIN[code]);

const GLOBAL_PARAMS = { link: LINK };

let _lang = null;

function readSaved() {
  try {
    const v = localStorage.getItem(LS_KEY);
    return v && STRINGS[v] ? v : null;
  } catch {
    return null;
  }
}

export function detectLang() {
  const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  for (const l of list) {
    const code = (l || '').toLowerCase().split('-')[0];
    if (STRINGS[code]) return code;
    if (code === 'in') return 'id'; // legacy code for Indonesian
  }
  return 'en';
}

export function getLang() {
  if (!_lang) _lang = readSaved() || detectLang();
  return _lang;
}

export function setLang(code) {
  _lang = STRINGS[code] ? code : 'en';
  try {
    localStorage.setItem(LS_KEY, _lang);
  } catch {
    /* storage disabled — keep in memory */
  }
  return _lang;
}

export function dirOf(code = getLang()) {
  return (SUPPORTED.find((s) => s.code === code) || {}).dir || 'ltr';
}

export function t(key, params) {
  const lang = getLang();
  let s = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? key;
  const all = params ? { ...GLOBAL_PARAMS, ...params } : GLOBAL_PARAMS;
  for (const k in all) s = s.split(`{${k}}`).join(all[k]);
  return s;
}

// Localized example cities for the current language.
export function localizedCities(lang = getLang()) {
  const names = CITY_NAMES[lang] || CITY_NAMES.en;
  return CITIES.map((c) => {
    const [short, full] = names[c.id] || CITY_NAMES.en[c.id];
    return { ...c, short, full };
  });
}

// Fill the static DOM and set <html lang/dir> + <title>/<meta description>.
export function applyStatic(root = document) {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = dirOf(lang);
  document.title = t('meta.title');
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', t('meta.description'));

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
}
