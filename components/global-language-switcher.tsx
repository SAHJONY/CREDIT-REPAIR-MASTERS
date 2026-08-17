'use client';

import { useEffect, useMemo, useState } from 'react';

const languages = [
  ['en','English'],['es','Español'],['fr','Français'],['pt','Português'],['de','Deutsch'],['it','Italiano'],
  ['ar','العربية'],['hi','हिन्दी'],['zh','中文'],['ja','日本語'],['ko','한국어'],['ru','Русский'],
  ['tr','Türkçe'],['vi','Tiếng Việt'],['id','Bahasa Indonesia'],['pl','Polski'],['nl','Nederlands'],
  ['he','עברית'],['fa','فارسی'],['ur','اردو'],['bn','বাংলা'],['sw','Kiswahili']
] as const;

type Locale = typeof languages[number][0];

const rtl = new Set<Locale>(['ar','he','fa','ur']);

const translations: Record<Locale, Record<string,string>> = {
  en:{},
  es:{'Home':'Inicio','Services':'Servicios','How It Works':'Cómo funciona','Results':'Resultados','Pricing':'Precios','Education':'Educación','About Us':'Nosotros','Get Started':'Comenzar','Get Started Now':'Comenzar ahora','Client Portal':'Portal del cliente','Staff':'Equipo','Dashboard':'Panel','Clients':'Clientes','Documents':'Documentos','Payments':'Pagos','Billing':'Facturación','Compliance':'Cumplimiento','Credit Progress':'Progreso de crédito','Reports & Scores':'Reportes y puntajes','Disputes':'Disputas','Account':'Cuenta','Account Settings':'Configuración','View Your Progress':'Ver tu progreso','View Reports':'Ver reportes','View Documents':'Ver documentos','View Billing':'Ver facturación','Credit Reports':'Reportes de crédito','Items Under Review':'Elementos en revisión','Disputes In Progress':'Disputas en proceso','Progress Overview':'Resumen del progreso','Recent Activity':'Actividad reciente','Financial Education':'Educación financiera','Secure & Confidential':'Seguro y confidencial','We Repair Credit.':'Reparamos tu crédito.','You Build Dreams.':'Tú construyes tus sueños.','A Better Score Changes Everything':'Un mejor puntaje lo cambia todo'},
  fr:{'Home':'Accueil','Services':'Services','How It Works':'Fonctionnement','Results':'Résultats','Pricing':'Tarifs','Education':'Éducation','About Us':'À propos','Get Started':'Commencer','Client Portal':'Portail client','Staff':'Équipe','Dashboard':'Tableau de bord','Clients':'Clients','Documents':'Documents','Payments':'Paiements','Billing':'Facturation','Compliance':'Conformité','Credit Progress':'Progression du crédit','Reports & Scores':'Rapports et scores','Disputes':'Contestations','Account':'Compte','View Your Progress':'Voir votre progression','Credit Reports':'Rapports de crédit','Financial Education':'Éducation financière'},
  pt:{'Home':'Início','Services':'Serviços','How It Works':'Como funciona','Results':'Resultados','Pricing':'Preços','Education':'Educação','About Us':'Sobre nós','Get Started':'Começar','Client Portal':'Portal do cliente','Staff':'Equipe','Dashboard':'Painel','Clients':'Clientes','Documents':'Documentos','Payments':'Pagamentos','Billing':'Cobrança','Compliance':'Conformidade','Credit Progress':'Progresso de crédito','Reports & Scores':'Relatórios e pontuações','Disputes':'Contestações','Account':'Conta','View Your Progress':'Ver seu progresso','Credit Reports':'Relatórios de crédito','Financial Education':'Educação financeira'},
  de:{'Home':'Start','Services':'Leistungen','How It Works':'So funktioniert es','Results':'Ergebnisse','Pricing':'Preise','Education':'Bildung','About Us':'Über uns','Get Started':'Loslegen','Client Portal':'Kundenportal','Staff':'Team','Dashboard':'Übersicht','Clients':'Kunden','Documents':'Dokumente','Payments':'Zahlungen','Billing':'Abrechnung','Compliance':'Compliance','Credit Progress':'Kreditfortschritt','Reports & Scores':'Berichte & Scores','Disputes':'Einwände','Account':'Konto','View Your Progress':'Fortschritt ansehen','Credit Reports':'Kreditberichte'},
  it:{'Home':'Home','Services':'Servizi','How It Works':'Come funziona','Results':'Risultati','Pricing':'Prezzi','Education':'Educazione','About Us':'Chi siamo','Get Started':'Inizia','Client Portal':'Portale cliente','Staff':'Staff','Dashboard':'Dashboard','Clients':'Clienti','Documents':'Documenti','Payments':'Pagamenti','Billing':'Fatturazione','Compliance':'Conformità','Credit Progress':'Progresso credito','Reports & Scores':'Report e punteggi','Disputes':'Contestazioni','Account':'Account'},
  ar:{'Home':'الرئيسية','Services':'الخدمات','How It Works':'كيف يعمل','Results':'النتائج','Pricing':'الأسعار','Education':'التعليم','About Us':'من نحن','Get Started':'ابدأ الآن','Client Portal':'بوابة العميل','Staff':'الفريق','Dashboard':'لوحة التحكم','Clients':'العملاء','Documents':'المستندات','Payments':'المدفوعات','Billing':'الفوترة','Compliance':'الامتثال','Credit Progress':'تقدم الائتمان','Reports & Scores':'التقارير والدرجات','Disputes':'الاعتراضات','Account':'الحساب','Credit Reports':'تقارير الائتمان'},
  hi:{'Home':'होम','Services':'सेवाएँ','How It Works':'यह कैसे काम करता है','Results':'परिणाम','Pricing':'मूल्य','Education':'शिक्षा','About Us':'हमारे बारे में','Get Started':'शुरू करें','Client Portal':'क्लाइंट पोर्टल','Staff':'टीम','Dashboard':'डैशबोर्ड','Clients':'क्लाइंट','Documents':'दस्तावेज़','Payments':'भुगतान','Billing':'बिलिंग','Compliance':'अनुपालन','Credit Progress':'क्रेडिट प्रगति','Disputes':'विवाद','Account':'खाता'},
  zh:{'Home':'首页','Services':'服务','How It Works':'运作方式','Results':'成果','Pricing':'价格','Education':'教育','About Us':'关于我们','Get Started':'开始','Client Portal':'客户门户','Staff':'员工','Dashboard':'仪表板','Clients':'客户','Documents':'文件','Payments':'付款','Billing':'账单','Compliance':'合规','Credit Progress':'信用进度','Reports & Scores':'报告与评分','Disputes':'争议','Account':'账户','Credit Reports':'信用报告'},
  ja:{'Home':'ホーム','Services':'サービス','How It Works':'仕組み','Results':'実績','Pricing':'料金','Education':'教育','About Us':'会社情報','Get Started':'始める','Client Portal':'クライアントポータル','Staff':'スタッフ','Dashboard':'ダッシュボード','Clients':'顧客','Documents':'書類','Payments':'支払い','Billing':'請求','Compliance':'コンプライアンス','Credit Progress':'信用改善の進捗','Disputes':'異議申し立て','Account':'アカウント'},
  ko:{'Home':'홈','Services':'서비스','How It Works':'이용 방법','Results':'결과','Pricing':'가격','Education':'교육','About Us':'회사 소개','Get Started':'시작하기','Client Portal':'고객 포털','Staff':'직원','Dashboard':'대시보드','Clients':'고객','Documents':'문서','Payments':'결제','Billing':'청구','Compliance':'규정 준수','Credit Progress':'신용 진행','Disputes':'이의 제기','Account':'계정'},
  ru:{'Home':'Главная','Services':'Услуги','How It Works':'Как это работает','Results':'Результаты','Pricing':'Цены','Education':'Обучение','About Us':'О нас','Get Started':'Начать','Client Portal':'Портал клиента','Staff':'Команда','Dashboard':'Панель','Clients':'Клиенты','Documents':'Документы','Payments':'Платежи','Billing':'Биллинг','Compliance':'Соответствие','Credit Progress':'Прогресс кредита','Disputes':'Споры','Account':'Аккаунт'},
  tr:{'Home':'Ana Sayfa','Services':'Hizmetler','Results':'Sonuçlar','Pricing':'Fiyatlar','Education':'Eğitim','Get Started':'Başlayın','Client Portal':'Müşteri Portalı','Dashboard':'Kontrol Paneli','Clients':'Müşteriler','Documents':'Belgeler','Payments':'Ödemeler','Billing':'Faturalama','Compliance':'Uyumluluk','Account':'Hesap'},
  vi:{'Home':'Trang chủ','Services':'Dịch vụ','Results':'Kết quả','Pricing':'Giá','Education':'Giáo dục','Get Started':'Bắt đầu','Client Portal':'Cổng khách hàng','Dashboard':'Bảng điều khiển','Clients':'Khách hàng','Documents':'Tài liệu','Payments':'Thanh toán','Billing':'Hóa đơn','Compliance':'Tuân thủ','Account':'Tài khoản'},
  id:{'Home':'Beranda','Services':'Layanan','Results':'Hasil','Pricing':'Harga','Education':'Edukasi','Get Started':'Mulai','Client Portal':'Portal Klien','Dashboard':'Dasbor','Clients':'Klien','Documents':'Dokumen','Payments':'Pembayaran','Billing':'Penagihan','Compliance':'Kepatuhan','Account':'Akun'},
  pl:{'Home':'Strona główna','Services':'Usługi','Results':'Wyniki','Pricing':'Ceny','Education':'Edukacja','Get Started':'Zacznij','Client Portal':'Portal klienta','Dashboard':'Panel','Clients':'Klienci','Documents':'Dokumenty','Payments':'Płatności','Billing':'Rozliczenia','Compliance':'Zgodność','Account':'Konto'},
  nl:{'Home':'Home','Services':'Diensten','Results':'Resultaten','Pricing':'Prijzen','Education':'Educatie','Get Started':'Beginnen','Client Portal':'Klantportaal','Dashboard':'Dashboard','Clients':'Klanten','Documents':'Documenten','Payments':'Betalingen','Billing':'Facturatie','Compliance':'Compliance','Account':'Account'},
  he:{'Home':'בית','Services':'שירותים','Results':'תוצאות','Pricing':'מחירים','Education':'השכלה','Get Started':'התחל','Client Portal':'פורטל לקוח','Dashboard':'לוח בקרה','Clients':'לקוחות','Documents':'מסמכים','Payments':'תשלומים','Billing':'חיוב','Compliance':'ציות','Account':'חשבון'},
  fa:{'Home':'خانه','Services':'خدمات','Results':'نتایج','Pricing':'قیمت‌ها','Education':'آموزش','Get Started':'شروع کنید','Client Portal':'پرتال مشتری','Dashboard':'داشبورد','Clients':'مشتریان','Documents':'اسناد','Payments':'پرداخت‌ها','Billing':'صورتحساب','Compliance':'انطباق','Account':'حساب'},
  ur:{'Home':'ہوم','Services':'خدمات','Results':'نتائج','Pricing':'قیمتیں','Education':'تعلیم','Get Started':'شروع کریں','Client Portal':'کلائنٹ پورٹل','Dashboard':'ڈیش بورڈ','Clients':'کلائنٹس','Documents':'دستاویزات','Payments':'ادائیگیاں','Billing':'بلنگ','Compliance':'تعمیل','Account':'اکاؤنٹ'},
  bn:{'Home':'হোম','Services':'সেবা','Results':'ফলাফল','Pricing':'মূল্য','Education':'শিক্ষা','Get Started':'শুরু করুন','Client Portal':'ক্লায়েন্ট পোর্টাল','Dashboard':'ড্যাশবোর্ড','Clients':'ক্লায়েন্ট','Documents':'নথি','Payments':'পেমেন্ট','Billing':'বিলিং','Compliance':'কমপ্লায়েন্স','Account':'অ্যাকাউন্ট'},
  sw:{'Home':'Nyumbani','Services':'Huduma','Results':'Matokeo','Pricing':'Bei','Education':'Elimu','Get Started':'Anza','Client Portal':'Lango la Mteja','Dashboard':'Dashibodi','Clients':'Wateja','Documents':'Nyaraka','Payments':'Malipo','Billing':'Bili','Compliance':'Uzingatiaji','Account':'Akaunti'}
};

function translateDocument(locale: Locale) {
  const dict = translations[locale];
  document.documentElement.lang = locale;
  document.documentElement.dir = rtl.has(locale) ? 'rtl' : 'ltr';
  document.body.dataset.locale = locale;
  if (locale === 'en') return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT','STYLE','TEXTAREA','OPTION'].includes(parent.tagName) || parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const raw = node.nodeValue || '';
    const trimmed = raw.trim();
    const translated = dict[trimmed];
    if (translated) node.nodeValue = raw.replace(trimmed, translated);
  }
}

export function GlobalLanguageSwitcher() {
  const [locale,setLocale] = useState<Locale>('en');
  const options = useMemo(() => languages, []);
  useEffect(() => {
    const saved = localStorage.getItem('crm-locale') as Locale | null;
    const browser = navigator.language.split('-')[0] as Locale;
    const selected = options.some(([code]) => code === saved) ? saved! : options.some(([code]) => code === browser) ? browser : 'en';
    setLocale(selected);
    queueMicrotask(() => translateDocument(selected));
  }, [options]);
  function change(next: Locale) {
    localStorage.setItem('crm-locale',next);
    setLocale(next);
    window.location.reload();
  }
  return <div className="globalLanguage" data-no-translate>
    <span aria-hidden="true">◎</span>
    <select aria-label="Language" value={locale} onChange={(e)=>change(e.target.value as Locale)}>
      {options.map(([code,label]) => <option value={code} key={code}>{label}</option>)}
    </select>
  </div>;
}
