
/* ------------------------------------------------------------------ */
/*  React (cargado como global vía CDN en index.html)                   */
/* ------------------------------------------------------------------ */

const { useState, useEffect, useMemo, useCallback } = React;

/* ------------------------------------------------------------------ */
/*  Firebase (Auth + Firestore) — reemplaza el config de abajo con     */
/*  el de TU proyecto (ver README.md, sección "Configurar Firebase")   */
/* ------------------------------------------------------------------ */

const firebaseConfig = {
  apiKey: "AIzaSyBZKiro5ROa4WO3h5X-cUHJZpdEiBDGJtw",
  authDomain: "control-de-dinero-5b783.firebaseapp.com",
  projectId: "control-de-dinero-5b783",
  storageBucket: "control-de-dinero-5b783.firebasestorage.app",
  messagingSenderId: "461614142499",
  appId: "1:461614142499:web:2dd8c137925ba09cf88d96"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

/* ------------------------------------------------------------------ */
/*  Persistencia en la nube (Firestore, un documento por usuario)      */
/* ------------------------------------------------------------------ */

async function cloudLoad(uid) {
  try {
    const snap = await db.collection("usuarios").doc(uid).get();
    return snap.exists ? snap.data() : null;
  } catch (e) {
    console.error("Error cargando datos:", e);
    return null;
  }
}
async function cloudSave(uid, data) {
  try {
    await db.collection("usuarios").doc(uid).set(data, { merge: true });
    return true;
  } catch (e) {
    console.error("Error guardando datos:", e);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Íconos (SVG propios, sin dependencias externas)                    */
/* ------------------------------------------------------------------ */

const ICON_PATHS = {
  LayoutDashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  Receipt: "M6 2h12v20l-3-2-3 2-3-2-3 2zM8 7h8M8 11h8M8 15h5",
  PiggyBank: "M19 9a2 2 0 100-4 2 2 0 000 4zM3 12c0-3.9 3.6-7 8-7 4 0 7.3 2.4 7.9 5.6L21 11l-1 3h-2v3a2 2 0 01-2 2h-1l-1 3H9l-.5-2c-3-.6-5.5-2.8-5.5-5.5zM6 12h.01",
  CreditCard: "M2 6h20v12H2zM2 10h20M6 15h4",
  Wallet: "M3 7a2 2 0 012-2h13a1 1 0 011 1v2M3 7v11a2 2 0 002 2h14a2 2 0 002-2v-8a1 1 0 00-1-1h-4a2 2 0 100 4h5",
  Plus: "M12 5v14M5 12h14",
  Trash2: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6",
  TrendingUp: "M3 17l6-6 4 4 8-8M15 7h6v6",
  TrendingDown: "M3 7l6 6 4-4 8 8M21 11v6h-6",
  AlertTriangle: "M10.3 3.9L2.6 18a1 1 0 00.9 1.5h17a1 1 0 00.9-1.5L13.7 3.9a1 1 0 00-1.7 0zM12 9v4M12 17h.01",
  ArrowLeftRight: "M7 3l-4 4 4 4M3 7h13M17 21l4-4-4-4M21 17H8",
  X: "M18 6L6 18M6 6l12 12",
  Pencil: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z",
  HandCoins: "M12 8a2 2 0 100-4 2 2 0 000 4zM3 15l4-4h5l3.5 1.5a1.2 1.2 0 01-1 2.2L11 14M3 15v5h4v-5M7 20l4-1 7 1 3-3",
  Landmark: "M3 21h18M4 10h16M12 3l9 5H3zM6 10v8M10 10v8M14 10v8M18 10v8",
  ChevronDown: "M6 9l6 6 6-6",
  Check: "M20 6L9 17l-5-5",
  Menu: "M4 6h16M4 12h16M4 18h16",
  Search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  Download: "M12 3v13m0 0l-4-4m4 4l4-4M4 20h16",
};

function Ico({ name, size = 16, className = "" }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Constantes y datos semilla                                         */
/* ------------------------------------------------------------------ */

// Empiezas desde cero: sin cuentas, sin movimientos ni tarjetas de ejemplo.
// Agrega tus propias cuentas, movimientos y tarjetas desde la app.
const ACCOUNTS_SEED = [];

const BASICOS_CATS = ["Instituto", "Salud", "Transporte", "Servicios", "Cosas para el hogar", "Mascotas", "Productos de limpieza", "Aseo personal", "Medicinas y vitaminas", "Comida", "Hospedaje", "Otros"];
const DESEO_CATS = ["Comida y restaurantes", "Tiendas de conveniencia", "Perfumes", "Ropa", "Juegos", "Compras en línea", "Snacks y antojos", "Otros"];

// Plantilla de categorías comunes con presupuesto en S/0 — edítalas o ponles
// monto en la pestaña "Presupuestos" cuando quieras.
const BUDGETS_SEED = [
  ...BASICOS_CATS.map((c) => ({ id: `Básicos:${c}`, grupo: "Básicos", categoria: c, presupuesto: 0 })),
  ...DESEO_CATS.map((c) => ({ id: `Deseo:${c}`, grupo: "Deseo", categoria: c, presupuesto: 0 })),
];

const TRANSACTIONS_SEED = [];

const CREDIT_CARDS_SEED = [];

const LOANS_SEED = [];

const DEFAULT_SETTINGS = { tipoCambio: 3.55 };

const CURRENCY_LABEL = { PEN: "Soles", USD: "Dólares" };
const CURRENCY_SYMBOL = { PEN: "S/", USD: "US$" };

const GRUPO_COLORS = {
  "Instituto": "#0d9488", "Salud": "#dc2626", "Transporte": "#2563eb", "Servicios": "#7c3aed",
  "Cosas para el hogar": "#b45309", "Mascotas": "#059669", "Productos de limpieza": "#0891b2",
  "Aseo personal": "#c026d3", "Medicinas y vitaminas": "#e11d48", "Comida": "#65a30d", "Hospedaje": "#4338ca",
  "Comida y restaurantes": "#f59e0b", "Tiendas de conveniencia": "#ef4444", "Perfumes": "#a855f7",
  "Ropa": "#3b82f6", "Juegos": "#14b8a6", "Compras en línea": "#f97316", "Snacks y antojos": "#84cc16",
  "Otros": "#78716c",
};
const PALETTE = ["#0d9488", "#f59e0b", "#dc2626", "#2563eb", "#7c3aed", "#059669", "#e11d48", "#c026d3", "#84cc16", "#78716c"];

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

const uid = () => Math.random().toString(36).slice(2, 10);
const monthKey = (iso) => iso.slice(0, 7);
const monthLabel = (mk) => {
  const [y, m] = mk.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" });
};
const fmt = (n, moneda = "PEN") => {
  const symbol = moneda === "USD" ? "US$" : "S/";
  const val = (n ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol} ${val}`;
};
const todayISO = () => new Date().toISOString().slice(0, 10);

// Exporta una lista de movimientos a un archivo CSV descargable (respaldo / portabilidad de datos).
function exportTransactionsCSV(transactions) {
  const headers = ["Fecha", "Tipo", "Grupo", "Categoría", "Cuenta", "Cuenta destino", "Descripción", "Moneda", "Monto", "Recurrente"];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = transactions.map((t) => [t.fecha, t.tipo, t.grupo, t.categoria, t.cuenta, t.cuentaDestino || "", t.descripcion || "", t.moneda || "PEN", t.monto, t.recurrente || ""]);
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `movimientos_${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Cuota mensual con interés compuesto (método francés), a partir de una tasa
// efectiva anual (TEA). Si no hay tasa o cuotas, reparte el monto en partes iguales.
function calcularCuotaMensual(monto, tasaAnualPct, numCuotas) {
  if (!numCuotas || numCuotas <= 0) return 0;
  const tea = (tasaAnualPct || 0) / 100;
  if (tea <= 0) return monto / numCuotas;
  const tasaMensual = Math.pow(1 + tea, 1 / 12) - 1;
  return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -numCuotas));
}

// Genera un cronograma mensual por defecto (uno por cuota) a partir de la fecha de la primera cuota.
function generarFechasCuotasDefault(fechaInicio, numCuotas) {
  if (!fechaInicio || !numCuotas || numCuotas <= 0) return [];
  const start = new Date(fechaInicio + "T00:00:00");
  const fechas = [];
  for (let i = 0; i < numCuotas; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    fechas.push(d.toISOString().slice(0, 10));
  }
  return fechas;
}

// Devuelve el cronograma de vencimientos de un préstamo: usa las fechas
// personalizadas (loan.fechasCuotas) si existen y coinciden con numCuotas;
// si no, cae en el cálculo mensual automático desde la primera cuota.
function fechasCuotasDe(loan) {
  if (Array.isArray(loan.fechasCuotas) && loan.fechasCuotas.length === loan.numCuotas) {
    return loan.fechasCuotas;
  }
  return generarFechasCuotasDefault(loan.fechaPrimeraCuota, loan.numCuotas);
}

// A partir del cronograma de cuotas, calcula cuál cuota (1..N) es la próxima por vencer.
function proximaCuotaInfo(loan) {
  if (!loan.numCuotas) return null;
  const fechas = fechasCuotasDe(loan);
  if (fechas.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < fechas.length; i++) {
    const d = new Date(fechas[i] + "T00:00:00");
    if (d >= today) {
      return { completado: false, numero: i + 1, fecha: fechas[i] };
    }
  }
  return { completado: true };
}

/* ------------------------------------------------------------------ */
/*  Gráficos en SVG puro (sin dependencias externas)                    */
/* ------------------------------------------------------------------ */

function DonutChart({ data, size = 200 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2;
  const inner = radius * 0.6;
  const cx = radius;
  const cy = radius;
  let cumulative = 0;

  if (total === 0) return null;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size}>
      {data.map((d, i) => {
        const startAngle = (cumulative / total) * 2 * Math.PI;
        cumulative += d.value;
        const endAngle = (cumulative / total) * 2 * Math.PI;
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const x1 = cx + radius * Math.sin(startAngle);
        const y1 = cy - radius * Math.cos(startAngle);
        const x2 = cx + radius * Math.sin(endAngle);
        const y2 = cy - radius * Math.cos(endAngle);
        const ix1 = cx + inner * Math.sin(startAngle);
        const iy1 = cy - inner * Math.cos(startAngle);
        const ix2 = cx + inner * Math.sin(endAngle);
        const iy2 = cy - inner * Math.cos(endAngle);
        // Si es la única rebanada (100%), dibuja un círculo completo en vez de un arco degenerado
        if (data.length === 1) {
          return (
            <g key={d.name}>
              <circle cx={cx} cy={cy} r={radius} fill={d.color} />
              <circle cx={cx} cy={cy} r={inner} fill="white" />
            </g>
          );
        }
        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
        return (
          <path key={d.name} d={path} fill={d.color}>
            <title>{`${d.name}: ${fmt(d.value)}`}</title>
          </path>
        );
      })}
    </svg>
  );
}

function GroupedBarChart({ data, seriesKeys, colors, height = 240 }) {
  const width = 600;
  const padding = { top: 10, right: 10, bottom: 26, left: 46 };
  const maxVal = Math.max(1, ...data.flatMap((d) => seriesKeys.map((k) => d[k] || 0)));
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const groupW = data.length ? chartW / data.length : chartW;
  const barW = groupW / (seriesKeys.length + 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = padding.top + chartH * (1 - f);
        return (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e7e5e4" strokeWidth="1" />
            <text x={padding.left - 6} y={y + 3} fontSize="10" textAnchor="end" fill="#a8a29e">
              {(maxVal * f).toFixed(0)}
            </text>
          </g>
        );
      })}
      {data.map((d, gi) => (
        <g key={d.mes + gi} transform={`translate(${padding.left + gi * groupW},0)`}>
          {seriesKeys.map((k, si) => {
            const val = d[k] || 0;
            const h = chartH * (val / maxVal);
            const x = barW * (si + 0.5);
            const y = padding.top + chartH - h;
            return (
              <rect key={k} x={x} y={y} width={barW * 0.8} height={Math.max(0, h)} fill={colors[si]} rx="3">
                <title>{`${k} ${d.mes}: ${fmt(val)}`}</title>
              </rect>
            );
          })}
          <text x={groupW / 2} y={height - 8} fontSize="11" textAnchor="middle" fill="#57534e" className="capitalize">
            {d.mes}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TrendLineChart({ data, dataKey, height = 200, color = "#0d9488" }) {
  const width = 600;
  const padding = { top: 16, right: 14, bottom: 26, left: 46 };
  const values = data.map((d) => d[dataKey] || 0);
  const maxAbs = Math.max(1, ...values.map((v) => Math.abs(v)));
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;
  const zeroY = padding.top + chartH / 2;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: zeroY - (chartH / 2) * ((d[dataKey] || 0) / maxAbs),
    val: d[dataKey] || 0,
    label: d.mes,
  }));
  const pathD = points.map((p, i) => (i === 0 ? "M" : "L") + `${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <line x1={padding.left} x2={width - padding.right} y1={zeroY} y2={zeroY} stroke="#e7e5e4" />
      {points.length > 1 && <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={color}>
            <title>{`${p.label}: ${fmt(p.val)}`}</title>
          </circle>
          <text x={p.x} y={height - 8} fontSize="11" textAnchor="middle" fill="#57534e" className="capitalize">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Componentes reutilizables                                          */
/* ------------------------------------------------------------------ */

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <h3 className="font-serif text-lg text-stone-900">{title}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
            <Ico name="X" size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Diálogo de confirmación para acciones destructivas (reemplaza al confirm() nativo del navegador
// para mantener el mismo estilo visual de la app y dar contexto claro de qué se va a borrar).
function ConfirmDialog({ title, message, confirmLabel = "Eliminar", danger = true, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/50 p-4" onClick={onCancel} role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2 text-rose-600">
          <Ico name="AlertTriangle" size={18} />
          <h3 className="font-serif text-lg text-stone-900">{title}</h3>
        </div>
        <p className="mb-5 text-sm leading-relaxed text-stone-600">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-teal-600 hover:bg-teal-700"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

function StatCard({ icon, label, value, sub, tone = "default" }) {
  const tones = {
    default: "text-stone-900",
    good: "text-emerald-700",
    bad: "text-rose-700",
    warn: "text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-stone-500">
        <Ico name={icon} size={16} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`font-mono text-2xl font-semibold tabular-nums ${tones[tone]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-stone-400">{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, tone = "teal" }) {
  const tones = { teal: "bg-teal-600", amber: "bg-amber-500", rose: "bg-rose-600" };
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div className={`h-full rounded-full ${tones[tone]} transition-all`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

function ChipGroup({ options, value, onChange, getLabel = (o) => o, getKey = (o) => o }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const key = getKey(o);
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "border-teal-600 bg-teal-600 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
            }`}
          >
            {getLabel(o)}
          </button>
        );
      })}
    </div>
  );
}

function CurrencyBadge({ moneda }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${moneda === "USD" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
      {CURRENCY_SYMBOL[moneda]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Pantalla de inicio de sesión                                        */
/* ------------------------------------------------------------------ */

function AuthScreen() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError("");
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (e) {
      setError(traducirErrorAuth(e));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        await auth.createUserWithEmailAndPassword(email, password);
      }
    } catch (e) {
      setError(traducirErrorAuth(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[700px] w-full items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-6 font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Ico name="Landmark" size={18} />
          </div>
          <div>
            <div className="font-serif text-lg leading-tight text-stone-900">Control de Dinero</div>
            <div className="text-xs text-stone-400">Tus finanzas, sincronizadas en la nube</div>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Continuar con Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-xs text-stone-400">
          <div className="h-px flex-1 bg-stone-200" />
          o con tu correo
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Correo">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="tucorreo@ejemplo.com" />
          </Field>
          <Field label="Contraseña">
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Mínimo 6 caracteres" />
          </Field>

          {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {loading ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="mt-4 w-full text-center text-xs text-stone-500 hover:text-teal-700"
        >
          {mode === "login" ? "¿No tienes cuenta? Crea una" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}

function traducirErrorAuth(e) {
  const map = {
    "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Intenta iniciar sesión.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/popup-closed-by-user": "Ventana de Google cerrada antes de terminar.",
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase (revisa Authentication → Settings → Authorized domains).",
  };
  return map[e.code] || "Ocurrió un error. Intenta de nuevo.";
}

/* ------------------------------------------------------------------ */
/*  Raíz: controla sesión y decide qué pantalla mostrar                 */
/* ------------------------------------------------------------------ */

function Root() {
  const [user, setUser] = useState(undefined); // undefined = cargando, null = sin sesión

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center bg-stone-50 font-sans text-stone-400">
        Cargando…
      </div>
    );
  }
  if (user === null) return <AuthScreen />;
  return <FinanceDashboard user={user} />;
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  App principal                                                       */
/* ------------------------------------------------------------------ */

function FinanceDashboard({ user }) {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState(ACCOUNTS_SEED);
  const [transactions, setTransactions] = useState(TRANSACTIONS_SEED);
  const [budgets, setBudgets] = useState(BUDGETS_SEED);
  const [cards, setCards] = useState(CREDIT_CARDS_SEED);
  const [loans, setLoans] = useState(LOANS_SEED);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tab, setTab] = useState("resumen");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAccModal, setShowAccModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [settlingLoan, setSettlingLoan] = useState(null);
  const [payingCard, setPayingCard] = useState(null); // { card, moneda }
  const [editingLoan, setEditingLoan] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [confirmState, setConfirmState] = useState(null); // { title, message, confirmLabel, onConfirm }
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [saveState, setSaveState] = useState("idle");

  // Cargar datos desde Firestore al iniciar sesión
  useEffect(() => {
    (async () => {
      const data = await cloudLoad(user.uid);
      if (data) {
        if (data.accounts) setAccounts(data.accounts);
        if (data.transactions) setTransactions(data.transactions);
        if (data.budgets) setBudgets(data.budgets);
        if (data.cards) setCards(data.cards);
        if (data.loans) setLoans(data.loans);
        if (data.settings) setSettings(data.settings);
      }
      setLoaded(true);
    })();
  }, [user.uid]);

  // Guardar en Firestore cada vez que cambian los datos
  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      const ok = await cloudSave(user.uid, { accounts, transactions, budgets, cards, loans, settings });
      setSaveState(ok ? "saved" : "error");
    }, 500);
    return () => clearTimeout(t);
  }, [accounts, transactions, budgets, cards, loans, settings, loaded, user.uid]);

  // Usa el tipo de cambio vigente al momento de registrar el movimiento (tipoCambioUsado) si existe,
  // para que la evolución histórica no cambie retroactivamente cuando actualizas el tipo de cambio actual.
  // Los movimientos antiguos que no lo tengan guardado siguen usando el tipo de cambio actual como respaldo.
  const toSoles = useCallback((t) => (t.moneda === "USD" ? t.monto * (t.tipoCambioUsado || settings.tipoCambio) : t.monto), [settings.tipoCambio]);

  const accountBalances = useMemo(() => {
    const balances = {};
    accounts.forEach((a) => (balances[a.nombre] = { PEN: 0, USD: 0 }));
    transactions.forEach((t) => {
      if (t.esTarjeta) return; // los gastos pagados con tarjeta no tocan el saldo de ninguna cuenta
      const m = t.moneda || "PEN";
      if (!balances[t.cuenta]) balances[t.cuenta] = { PEN: 0, USD: 0 };
      if (t.tipo === "Ingreso") balances[t.cuenta][m] += t.monto;
      else if (t.tipo === "Gasto" || t.tipo === "PagoTarjeta") balances[t.cuenta][m] -= t.monto;
      else if (t.tipo === "Transferencia") {
        balances[t.cuenta][m] -= t.monto;
        if (!balances[t.cuentaDestino]) balances[t.cuentaDestino] = { PEN: 0, USD: 0 };
        balances[t.cuentaDestino][m] += t.monto;
      }
    });
    return balances;
  }, [accounts, transactions]);

  // Deuda de cada tarjeta = saldo inicial que le pusiste al crearla + gastos pagados con
  // ella - pagos que le hiciste, todo calculado por separado en soles y dólares.
  const cardDebt = useMemo(() => {
    const debt = {};
    cards.forEach((c) => {
      debt[c.id] = { PEN: c.porMoneda?.PEN?.saldoActual || 0, USD: c.porMoneda?.USD?.saldoActual || 0 };
    });
    transactions.forEach((t) => {
      if (!t.tarjetaId || !debt[t.tarjetaId]) return;
      const m = t.moneda || "PEN";
      if (t.tipo === "Gasto" && t.esTarjeta) debt[t.tarjetaId][m] += t.monto;
      else if (t.tipo === "PagoTarjeta") debt[t.tarjetaId][m] -= t.monto;
    });
    return debt;
  }, [cards, transactions]);

  const availableMonths = useMemo(() => {
    const set = new Set(transactions.map((t) => monthKey(t.fecha)));
    return Array.from(set).sort();
  }, [transactions]);

  useEffect(() => {
    if (!selectedMonth && availableMonths.length) setSelectedMonth(availableMonths[availableMonths.length - 1]);
  }, [availableMonths, selectedMonth]);

  const monthTx = useMemo(
    () => transactions.filter((t) => selectedMonth && monthKey(t.fecha) === selectedMonth),
    [transactions, selectedMonth]
  );

  const realIncomeTx = monthTx.filter((t) => t.tipo === "Ingreso" && t.grupo !== "Balance" && t.grupo !== "Préstamos");
  const realExpenseTx = monthTx.filter((t) => t.tipo === "Gasto" && t.grupo !== "Préstamos");
  const loanTx = monthTx.filter((t) => t.grupo === "Préstamos");

  const ingresosMes = realIncomeTx.reduce((s, t) => s + toSoles(t), 0);
  const gastosMes = realExpenseTx.reduce((s, t) => s + toSoles(t), 0);
  const ahorroMes = ingresosMes - gastosMes;
  const pctAhorro = ingresosMes > 0 ? (ahorroMes / ingresosMes) * 100 : 0;
  const prestado = loanTx.filter((t) => t.tipo === "Gasto").reduce((s, t) => s + toSoles(t), 0);
  const cobrado = loanTx.filter((t) => t.tipo === "Ingreso").reduce((s, t) => s + toSoles(t), 0);

  const totalPEN = accounts.reduce((s, a) => s + (accountBalances[a.nombre]?.PEN || 0), 0);
  const totalUSD = accounts.reduce((s, a) => s + (accountBalances[a.nombre]?.USD || 0), 0);
  const patrimonioSoles = totalPEN + totalUSD * settings.tipoCambio;

  const deudaTarjetasSoles = cards.reduce((s, c) => s + (cardDebt[c.id]?.PEN || 0) + (cardDebt[c.id]?.USD || 0) * settings.tipoCambio, 0);
  // Ratio deuda de tarjetas / ingresos del mes: una señal rápida de qué tan comprometidos están
  // tus ingresos frente a tu deuda de consumo. Por encima de ~30-36% suele considerarse alto.
  const ratioDeudaIngreso = ingresosMes > 0 ? (deudaTarjetasSoles / ingresosMes) * 100 : null;

  const gastosPorCategoria = useMemo(() => {
    const map = {};
    realExpenseTx.forEach((t) => {
      map[t.categoria] = (map[t.categoria] || 0) + toSoles(t);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [realExpenseTx, toSoles]);

  const topGastos = useMemo(() => [...realExpenseTx].sort((a, b) => toSoles(b) - toSoles(a)).slice(0, 5), [realExpenseTx, toSoles]);

  const evolucion6m = useMemo(() => {
    if (!selectedMonth) return [];
    const [y, m] = selectedMonth.split("-").map(Number);
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const txs = transactions.filter((t) => monthKey(t.fecha) === mk);
      const ing = txs.filter((t) => t.tipo === "Ingreso" && t.grupo !== "Balance" && t.grupo !== "Préstamos").reduce((s, t) => s + toSoles(t), 0);
      const gas = txs.filter((t) => t.tipo === "Gasto" && t.grupo !== "Préstamos").reduce((s, t) => s + toSoles(t), 0);
      out.push({ mes: d.toLocaleDateString("es-PE", { month: "short" }), Ingresos: Number(ing.toFixed(2)), Gastos: Number(gas.toFixed(2)) });
    }
    return out;
  }, [transactions, selectedMonth, toSoles]);

  // Patrimonio acumulado a fin de cada uno de los últimos 6 meses (saldo de todas las cuentas,
  // reconstruido a partir del historial de movimientos hasta esa fecha). A diferencia del "ahorro
  // del mes", esto muestra la trayectoria real de tu dinero total, no solo el flujo mensual.
  const patrimonio6m = useMemo(() => {
    if (!selectedMonth) return [];
    const [y, m] = selectedMonth.split("-").map(Number);
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const finDeMes = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
      const balances = {};
      transactions.forEach((t) => {
        if (t.esTarjeta || t.fecha > finDeMes) return;
        const mo = t.moneda || "PEN";
        if (!balances[t.cuenta]) balances[t.cuenta] = { PEN: 0, USD: 0 };
        if (t.tipo === "Ingreso") balances[t.cuenta][mo] += t.monto;
        else if (t.tipo === "Gasto" || t.tipo === "PagoTarjeta") balances[t.cuenta][mo] -= t.monto;
        else if (t.tipo === "Transferencia") {
          balances[t.cuenta][mo] -= t.monto;
          if (!balances[t.cuentaDestino]) balances[t.cuentaDestino] = { PEN: 0, USD: 0 };
          balances[t.cuentaDestino][mo] += t.monto;
        }
      });
      let totalPEN = 0;
      let totalUSD = 0;
      Object.values(balances).forEach((b) => {
        totalPEN += b.PEN;
        totalUSD += b.USD;
      });
      out.push({ mes: d.toLocaleDateString("es-PE", { month: "short" }), Patrimonio: Number((totalPEN + totalUSD * settings.tipoCambio).toFixed(2)) });
    }
    return out;
  }, [transactions, selectedMonth, settings.tipoCambio]);

  const budgetsWithSpent = useMemo(
    () =>
      budgets.map((b) => {
        const gastado = realExpenseTx.filter((t) => t.grupo === b.grupo && t.categoria === b.categoria).reduce((s, t) => s + toSoles(t), 0);
        const pct = b.presupuesto > 0 ? (gastado / b.presupuesto) * 100 : gastado > 0 ? 100 : 0;
        return { ...b, gastado, pct, disponible: b.presupuesto - gastado };
      }),
    [budgets, realExpenseTx, toSoles]
  );

  const cardsWithUtil = useMemo(
    () =>
      cards.map((c) => {
        const saldoPEN = cardDebt[c.id]?.PEN || 0;
        const saldoUSD = cardDebt[c.id]?.USD || 0;
        return {
          ...c,
          porMoneda: {
            ...(c.porMoneda || {}),
            ...(c.porMoneda?.PEN ? { PEN: { ...c.porMoneda.PEN, saldoActual: saldoPEN } } : {}),
            ...(c.porMoneda?.USD ? { USD: { ...c.porMoneda.USD, saldoActual: saldoUSD } } : {}),
          },
          utilPEN: c.porMoneda?.PEN?.limite > 0 ? (saldoPEN / c.porMoneda.PEN.limite) * 100 : 0,
          utilUSD: c.porMoneda?.USD?.limite > 0 ? (saldoUSD / c.porMoneda.USD.limite) * 100 : 0,
        };
      }),
    [cards, cardDebt]
  );

  const loansPendientes = loans.filter((l) => l.estado === "Pendiente");
  const teDeben = { PEN: 0, USD: 0 };
  const debes = { PEN: 0, USD: 0 };
  loansPendientes.forEach((l) => {
    if (l.tipo === "Presté") teDeben[l.moneda] += l.monto;
    else debes[l.moneda] += l.monto;
  });

  const alerts = useMemo(() => {
    const list = [];
    accounts.forEach((a) => {
      const bal = accountBalances[a.nombre] || { PEN: 0, USD: 0 };
      (a.monedas || []).forEach((m) => {
        if (bal[m] < 0) list.push({ type: "danger", text: `${a.nombre} tiene saldo negativo en ${CURRENCY_LABEL[m].toLowerCase()}: ${fmt(bal[m], m)}` });
      });
    });
    budgetsWithSpent.forEach((b) => {
      if (b.presupuesto > 0 && b.pct >= 100) list.push({ type: "danger", text: `Presupuesto "${b.categoria}" excedido (${b.pct.toFixed(0)}%)` });
      else if (b.presupuesto > 0 && b.pct >= 80) list.push({ type: "warn", text: `Presupuesto "${b.categoria}" al ${b.pct.toFixed(0)}%` });
    });
    cardsWithUtil.forEach((c) => {
      if (c.utilPEN >= 80) list.push({ type: "danger", text: `Tarjeta ${c.nombre} con ${c.utilPEN.toFixed(0)}% de uso en soles` });
      if (c.utilUSD >= 80) list.push({ type: "danger", text: `Tarjeta ${c.nombre} con ${c.utilUSD.toFixed(0)}% de uso en dólares` });
      if (c.fechaPago) {
        const days = Math.ceil((new Date(c.fechaPago) - new Date()) / 86400000);
        if (days >= 0 && days <= 7) list.push({ type: "warn", text: `Pago de ${c.nombre} vence en ${days} día(s)` });
      }
    });
    if (loansPendientes.length > 0) {
      list.push({ type: "warn", text: `Tienes ${loansPendientes.length} préstamo(s) pendiente(s) de cobrar o pagar` });
    }
    return list;
  }, [accounts, accountBalances, budgetsWithSpent, cardsWithUtil, loansPendientes]);

  /* ---------------------------- Acciones --------------------------- */

  // Sella cada movimiento en dólares con el tipo de cambio vigente al momento de crearlo, para que
  // el histórico no se distorsione si más adelante actualizas el tipo de cambio en Configuración.
  const tipoCambioUsado = (moneda) => (moneda === "USD" ? settings.tipoCambio : undefined);

  const addTransaction = (tx) => setTransactions((prev) => [{ id: uid(), tipoCambioUsado: tipoCambioUsado(tx.moneda), ...tx }, ...prev]);
  const updateTransaction = (id, tx) =>
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...tx, id, tipoCambioUsado: tx.moneda === "USD" ? t.tipoCambioUsado || tipoCambioUsado(tx.moneda) : undefined } : t)));
  const payCard = (card, moneda, cuenta, monto, fecha) => {
    addTransaction({ tipo: "PagoTarjeta", cuenta, tarjetaId: card.id, moneda, monto, fecha, grupo: "Pago de tarjeta", categoria: "Pago de tarjeta", descripcion: `Pago tarjeta ${card.nombre}`, recurrente: "NO" });
    setPayingCard(null);
  };
  const deleteTransaction = (id) => setTransactions((prev) => prev.filter((t) => t.id !== id));
  const requestDeleteTransaction = (t) =>
    setConfirmState({
      title: "Eliminar movimiento",
      message: `¿Eliminar "${t.descripcion || t.categoria}" por ${fmt(t.monto, t.moneda || "PEN")} del ${t.fecha}? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        deleteTransaction(t.id);
        setConfirmState(null);
      },
    });
  const updateBudget = (id, presupuesto) => setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, presupuesto } : b)));
  const addCard = (card) => setCards((prev) => [...prev, { id: uid(), ...card }]);
  const deleteCard = (id) => setCards((prev) => prev.filter((c) => c.id !== id));
  const requestDeleteCard = (c) =>
    setConfirmState({
      title: `Eliminar tarjeta "${c.nombre}"`,
      message: "¿Eliminar esta tarjeta de crédito? Los movimientos que ya registraste con ella se mantendrán en tu historial. Esta acción no se puede deshacer.",
      onConfirm: () => {
        deleteCard(c.id);
        setConfirmState(null);
      },
    });
  const addAccount = (acc) => setAccounts((prev) => [...prev, { id: uid(), ...acc }]);
  const deleteAccount = (id) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.cuenta !== acc.nombre && t.cuentaDestino !== acc.nombre));
  };
  const requestDeleteAccount = (acc) => {
    const count = transactions.filter((t) => t.cuenta === acc.nombre || t.cuentaDestino === acc.nombre).length;
    setConfirmState({
      title: `Eliminar cuenta "${acc.nombre}"`,
      message:
        count > 0
          ? `Esta cuenta tiene ${count} movimiento(s) asociado(s). Si la eliminas, esos movimientos también se borrarán permanentemente y tus totales cambiarán.`
          : "¿Eliminar esta cuenta? Esta acción no se puede deshacer.",
      onConfirm: () => {
        deleteAccount(acc.id);
        setConfirmState(null);
      },
    });
  };

  const addLoan = (form) => {
    const txId = uid();
    const tx = {
      id: txId,
      tipo: form.tipo === "Presté" ? "Gasto" : "Ingreso",
      fecha: form.fecha,
      cuenta: form.cuenta,
      grupo: "Préstamos",
      categoria: "Préstamos",
      monto: form.monto,
      moneda: form.moneda,
      tipoCambioUsado: tipoCambioUsado(form.moneda),
      descripcion: form.descripcion || `${form.tipo} — ${form.persona}`,
      recurrente: "NO",
      persona: form.persona,
    };
    setTransactions((prev) => [tx, ...prev]);
    setLoans((prev) => [
      {
        id: uid(),
        persona: form.persona,
        tipo: form.tipo,
        monto: form.monto,
        moneda: form.moneda,
        cuenta: form.cuenta,
        fecha: form.fecha,
        descripcion: form.descripcion,
        tasaInteres: form.tasaInteres || 0,
        numCuotas: form.numCuotas || 0,
        fechaPrimeraCuota: form.fechaPrimeraCuota || null,
        fechasCuotas: form.fechasCuotas || null,
        estado: "Pendiente",
        txId,
      },
      ...prev,
    ]);
  };

  const editLoan = (loanId, form) => {
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              persona: form.persona,
              monto: form.monto,
              fecha: form.fecha,
              descripcion: form.descripcion,
              tasaInteres: form.tasaInteres || 0,
              numCuotas: form.numCuotas || 0,
              fechaPrimeraCuota: form.fechaPrimeraCuota || null,
              fechasCuotas: form.fechasCuotas || null,
            }
          : l
      )
    );
    // Si cambió el monto, actualiza también el movimiento original para que el saldo de la cuenta cuadre.
    const loan = loans.find((l) => l.id === loanId);
    if (loan && loan.monto !== form.monto) {
      setTransactions((prev) => prev.map((t) => (t.id === loan.txId ? { ...t, monto: form.monto, fecha: form.fecha, descripcion: form.descripcion || t.descripcion, persona: form.persona } : t)));
    }
  };

  const settleLoan = (loan, cuenta, fecha) => {
    const txId = uid();
    const tx = {
      id: txId,
      tipo: loan.tipo === "Presté" ? "Ingreso" : "Gasto",
      fecha,
      cuenta,
      grupo: "Préstamos",
      categoria: "Préstamos",
      monto: loan.monto,
      moneda: loan.moneda,
      tipoCambioUsado: tipoCambioUsado(loan.moneda),
      descripcion: `Liquidación préstamo con ${loan.persona}`,
      recurrente: "NO",
      persona: loan.persona,
    };
    setTransactions((prev) => [tx, ...prev]);
    setLoans((prev) => prev.map((l) => (l.id === loan.id ? { ...l, estado: "Liquidado", fechaLiquidacion: fecha, liquidacionTxId: txId } : l)));
    setSettlingLoan(null);
  };

  const deleteLoan = (loan) => {
    setLoans((prev) => prev.filter((l) => l.id !== loan.id));
    setTransactions((prev) => prev.filter((t) => t.id !== loan.txId && t.id !== loan.liquidacionTxId));
  };
  const requestDeleteLoan = (loan) =>
    setConfirmState({
      title: `Eliminar préstamo con ${loan.persona}`,
      message: "Esto también eliminará el/los movimiento(s) asociados a este préstamo en tus transacciones. Esta acción no se puede deshacer.",
      onConfirm: () => {
        deleteLoan(loan);
        setConfirmState(null);
      },
    });

  const NAV = [
    { id: "resumen", label: "Resumen", icon: "LayoutDashboard" },
    { id: "transacciones", label: "Transacciones", icon: "Receipt" },
    { id: "presupuestos", label: "Presupuestos", icon: "PiggyBank" },
    { id: "prestamos", label: "Préstamos", icon: "HandCoins" },
    { id: "cuentas", label: "Cuentas y tarjetas", icon: "Wallet" },
  ];

  if (!loaded) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center bg-stone-50 font-sans text-stone-400">
        Cargando tus finanzas…
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[100dvh] w-full overflow-hidden bg-stone-50 font-sans text-stone-900 md:min-h-[700px] md:rounded-2xl md:border md:border-stone-200">
      {/* Overlay del menú móvil */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-stone-900/50 md:hidden" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar (drawer en móvil, fija en escritorio) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-stone-200 bg-stone-900 text-stone-100 transition-transform duration-200 ease-out md:static md:z-auto md:w-56 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-800 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <Ico name="Landmark" size={16} />
            </div>
            <div>
              <div className="font-serif text-base leading-tight">Control de Dinero</div>
              <div className="text-[11px] text-stone-400">Finanzas personales</div>
            </div>
          </div>
          <button onClick={() => setMobileNavOpen(false)} aria-label="Cerrar menú" className="rounded-full p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white md:hidden">
            <Ico name="X" size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setTab(n.id);
                setMobileNavOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                tab === n.id ? "bg-teal-600 text-white" : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <Ico name={n.icon} size={16} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-stone-800 px-4 py-3">
          <div className="mb-1 truncate text-[11px] text-stone-500">
            {saveState === "saving" ? "Guardando en la nube…" : saveState === "error" ? "Error al guardar" : "Sincronizado ✓"}
          </div>
          <div className="mb-2 truncate text-[11px] text-stone-400">{user.email || "Sesión con Google"}</div>
          <button onClick={() => auth.signOut()} className="text-[11px] text-stone-400 underline hover:text-stone-200">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileNavOpen(true)} aria-label="Abrir menú" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 md:hidden">
              <Ico name="Menu" size={20} />
            </button>
            <div>
              <h1 className="font-serif text-xl text-stone-900">{NAV.find((n) => n.id === tab)?.label}</h1>
              {selectedMonth && <p className="text-xs capitalize text-stone-500">{monthLabel(selectedMonth)}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {availableMonths.length > 0 && (
              <select
                value={selectedMonth || ""}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Mes"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-teal-600"
              >
                {availableMonths.map((mk) => (
                  <option key={mk} value={mk} className="capitalize">
                    {monthLabel(mk)}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => (accounts.length ? setShowTxModal(true) : setTab("cuentas"))}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Ico name="Plus" size={16} /> <span className="hidden sm:inline">Nuevo movimiento</span><span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {tab === "resumen" && accounts.length === 0 && (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-teal-300 bg-teal-50/60 p-8 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white">
                <Ico name="Wallet" size={20} />
              </div>
              <h2 className="mb-1 font-serif text-lg text-stone-900">Empecemos desde cero</h2>
              <p className="mb-5 text-sm text-stone-500">
                Primero agrega tus cuentas o billeteras (banco, efectivo, Yape, tarjeta prepago, etc.). Cada una puede
                manejar soles, dólares, o ambos.
              </p>
              <button
                onClick={() => setTab("cuentas")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Ico name="Plus" size={16} /> Agregar mi primera cuenta
              </button>
            </div>
          )}
          {tab === "resumen" && accounts.length > 0 && (
            <ResumenTab
              ingresosMes={ingresosMes}
              gastosMes={gastosMes}
              ahorroMes={ahorroMes}
              pctAhorro={pctAhorro}
              patrimonioSoles={patrimonioSoles}
              totalPEN={totalPEN}
              totalUSD={totalUSD}
              deudaTarjetasSoles={deudaTarjetasSoles}
              prestado={prestado}
              cobrado={cobrado}
              gastosPorCategoria={gastosPorCategoria}
              evolucion6m={evolucion6m}
              patrimonio6m={patrimonio6m}
              topGastos={topGastos}
              alerts={alerts}
              settings={settings}
              ratioDeudaIngreso={ratioDeudaIngreso}
            />
          )}
          {tab === "transacciones" && (
            <TransaccionesTab
              transactions={[...transactions].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))}
              onDelete={requestDeleteTransaction}
              onEdit={(t) => setEditingTx(t)}
            />
          )}
          {tab === "presupuestos" && <PresupuestosTab budgetsWithSpent={budgetsWithSpent} onUpdate={updateBudget} />}
          {tab === "prestamos" && (
            <PrestamosTab
              loans={[...loans].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))}
              teDeben={teDeben}
              debes={debes}
              onAdd={() => setShowLoanModal(true)}
              onSettle={(loan) => setSettlingLoan(loan)}
              onEdit={(loan) => setEditingLoan(loan)}
              onDelete={requestDeleteLoan}
            />
          )}
          {tab === "cuentas" && (
            <CuentasTab
              accounts={accounts}
              accountBalances={accountBalances}
              cardsWithUtil={cardsWithUtil}
              onAddAccount={() => setShowAccModal(true)}
              onDeleteAccount={requestDeleteAccount}
              onAddCard={() => setShowCardModal(true)}
              onDeleteCard={requestDeleteCard}
              onPayCard={(card, moneda) => setPayingCard({ card, moneda })}
              settings={settings}
              setSettings={setSettings}
            />
          )}
        </div>
      </main>

      {(showTxModal || editingTx) && (
        <TransactionModal
          accounts={accounts}
          cards={cards}
          initial={editingTx}
          onClose={() => {
            setShowTxModal(false);
            setEditingTx(null);
          }}
          onSave={(tx) => {
            if (editingTx) updateTransaction(editingTx.id, tx);
            else addTransaction(tx);
            setShowTxModal(false);
            setEditingTx(null);
          }}
        />
      )}
      {showCardModal && (
        <CardModal
          onClose={() => setShowCardModal(false)}
          onSave={(c) => {
            addCard(c);
            setShowCardModal(false);
          }}
        />
      )}
      {showAccModal && (
        <AccountModal
          onClose={() => setShowAccModal(false)}
          onSave={(a) => {
            addAccount(a);
            setShowAccModal(false);
          }}
        />
      )}
      {showLoanModal && (
        <LoanModal
          accounts={accounts}
          onClose={() => setShowLoanModal(false)}
          onSave={(l) => {
            addLoan(l);
            setShowLoanModal(false);
          }}
        />
      )}
      {settlingLoan && (
        <SettleLoanModal
          loan={settlingLoan}
          accounts={accounts.filter((a) => (a.monedas || []).includes(settlingLoan.moneda))}
          onClose={() => setSettlingLoan(null)}
          onConfirm={(cuenta, fecha) => settleLoan(settlingLoan, cuenta, fecha)}
        />
      )}
      {editingLoan && (
        <LoanModal
          accounts={accounts}
          initial={editingLoan}
          onClose={() => setEditingLoan(null)}
          onSave={(form) => {
            editLoan(editingLoan.id, form);
            setEditingLoan(null);
          }}
        />
      )}
      {payingCard && (
        <PayCardModal
          card={payingCard.card}
          moneda={payingCard.moneda}
          deudaActual={cardDebt[payingCard.card.id]?.[payingCard.moneda] || 0}
          accounts={accounts.filter((a) => (a.monedas || []).includes(payingCard.moneda))}
          onClose={() => setPayingCard(null)}
          onConfirm={(cuenta, monto, fecha) => payCard(payingCard.card, payingCard.moneda, cuenta, monto, fecha)}
        />
      )}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Resumen                                                        */
/* ------------------------------------------------------------------ */

function ResumenTab({
  ingresosMes, gastosMes, ahorroMes, pctAhorro, patrimonioSoles, totalPEN, totalUSD,
  deudaTarjetasSoles, prestado, cobrado, gastosPorCategoria, evolucion6m, patrimonio6m, topGastos, alerts, settings, ratioDeudaIngreso,
}) {
  // Guía de ahorro (regla general 20%): da contexto útil sobre si tu tasa de ahorro del mes va bien.
  const metaAhorroTexto =
    ingresosMes <= 0
      ? null
      : pctAhorro >= 20
      ? "Meta recomendada de 20% cumplida"
      : pctAhorro >= 0
      ? `Por debajo de la meta recomendada de 20% (te faltan ${(20 - pctAhorro).toFixed(1)} pts)`
      : "Estás gastando más de lo que ingresa este mes";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon="Landmark" label="Patrimonio (S/ equiv.)" value={fmt(patrimonioSoles)} sub={`${fmt(totalPEN)} + ${fmt(totalUSD, "USD")}`} />
        <StatCard icon="TrendingUp" label="Ingresos del mes" value={fmt(ingresosMes)} tone="good" />
        <StatCard icon="TrendingDown" label="Gastos del mes" value={fmt(gastosMes)} tone="bad" />
        <StatCard icon="PiggyBank" label="Ahorro del mes" value={fmt(ahorroMes)} sub={metaAhorroTexto || `${pctAhorro.toFixed(1)}% de tus ingresos`} tone={ahorroMes >= 0 ? "good" : "bad"} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard icon="CreditCard" label="Deuda en tarjetas (S/ equiv.)" value={fmt(deudaTarjetasSoles)} tone={deudaTarjetasSoles > 0 ? "warn" : "default"} />
        <StatCard
          icon="AlertTriangle"
          label="Deuda / ingresos del mes"
          value={ratioDeudaIngreso === null ? "—" : `${ratioDeudaIngreso.toFixed(0)}%`}
          sub={ratioDeudaIngreso === null ? "Sin ingresos registrados" : ratioDeudaIngreso >= 36 ? "Nivel alto, cuidado" : ratioDeudaIngreso >= 20 ? "Nivel moderado" : "Nivel saludable"}
          tone={ratioDeudaIngreso === null ? "default" : ratioDeudaIngreso >= 36 ? "bad" : ratioDeudaIngreso >= 20 ? "warn" : "good"}
        />
        <StatCard icon="HandCoins" label="Prestado este mes" value={fmt(prestado)} />
        <StatCard icon="HandCoins" label="Te devolvieron" value={fmt(cobrado)} tone="good" />
        <StatCard icon="ArrowLeftRight" label="Tipo de cambio USD" value={`S/ ${settings.tipoCambio.toFixed(2)}`} />
      </div>

      {alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-800">
            <Ico name="AlertTriangle" size={16} />
            <span className="text-sm font-semibold">Alertas ({alerts.length})</span>
          </div>
          <ul className="space-y-1 text-sm text-amber-800">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.type === "danger" ? "bg-rose-600" : "bg-amber-500"}`} />
                {a.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-3 font-serif text-base text-stone-800">¿En qué gastas más?</h3>
          {gastosPorCategoria.length === 0 ? (
            <p className="text-sm text-stone-400">Sin gastos este mes.</p>
          ) : (
            <>
              <DonutChart
                data={gastosPorCategoria.map((c, i) => ({ name: c.name, value: c.value, color: GRUPO_COLORS[c.name] || PALETTE[i % PALETTE.length] }))}
                size={190}
              />
              <ul className="mt-2 space-y-2">
                {gastosPorCategoria.map((c, i) => {
                  const total = gastosPorCategoria.reduce((s, x) => s + x.value, 0);
                  const pct = total > 0 ? (c.value / total) * 100 : 0;
                  const color = GRUPO_COLORS[c.name] || PALETTE[i % PALETTE.length];
                  return (
                    <li key={c.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <span className="flex-1 truncate text-stone-700">{c.name}</span>
                      <span className="font-mono text-stone-500">{pct.toFixed(0)}%</span>
                      <span className="w-20 shrink-0 text-right font-mono font-medium text-stone-800">{fmt(c.value)}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-3 font-serif text-base text-stone-800">Ingresos vs. gastos (últimos 6 meses, en soles)</h3>
          <GroupedBarChart data={evolucion6m} seriesKeys={["Ingresos", "Gastos"]} colors={["#0d9488", "#e11d48"]} height={260} />
          <div className="mt-2 flex justify-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Ingresos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Gastos
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-base text-stone-800">Top 5 gastos del mes</h3>
          {topGastos.length === 0 ? (
            <p className="text-sm text-stone-400">Sin gastos registrados.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {topGastos.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-stone-800">
                      {t.descripcion || t.categoria} <CurrencyBadge moneda={t.moneda || "PEN"} />
                    </div>
                    <div className="text-xs text-stone-400">
                      {t.categoria} · {t.cuenta} · {t.fecha}
                    </div>
                  </div>
                  <div className="font-mono text-sm font-semibold text-rose-700">{fmt(t.monto, t.moneda || "PEN")}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-base text-stone-800">Evolución de tu patrimonio (soles, últimos 6 meses)</h3>
          <TrendLineChart data={patrimonio6m} dataKey="Patrimonio" height={220} color="#0d9488" />
          <p className="mt-2 text-xs text-stone-400">Suma de saldos de todas tus cuentas a fin de cada mes (no incluye deuda de tarjetas ni préstamos).</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Transacciones                                                  */
/* ------------------------------------------------------------------ */

function TransaccionesTab({ transactions, onDelete, onEdit }) {
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = filterTipo === "Todos" ? transactions : transactions.filter((t) => t.tipo === filterTipo);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => `${t.descripcion || ""} ${t.categoria || ""} ${t.cuenta || ""} ${t.grupo || ""}`.toLowerCase().includes(q));
    }
    return list;
  }, [transactions, filterTipo, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ChipGroup
          options={["Todos", "Ingreso", "Gasto", "Transferencia", "PagoTarjeta"]}
          value={filterTipo}
          onChange={setFilterTipo}
          getLabel={(v) => (v === "PagoTarjeta" ? "Pago de tarjeta" : v)}
        />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Ico name="Search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar descripción, categoría o cuenta…"
              aria-label="Buscar movimientos"
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 sm:w-64"
            />
          </div>
          <button
            onClick={() => exportTransactionsCSV(filtered)}
            disabled={filtered.length === 0}
            title="Exportar los movimientos filtrados a CSV"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Ico name="Download" size={14} /> <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-stone-400">
        Mostrando {filtered.length} de {transactions.length} movimiento{transactions.length === 1 ? "" : "s"}.
      </p>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Cuenta</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50">
                  <td className="whitespace-nowrap px-4 py-2.5 text-stone-500">{t.fecha}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.tipo === "Ingreso"
                          ? "bg-emerald-50 text-emerald-700"
                          : t.tipo === "Gasto"
                          ? "bg-rose-50 text-rose-700"
                          : t.tipo === "PagoTarjeta"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {t.tipo === "PagoTarjeta" ? "Pago de tarjeta" : t.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-stone-700">{t.categoria}</td>
                  <td className="px-4 py-2.5 text-stone-700">
                    <span className="inline-flex items-center gap-1">
                      {t.esTarjeta && <Ico name="CreditCard" size={13} className="text-stone-400" />}
                      {t.cuenta}
                    </span>
                    {t.cuentaDestino ? ` → ${t.cuentaDestino}` : ""}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-stone-500">{t.descripcion}</td>
                  <td
                    className={`whitespace-nowrap px-4 py-2.5 text-right font-mono font-medium ${
                      t.tipo === "Ingreso" ? "text-emerald-700" : t.tipo === "Gasto" ? "text-rose-700" : t.tipo === "PagoTarjeta" ? "text-violet-700" : "text-blue-700"
                    }`}
                  >
                    <span className="mr-1 align-middle">
                      <CurrencyBadge moneda={t.moneda || "PEN"} />
                    </span>
                    {fmt(t.monto, t.moneda || "PEN")}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(t)} aria-label="Editar movimiento" className="rounded p-1 text-stone-300 hover:bg-teal-50 hover:text-teal-600">
                        <Ico name="Pencil" size={14} />
                      </button>
                      <button onClick={() => onDelete(t)} aria-label="Eliminar movimiento" className="rounded p-1 text-stone-300 hover:bg-rose-50 hover:text-rose-600">
                        <Ico name="Trash2" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                    {transactions.length === 0 ? "No hay movimientos." : "Ningún movimiento coincide con tu búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Presupuestos                                                   */
/* ------------------------------------------------------------------ */

function PresupuestosTab({ budgetsWithSpent, onUpdate }) {
  const grupos = ["Básicos", "Deseo"];
  const totalPresupuesto = budgetsWithSpent.reduce((s, b) => s + (b.presupuesto || 0), 0);
  const totalGastado = budgetsWithSpent.reduce((s, b) => s + b.gastado, 0);

  return (
    <div className="space-y-6">
      <p className="text-xs text-stone-400">Los presupuestos y montos gastados se calculan en soles (los gastos en dólares se convierten con tu tipo de cambio).</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon="PiggyBank" label="Presupuesto total del mes" value={fmt(totalPresupuesto)} />
        <StatCard icon="TrendingDown" label="Gastado del presupuesto" value={fmt(totalGastado)} tone={totalGastado > totalPresupuesto ? "bad" : "default"} />
        <StatCard icon="Check" label="Disponible" value={fmt(totalPresupuesto - totalGastado)} tone={totalPresupuesto - totalGastado >= 0 ? "good" : "bad"} />
      </div>

      {grupos.map((g) => (
        <div key={g} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-serif text-base text-stone-800">{g}</h3>
          <div className="space-y-4">
            {budgetsWithSpent
              .filter((b) => b.grupo === g)
              .map((b) => (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-700">{b.categoria}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">{fmt(b.gastado)} de</span>
                      <input
                        type="number"
                        step="0.01"
                        value={b.presupuesto}
                        onChange={(e) => onUpdate(b.id, parseFloat(e.target.value) || 0)}
                        className="w-24 rounded border border-stone-200 px-2 py-0.5 text-right font-mono text-sm outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                  <ProgressBar pct={b.pct} tone={b.pct >= 100 ? "rose" : b.pct >= 80 ? "amber" : "teal"} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Préstamos                                                      */
/* ------------------------------------------------------------------ */

function MultiCurrencySum({ obj }) {
  const parts = ["PEN", "USD"].filter((m) => obj[m] > 0);
  if (parts.length === 0) return <span>{fmt(0)}</span>;
  return <span>{parts.map((m) => fmt(obj[m], m)).join(" · ")}</span>;
}

function PrestamosTab({ loans, teDeben, debes, onAdd, onSettle, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-stone-500">
            <Ico name="TrendingUp" size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Te deben (pendiente)</span>
          </div>
          <div className="font-mono text-xl font-semibold text-emerald-700">
            <MultiCurrencySum obj={teDeben} />
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-stone-500">
            <Ico name="TrendingDown" size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Debes (pendiente)</span>
          </div>
          <div className="font-mono text-xl font-semibold text-rose-700">
            <MultiCurrencySum obj={debes} />
          </div>
        </div>
      </div>

      <button onClick={onAdd} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800">
        <Ico name="Plus" size={16} /> Nuevo préstamo
      </button>

      {loans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-400">
          Aún no registras préstamos. Agrega uno cuando prestes o te presten dinero.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((l) => {
            const conCuotas = l.numCuotas > 0;
            const cuotaMensual = conCuotas ? calcularCuotaMensual(l.monto, l.tasaInteres, l.numCuotas) : 0;
            const totalConInteres = cuotaMensual * l.numCuotas;
            return (
              <div key={l.id} className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-900 to-stone-700 p-5 text-white shadow-sm">
                <div className="absolute right-3 top-3 flex gap-1">
                  <button onClick={() => onEdit(l)} aria-label="Editar préstamo" className="rounded p-1 text-stone-300 hover:bg-white/10 hover:text-white">
                    <Ico name="Pencil" size={14} />
                  </button>
                  <button onClick={() => onDelete(l)} aria-label="Eliminar préstamo" className="rounded p-1 text-stone-300 hover:bg-white/10 hover:text-white">
                    <Ico name="Trash2" size={14} />
                  </button>
                </div>

                <div className="text-xs uppercase tracking-wide text-stone-300">{l.tipo === "Presté" ? "Le prestaste a" : "Te prestó"}</div>
                <div className="mb-4 font-serif text-lg">{l.persona}</div>

                <div className="mb-1 flex items-end justify-between">
                  <span className="text-xs text-stone-300">Monto</span>
                  <span className="font-mono text-xl font-semibold">{fmt(l.monto, l.moneda)}</span>
                </div>

                {conCuotas ? (
                  <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Tasa de interés (TEA)</span>
                      <span>{l.tasaInteres}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Cuotas</span>
                      <span>{l.numCuotas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Cuota mensual</span>
                      <span className="font-mono">{fmt(cuotaMensual, l.moneda)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Total con interés</span>
                      <span className="font-mono">{fmt(totalConInteres, l.moneda)}</span>
                    </div>
                    {(() => {
                      const info = proximaCuotaInfo(l);
                      if (!info) return null;
                      return (
                        <div className="flex justify-between">
                          <span className="text-stone-400">{info.completado ? "Cuotas" : "Próxima cuota"}</span>
                          <span>{info.completado ? "Completadas ✓" : `${info.numero}/${l.numCuotas} · ${info.fecha}`}</span>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="mt-3 border-t border-white/10 pt-3 text-xs text-stone-400">Sin interés ni cuotas (pago único)</div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${l.estado === "Pendiente" ? "bg-amber-400/20 text-amber-300" : "bg-emerald-400/20 text-emerald-300"}`}>{l.estado}</span>
                  <span className="text-stone-400">{l.fecha}</span>
                </div>
                {l.descripcion && <div className="mt-2 truncate text-xs text-stone-400">{l.descripcion}</div>}

                {l.estado === "Pendiente" && (
                  <button onClick={() => onSettle(l)} className="mt-3 w-full rounded-lg bg-teal-600 py-1.5 text-xs font-medium text-white hover:bg-teal-700">
                    Marcar como liquidado
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Cuentas y tarjetas de crédito (unificado)                      */
/* ------------------------------------------------------------------ */

function CuentasTab({ accounts, accountBalances, cardsWithUtil, onAddAccount, onDeleteAccount, onAddCard, onDeleteCard, onPayCard, settings, setSettings }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={onAddAccount} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800">
            <Ico name="Plus" size={16} /> Agregar cuenta
          </button>
          <button onClick={onAddCard} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800">
            <Ico name="Plus" size={16} /> Agregar tarjeta
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-600">
          Tipo de cambio USD → PEN
          <input
            type="number"
            step="0.01"
            value={settings.tipoCambio}
            onChange={(e) => setSettings((s) => ({ ...s, tipoCambio: parseFloat(e.target.value) || 0 }))}
            className="w-20 rounded border border-stone-300 px-2 py-1 text-right font-mono text-sm outline-none focus:border-teal-600"
          />
        </label>
      </div>

      <div>
        <h3 className="mb-3 font-serif text-base text-stone-800">Cuentas y billeteras</h3>
        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">Aún no tienes cuentas registradas.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => {
              const bal = accountBalances[a.nombre] || { PEN: 0, USD: 0 };
              return (
                <div key={a.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-stone-800">{a.nombre}</div>
                      <div className="text-xs text-stone-400">{a.tipo}</div>
                    </div>
                    <button onClick={() => onDeleteAccount(a)} aria-label="Eliminar cuenta" className="rounded p-1 text-stone-300 hover:bg-rose-50 hover:text-rose-600">
                      <Ico name="Trash2" size={14} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(a.monedas || ["PEN"]).map((m) => (
                      <div key={m} className={`font-mono text-lg font-semibold ${bal[m] < 0 ? "text-rose-700" : "text-stone-900"}`}>
                        {fmt(bal[m], m)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-serif text-base text-stone-800">Tarjetas de crédito</h3>
        {cardsWithUtil.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">Aún no registras tarjetas de crédito.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardsWithUtil.map((c) => (
              <div key={c.id} className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-900 to-stone-700 p-5 text-white shadow-sm">
                <button onClick={() => onDeleteCard(c)} aria-label="Eliminar tarjeta" className="absolute right-3 top-3 rounded p-1 text-stone-300 hover:bg-white/10 hover:text-white">
                  <Ico name="Trash2" size={14} />
                </button>
                <div className="text-xs uppercase tracking-wide text-stone-300">{c.banco}</div>
                <div className="mb-4 font-serif text-lg">{c.nombre}</div>

                {["PEN", "USD"].filter((m) => c.porMoneda?.[m]).map((m) => {
                  const d = c.porMoneda[m];
                  const util = m === "PEN" ? c.utilPEN : c.utilUSD;
                  return (
                    <div key={m} className="mb-3 border-t border-white/10 pt-3 first:border-0 first:pt-0">
                      <div className="mb-1 flex items-end justify-between">
                        <span className="text-xs text-stone-300">Saldo actual ({CURRENCY_LABEL[m]})</span>
                        <span className="font-mono text-lg font-semibold">{fmt(d.saldoActual, m)}</span>
                      </div>
                      <div className="mb-1 text-xs text-stone-300">Línea: {fmt(d.limite, m)}</div>
                      <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                        <div className={`h-full rounded-full ${util >= 80 ? "bg-rose-400" : util >= 50 ? "bg-amber-400" : "bg-teal-400"}`} style={{ width: `${Math.min(100, util)}%` }} />
                      </div>
                      <div className="mb-2 text-xs text-stone-300">
                        {util.toFixed(0)}% utilizado{d.pagoMinimo ? ` · mín. ${fmt(d.pagoMinimo, m)}` : ""}
                      </div>
                      {d.saldoActual > 0 && (
                        <button onClick={() => onPayCard(c, m)} className="w-full rounded-lg bg-white/10 py-1.5 text-xs font-medium text-white hover:bg-white/20">
                          Pagar esta tarjeta
                        </button>
                      )}
                    </div>
                  );
                })}

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
                  <div>
                    <div className="text-stone-400">Fecha de corte</div>
                    <div>{c.fechaCorte || "—"}</div>
                  </div>
                  <div>
                    <div className="text-stone-400">Fecha de pago</div>
                    <div>{c.fechaPago || "—"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-stone-400">TCEA</div>
                    <div>{c.tasaInteres ? `${c.tasaInteres}%` : "—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal: Nuevo movimiento (rediseñado, con chips en vez de dropdowns) */
/* ------------------------------------------------------------------ */

function TransactionModal({ accounts, cards, initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [tipo, setTipo] = useState(initial?.tipo || "Gasto");
  const [moneda, setMoneda] = useState(initial?.moneda || "PEN");
  const [fecha, setFecha] = useState(initial?.fecha || todayISO());
  const [showDatePicker, setShowDatePicker] = useState(!!initial && initial.fecha !== todayISO());
  const [metodoPago, setMetodoPago] = useState(initial?.esTarjeta ? "tarjeta" : "cuenta"); // "cuenta" | "tarjeta" (solo aplica a Gasto)
  const [cuenta, setCuenta] = useState(initial && !initial.esTarjeta ? initial.cuenta : "");
  const [tarjetaId, setTarjetaId] = useState(initial?.esTarjeta ? initial.tarjetaId : "");
  const [cuentaDestino, setCuentaDestino] = useState(initial?.cuentaDestino || "");
  const [grupo, setGrupo] = useState(initial?.grupo || "Básicos");
  const [categoria, setCategoria] = useState(initial?.categoria || BASICOS_CATS[0]);
  const [monto, setMonto] = useState(initial ? String(initial.monto) : "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [recurrente, setRecurrente] = useState(initial?.recurrente || "NO");

  const cuentasDisponibles = accounts.filter((a) => (a.monedas || ["PEN"]).includes(moneda));
  const tarjetasDisponibles = (cards || []).filter((c) => (c.monedas || []).includes(moneda));

  useEffect(() => {
    if (!cuentasDisponibles.find((a) => a.nombre === cuenta)) setCuenta(cuentasDisponibles[0]?.nombre || "");
    if (!tarjetasDisponibles.find((c) => c.id === tarjetaId)) setTarjetaId(tarjetasDisponibles[0]?.id || "");
  }, [moneda]);

  useEffect(() => {
    if (tipo !== "Gasto") setMetodoPago("cuenta");
  }, [tipo]);

  const grupoOptionsByTipo = {
    Ingreso: ["Balance", "Otros ingresos", "Recarga Tarjeta", "Sueldo", "Freelance"],
    Gasto: ["Básicos", "Deseo"],
    Transferencia: ["Transferencia"],
  };
  const catOptions = grupo === "Básicos" ? BASICOS_CATS : DESEO_CATS;
  const pagaConTarjeta = tipo === "Gasto" && metodoPago === "tarjeta";
  const tarjetaSeleccionada = tarjetasDisponibles.find((c) => c.id === tarjetaId);

  const handleSubmit = () => {
    if (!monto || Number(monto) <= 0) return;
    if (pagaConTarjeta) {
      if (!tarjetaSeleccionada) return;
      onSave({
        tipo: "Gasto",
        fecha,
        cuenta: tarjetaSeleccionada.nombre,
        esTarjeta: true,
        tarjetaId: tarjetaSeleccionada.id,
        grupo,
        categoria,
        monto: Number(monto),
        moneda,
        descripcion,
        recurrente,
      });
      return;
    }
    if (!cuenta) return;
    onSave({
      tipo,
      fecha,
      cuenta,
      cuentaDestino: tipo === "Transferencia" ? cuentaDestino : undefined,
      grupo: tipo === "Transferencia" ? "Transferencia" : grupo,
      categoria: tipo === "Gasto" ? categoria : grupo,
      monto: Number(monto),
      moneda,
      descripcion,
      recurrente,
    });
  };

  return (
    <Modal title={isEdit ? "Editar movimiento" : "Nuevo movimiento"} onClose={onClose}>
      {/* Tipo: botones grandes con ícono */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { v: "Gasto", icon: "TrendingDown", color: "rose" },
          { v: "Ingreso", icon: "TrendingUp", color: "emerald" },
          { v: "Transferencia", icon: "ArrowLeftRight", color: "blue" },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => {
              setTipo(o.v);
              setGrupo(grupoOptionsByTipo[o.v][0]);
              if (o.v === "Gasto") setCategoria(BASICOS_CATS[0]);
            }}
            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-medium ${
              tipo === o.v ? `border-${o.color}-600 bg-${o.color}-50 text-${o.color}-700` : "border-stone-200 text-stone-500"
            }`}
          >
            <Ico name={o.icon} size={20} />
            {o.v}
          </button>
        ))}
      </div>

      {/* Monto grande + moneda */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        <ChipGroup options={["PEN", "USD"]} value={moneda} onChange={setMoneda} getLabel={(m) => CURRENCY_SYMBOL[m]} />
        <input
          type="number"
          step="0.01"
          min="0"
          autoFocus
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="0.00"
          className="flex-1 bg-transparent text-right font-mono text-2xl font-semibold text-stone-900 outline-none"
        />
      </div>

      {/* Fecha rápida */}
      <Field label="Fecha">
        <div className="flex flex-wrap items-center gap-2">
          <ChipGroup
            options={["hoy", "ayer", "otra"]}
            value={fecha === todayISO() && !showDatePicker ? "hoy" : showDatePicker ? "otra" : "ayer"}
            onChange={(v) => {
              if (v === "hoy") {
                setFecha(todayISO());
                setShowDatePicker(false);
              } else if (v === "ayer") {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                setFecha(d.toISOString().slice(0, 10));
                setShowDatePicker(false);
              } else {
                setShowDatePicker(true);
              }
            }}
            getLabel={(v) => (v === "hoy" ? "Hoy" : v === "ayer" ? "Ayer" : "Otra fecha")}
          />
          {showDatePicker && <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls + " w-auto"} />}
        </div>
      </Field>

      {/* Método de pago (solo Gasto): Cuenta o Tarjeta de crédito */}
      {tipo === "Gasto" && (
        <Field label="Pagar con">
          <ChipGroup options={["cuenta", "tarjeta"]} value={metodoPago} onChange={setMetodoPago} getLabel={(v) => (v === "cuenta" ? "Cuenta / efectivo" : "Tarjeta de crédito")} />
        </Field>
      )}

      {/* Cuenta(s) como chips */}
      {!pagaConTarjeta && (
        <Field label={tipo === "Transferencia" ? "Cuenta de origen" : "Cuenta"}>
          {cuentasDisponibles.length === 0 ? (
            <p className="text-sm text-rose-600">No tienes cuentas en {CURRENCY_LABEL[moneda].toLowerCase()}. Agrega una desde la pestaña Cuentas.</p>
          ) : (
            <ChipGroup options={cuentasDisponibles.map((a) => a.nombre)} value={cuenta} onChange={setCuenta} />
          )}
        </Field>
      )}

      {pagaConTarjeta && (
        <Field label="Tarjeta">
          {tarjetasDisponibles.length === 0 ? (
            <p className="text-sm text-rose-600">No tienes tarjetas en {CURRENCY_LABEL[moneda].toLowerCase()}. Agrega una desde la pestaña Cuentas.</p>
          ) : (
            <ChipGroup options={tarjetasDisponibles.map((c) => c.id)} value={tarjetaId} onChange={setTarjetaId} getLabel={(id) => tarjetasDisponibles.find((c) => c.id === id)?.nombre} />
          )}
        </Field>
      )}

      {tipo === "Transferencia" && (
        <Field label="Cuenta de destino">
          <ChipGroup options={cuentasDisponibles.filter((a) => a.nombre !== cuenta).map((a) => a.nombre)} value={cuentaDestino} onChange={setCuentaDestino} />
        </Field>
      )}

      {tipo !== "Transferencia" && (
        <Field label="Grupo">
          <ChipGroup
            options={grupoOptionsByTipo[tipo]}
            value={grupo}
            onChange={(g) => {
              setGrupo(g);
              if (g === "Básicos") setCategoria(BASICOS_CATS[0]);
              if (g === "Deseo") setCategoria(DESEO_CATS[0]);
            }}
          />
        </Field>
      )}

      {tipo === "Gasto" && (
        <Field label="Categoría (para tu presupuesto)">
          <ChipGroup options={catOptions} value={categoria} onChange={setCategoria} />
        </Field>
      )}

      <Field label="Descripción (opcional)">
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputCls} placeholder="Ej. almuerzo, pasaje, etc." />
      </Field>

      {tipo === "Gasto" && (
        <Field label="¿Es recurrente?">
          <ChipGroup options={["NO", "SEMANAL", "MENSUAL", "ANUAL"]} value={recurrente} onChange={setRecurrente} />
        </Field>
      )}

      <button
        onClick={handleSubmit}
        disabled={!monto || (pagaConTarjeta ? !tarjetaSeleccionada : !cuenta)}
        className="mt-2 w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {isEdit ? "Guardar cambios" : "Guardar movimiento"}
      </button>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal: Nuevo préstamo / Liquidar préstamo                           */
/* ------------------------------------------------------------------ */

function LoanModal({ accounts, onClose, onSave, initial }) {
  const isEdit = !!initial;
  const [tipo, setTipo] = useState(initial?.tipo || "Presté");
  const [persona, setPersona] = useState(initial?.persona || "");
  const [moneda, setMoneda] = useState(initial?.moneda || "PEN");
  const [monto, setMonto] = useState(initial ? String(initial.monto) : "");
  const [fecha, setFecha] = useState(initial?.fecha || todayISO());
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [conCuotas, setConCuotas] = useState(!!(initial && initial.numCuotas > 0));
  const [tasaInteres, setTasaInteres] = useState(initial?.tasaInteres ? String(initial.tasaInteres) : "");
  const [numCuotas, setNumCuotas] = useState(initial?.numCuotas ? String(initial.numCuotas) : "");
  const [fechaPrimeraCuota, setFechaPrimeraCuota] = useState(initial?.fechaPrimeraCuota || initial?.fecha || todayISO());
  const [fechasCuotas, setFechasCuotas] = useState(() =>
    Array.isArray(initial?.fechasCuotas) && initial.fechasCuotas.length === initial?.numCuotas
      ? initial.fechasCuotas
      : generarFechasCuotasDefault(initial?.fechaPrimeraCuota || initial?.fecha || todayISO(), initial?.numCuotas || 0)
  );
  const cuentasDisponibles = accounts.filter((a) => (a.monedas || ["PEN"]).includes(moneda));
  const [cuenta, setCuenta] = useState(initial?.cuenta || "");

  useEffect(() => {
    if (isEdit) return;
    if (!cuentasDisponibles.find((a) => a.nombre === cuenta)) setCuenta(cuentasDisponibles[0]?.nombre || "");
  }, [moneda]);

  const montoNum = Number(monto) || 0;
  const tasaNum = Number(tasaInteres) || 0;
  const cuotasNum = Number(numCuotas) || 0;
  const cuotaMensual = conCuotas && cuotasNum > 0 ? calcularCuotaMensual(montoNum, tasaNum, cuotasNum) : 0;

  // Mantiene el cronograma de vencimientos con el mismo largo que el número
  // de cuotas: conserva las fechas ya personalizadas y completa las nuevas
  // con un vencimiento mensual a partir de la última fecha conocida.
  useEffect(() => {
    if (!conCuotas) return;
    setFechasCuotas((prev) => {
      if (cuotasNum <= 0) return [];
      if (prev.length === cuotasNum) return prev;
      if (prev.length > cuotasNum) return prev.slice(0, cuotasNum);
      const next = [...prev];
      while (next.length < cuotasNum) {
        const base = new Date((next[next.length - 1] || fechaPrimeraCuota || todayISO()) + "T00:00:00");
        if (next.length > 0) base.setMonth(base.getMonth() + 1);
        next.push(base.toISOString().slice(0, 10));
      }
      return next;
    });
  }, [cuotasNum, conCuotas]);

  const updateFechaCuota = (idx, valor) => setFechasCuotas((prev) => prev.map((f, i) => (i === idx ? valor : f)));
  const regenerarFechasCuotas = () => setFechasCuotas(generarFechasCuotasDefault(fechaPrimeraCuota, cuotasNum));

  const handleSubmit = () => {
    if (!persona || !montoNum || !(isEdit || cuenta)) return;
    onSave({
      tipo,
      persona,
      monto: montoNum,
      moneda,
      cuenta,
      fecha,
      descripcion,
      tasaInteres: conCuotas ? tasaNum : 0,
      numCuotas: conCuotas ? cuotasNum : 0,
      fechaPrimeraCuota: conCuotas ? fechaPrimeraCuota : null,
      fechasCuotas: conCuotas && cuotasNum > 0 ? fechasCuotas.slice(0, cuotasNum) : null,
    });
  };

  return (
    <Modal title={isEdit ? "Editar préstamo" : "Nuevo préstamo"} onClose={onClose}>
      {!isEdit && (
        <Field label="Tipo">
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "Presté", label: "Yo presté", sub: "Tu dinero sale de una cuenta" },
              { v: "Me prestaron", label: "Me prestaron", sub: "El dinero entra a una cuenta" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setTipo(o.v)}
                className={`rounded-xl border-2 p-3 text-left text-sm ${tipo === o.v ? "border-teal-600 bg-teal-50" : "border-stone-200"}`}
              >
                <div className="font-medium text-stone-800">{o.label}</div>
                <div className="text-xs text-stone-500">{o.sub}</div>
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="¿Con quién?">
        <input value={persona} onChange={(e) => setPersona(e.target.value)} className={inputCls} placeholder="Nombre de la persona" />
      </Field>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        {isEdit ? <CurrencyBadge moneda={moneda} /> : <ChipGroup options={["PEN", "USD"]} value={moneda} onChange={setMoneda} getLabel={(m) => CURRENCY_SYMBOL[m]} />}
        <input type="number" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent text-right font-mono text-2xl font-semibold text-stone-900 outline-none" />
      </div>

      {!isEdit && (
        <Field label="Cuenta">
          {cuentasDisponibles.length === 0 ? (
            <p className="text-sm text-rose-600">No tienes cuentas en {CURRENCY_LABEL[moneda].toLowerCase()}.</p>
          ) : (
            <ChipGroup options={cuentasDisponibles.map((a) => a.nombre)} value={cuenta} onChange={setCuenta} />
          )}
        </Field>
      )}

      <Field label="Fecha">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
      </Field>

      <Field label="Descripción (opcional)">
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputCls} placeholder="Ej. para el pasaje del bus" />
      </Field>

      <Field label="¿Tiene interés y cuotas?">
        <ChipGroup options={[false, true]} value={conCuotas} onChange={setConCuotas} getLabel={(v) => (v ? "Sí, con cuotas" : "No, pago único")} />
      </Field>

      {conCuotas && (
        <div className="mb-4 rounded-xl border border-stone-200 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tasa de interés anual (TEA %)">
              <input type="number" step="0.01" min="0" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} className={inputCls} placeholder="Ej. 45" />
            </Field>
            <Field label="Número de cuotas">
              <input type="number" step="1" min="1" value={numCuotas} onChange={(e) => setNumCuotas(e.target.value)} className={inputCls} placeholder="Ej. 12" />
            </Field>
          </div>
          <Field label="Fecha de la primera cuota">
            <input type="date" value={fechaPrimeraCuota} onChange={(e) => setFechaPrimeraCuota(e.target.value)} className={inputCls} />
          </Field>

          {cuotasNum > 0 && (
            <Field label={`Cronograma de vencimientos (${cuotasNum} cuota${cuotasNum === 1 ? "" : "s"})`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs leading-snug text-stone-400">Ajusta la fecha de cada cuota si no vencen todas el mismo día del mes.</p>
                <button
                  type="button"
                  onClick={regenerarFechasCuotas}
                  className="shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                >
                  Generar automático
                </button>
              </div>
              <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-2 sm:grid-cols-2">
                {fechasCuotas.map((f, i) => (
                  <div key={i} className="flex min-w-0 items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                    <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded bg-stone-100 text-[11px] font-semibold text-stone-500">{i + 1}</span>
                    <input
                      type="date"
                      value={f}
                      onChange={(e) => updateFechaCuota(i, e.target.value)}
                      className="w-full min-w-0 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 outline-none focus:border-teal-500"
                    />
                  </div>
                ))}
              </div>
            </Field>
          )}

          {montoNum > 0 && cuotasNum > 0 && (
            <div className="mt-1 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
              <div className="flex justify-between">
                <span>Cuota mensual estimada</span>
                <span className="font-mono font-semibold">{fmt(cuotaMensual, moneda)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-teal-700">
                <span>Total a pagar con interés</span>
                <span className="font-mono">{fmt(cuotaMensual * cuotasNum, moneda)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={handleSubmit} disabled={!persona || !monto || (!isEdit && !cuenta)} className="mt-2 w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
        {isEdit ? "Guardar cambios" : "Guardar préstamo"}
      </button>
    </Modal>
  );
}

function SettleLoanModal({ loan, accounts, onClose, onConfirm }) {
  const [cuenta, setCuenta] = useState(accounts[0]?.nombre || "");
  const [fecha, setFecha] = useState(todayISO());

  return (
    <Modal title={`Liquidar préstamo con ${loan.persona}`} onClose={onClose}>
      <p className="mb-4 text-sm text-stone-600">
        {loan.tipo === "Presté" ? `${loan.persona} te devuelve ${fmt(loan.monto, loan.moneda)}. Elige a qué cuenta llega el dinero.` : `Le devuelves ${fmt(loan.monto, loan.moneda)} a ${loan.persona}. Elige de qué cuenta sale.`}
      </p>
      <Field label="Cuenta">
        {accounts.length === 0 ? <p className="text-sm text-rose-600">No tienes cuentas en {CURRENCY_LABEL[loan.moneda].toLowerCase()}.</p> : <ChipGroup options={accounts.map((a) => a.nombre)} value={cuenta} onChange={setCuenta} />}
      </Field>
      <Field label="Fecha">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
      </Field>
      <button onClick={() => cuenta && onConfirm(cuenta, fecha)} disabled={!cuenta} className="mt-2 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
        Confirmar liquidación
      </button>
    </Modal>
  );
}

function PayCardModal({ card, moneda, deudaActual, accounts, onClose, onConfirm }) {
  const [cuenta, setCuenta] = useState(accounts[0]?.nombre || "");
  const [monto, setMonto] = useState(deudaActual > 0 ? String(deudaActual.toFixed(2)) : "");
  const [fecha, setFecha] = useState(todayISO());
  const montoNum = Number(monto) || 0;

  return (
    <Modal title={`Pagar ${card.nombre}`} onClose={onClose}>
      <p className="mb-4 text-sm text-stone-600">
        Deuda actual en {CURRENCY_LABEL[moneda].toLowerCase()}: <span className="font-mono font-semibold">{fmt(deudaActual, moneda)}</span>. Elige de qué cuenta sale el pago.
      </p>
      <Field label="Cuenta de origen">
        {accounts.length === 0 ? <p className="text-sm text-rose-600">No tienes cuentas en {CURRENCY_LABEL[moneda].toLowerCase()}.</p> : <ChipGroup options={accounts.map((a) => a.nombre)} value={cuenta} onChange={setCuenta} />}
      </Field>
      <Field label="Monto a pagar">
        <input type="number" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Fecha">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
      </Field>
      <button
        onClick={() => cuenta && montoNum > 0 && onConfirm(cuenta, montoNum, fecha)}
        disabled={!cuenta || montoNum <= 0}
        className="mt-2 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        Confirmar pago
      </button>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal: Nueva tarjeta de crédito (multi-moneda)                      */
/* ------------------------------------------------------------------ */

function CardModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [monedas, setMonedas] = useState(["PEN"]);
  const [campos, setCampos] = useState({
    PEN: { limite: "", saldoActual: "", pagoMinimo: "" },
    USD: { limite: "", saldoActual: "", pagoMinimo: "" },
  });
  const [fechaCorte, setFechaCorte] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [tasaInteres, setTasaInteres] = useState("");

  const toggleMoneda = (m) => setMonedas((prev) => (prev.includes(m) ? (prev.length > 1 ? prev.filter((x) => x !== m) : prev) : [...prev, m]));
  const setCampo = (m, campo, valor) => setCampos((prev) => ({ ...prev, [m]: { ...prev[m], [campo]: valor } }));

  const handleSubmit = () => {
    if (!nombre) return;
    const porMoneda = {};
    monedas.forEach((m) => {
      porMoneda[m] = {
        limite: Number(campos[m].limite) || 0,
        saldoActual: Number(campos[m].saldoActual) || 0,
        pagoMinimo: Number(campos[m].pagoMinimo) || 0,
      };
    });
    onSave({ nombre, banco, monedas, porMoneda, fechaCorte, fechaPago, tasaInteres: Number(tasaInteres) || 0 });
  };

  return (
    <Modal title="Agregar tarjeta de crédito" onClose={onClose}>
      <Field label="Nombre de la tarjeta">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} placeholder="Ej. BCP Visa Signature" />
      </Field>
      <Field label="Banco / entidad">
        <input value={banco} onChange={(e) => setBanco(e.target.value)} className={inputCls} placeholder="Ej. BCP, Interbank, Falabella" />
      </Field>
      <Field label="¿En qué monedas maneja saldo?">
        <div className="flex gap-2">
          {["PEN", "USD"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleMoneda(m)}
              className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium ${monedas.includes(m) ? "border-teal-600 bg-teal-50 text-teal-700" : "border-stone-200 text-stone-500"}`}
            >
              {CURRENCY_LABEL[m]} ({CURRENCY_SYMBOL[m]})
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-stone-400">Marca ambas si la tarjeta tiene línea y consumos en soles y en dólares por separado.</p>
      </Field>

      {monedas.map((m) => (
        <div key={m} className="mb-3 rounded-xl border border-stone-200 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{CURRENCY_LABEL[m]}</div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Línea">
              <input type="number" step="0.01" value={campos[m].limite} onChange={(e) => setCampo(m, "limite", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Saldo (deuda)">
              <input type="number" step="0.01" value={campos[m].saldoActual} onChange={(e) => setCampo(m, "saldoActual", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pago mínimo">
              <input type="number" step="0.01" value={campos[m].pagoMinimo} onChange={(e) => setCampo(m, "pagoMinimo", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
      ))}

      <Field label="Fecha de corte">
        <input type="date" value={fechaCorte} onChange={(e) => setFechaCorte(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Fecha límite de pago">
        <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} className={inputCls} />
      </Field>
      <Field label="TCEA / tasa de interés anual (%)">
        <input type="number" step="0.01" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} className={inputCls} />
      </Field>
      <button onClick={handleSubmit} className="mt-2 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
        Guardar tarjeta
      </button>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal: Nueva cuenta / billetera (multi-moneda)                      */
/* ------------------------------------------------------------------ */

function AccountModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Banco");
  const [monedas, setMonedas] = useState(["PEN"]);

  const toggleMoneda = (m) => setMonedas((prev) => (prev.includes(m) ? (prev.length > 1 ? prev.filter((x) => x !== m) : prev) : [...prev, m]));

  const handleSubmit = () => {
    if (!nombre) return;
    onSave({ nombre, tipo, monedas });
  };

  return (
    <Modal title="Agregar cuenta o billetera" onClose={onClose}>
      <Field label="Nombre">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} placeholder="Ej. Plin, Bipay, Interbank" />
      </Field>
      <Field label="Tipo">
        <ChipGroup options={["Banco", "Efectivo", "Billetera digital", "Ahorros", "Prepago", "Cashback", "Inversión"]} value={tipo} onChange={setTipo} />
      </Field>
      <Field label="¿En qué monedas maneja saldo?">
        <div className="flex gap-2">
          {["PEN", "USD"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleMoneda(m)}
              className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium ${monedas.includes(m) ? "border-teal-600 bg-teal-50 text-teal-700" : "border-stone-200 text-stone-500"}`}
            >
              {CURRENCY_LABEL[m]} ({CURRENCY_SYMBOL[m]})
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-stone-400">Marca ambas si, por ejemplo, tu cuenta bancaria tiene una caja de ahorro en soles y otra en dólares.</p>
      </Field>
      <button onClick={handleSubmit} className="mt-2 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
        Guardar cuenta
      </button>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Montaje de la app                                                    */
/* ------------------------------------------------------------------ */

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
