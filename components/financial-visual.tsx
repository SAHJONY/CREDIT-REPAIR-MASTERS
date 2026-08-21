import type { New850VerticalId } from '@/lib/new850-platform';

type FinancialVisualVariant = New850VerticalId | 'passport' | 'owner' | 'growth' | 'documents' | 'security' | 'readiness';

export function FinancialVisual({ variant, compact = false, label }: { variant: FinancialVisualVariant; compact?: boolean; label?: string }) {
  return (
    <figure className={`financialVisual ${compact ? 'compact' : ''} visual-${variant}`} aria-label={label || `${variant} financial illustration`}>
      <svg viewBox="0 0 1200 720" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`bg-${variant}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0d1520" />
            <stop offset="0.55" stopColor="#07101a" />
            <stop offset="1" stopColor="#03070c" />
          </linearGradient>
          <linearGradient id={`blue-${variant}`} x1="0" x2="1">
            <stop offset="0" stopColor="#2f7df7" />
            <stop offset="1" stopColor="#8ed0ff" />
          </linearGradient>
          <radialGradient id={`glow-${variant}`} cx="50%" cy="50%" r="55%">
            <stop offset="0" stopColor="#5aa7ff" stopOpacity=".34" />
            <stop offset="1" stopColor="#5aa7ff" stopOpacity="0" />
          </radialGradient>
          <filter id={`blur-${variant}`}><feGaussianBlur stdDeviation="26" /></filter>
        </defs>
        <rect width="1200" height="720" rx="44" fill={`url(#bg-${variant})`} />
        <circle cx="910" cy="190" r="260" fill={`url(#glow-${variant})`} filter={`url(#blur-${variant})`} />
        <path d="M70 606 C250 510 340 548 500 430 S840 250 1130 306" fill="none" stroke="#142336" strokeWidth="2" />
        <path d="M70 610 C250 520 355 560 515 442 S850 266 1130 320" fill="none" stroke={`url(#blue-${variant})`} strokeWidth="7" strokeLinecap="round" opacity=".9" />
        <g opacity=".2" stroke="#b8dcff"><path d="M90 150H1110"/><path d="M90 270H1110"/><path d="M90 390H1110"/><path d="M90 510H1110"/></g>
        {variant === 'auto' ? <AutoArt /> : null}
        {variant === 'mortgage' ? <MortgageArt /> : null}
        {variant === 'business' || variant === 'growth' ? <BusinessArt /> : null}
        {variant === 'loans' ? <LoansArt /> : null}
        {variant === 'marketplace' ? <MarketplaceArt /> : null}
        {variant === 'passport' || variant === 'security' ? <PassportArt /> : null}
        {variant === 'owner' ? <OwnerArt /> : null}
        {variant === 'documents' ? <DocumentsArt /> : null}
        {variant === 'readiness' ? <ReadinessArt /> : null}
      </svg>
      <figcaption><span>NEW850</span><strong>{label || visualLabel(variant)}</strong></figcaption>
    </figure>
  );
}

function visualLabel(variant: FinancialVisualVariant) {
  const labels: Record<FinancialVisualVariant, string> = {
    loans: 'Borrowing readiness', auto: 'Auto affordability', mortgage: 'Mortgage preparation', business: 'Business funding', marketplace: 'Financial marketplace', passport: 'Financial Passport', owner: 'Owner command center', growth: 'Capital growth', documents: 'Document readiness', security: 'Privacy & control', readiness: 'Readiness intelligence'
  };
  return labels[variant];
}

function AutoArt() { return <g transform="translate(590 250)"><path d="M40 250h430l-35-108c-8-25-27-42-53-47l-210-38c-27-5-55 6-71 29L40 250Z" fill="#101b29" stroke="#79baff" strokeWidth="5"/><rect x="0" y="238" width="525" height="112" rx="44" fill="#0d1621" stroke="#486f9f" strokeWidth="4"/><circle cx="120" cy="355" r="48" fill="#05090e" stroke="#8ed0ff" strokeWidth="6"/><circle cx="408" cy="355" r="48" fill="#05090e" stroke="#8ed0ff" strokeWidth="6"/><path d="M165 105h174l58 119H95l70-119Z" fill="#17304c" opacity=".85"/><path d="M55 277h414" stroke="#d9eeff" strokeOpacity=".5" strokeWidth="4"/></g> }
function MortgageArt() { return <g transform="translate(650 175)"><path d="M0 210 220 30l220 180v270H0V210Z" fill="#0d1722" stroke="#7fbfff" strokeWidth="6"/><path d="M115 480V280h210v200" fill="#101e2c" stroke="#42698f" strokeWidth="4"/><rect x="40" y="250" width="88" height="92" rx="8" fill="#1a3350"/><rect x="314" y="250" width="88" height="92" rx="8" fill="#1a3350"/><path d="M-55 220 220 0l275 220" fill="none" stroke="#d9eeff" strokeOpacity=".7" strokeWidth="8" strokeLinecap="round"/></g> }
function BusinessArt() { return <g transform="translate(620 160)"><rect x="0" y="110" width="420" height="360" rx="26" fill="#0d1621" stroke="#385c83" strokeWidth="4"/><rect x="55" y="190" width="65" height="215" rx="12" fill="#17314d"/><rect x="155" y="145" width="65" height="260" rx="12" fill="#244b73"/><rect x="255" y="95" width="65" height="310" rx="12" fill="#3776b7"/><rect x="355" y="35" width="65" height="370" rx="12" fill="#68b5ff"/><path d="M45 130 150 90 250 105 360 35" fill="none" stroke="#dff1ff" strokeWidth="7" strokeLinecap="round"/><circle cx="360" cy="35" r="12" fill="#fff"/></g> }
function LoansArt() { return <g transform="translate(625 175)"><rect x="0" y="45" width="430" height="300" rx="34" fill="#0c151f" stroke="#6eb5ff" strokeWidth="5"/><rect x="38" y="88" width="235" height="22" rx="11" fill="#1d3b5d"/><rect x="38" y="140" width="160" height="16" rx="8" fill="#172b40"/><rect x="38" y="180" width="210" height="16" rx="8" fill="#172b40"/><circle cx="347" cy="155" r="62" fill="#0b1e31" stroke="#95d2ff" strokeWidth="5"/><path d="m320 157 18 19 38-45" fill="none" stroke="#a9ddff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M55 386h350" stroke="#223a54" strokeWidth="42" strokeLinecap="round"/><path d="M55 386h255" stroke="#5aabff" strokeWidth="42" strokeLinecap="round"/></g> }
function MarketplaceArt() { return <g transform="translate(600 145)"><rect x="0" y="40" width="200" height="220" rx="28" fill="#0b1520" stroke="#4a78a7" strokeWidth="4"/><rect x="250" y="0" width="200" height="260" rx="28" fill="#0d1925" stroke="#79baff" strokeWidth="5"/><rect x="500" y="70" width="200" height="190" rx="28" fill="#0b1520" stroke="#4a78a7" strokeWidth="4"/><path d="M100 315 C210 410 390 410 600 315" fill="none" stroke="#5eaaff" strokeWidth="6" strokeLinecap="round"/><circle cx="100" cy="315" r="14" fill="#a7dbff"/><circle cx="350" cy="390" r="14" fill="#a7dbff"/><circle cx="600" cy="315" r="14" fill="#a7dbff"/><path d="M65 105h70M315 75h70M565 125h70" stroke="#8bc8ff" strokeWidth="14" strokeLinecap="round"/></g> }
function PassportArt() { return <g transform="translate(670 135)"><rect x="0" y="0" width="390" height="450" rx="34" fill="#0c151f" stroke="#76baff" strokeWidth="5"/><circle cx="105" cy="125" r="56" fill="#15304a" stroke="#9ad4ff" strokeWidth="5"/><path d="M55 230h280M55 285h230M55 340h260" stroke="#284865" strokeWidth="18" strokeLinecap="round"/><rect x="240" y="82" width="95" height="70" rx="16" fill="#152a40"/><path d="m260 116 18 18 36-40" fill="none" stroke="#8ed0ff" strokeWidth="8" strokeLinecap="round"/><circle cx="325" cy="390" r="72" fill="#07111c" stroke="#4f92d2" strokeWidth="4"/><path d="M325 350v80M285 390h80" stroke="#a7dcff" strokeWidth="7" strokeLinecap="round"/></g> }
function OwnerArt() { return <g transform="translate(575 120)"><rect x="0" y="0" width="520" height="430" rx="30" fill="#09121c" stroke="#4b759c" strokeWidth="4"/><rect x="34" y="40" width="280" height="165" rx="20" fill="#0d1a27"/><path d="M65 165 120 125 175 143 228 82 282 105" fill="none" stroke="#73baff" strokeWidth="7" strokeLinecap="round"/><rect x="342" y="40" width="140" height="165" rx="20" fill="#0d1a27"/><circle cx="412" cy="122" r="45" fill="#07111a" stroke="#75baff" strokeWidth="12" strokeDasharray="210 80"/><rect x="34" y="238" width="448" height="154" rx="20" fill="#0d1a27"/><path d="M70 335h350" stroke="#213b54" strokeWidth="18" strokeLinecap="round"/><path d="M70 335h250" stroke="#61adff" strokeWidth="18" strokeLinecap="round"/><circle cx="320" cy="335" r="12" fill="#d8efff"/></g> }
function DocumentsArt() { return <g transform="translate(660 120)"><rect x="110" y="15" width="340" height="450" rx="28" fill="#0b151f" stroke="#4b769f" strokeWidth="4" transform="rotate(6 280 240)"/><rect x="0" y="45" width="340" height="450" rx="28" fill="#0e1a27" stroke="#78baff" strokeWidth="5"/><path d="M55 140h230M55 205h185M55 270h230M55 335h150" stroke="#2d5274" strokeWidth="18" strokeLinecap="round"/><circle cx="262" cy="380" r="42" fill="#0a2134" stroke="#8acaff" strokeWidth="5"/><path d="m244 380 14 14 28-32" fill="none" stroke="#b5e0ff" strokeWidth="8" strokeLinecap="round"/></g> }
function ReadinessArt() { return <g transform="translate(650 120)"><circle cx="230" cy="230" r="170" fill="#07111a" stroke="#1d354d" strokeWidth="34"/><path d="M93 330 A170 170 0 1 1 365 335" fill="none" stroke="#67b3ff" strokeWidth="34" strokeLinecap="round"/><text x="230" y="255" textAnchor="middle" fill="#f5fbff" fontSize="96" fontWeight="500">82</text><text x="230" y="310" textAnchor="middle" fill="#8bbfe9" fontSize="24">READINESS</text><path d="M55 515h350" stroke="#223c55" strokeWidth="18" strokeLinecap="round"/><path d="M55 515h285" stroke="#5baaff" strokeWidth="18" strokeLinecap="round"/></g> }
