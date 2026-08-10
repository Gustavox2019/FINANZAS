
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

const DEFAULT_SETTINGS = { tipoCambio: 3.55 };

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <h3 className="font-serif text-lg text-stone-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
            <Ico name="X" size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
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
/*  App principal                                                       */
/* ------------------------------------------------------------------ */

function FinanceDashboard({ user }) {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState(ACCOUNTS_SEED);
  const [transactions, setTransactions] = useState(TRANSACTIONS_SEED);
  const [budgets, setBudgets] = useState(BUDGETS_SEED);
  const [cards, setCards] = useState(CREDIT_CARDS_SEED);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tab, setTab] = useState("resumen");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAccModal, setShowAccModal] = useState(false);
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
      const ok = await cloudSave(user.uid, { accounts, transactions, budgets, cards, settings });
      setSaveState(ok ? "saved" : "error");
    }, 500);
    return () => clearTimeout(t);
  }, [accounts, transactions, budgets, cards, settings, loaded, user.uid]);

  const accountByName = useCallback((nombre) => accounts.find((a) => a.nombre === nombre), [accounts]);

  const accountBalances = useMemo(() => {
    const balances = {};
    accounts.forEach((a) => (balances[a.nombre] = 0));
    transactions.forEach((t) => {
      if (balances[t.cuenta] === undefined) balances[t.cuenta] = 0;
      if (t.tipo === "Ingreso") balances[t.cuenta] += t.monto;
      else if (t.tipo === "Gasto") balances[t.cuenta] -= t.monto;
      else if (t.tipo === "Transferencia") {
        balances[t.cuenta] -= t.monto;
        if (balances[t.cuentaDestino] === undefined) balances[t.cuentaDestino] = 0;
        balances[t.cuentaDestino] += t.monto;
      }
    });
    return balances;
  }, [accounts, transactions]);

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

  const ingresosMes = realIncomeTx.reduce((s, t) => s + t.monto, 0);
  const gastosMes = realExpenseTx.reduce((s, t) => s + t.monto, 0);
  const ahorroMes = ingresosMes - gastosMes;
  const pctAhorro = ingresosMes > 0 ? (ahorroMes / ingresosMes) * 100 : 0;
  const prestado = loanTx.filter((t) => t.tipo === "Gasto").reduce((s, t) => s + t.monto, 0);
  const cobrado = loanTx.filter((t) => t.tipo === "Ingreso").reduce((s, t) => s + t.monto, 0);

  const totalPEN = accounts.filter((a) => a.moneda === "PEN").reduce((s, a) => s + (accountBalances[a.nombre] || 0), 0);
  const totalUSD = accounts.filter((a) => a.moneda === "USD").reduce((s, a) => s + (accountBalances[a.nombre] || 0), 0);
  const patrimonioSoles = totalPEN + totalUSD * settings.tipoCambio;

  const gastosPorCategoria = useMemo(() => {
    const map = {};
    realExpenseTx.forEach((t) => {
      map[t.categoria] = (map[t.categoria] || 0) + t.monto;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [realExpenseTx]);

  const topGastos = useMemo(
    () => [...realExpenseTx].sort((a, b) => b.monto - a.monto).slice(0, 5),
    [realExpenseTx]
  );

  const evolucion6m = useMemo(() => {
    if (!selectedMonth) return [];
    const [y, m] = selectedMonth.split("-").map(Number);
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const txs = transactions.filter((t) => monthKey(t.fecha) === mk);
      const ing = txs.filter((t) => t.tipo === "Ingreso" && t.grupo !== "Balance" && t.grupo !== "Préstamos").reduce((s, t) => s + t.monto, 0);
      const gas = txs.filter((t) => t.tipo === "Gasto" && t.grupo !== "Préstamos").reduce((s, t) => s + t.monto, 0);
      out.push({ mes: d.toLocaleDateString("es-PE", { month: "short" }), Ingresos: Number(ing.toFixed(2)), Gastos: Number(gas.toFixed(2)) });
    }
    return out;
  }, [transactions, selectedMonth]);

  const budgetsWithSpent = useMemo(
    () =>
      budgets.map((b) => {
        const gastado = realExpenseTx.filter((t) => t.grupo === b.grupo && t.categoria === b.categoria).reduce((s, t) => s + t.monto, 0);
        const pct = b.presupuesto > 0 ? (gastado / b.presupuesto) * 100 : gastado > 0 ? 100 : 0;
        return { ...b, gastado, pct, disponible: b.presupuesto - gastado };
      }),
    [budgets, realExpenseTx]
  );

  const cardsWithUtil = useMemo(
    () => cards.map((c) => ({ ...c, util: c.limite > 0 ? (c.saldoActual / c.limite) * 100 : 0 })),
    [cards]
  );

  const alerts = useMemo(() => {
    const list = [];
    accounts.forEach((a) => {
      const bal = accountBalances[a.nombre] || 0;
      if (bal < 0) list.push({ type: "danger", text: `${a.nombre} tiene saldo negativo: ${fmt(bal, a.moneda)}` });
    });
    budgetsWithSpent.forEach((b) => {
      if (b.presupuesto > 0 && b.pct >= 100) list.push({ type: "danger", text: `Presupuesto "${b.categoria}" excedido (${b.pct.toFixed(0)}%)` });
      else if (b.presupuesto > 0 && b.pct >= 80) list.push({ type: "warn", text: `Presupuesto "${b.categoria}" al ${b.pct.toFixed(0)}%` });
    });
    cardsWithUtil.forEach((c) => {
      if (c.util >= 80) list.push({ type: "danger", text: `Tarjeta ${c.nombre} con ${c.util.toFixed(0)}% de uso de línea` });
      if (c.fechaPago) {
        const days = Math.ceil((new Date(c.fechaPago) - new Date()) / 86400000);
        if (days >= 0 && days <= 7) list.push({ type: "warn", text: `Pago de ${c.nombre} vence en ${days} día(s)` });
      }
    });
    return list;
  }, [accounts, accountBalances, budgetsWithSpent, cardsWithUtil]);

  const deudaTarjetas = cards.reduce((s, c) => s + (Number(c.saldoActual) || 0), 0);

  /* ---------------------------- Acciones --------------------------- */

  const addTransaction = (tx) => setTransactions((prev) => [{ id: uid(), ...tx }, ...prev]);
  const deleteTransaction = (id) => setTransactions((prev) => prev.filter((t) => t.id !== id));
  const updateBudget = (id, presupuesto) => setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, presupuesto } : b)));
  const addCard = (card) => setCards((prev) => [...prev, { id: uid(), ...card }]);
  const deleteCard = (id) => setCards((prev) => prev.filter((c) => c.id !== id));
  const addAccount = (acc) => setAccounts((prev) => [...prev, { id: uid(), ...acc }]);
  const deleteAccount = (id) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.cuenta !== acc.nombre && t.cuentaDestino !== acc.nombre));
  };

  const NAV = [
    { id: "resumen", label: "Resumen", icon: "LayoutDashboard" },
    { id: "transacciones", label: "Transacciones", icon: "Receipt" },
    { id: "presupuestos", label: "Presupuestos", icon: "PiggyBank" },
    { id: "tarjetas", label: "Tarjetas de crédito", icon: "CreditCard" },
    { id: "cuentas", label: "Cuentas", icon: "Wallet" },
  ];

  if (!loaded) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center bg-stone-50 font-sans text-stone-400">
        Cargando tus finanzas…
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[700px] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 font-sans text-stone-900">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-stone-200 bg-stone-900 text-stone-100">
        <div className="border-b border-stone-800 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <Ico name="Landmark" size={16} />
            </div>
            <div>
              <div className="font-serif text-base leading-tight">Control de Dinero</div>
              <div className="text-[11px] text-stone-400">Finanzas personales</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
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
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white/90 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="font-serif text-xl text-stone-900">
              {NAV.find((n) => n.id === tab)?.label}
            </h1>
            {selectedMonth && <p className="text-xs capitalize text-stone-500">{monthLabel(selectedMonth)}</p>}
          </div>
          <div className="flex items-center gap-2">
            {availableMonths.length > 0 && (
              <select
                value={selectedMonth || ""}
                onChange={(e) => setSelectedMonth(e.target.value)}
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
              title={accounts.length ? "" : "Primero agrega una cuenta"}
            >
              <Ico name="Plus" size={16} /> Nuevo movimiento
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === "resumen" && accounts.length === 0 && (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-teal-300 bg-teal-50/60 p-8 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white">
                <Ico name="Wallet" size={20} />
              </div>
              <h2 className="mb-1 font-serif text-lg text-stone-900">Empecemos desde cero</h2>
              <p className="mb-5 text-sm text-stone-500">
                Primero agrega tus cuentas o billeteras (banco, efectivo, Yape, tarjeta prepago, etc.). Luego podrás
                registrar movimientos, definir presupuestos y agregar tarjetas de crédito.
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
              deudaTarjetas={deudaTarjetas}
              prestado={prestado}
              cobrado={cobrado}
              gastosPorCategoria={gastosPorCategoria}
              evolucion6m={evolucion6m}
              topGastos={topGastos}
              alerts={alerts}
              settings={settings}
            />
          )}
          {tab === "transacciones" && (
            <TransaccionesTab
              transactions={[...transactions].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))}
              accounts={accounts}
              onDelete={deleteTransaction}
            />
          )}
          {tab === "presupuestos" && <PresupuestosTab budgetsWithSpent={budgetsWithSpent} onUpdate={updateBudget} />}
          {tab === "tarjetas" && (
            <TarjetasTab cardsWithUtil={cardsWithUtil} onAdd={() => setShowCardModal(true)} onDelete={deleteCard} />
          )}
          {tab === "cuentas" && (
            <CuentasTab
              accounts={accounts}
              accountBalances={accountBalances}
              onAdd={() => setShowAccModal(true)}
              onDelete={deleteAccount}
              settings={settings}
              setSettings={setSettings}
            />
          )}
        </div>
      </main>

      {showTxModal && (
        <TransactionModal
          accounts={accounts}
          onClose={() => setShowTxModal(false)}
          onSave={(tx) => {
            addTransaction(tx);
            setShowTxModal(false);
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Resumen                                                        */
/* ------------------------------------------------------------------ */

function ResumenTab({
  ingresosMes, gastosMes, ahorroMes, pctAhorro, patrimonioSoles, totalPEN, totalUSD,
  deudaTarjetas, prestado, cobrado, gastosPorCategoria, evolucion6m, topGastos, alerts, settings,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon="Landmark" label="Patrimonio (S/ equiv.)" value={fmt(patrimonioSoles)} sub={`${fmt(totalPEN)} + ${fmt(totalUSD, "USD")}`} />
        <StatCard icon="TrendingUp" label="Ingresos del mes" value={fmt(ingresosMes)} tone="good" />
        <StatCard icon="TrendingDown" label="Gastos del mes" value={fmt(gastosMes)} tone="bad" />
        <StatCard
          icon="PiggyBank"
          label="Ahorro del mes"
          value={fmt(ahorroMes)}
          sub={`${pctAhorro.toFixed(1)}% de tus ingresos`}
          tone={ahorroMes >= 0 ? "good" : "bad"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon="CreditCard" label="Deuda en tarjetas" value={fmt(deudaTarjetas)} tone={deudaTarjetas > 0 ? "warn" : "default"} />
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
                data={gastosPorCategoria.map((c, i) => ({
                  name: c.name,
                  value: c.value,
                  color: GRUPO_COLORS[c.name] || PALETTE[i % PALETTE.length],
                }))}
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
          <h3 className="mb-3 font-serif text-base text-stone-800">Ingresos vs. gastos (últimos 6 meses)</h3>
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
                    <div className="text-sm font-medium text-stone-800">{t.descripcion || t.categoria}</div>
                    <div className="text-xs text-stone-400">
                      {t.categoria} · {t.cuenta} · {t.fecha}
                    </div>
                  </div>
                  <div className="font-mono text-sm font-semibold text-rose-700">{fmt(t.monto)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-base text-stone-800">Evolución del saldo neto</h3>
          <TrendLineChart
            data={evolucion6m.map((d) => ({ mes: d.mes, Ahorro: Number((d.Ingresos - d.Gastos).toFixed(2)) }))}
            dataKey="Ahorro"
            height={220}
            color="#0d9488"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Transacciones                                                  */
/* ------------------------------------------------------------------ */

function TransaccionesTab({ transactions, onDelete }) {
  const [filterTipo, setFilterTipo] = useState("Todos");
  const filtered = filterTipo === "Todos" ? transactions : transactions.filter((t) => t.tipo === filterTipo);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["Todos", "Ingreso", "Gasto", "Transferencia"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterTipo(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
              filterTipo === f ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
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
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {t.tipo}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-stone-700">{t.categoria}</td>
                <td className="px-4 py-2.5 text-stone-700">
                  {t.cuenta}
                  {t.cuentaDestino ? ` → ${t.cuentaDestino}` : ""}
                </td>
                <td className="max-w-[220px] truncate px-4 py-2.5 text-stone-500">{t.descripcion}</td>
                <td
                  className={`whitespace-nowrap px-4 py-2.5 text-right font-mono font-medium ${
                    t.tipo === "Ingreso" ? "text-emerald-700" : t.tipo === "Gasto" ? "text-rose-700" : "text-blue-700"
                  }`}
                >
                  {fmt(t.monto)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => onDelete(t.id)} className="rounded p-1 text-stone-300 hover:bg-rose-50 hover:text-rose-600">
                    <Ico name="Trash2" size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                  No hay movimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
/*  Tab: Tarjetas de crédito                                            */
/* ------------------------------------------------------------------ */

function TarjetasTab({ cardsWithUtil, onAdd, onDelete }) {
  return (
    <div className="space-y-4">
      <button onClick={onAdd} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800">
        <Ico name="Plus" size={16} /> Agregar tarjeta
      </button>

      {cardsWithUtil.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-400">
          Aún no registras tarjetas de crédito. Agrega la primera para ver su línea, deuda y vencimientos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cardsWithUtil.map((c) => (
            <div key={c.id} className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-900 to-stone-700 p-5 text-white shadow-sm">
              <button onClick={() => onDelete(c.id)} className="absolute right-3 top-3 rounded p-1 text-stone-300 hover:bg-white/10 hover:text-white">
                <Ico name="Trash2" size={14} />
              </button>
              <div className="text-xs uppercase tracking-wide text-stone-300">{c.banco}</div>
              <div className="mb-4 font-serif text-lg">{c.nombre}</div>
              <div className="mb-1 flex items-end justify-between">
                <span className="text-xs text-stone-300">Saldo actual</span>
                <span className="font-mono text-xl font-semibold">{fmt(c.saldoActual, c.moneda)}</span>
              </div>
              <div className="mb-3 text-xs text-stone-300">Línea: {fmt(c.limite, c.moneda)}</div>
              <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full ${c.util >= 80 ? "bg-rose-400" : c.util >= 50 ? "bg-amber-400" : "bg-teal-400"}`}
                  style={{ width: `${Math.min(100, c.util)}%` }}
                />
              </div>
              <div className="mb-3 text-xs text-stone-300">{c.util.toFixed(0)}% utilizado</div>
              <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
                <div>
                  <div className="text-stone-400">Fecha de corte</div>
                  <div>{c.fechaCorte || "—"}</div>
                </div>
                <div>
                  <div className="text-stone-400">Fecha de pago</div>
                  <div>{c.fechaPago || "—"}</div>
                </div>
                <div>
                  <div className="text-stone-400">Pago mínimo</div>
                  <div>{c.pagoMinimo ? fmt(c.pagoMinimo, c.moneda) : "—"}</div>
                </div>
                <div>
                  <div className="text-stone-400">TCEA</div>
                  <div>{c.tasaInteres ? `${c.tasaInteres}%` : "—"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Cuentas                                                        */
/* ------------------------------------------------------------------ */

function CuentasTab({ accounts, accountBalances, onAdd, onDelete, settings, setSettings }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onAdd} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800">
          <Ico name="Plus" size={16} /> Agregar cuenta
        </button>
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => {
          const bal = accountBalances[a.nombre] || 0;
          return (
            <div key={a.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-stone-800">{a.nombre}</div>
                  <div className="text-xs text-stone-400">{a.tipo}</div>
                </div>
                <button onClick={() => onDelete(a.id)} className="rounded p-1 text-stone-300 hover:bg-rose-50 hover:text-rose-600">
                  <Ico name="Trash2" size={14} />
                </button>
              </div>
              <div className={`font-mono text-xl font-semibold ${bal < 0 ? "text-rose-700" : "text-stone-900"}`}>{fmt(bal, a.moneda)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modales de creación                                                 */
/* ------------------------------------------------------------------ */

function TransactionModal({ accounts, onClose, onSave }) {
  const [tipo, setTipo] = useState("Gasto");
  const [fecha, setFecha] = useState(todayISO());
  const [cuenta, setCuenta] = useState(accounts[0]?.nombre || "");
  const [cuentaDestino, setCuentaDestino] = useState(accounts[1]?.nombre || "");
  const [grupo, setGrupo] = useState("Básicos");
  const [categoria, setCategoria] = useState(BASICOS_CATS[0]);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [recurrente, setRecurrente] = useState("NO");

  const catOptions = grupo === "Básicos" ? BASICOS_CATS : grupo === "Deseo" ? DESEO_CATS : ["Préstamos"];

  const grupoOptionsByTipo = {
    Ingreso: ["Balance", "Otros ingresos", "Recarga Tarjeta", "Préstamos", "Sueldo", "Freelance"],
    Gasto: ["Básicos", "Deseo", "Préstamos"],
    Transferencia: ["Transferencia"],
  };

  const handleSubmit = () => {
    if (!monto || Number(monto) <= 0) return;
    onSave({
      tipo,
      fecha,
      cuenta,
      cuentaDestino: tipo === "Transferencia" ? cuentaDestino : undefined,
      grupo: tipo === "Transferencia" ? "Transferencia" : grupo,
      categoria: tipo === "Gasto" ? categoria : grupo,
      monto: Number(monto),
      descripcion,
      recurrente,
    });
  };

  return (
    <Modal title="Nuevo movimiento" onClose={onClose}>
      <Field label="Tipo">
        <div className="flex gap-2">
          {["Gasto", "Ingreso", "Transferencia"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTipo(t);
                setGrupo(grupoOptionsByTipo[t][0]);
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                tipo === t ? "border-teal-600 bg-teal-50 text-teal-700" : "border-stone-200 text-stone-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Fecha">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
      </Field>

      <Field label={tipo === "Transferencia" ? "Cuenta de origen" : "Cuenta"}>
        <select value={cuenta} onChange={(e) => setCuenta(e.target.value)} className={inputCls}>
          {accounts.map((a) => (
            <option key={a.id} value={a.nombre}>
              {a.nombre}
            </option>
          ))}
        </select>
      </Field>

      {tipo === "Transferencia" && (
        <Field label="Cuenta de destino">
          <select value={cuentaDestino} onChange={(e) => setCuentaDestino(e.target.value)} className={inputCls}>
            {accounts.map((a) => (
              <option key={a.id} value={a.nombre}>
                {a.nombre}
              </option>
            ))}
          </select>
        </Field>
      )}

      {tipo !== "Transferencia" && (
        <Field label="Grupo / categoría general">
          <select
            value={grupo}
            onChange={(e) => {
              setGrupo(e.target.value);
              if (e.target.value === "Básicos") setCategoria(BASICOS_CATS[0]);
              if (e.target.value === "Deseo") setCategoria(DESEO_CATS[0]);
            }}
            className={inputCls}
          >
            {grupoOptionsByTipo[tipo].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      )}

      {tipo === "Gasto" && (grupo === "Básicos" || grupo === "Deseo") && (
        <Field label="Categoría específica (para presupuesto)">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
            {catOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Monto">
        <input type="number" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} className={inputCls} placeholder="0.00" />
      </Field>

      <Field label="Descripción">
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputCls} placeholder="Ej. almuerzo, pasaje, etc." />
      </Field>

      {tipo === "Gasto" && (
        <Field label="¿Es recurrente?">
          <select value={recurrente} onChange={(e) => setRecurrente(e.target.value)} className={inputCls}>
            {["NO", "SEMANAL", "MENSUAL", "ANUAL"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      )}

      <button onClick={handleSubmit} className="mt-2 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
        Guardar movimiento
      </button>
    </Modal>
  );
}

function CardModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [moneda, setMoneda] = useState("PEN");
  const [limite, setLimite] = useState("");
  const [saldoActual, setSaldoActual] = useState("");
  const [fechaCorte, setFechaCorte] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [pagoMinimo, setPagoMinimo] = useState("");
  const [tasaInteres, setTasaInteres] = useState("");

  const handleSubmit = () => {
    if (!nombre || !limite) return;
    onSave({
      nombre,
      banco,
      moneda,
      limite: Number(limite) || 0,
      saldoActual: Number(saldoActual) || 0,
      fechaCorte,
      fechaPago,
      pagoMinimo: Number(pagoMinimo) || 0,
      tasaInteres: Number(tasaInteres) || 0,
    });
  };

  return (
    <Modal title="Agregar tarjeta de crédito" onClose={onClose}>
      <Field label="Nombre de la tarjeta">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} placeholder="Ej. BCP Visa Signature" />
      </Field>
      <Field label="Banco / entidad">
        <input value={banco} onChange={(e) => setBanco(e.target.value)} className={inputCls} placeholder="Ej. BCP, Interbank, Falabella" />
      </Field>
      <Field label="Moneda">
        <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className={inputCls}>
          <option value="PEN">Soles (PEN)</option>
          <option value="USD">Dólares (USD)</option>
        </select>
      </Field>
      <Field label="Línea de crédito">
        <input type="number" step="0.01" value={limite} onChange={(e) => setLimite(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Saldo actual (deuda)">
        <input type="number" step="0.01" value={saldoActual} onChange={(e) => setSaldoActual(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Fecha de corte">
        <input type="date" value={fechaCorte} onChange={(e) => setFechaCorte(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Fecha límite de pago">
        <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Pago mínimo">
        <input type="number" step="0.01" value={pagoMinimo} onChange={(e) => setPagoMinimo(e.target.value)} className={inputCls} />
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

function AccountModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Banco");
  const [moneda, setMoneda] = useState("PEN");

  const handleSubmit = () => {
    if (!nombre) return;
    onSave({ nombre, tipo, moneda });
  };

  return (
    <Modal title="Agregar cuenta o billetera" onClose={onClose}>
      <Field label="Nombre">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} placeholder="Ej. Plin, Bipay, Interbank" />
      </Field>
      <Field label="Tipo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
          {["Banco", "Efectivo", "Billetera digital", "Ahorros", "Prepago", "Cashback", "Inversión"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Moneda">
        <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className={inputCls}>
          <option value="PEN">Soles (PEN)</option>
          <option value="USD">Dólares (USD)</option>
        </select>
      </Field>
      <button onClick={handleSubmit} className="mt-2 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
        Guardar cuenta
      </button>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Montaje de la app                                                   */
/* ------------------------------------------------------------------ */

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
