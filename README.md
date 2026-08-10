# Control de Dinero

Dashboard personal de finanzas: cuentas, ingresos, gastos, presupuestos y tarjetas de crédito, con gráficos dinámicos. Es una página estática (sin backend propio ni paso de compilación) que guarda tus datos en **Firestore** (la base de datos en la nube de Firebase), ligados a tu cuenta — así puedes entrar desde el celular y la computadora y ver la misma información.

## Paso 1 — Crear tu proyecto de Firebase (gratis)

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) e inicia sesión con tu cuenta de Google.
2. **Añadir proyecto** → ponle un nombre (ej. "control-de-dinero") → puedes desactivar Google Analytics, no lo necesitas → **Crear proyecto**.
3. En el menú lateral, entra a **Compilación → Authentication → Comenzar**.
   - Pestaña **Sign-in method** → habilita **Correo electrónico/contraseña**.
   - También habilita **Google** (así puedes entrar con un clic, sin crear contraseña nueva).
4. Entra a **Compilación → Firestore Database → Crear base de datos**.
   - Elige una ubicación (cualquiera cercana a Perú, ej. `southamerica-east1`).
   - Empieza en **modo de producción** (le pondremos reglas propias en el paso 3).
5. En **reglas de Firestore** (pestaña "Reglas" dentro de Firestore Database), reemplaza el contenido por:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /usuarios/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
   Esto asegura que cada persona solo puede leer y escribir su propio documento — nadie más puede ver tus datos, ni siquiera con la config pública del proyecto.
6. Ve a **Configuración del proyecto** (ícono de engranaje arriba a la izquierda) → pestaña **General** → baja hasta "Tus apps" → clic en el ícono **`</>`** (Web) → ponle un apodo → **Registrar app**. Te mostrará un bloque `firebaseConfig` con tus claves (`apiKey`, `authDomain`, etc.) — cópialo, lo necesitas en el paso 2.

## Paso 2 — Pegar tu configuración en el código

Abre `app.js` y busca, cerca del inicio, este bloque:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};
```

Reemplázalo por el `firebaseConfig` real que copiaste en el paso 1.6. Estos valores **no son secretos** (Google los diseñó para ir en el código del navegador) — lo que protege tus datos son las reglas de Firestore del paso 1.5, no ocultar esta config.

## Paso 3 — Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube `index.html`, `app.js` y este `README.md` a la raíz.
   ```bash
   git init
   git add index.html app.js README.md
   git commit -m "Control de dinero"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```
2. En el repo: **Settings → Pages** → "Source": Deploy from a branch → rama `main`, carpeta `/(root)` → guardar.
3. En uno o dos minutos tendrás tu URL: `https://TU-USUARIO.github.io/TU-REPO/`.

## Paso 4 — Autorizar tu dominio en Firebase (para el login con Google)

Firebase solo permite iniciar sesión desde dominios que tú autorices:

1. En Firebase Console → **Authentication → Settings → Authorized domains**.
2. Agrega `TU-USUARIO.github.io` (sin `https://` ni la ruta del repo).

Sin este paso, el botón "Continuar con Google" mostrará un error de dominio no autorizado — el login con correo y contraseña funciona igual sin este paso.

## Cómo usarla

- La primera vez, crea tu cuenta (con Google o con correo/contraseña) — es tu login personal, nadie más puede entrar a tus datos.
- Desde cualquier dispositivo, entra con la misma cuenta y verás la misma información: se sincroniza sola cada vez que agregas o editas algo (el sidebar muestra "Guardando en la nube…" / "Sincronizado ✓").
- El desglose "¿En qué gastas más?" en el Resumen te muestra cada categoría con su porcentaje del gasto total del mes, junto con el gráfico de 6 meses para ver la tendencia.

## Costos

El plan gratuito de Firebase (Spark) incluye 50,000 lecturas y 20,000 escrituras al día en Firestore, y autenticación ilimitada — para uso personal jamás lo vas a alcanzar. No requiere tarjeta de crédito para el plan gratuito.

## Editar o personalizar

Todo el código vive en `app.js` (React sin build, Tailwind por CDN para estilos). Puedes editar categorías, colores, textos, etc. y volver a subir el archivo — GitHub Pages se actualiza solo con cada push a `main`.
