# ❓ 05. Preguntas Frecuentes (FAQ)

Respuestas a las dudas más comunes sobre el uso cotidiano de CasaFinance.

---

### 1. ¿Qué pasa si sobra dinero en la cuenta común a final de mes?
**¡Nada, se queda en la cuenta común!**
El sobrante pasa a formar parte del remanente del hogar y actúa como colchón de seguridad para meses con gastos más altos (por ejemplo, meses con recibos trimestrales de agua o seguro anual). También podéis traspasarlo periódicamente a una **Meta de Ahorro** dentro de la app (ej. "Bote Vacaciones").

---

### 2. ¿Qué pasa si falta dinero en la cuenta común a final de mes?
Si un mes habéis tenido más gastos de la cuenta común de lo habitual:
1. **Puntualmente:** Hacéis una pequeña transferencia extraordinaria a la cuenta común repartida en vuestro porcentaje habitual (ej. 60%/40%).
2. **Estructuralmente:** Si todos los meses falta dinero, significa que vuestra bolsa de *Supermercado* o *Suministros* en la pestaña **Presupuesto** está infraestimada. Subid la estimación en la app para que la cuota mensual refleje la realidad.

---

### 3. ¿Cómo funciona la pestaña "Balance & Liquidaciones"?
Cuando uno de los dos paga un gasto del hogar con su tarjeta de débito o crédito personal (en lugar de la cuenta común), esa persona ha **adelantado dinero de su bolsillo privado**.
- La app no cuenta ese adelanto como un gasto que salió de la cuenta común.
- En la pestaña **Balance**, la app calcula exactamente cuánto debe transferir el deudor al acreedor para quedar completamente en paz.
- Al pulsar **"Registrar compensación / Marcar como saldada"**, la deuda se pone a cero y se registra el movimiento de liquidación en el historial.

---

### 4. Uno de los dos es autónomo o tiene ingresos variables, ¿cómo lo gestionamos?
En **Ajustes > Perfiles de la Pareja**, puedes marcar la modalidad de ingresos como **"Variable"** para esa persona.
Al comienzo de cada mes, la app mostrará un aviso discreto en la parte superior para que introduzca los ingresos netos reales facturados ese mes, recalculando el porcentaje de reparto de ese mes sin tocar la media habitual.

---

### 5. ¿Por qué usamos SQLite en lugar de PostgreSQL o MySQL?
SQLite es ultrarrápido, no consume memoria RAM innecesaria en servidores pequeños (como Raspberry Pi o NAS domésticos) y guarda absolutamente toda vuestra información en un único archivo (`./data/casafinance.db`), lo que hace que hacer una copia de seguridad o migrar de servidor sea tan simple como copiar un archivo.
