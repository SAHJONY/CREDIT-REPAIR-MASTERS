'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const languages = [
  ['en','English'],['es','Español'],['fr','Français'],['pt','Português'],['de','Deutsch'],['it','Italiano'],
  ['ar','العربية'],['hi','हिन्दी'],['zh','中文'],['ja','日本語'],['ko','한국어'],['ru','Русский'],
  ['tr','Türkçe'],['vi','Tiếng Việt'],['id','Bahasa Indonesia'],['pl','Polski'],['nl','Nederlands'],
  ['he','עברית'],['fa','فارسی'],['ur','اردو'],['bn','বাংলা'],['sw','Kiswahili']
] as const;

type Locale = typeof languages[number][0];
type TranslationMap = Record<string,string>;
const rtl = new Set<Locale>(['ar','he','fa','ur']);
const ATTRS = ['placeholder','title','aria-label'] as const;
const originalText = new WeakMap<Text,string>();
const originalAttrs = new WeakMap<Element,Record<string,string>>();
const FAILURE_COOLDOWN_MS = 5 * 60 * 1000;

const core: Partial<Record<Locale,TranslationMap>> = {
  es:{'Home':'Inicio','Services':'Servicios','How It Works':'Cómo funciona','Results':'Resultados','Pricing':'Precios','Education':'Educación','About Us':'Nosotros','Get Started':'Comenzar','Get Started Now':'Comenzar ahora','Client Portal':'Portal del cliente','Staff':'Equipo','Dashboard':'Panel','Clients':'Clientes','Documents':'Documentos','Payments':'Pagos','Billing':'Facturación','Compliance':'Cumplimiento','Credit Progress':'Progreso de crédito','Reports & Scores':'Reportes y puntajes','Disputes':'Disputas','Account':'Cuenta','Account Settings':'Configuración','View Your Progress':'Ver tu progreso','View Reports':'Ver reportes','View Documents':'Ver documentos','View Billing':'Ver facturación','Credit Reports':'Reportes de crédito','Items Under Review':'Elementos en revisión','Progress Overview':'Resumen del progreso','Recent Activity':'Actividad reciente','Financial Education':'Educación financiera','Secure & Confidential':'Seguro y confidencial','Pending':'Pendiente','Completed':'Completado','Current':'Actual','Open':'Abrir','Close':'Cerrar','Save':'Guardar','Cancel':'Cancelar','Continue':'Continuar','Sign in':'Iniciar sesión','Sign out':'Cerrar sesión'},
  fr:{'Home':'Accueil','Services':'Services','Dashboard':'Tableau de bord','Clients':'Clients','Documents':'Documents','Payments':'Paiements','Billing':'Facturation','Compliance':'Conformité','Account':'Compte','Pending':'En attente','Completed':'Terminé'},
  pt:{'Home':'Início','Services':'Serviços','Dashboard':'Painel','Clients':'Clientes','Documents':'Documentos','Payments':'Pagamentos','Billing':'Cobrança','Compliance':'Conformidade','Account':'Conta','Pending':'Pendente','Completed':'Concluído'},
  de:{'Home':'Start','Services':'Leistungen','Dashboard':'Übersicht','Clients':'Kunden','Documents':'Dokumente','Payments':'Zahlungen','Billing':'Abrechnung','Compliance':'Compliance','Account':'Konto','Pending':'Ausstehend','Completed':'Abgeschlossen'},
  it:{'Home':'Home','Services':'Servizi','Dashboard':'Dashboard','Clients':'Clienti','Documents':'Documenti','Payments':'Pagamenti','Billing':'Fatturazione','Compliance':'Conformità','Account':'Account'},
  ar:{'Home':'الرئيسية','Services':'الخدمات','Dashboard':'لوحة التحكم','Clients':'العملاء','Documents':'المستندات','Payments':'المدفوعات','Billing':'الفوترة','Compliance':'الامتثال','Account':'الحساب'},
  zh:{'Home':'首页','Services':'服务','Dashboard':'仪表板','Clients':'客户','Documents':'文件','Payments':'付款','Billing':'账单','Compliance':'合规','Account':'账户'},
  ja:{'Home':'ホーム','Services':'サービス','Dashboard':'ダッシュボード','Clients':'顧客','Documents':'書類','Payments':'支払い','Billing':'請求','Compliance':'コンプライアンス','Account':'アカウント'},
  ko:{'Home':'홈','Services':'서비스','Dashboard':'대시보드','Clients':'고객','Documents':'문서','Payments':'결제','Billing':'청구','Compliance':'규정 준수','Account':'계정'},
  ru:{'Home':'Главная','Services':'Услуги','Dashboard':'Панель','Clients':'Клиенты','Documents':'Документы','Payments':'Платежи','Billing':'Биллинг','Compliance':'Соответствие','Account':'Аккаунт'}
};

function cacheKey(locale: Locale) { return `crm-i18n-v3:${locale}`; }
function failureKey(locale: Locale) { return `crm-i18n-v3:cooldown:${locale}`; }
function loadCache(locale: Locale): TranslationMap {
  try { return { ...(core[locale] || {}), ...JSON.parse(localStorage.getItem(cacheKey(locale)) || '{}') }; }
  catch { return { ...(core[locale] || {}) }; }
}
function saveCache(locale: Locale, map: TranslationMap) {
  try { localStorage.setItem(cacheKey(locale), JSON.stringify(map)); } catch { /* storage can be unavailable */ }
}
function translationCoolingDown(locale: Locale) {
  try {
    const until = Number(localStorage.getItem(failureKey(locale)) || 0);
    if (!Number.isFinite(until) || until <= Date.now()) {
      localStorage.removeItem(failureKey(locale));
      return false;
    }
    return true;
  } catch { return false; }
}
function startTranslationCooldown(locale: Locale) {
  try { localStorage.setItem(failureKey(locale), String(Date.now() + FAILURE_COOLDOWN_MS)); } catch { /* storage can be unavailable */ }
}
function clearTranslationCooldown(locale: Locale) {
  try { localStorage.removeItem(failureKey(locale)); } catch { /* storage can be unavailable */ }
}
function isSkippedElement(element: Element | null) {
  return !element || Boolean(element.closest('[data-no-translate]')) || ['SCRIPT','STYLE','CODE','PRE'].includes(element.tagName);
}
function translatable(source: string) {
  const text = source.trim();
  if (!text || text.length > 700) return false;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(text) || /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(text)) return false;
  if (/^[\d\s$€£¥₹.,:%+#*()\-/]+$/.test(text)) return false;
  if (/^[A-Z0-9_-]{18,}$/.test(text)) return false;
  return /[A-Za-zÀ-ÿ]/.test(text);
}
function rememberText(node: Text) { if (!originalText.has(node)) originalText.set(node, node.nodeValue || ''); return originalText.get(node) || ''; }
function rememberAttr(element: Element, attr: string, value: string) {
  const stored = originalAttrs.get(element) || {};
  if (!(attr in stored)) { stored[attr] = value; originalAttrs.set(element, stored); }
  return stored[attr] || value;
}
function sourceStrings(root: ParentNode = document.body) {
  const strings = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node) {
    const parent = node.parentElement;
    if (isSkippedElement(parent) || parent?.tagName === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
    const source = rememberText(node as Text).trim();
    return translatable(source) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
  }});
  while (walker.nextNode()) strings.add(rememberText(walker.currentNode as Text).trim());
  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll('*'))] : Array.from(root.querySelectorAll('*'));
  for (const element of elements) {
    if (isSkippedElement(element)) continue;
    for (const attr of ATTRS) { const value = element.getAttribute(attr); if (value) { const source = rememberAttr(element, attr, value).trim(); if (translatable(source)) strings.add(source); } }
    if (element instanceof HTMLInputElement && ['button','submit','reset'].includes(element.type) && element.value) {
      const source = rememberAttr(element, 'value', element.value).trim(); if (translatable(source)) strings.add(source);
    }
  }
  return [...strings];
}
function applyTranslations(locale: Locale, map: TranslationMap, root: ParentNode = document.body) {
  document.documentElement.lang = locale;
  document.documentElement.dir = rtl.has(locale) ? 'rtl' : 'ltr';
  document.body.dataset.locale = locale;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node) {
    const parent = node.parentElement;
    return isSkippedElement(parent) || parent?.tagName === 'TEXTAREA' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  }});
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const sourceRaw = rememberText(node); const source = sourceRaw.trim();
    const translated = locale === 'en' ? source : map[source];
    if (translated && source) node.nodeValue = sourceRaw.replace(source, translated);
  }
  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll('*'))] : Array.from(root.querySelectorAll('*'));
  for (const element of elements) {
    if (isSkippedElement(element)) continue;
    for (const attr of ATTRS) {
      const current = element.getAttribute(attr); if (!current) continue;
      const source = rememberAttr(element, attr, current).trim(); const translated = locale === 'en' ? source : map[source];
      if (translated) element.setAttribute(attr, translated);
    }
    if (element instanceof HTMLInputElement && ['button','submit','reset'].includes(element.type) && element.value) {
      const source = rememberAttr(element, 'value', element.value).trim(); const translated = locale === 'en' ? source : map[source]; if (translated) element.value = translated;
    }
  }
}

async function fetchMissing(locale: Locale, strings: string[], map: TranslationMap) {
  if (locale === 'en' || translationCoolingDown(locale)) return { map, available: locale === 'en' };
  const missing = strings.filter((source) => !map[source]);
  if (!missing.length) return { map, available: true };
  for (let i = 0; i < missing.length; i += 80) {
    try {
      const response = await fetch('/api/ui-translate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ locale, strings: missing.slice(i, i + 80) }) });
      if (!response.ok) {
        startTranslationCooldown(locale);
        return { map, available: false };
      }
      const data = await response.json() as { translations?: TranslationMap };
      Object.assign(map, data.translations || {});
    } catch {
      startTranslationCooldown(locale);
      return { map, available: false };
    }
  }
  clearTranslationCooldown(locale);
  saveCache(locale, map);
  return { map, available: true };
}

export function GlobalLanguageSwitcher() {
  const [locale,setLocale] = useState<Locale>('en');
  const options = useMemo(() => languages, []);
  const running = useRef(false);
  const activeLocale = useRef<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('crm-locale') as Locale | null;
    const browser = navigator.language.split('-')[0] as Locale;
    const selected = options.some(([code]) => code === saved) ? saved! : options.some(([code]) => code === browser) ? browser : 'en';
    setLocale(selected); activeLocale.current = selected;
    let map = loadCache(selected);
    applyTranslations(selected, map);

    async function translateAll() {
      if (running.current || activeLocale.current === 'en' || translationCoolingDown(activeLocale.current)) return;
      const missing = sourceStrings().filter((source) => !map[source]);
      if (!missing.length) return;
      running.current = true;
      try {
        const result = await fetchMissing(activeLocale.current, missing, map);
        map = result.map;
        applyTranslations(activeLocale.current, map);
      } finally {
        running.current = false;
      }
    }
    void translateAll();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        applyTranslations(activeLocale.current, map);
        if (!translationCoolingDown(activeLocale.current)) void translateAll();
      }, 250);
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:[...ATTRS,'value'] });
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [options]);

  function change(next: Locale) {
    localStorage.setItem('crm-locale',next);
    clearTranslationCooldown(next);
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
