# 💬 03. Guía de Bots: WhatsApp & Telegram

Uno de los mayores motivos por los que la gente abandona el control de gastos es la **fricción de abrir una app cada vez que compra una barra de pan**.

CasaFinance incluye bots integrados para **WhatsApp** y **Telegram** para que registrar un gasto sea tan rápido como enviar un mensaje en el grupo de chat de la pareja.

---

## 🚀 1. Configuración Rápida

### A) Bot de WhatsApp (100% Local con Baileys)
1. Ve a **Ajustes > Plataforma de Mensajería** en CasaFinance y selecciona **WhatsApp**.
2. Escribe el nombre exacto de vuestro grupo de WhatsApp (ej. `Gastos Casa` o `Piso & Vida`).
3. Pulsa en **"Vincular WhatsApp / Mostrar Código QR"**.
4. Abre WhatsApp en tu teléfono -> **Ajustes > Dispositivos vinculados > Vincular un dispositivo** y escanea el código QR que aparece en pantalla.
5. ¡Listo! El bot solo escuchará los mensajes que se envíen dentro de ese grupo específico.

### B) Bot de Telegram
1. Crea un bot en Telegram hablando con [@BotFather](https://t.me/botfather) (`/newbot`) y copia el **Bot Token**.
2. Pega el token en **Ajustes > Telegram** en CasaFinance.
3. Añade tu nuevo bot a vuestro grupo de Telegram y configúralo como administrador.

---

## 📝 2. Sintaxis y Lenguaje Natural

El bot cuenta con un motor de procesamiento de lenguaje natural (NLP) con **más de 750 palabras clave en español e inglés**.

### A) Gastos Pagados con la Cuenta Común (Por Defecto)
Simplemente envía el importe y el concepto:
- `42.50 Mercadona` -> Guarda 42,50 € en *Supermercado* pagado por Cuenta Común.
- `18.90 Gasolina Repsol` -> Guarda 18,90 € en *Transporte*.
- `32 Cena Tagliatella` -> Guarda 32,00 € en *Ocio & Restaurantes*.
- `12.99 Netflix` -> Guarda 12,99 € en *Suscripciones*.

### B) Adelantos de Bolsillo (Pagado por uno de los dos)
Si estás en la calle y pagas algo de la casa con tu tarjeta privada:
- `15 Farmacia adelanto` (o `15 Farmacia pagué yo`) -> Registra el gasto como adelanto de quien envió el mensaje.
- `60 Compra Carrefour pagó Carlos` -> Registra el adelanto a nombre de Carlos.

### C) Forzar Reparto 50/50
Si queréis que una compra puntual se divida a partes iguales:
- `85 Cena especial 50/50` (o `mitad`, `a medias`).

## ⚡ 3. Interactividad Avanzada (Borrar, Corregir y Botones)

### 🟢 En WhatsApp:
1. **Borrar con Reacción de Emoji (`🗑️` o `❌`):**
   - Mantén pulsado el mensaje de confirmación del bot y reacciona con **`🗑️`** o **`❌`**. El bot eliminará el gasto al instante de la base de datos y actualizará los balances.
2. **Borrar respondiendo al mensaje:**
   - Desliza a la derecha el mensaje del gasto y escribe: `borrar`, `eliminar`, `cancela` o `/borrar`.
3. **Modificar respondiendo al mensaje:**
   - Desliza a la derecha y escribe la corrección en lenguaje natural:
     - `eran 35€` o `35€` -> Corrige el importe.
     - `lo pagó Diego` o `pagó Sam` -> Corrige el pagador.
     - `categoría Ocio` -> Cambia la categoría.
     - `50/50` -> Forza reparto al 50%.
4. **Comando Rápido `/deshacer`:**
   - Envía `/deshacer` (sin citar) para anular el último gasto que acabas de meter.

### 🔵 En Telegram:
- **Botones en cada gasto:** Debajo de cada gasto confirmado aparecen los botones pulsables directos:
  - `[ 🗑️ Borrar ]` (elimina el gasto en 1 toque)
  - `[ ⚖️ Forzar 50/50 ]` (convierte el gasto a reparto a medias)
- **Botón en balance:** Al pedir `/balance`, si hay deudas aparece el botón:
  - `[ 💸 Marcar como Saldado ]` (liquida la deuda automáticamente)

---

## 🤖 4. Catálogo Completo de Comandos

Puedes interactuar con el bot en cualquier momento enviando estos comandos al grupo:

| Comando | Descripción |
| :--- | :--- |
| **`/ayuda`** | Chuleta visual completa con ejemplos de formato y comandos. |
| **`/balance`** | Muestra quién debe dinero a quién por adelantos particulares del mes. |
| **`/saldar`** | Marca las deudas como saldadas registrando la compensación en la web. |
| **`/resumen`** | Totales gastados, saldo de cuenta común y restante del presupuesto. |
| **`/gastos`** | Muestra los últimos 5 gastos registrados con pagador y categoría. |
| **`/deshacer`** | Anula inmediatamente el último gasto guardado. |
| **`/huchas`** | Estado de las metas de ahorro con barras de progreso `[██████░░░░]`. |
| **`/hucha [nombre] [€]`** | Suma una aportación a una hucha (ej: `/hucha viaje 50`). |
| **`/categorias`** | Lista todas las categorías activas del hogar. |

---

## ⚠️ 5. Alertas de Presupuesto en Tiempo Real

Cuando un nuevo gasto haga que una categoría alcance el **80%** o supere el **100%** de su presupuesto asignado para el mes, el bot añadirá un aviso automático en la confirmación:
> *⚠️ **Aviso:** Habéis alcanzado el 85% de Supermercado (425,00 € / 500,00 €)*

---

## 🛡️ 6. Política Anti-Spam y Privacidad Total
- **Cero Spam:** Si habláis de cosas cotidianas en el grupo (`"¿A qué hora llegas?"`), el bot permanece en silencio absoluto y no responderá nada.
- **100% Local:** Ningún mensaje se envía a servidores de terceros ni a la nube de IA; el análisis del texto ocurre dentro de tu propio procesador.

