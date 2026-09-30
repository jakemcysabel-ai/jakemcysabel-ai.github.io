# JAYC'sTasks — notas para quien siga trabajando en la app

> Notas de traspaso para cualquier asistente de IA o persona que continúe el proyecto (Claude, ChatGPT/Codex, Gemini, Copilot, Cursor…). Léelas enteras antes de cambiar nada y actualízalas al terminar (sobre todo "Pendiente").
> Versión en línea: https://github.com/jakemcysabel-ai/jakemcysabel-ai.github.io/blob/main/AGENTS.md · texto plano: https://raw.githubusercontent.com/jakemcysabel-ai/jakemcysabel-ai.github.io/main/AGENTS.md

Agenda escolar web en español: tareas y exámenes en un calendario, lista de pendientes, notas con medias, modo concentración (Pomodoro 25 min). Cuentas de usuario con Firebase; los datos se sincronizan entre dispositivos.

- **Producción:** https://jakemcysabel-ai.github.io (GitHub Pages, repo `jakemcysabel-ai/jakemcysabel-ai.github.io`, rama `main`).
- **URL antigua:** https://jakemcysabel-ai.github.io/JAYC-sTasks/ (repo `jakemcysabel-ai/JAYC-sTasks`) — todavía sirve la **versión original** sin cuentas. Ver "Pendiente".
- **Copia local:** `E:\Apps Claude\JAYC-sTasks` (es un repo git con `origin` = el repo de producción).
- El usuario habla español; responder en español.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Toda la app: HTML + CSS + JS en un `<script type="module">`. Sin build ni dependencias npm. |
| `firebase-config.js` | Config web del proyecto Firebase **jayc** (`projectId: jayc-f947f`). No es secreta. |
| `firestore.rules` | Reglas de Firestore (copia de lo publicado en la consola; **no se despliega solo**, hay que pegarlo en Firestore → Reglas). |
| `manifest.json`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | PWA / iconos (redimensionados desde el original de 1254 px). |
| `dev/mock-firebase/` | Firebase simulado (auth + firestore sobre localStorage) para pruebas. |
| `dev/build-test.sh` | Genera `dev/test-build/` (ignorado por git) usando el mock. |
| `para-el-repo-antiguo/index.html` | Página de redirección a la URL nueva (ignorada por git; es para el repo `JAYC-sTasks`). |
| `original-icon.png` | Icono original de 1 MB (ignorado por git). |
| `AGENTS.md` | Estas notas (fuente única). `CLAUDE.md` solo lo importa; `README.md` es la portada corta. |

## Arquitectura (index.html)

- **Tres pantallas** `#splash`, `#auth`, `#app`; `show(id)` alterna entre ellas.
- **Firebase** se carga con `import()` dinámico desde `https://www.gstatic.com/firebasejs/12.19.0/` (constante `SDK`). Si `firebase-config.js` tiene el placeholder `PEGA_...`, la app muestra un aviso y desactiva el login.
- Todas las funciones del SDK quedan en el objeto `fb` (`fb.auth`, `fb.db`, `fb.setDoc`, ...).
- **Auth:** correo/contraseña (`createUserWithEmailAndPassword` + `updateProfile` para el nombre), Google con `signInWithPopup`, `sendPasswordResetEmail`. Errores traducidos en `authError()`. `fb.auth.languageCode="es"`.
- **Datos:** un documento por usuario `users/{uid}` con `{ items: [...], grades: [...], updatedAt }`. Se escribe el documento entero en cada cambio (`persist()`, `setDoc` con merge) → *last-write-wins* entre dispositivos.
- **Lectura:** `onSnapshot` con `includeMetadataChanges`; ignora snapshots con `hasPendingWrites`; en el primer arranque de un dispositivo nuevo espera al servidor si la caché está vacía (para no mostrar/sobrescribir con una agenda vacía).
- **Offline:** `initializeFirestore(... persistentLocalCache + persistentMultipleTabManager)`. Indicador en `#sync` (☁️ Guardado / ⏳ Guardando… / 📴 Sin conexión / ⚠️ Error).
- **Datos antiguos:** la versión original guardaba en `localStorage` (`jayc_tasks`, `jayc_grades`). `offerLegacy()` ofrece una vez pasarlos a la cuenta; si se aceptan y se guardan, se borran las claves; si se rechazan, se marca `jayc_legacy_skip_{uid}`. La URL nueva comparte origen con la antigua, así que puede leerlos.
- **Solo en el dispositivo (localStorage):** tema `jayc_dark` (si no existe, sigue `prefers-color-scheme`) y temporizador `jayc_timer` (`{left, end}`; se basa en la hora de fin para no descuadrarse en segundo plano).
- **Saneado:** `cleanItems()` / `cleanGrades()` se usan al leer de Firestore, al importar JSON y al migrar.
- **Formato de datos:**
  - item: `{id, type:"task"|"exam", subject, title, date:"YYYY-MM-DD", time:"HH:MM"|"" , notes, done}`
  - grade: `{id, subject, type, value, max, date:"YYYY-MM-DD", comment}`
  - `id` numérico (`uid()`) o el que viniera; comparar siempre con `same(a,b)` (String).

### Reglas importantes al tocar el código
- **Fechas siempre en hora local**: usar `iso()` / `parse()` del propio archivo. Nunca `toISOString()` (era el bug original: en España desplazaba el calendario un día y la casilla marcada no era la pulsada).
- La navegación de meses usa `view` fijado al día 1 (con `setMonth` en día 31 se saltaban meses).
- Todo texto de usuario se pinta con `esc()`. Las acciones de las listas van por delegación (`data-act` = `toggle|edit|del|gedit|gdel|go`).
- Firestore no admite `undefined`: pasar los datos por los `clean*`.
- Estilo: código compacto (una línea por función), igual que el existente.

## Firebase (proyecto "jayc", plan Spark gratis)
- Firestore base de datos `(default)` creada. Reglas: cada usuario solo lee/escribe `users/{su uid}` (ver `firestore.rules`).
- Proveedores que deben estar habilitados: Correo/contraseña y Google. Dominio autorizado necesario: `jakemcysabel-ai.github.io` (`localhost` viene por defecto).
- ⚠️ En una captura de la pantalla del proveedor Google el proyecto aparecía como `project-820253207410`, pero la config es del proyecto número `797247990553`. Si falla el login con "método no activado", comprobar que los proveedores están activos en **jayc**.

## Publicar
```bash
cd "E:/Apps Claude/JAYC-sTasks" && git add -A && git commit -m "..." && git push
```
GitHub Pages tarda ~1 min. `git push` funciona con el Git Credential Manager (cuenta `jakemcysabel-ai`).
**Limitación:** en esta máquina el agente NO puede crear repos ni usar la API de GitHub (el clasificador de permisos bloquea sacar el token y usar la sesión del navegador). Si hace falta un repo nuevo, pedir al usuario que lo cree vacío a mano y luego hacer `git push`.

## Probar en local
La app usa módulos JS: hay que servirla por HTTP (abrir el archivo con doble clic no funciona) y el servidor debe mandar los `.js` como `text/javascript`. Cualquier servidor estático vale, p. ej. `npx serve .` desde la carpeta (Node está instalado; Python no).

Si usas Claude Code, ya hay configuraciones en `E:\Apps Claude\.claude\launch.json` (servidor Node mínimo):
- `jaycstasks` → puerto 5510, sirve esta carpeta con **Firebase real** (`localhost` está autorizado).
- `jaycstasks-test` → puerto 5511, sirve `dev/test-build/` con **Firebase simulado**. Antes: `bash dev/build-test.sh`.

No crear cuentas reales en el Firebase del usuario para probar: usar el mock (usuarios y datos en localStorage: `mock_auth`, `mock_current`, `mock_db`).

## Historial
1. Análisis de la app original (un solo `index.html` con localStorage).
2. Arreglos: fechas en UTC (bug del calendario y del "ratón en otro sitio"), saltos de mes el día 31, icono de 1 MB → 32 KB, temporizador por hora de fin, progreso por día, sección "⏰ Pendientes", editar, confirmar borrados, validar nota ≤ máximo, exportar/importar JSON, botón Hoy, modo oscuro del sistema, aria-labels, PWA, calendario sin desbordes en móvil.
3. Registro/login con Firebase + Firestore, migración de datos antiguos, nueva URL `jakemcysabel-ai.github.io` (repo creado por el usuario, subido por el agente).

## Pendiente
- [ ] El usuario tiene que confirmar que el registro y el login con Google funcionan en producción.
- [ ] Después: subir `para-el-repo-antiguo/index.html` como `index.html` del repo `jakemcysabel-ai/JAYC-sTasks` (clonar, sustituir, commit, push) para redirigir la URL antigua. No hacerlo antes: dejaría a los usuarios sin app.
- Ideas no pedidas: verificación de correo, borrar cuenta, cambio de contraseña desde la app, evitar *last-write-wins* (guardar cada item como documento propio).
