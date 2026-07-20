# Plan SEO — CalculaEasy

Basado en Google Search Console, últimos 3 meses (18/04/2026 – 17/07/2026).
Elaborado el 20/07/2026 a partir de los CSV exportados a `datos/`, que no está
versionado: este repositorio es público y esos archivos contienen las
estadísticas de tráfico del sitio.

---

## Resumen

| Métrica | Valor |
| --- | --- |
| Clics | 215 |
| Impresiones | 21.230 |
| CTR | **1,01 %** |
| Posición media | 7,74 |
| Tráfico de Uruguay | 95 % (20.188 impresiones) |
| Tráfico móvil | 75 % (15.942 impresiones) |

**La buena noticia: el sitio está creciendo y rankeando cada vez mejor.**

| Mes | Clics | Impresiones | Posición media |
| --- | --- | --- | --- |
| Abril | 18 | 1.493 | 9,2 |
| Mayo | 56 | 4.946 | 9,2 |
| Junio | 74 | 9.495 | 7,8 |
| Julio (parcial) | 67 | 5.296 | **6,9** |

Las impresiones se multiplicaron por 6 y la posición media mejoró de 9,2 a 6,9.
Google te está mostrando cada vez más y cada vez más arriba. El problema no es
visibilidad.

Hay **dos problemas**, y conviene no confundirlos porque se arreglan distinto:

1. **Un bug técnico que impide indexar** 5 páginas: el canonical apunta a una
   URL que redirige y nunca devuelve contenido. Es un arreglo de configuración,
   de una tarde, y bloquea todo lo demás. → punto 3 del diagnóstico y paso 1.
2. **Un CTR muy bajo** en las páginas que sí están indexadas: te ven y no te
   clickean. Es trabajo de contenido, más lento y continuo. → punto 1 y paso 3.

El orden importa: el segundo no rinde hasta resolver el primero.

---

## Diagnóstico

### 1. El CTR es muy bajo en las páginas que sí están indexadas

Un sitio en posición ~5-6 debería tener un CTR de 5-8 %. El conversor de sueldo
está en posición 5,68 y saca **1,45 %**. Es entre 3 y 5 veces menos de lo
esperable.

Esto se repite en consultas individuales muy bien posicionadas:

| Consulta | Posición | Impresiones | Clics |
| --- | --- | --- | --- |
| cuanto son 90 jornales | 3,5 | 14 | **0** |
| como se calcula el valor hora de un sueldo mensual | 4,87 | 15 | **0** |
| como calcular cuanto gano por hora | 5,65 | 17 | **0** |
| cuanto gano | 5,81 | 16 | **0** |
| calcular salario por hora | 6,4 | 20 | **0** |

Estar cuarto y no recibir un solo clic en 3 meses no es normal. Las causas
probables, en orden:

- **Los títulos no se diferencian.** Todos siguen el patrón
  `Calcular X Uruguay - CalculaEasy`. No hay año, ni cifra, ni gancho. Contra
  competidores que ponen "2026" o "Actualizado", pierden.
- **Google responde solo.** Muchas de esas consultas ("cuánto gano por hora")
  se resuelven en un featured snippet o en la calculadora propia de Google. Si
  no sos vos quien ocupa ese bloque, la posición 4 vale poco.
- **La marca es desconocida.** A igualdad de resultado, la gente clickea lo que
  reconoce. Esto se corrige con tiempo y con presencia, no con un cambio de
  título.

### 2. Cinco páginas son invisibles

Estas páginas tuvieron **cero impresiones** en 3 meses:

- `/calculadoras/horas-extra-uruguay`
- `/calculadoras/iva-uruguay`
- `/calculadoras/salario-vacacional-uruguay`
- `/calculadoras/indemnizacion-despido-uruguay`
- `/calculadoras` (el índice)

No es un problema de contenido: tienen entre 891 y 1.016 palabras, schema
`FAQPage` y `BreadcrumbList`, igual que las que sí funcionan. Y salvo
indemnización (19/01), fueron creadas el 03/01/2026, el mismo día que el
conversor y aguinaldo.

**Confirmado en Search Console el 20/07/2026:** las 5 URLs devuelven
"La URL no está en Google". No es que ranqueen mal — no están indexadas.

La causa está identificada y es el punto 3.

### 3. 🔴 CAUSA RAÍZ: el canonical apunta a una URL que nunca devuelve contenido

Este es el hallazgo central de todo el documento y explica casi todo lo demás.

En producción, **todo el dominio sin `www` redirige a `www`**:

```
GET https://calculaeasy.com/calculadoras/iva-uruguay
  → 307 Temporary Redirect
  → https://www.calculaeasy.com/calculadoras/iva-uruguay  → 200 OK
```

Pero la página que sí responde 200 declara este canonical:

```html
<link rel="canonical" href="https://calculaeasy.com/calculadoras/iva-uruguay">
```

Es decir: **le estás diciendo a Google que la versión buena es la que no sirve
contenido.** El circuito es:

1. El sitemap declara la URL sin `www`.
2. Google la pide y recibe un 307 hacia `www`.
3. La página `www` responde 200, pero su canonical dice "la buena es la de sin
   `www`".
4. Google vuelve a la de sin `www`... y recibe otro 307.

Google nunca consigue un 200 en la URL que vos mismo declarás como canónica.
Ante señales contradictorias, lo más común es que directamente no indexe.

Hay dos agravantes:

- **El redirect es 307, no 301.** El 307 es *temporal*: Google entiende "esta
  URL va a volver", así que mantiene la versión sin `www` como la buena y **no
  transfiere autoridad** a la de `www`. Para consolidar dominios hace falta un
  301 (o 308) permanente.
- **El sitemap declara barra final** (`/calculadoras/aguinaldo-uruguay/`) y el
  canonical no la lleva. Un tercer nombre para la misma página.

Entre `astro.config.mjs` (`site: "https://calculaeasy.com"`), el canonical del
layout, el sitemap y el redirect real de Vercel, hay **cuatro fuentes que no
coinciden**.

Esto también explica por qué en `Páginas.csv` aparecen las dos versiones:

| URL | Clics | Impresiones | CTR |
| --- | --- | --- | --- |
| `https://calculaeasy.com/calculadoras/conversor-sueldo-uruguay` | 156 | 10.773 | 1,45 % |
| `https://www.calculaeasy.com/calculadoras/conversor-sueldo-uruguay` | 5 | 126 | 3,97 % |

**¿Y por qué el conversor, sueldo líquido y aguinaldo sí están indexados?**
Casi con seguridad porque se indexaron *antes* de que se configurara el
redirect: son las páginas más antiguas y con más autoridad, y Google es
conservador para desindexar lo que ya tiene. Las nuevas y las débiles nunca
lograron entrar. Es una hipótesis, pero encaja con que las 3 indexadas sean
exactamente las 3 con más historial.

> El redirect **no está en el repo** (no hay `vercel.json`), así que está
> configurado en el panel de Vercel, en la sección de dominios.

### 4. Todo depende de una sola página

El conversor de sueldo genera **156 de los 215 clics: el 73 %**. Si Google
cambia de opinión sobre esa página, el sitio pierde tres cuartas partes de su
tráfico de un día para el otro.

### 5. Hay demanda para "sueldo líquido" que no estás capturando

Agrupando las consultas por tema:

| Tema | Clics | Impresiones | CTR | Posición |
| --- | --- | --- | --- | --- |
| Por hora / día (conversor) | 17 | 384 | **4,43 %** | **5,2** |
| Sueldo líquido / nominal | 2 | 507 | 0,39 % | **30,9** |
| Aguinaldo | 2 | 244 | 0,82 % | **39,1** |

El patrón es nítido: **donde rankeás bien, convertís bien** (4,43 % de CTR en el
grupo del conversor, que es un CTR sano). Sueldo líquido tiene *más* demanda que
el conversor pero está en posición 30 — página 3. Aguinaldo, en página 4.

Y esto es aún más llamativo porque `sueldo-liquido-uruguay` es la página con
**más contenido de todo el sitio** (1.345 palabras). Tiene el contenido; le
falta autoridad.

> ⚠️ Este cuadro sale de las 561 consultas del CSV, que suman ~1.656
> impresiones: apenas el **8 % del total**. Search Console anonimiza la cola
> larga. Los porcentajes son direccionales, no exactos.

---

## Pasos a realizar

Ordenados por impacto sobre esfuerzo. **El paso 1 es bloqueante: los demás no
rinden hasta que esté resuelto.**

### Paso 1 — ✅ HECHO (20/07/2026) — Alinear canonical, sitemap y redirect

**Resuelto.** `calculaeasy.com` quedó como dominio principal, `www` redirige con
**301** hacia sin-`www`, y las 5 URLs devuelven 200 directo. Se agregó
`trailingSlash: "never"` en `astro.config.mjs` para que el sitemap coincida con
el canonical (commits `fd04ed3` y anteriores). Verificado contra producción con
el `curl` de abajo: un único `HTTP/2 200`, sin `location`.

<details>
<summary>Detalle original del paso (por si hay que repetirlo)</summary>

**Por qué primero:** es la causa raíz. Mientras el canonical apunte a una URL
que devuelve 307, ningún otro paso de este plan puede funcionar. No tiene
sentido pulir títulos de páginas que Google no indexa.

Hay que elegir **una** versión del dominio y alinear las cuatro fuentes. Las dos
opciones son igual de válidas técnicamente; lo único que importa es la
coherencia.

**Recomiendo quedarse sin `www`**, porque tres de las cuatro fuentes ya lo dicen
(`astro.config.mjs`, el canonical del layout y el sitemap) y porque concentra el
97 % de los clics. Así el arreglo es **un solo cambio en Vercel** en lugar de
tocar código en varios lugares.

- [ ] En el panel de Vercel → dominios, poner `calculaeasy.com` como dominio
      **principal** e invertir el redirect: que `www.calculaeasy.com` sea el que
      redirige, y no al revés.
- [ ] Asegurarse de que ese redirect sea **301 o 308 (permanente)**, nunca 307.
      El 307 actual no transfiere autoridad.
- [ ] Verificar que `https://calculaeasy.com/calculadoras/iva-uruguay` devuelva
      **200 directo, sin saltos**.
- [ ] Definir `trailingSlash` explícitamente en `astro.config.mjs` y comprobar
      que el sitemap y el canonical emitan exactamente la misma forma (con barra
      o sin barra, pero la misma).
- [ ] Dar de alta las dos propiedades (`www` y sin `www`) en Search Console para
      poder seguir la consolidación.

**Si en cambio preferís quedarte con `www`** (por ejemplo si hay algo en la
configuración de DNS que lo haga más simple), entonces hay que cambiar
`site` en `astro.config.mjs` y el canonical de `src/layouts/Layout.astro` a
`https://www.calculaeasy.com`, y dejar el redirect como está pero pasándolo a
301. Lo que **no** puede quedar es la contradicción actual.

**Cómo verificarlo, en una línea:**

```bash
curl -sIL https://calculaeasy.com/calculadoras/iva-uruguay | grep -iE "^HTTP|^location"
```

Tiene que devolver un único `HTTP/2 200`, sin ningún `location`.

**Cómo sé si funcionó:** en Search Console, la Inspección de URL de esas 5 URLs
deja de decir "La URL no está en Google". Las URLs con `www` desaparecen de
`Páginas.csv` en el próximo export.

</details>

### Paso 2 — ✅ HECHO (20/07/2026) — Reindexación solicitada

**Hecho.** Se solicitó indexación de las 5 URLs en Search Console y se reenvió el
sitemap. **Ahora es cuestión de esperar 1-3 semanas** a que Google las procese.

- [x] Solicitar indexación de las 5 URLs.
- [x] Reenviar el sitemap.
- [x] Engordar `/calculadoras`: pasó de **164 a ~780 palabras** con una guía por
      categorías (sueldo, beneficios laborales, impuestos) y una sección de FAQ
      con `FAQPage` schema. De paso, cada calculadora ahora recibe **2 enlaces
      internos** desde el hub (tarjeta + texto), lo que adelanta parte del
      paso 5.

**Cómo sé si funcionó:** cualquier número de impresiones mayor a cero en esas
URLs. Es la métrica a vigilar las próximas semanas.

### Paso 3 — ✅ HECHO (20/07/2026) — Títulos y descripciones reescritos

**Hecho.** Se reescribieron los 7 títulos y descripciones de las calculadoras,
priorizando año, cifra y vocabulario real de búsqueda por sobre la marca (que ya
aparece en el dominio visible). Todos quedaron bajo 60 caracteres.

| Página | Título nuevo |
| --- | --- |
| conversor | Cuánto Gano por Hora, Día y Año — Sueldo Uruguay 2026 |
| sueldo líquido | Calculadora Sueldo Líquido Uruguay 2026 \| Nominal a Líquido |
| aguinaldo | Calculadora de Aguinaldo Uruguay 2026 \| Cuánto Cobrás |
| IVA | Calculadora de IVA Uruguay 2026 \| Tasa 22% y 10% |
| horas extra | Calculadora de Horas Extra Uruguay 2026 \| Valor Hora |
| vacacional | Calculadora de Salario Vacacional Uruguay 2026 |
| despido | Indemnización por Despido Uruguay 2026 \| Calculadora |

**A tener en cuenta:**

- Los títulos llevan **"2026" hardcodeado**. Hay que actualizarlos en enero de
  2027, o hacerlos dinámicos con `new Date().getFullYear()`. Anotarlo en el
  calendario para no quedar con el año viejo, que da mala señal.
- El cambio de títulos **puede mover posiciones en cualquier dirección** las
  primeras semanas. Fecha del cambio: 20/07/2026, para poder atribuir el efecto.

**Cómo sé si funcionó:** comparar el CTR por página dentro de 4-6 semanas. La
posición debería quedar más o menos igual; lo que tiene que subir es el CTR.
Objetivo realista: de ~1 % a 2,5-3 %.

**Cómo sé si funcionó:** comparar el CTR por página dentro de 4-6 semanas. Es la
métrica a mirar; la posición debería quedar igual.

**Ojo:** cambiar títulos puede mover posiciones en cualquier dirección. Hacelo
en un solo deploy y anotá la fecha para poder atribuir el efecto.

### Paso 4 — Revisar el schema

**Por qué:** hoy hay 39 bloques `Question`/`Answer` en `FAQPage`. Desde agosto
de 2023 Google **dejó de mostrar rich results de FAQ** salvo para sitios
gubernamentales y de salud. Es decir: ese schema probablemente no te está dando
ningún beneficio visual en los resultados.

- [ ] Agregar schema `WebApplication` o `SoftwareApplication` a cada
      calculadora. Es el tipo correcto para una herramienta interactiva y es
      elegible para presentaciones enriquecidas.
- [ ] Conservar el `BreadcrumbList` — ese **sí** se sigue mostrando y ayuda al
      CTR.
- [ ] No borrar el `FAQPage`: no penaliza y el contenido de las FAQ sigue siendo
      útil para posicionar. Simplemente no esperes que se vea en el resultado.

### Paso 5 — Subir "sueldo líquido" y "aguinaldo" de la página 3

**Por qué:** es la mayor bolsa de demanda desperdiciada. Ya tenés el contenido
(1.345 palabras en sueldo líquido, la página más extensa del sitio); el
problema es autoridad, y la palanca más barata es el enlazado interno.

- [ ] Enlazar desde el conversor — que concentra el 73 % del tráfico — hacia
      sueldo líquido y aguinaldo, con texto de enlace descriptivo
      ("calculá tu sueldo líquido", no "hacé clic acá").
- [ ] Revisar que `src/config/relatedTools.ts` esté empujando tráfico hacia las
      páginas débiles y no solo entre las fuertes.
- [ ] Cubrir el vocabulario real de la gente. En las consultas aparecen
      "nominal", "líquido", "neto", "BPS", "FONASA", "IRPF", "aportes",
      "descuentos". Verificar que ese lenguaje esté en el contenido.
- [ ] Aprovechar que ya existe `/calculadoras` como índice para distribuir
      autoridad hacia las páginas huérfanas.

**Cómo sé si funcionó:** la posición media del grupo "sueldo líquido" baja de 30
hacia la primera página. Es el paso más lento: pensá en 2-3 meses.

### Paso 6 — Reducir la dependencia del conversor

**Por qué:** 73 % del tráfico en una sola URL es frágil. No es urgente, pero sí
estratégico.

- [ ] Tratar los pasos 1 y 5 como la vía para diversificar: cada calculadora que
      empiece a traer tráfico baja ese porcentaje.
- [ ] Priorizar por estacionalidad. El aguinaldo se cobra en **junio y
      diciembre** en Uruguay: conviene tener esa página fuerte *antes* de esos
      meses, no durante.
- [ ] El salario vacacional tiene el mismo patrón estacional (licencia de
      verano) — trabajarlo hacia fin de año.

### Paso 7 — Optimizar para móvil

**Por qué:** el 75 % de las impresiones son móviles, pero el CTR móvil (1,01 %)
es igual al de escritorio (1,03 %). En general el móvil convierte peor, así que
no hay una anomalía — pero es donde está tu gente.

- [ ] Verificar Core Web Vitals en Search Console, sobre todo **CLS**: las
      calculadoras insertan resultados dinámicamente y eso suele generar saltos
      de layout que penalizan.
- [ ] Comprobar que el resultado del cálculo se vea sin hacer scroll en un
      teléfono.

---

## Qué NO hacer

- **No persigas el tráfico internacional.** Estados Unidos tiene 660 impresiones
  y 0 clics; casi todo el mundo fuera de Uruguay tiene CTR 0 %. El contenido es
  específico de la normativa uruguaya y está bien que así sea. Ese tráfico es
  ruido, no oportunidad.
- **No agregues calculadoras nuevas todavía.** Ya tenés 4 sin una sola
  impresión. Primero hacé que las existentes funcionen.
- **No toques varias cosas a la vez.** Si cambiás títulos, schema y enlazado en
  el mismo deploy, no vas a saber qué movió la aguja.

---

## Seguimiento

Exportar de nuevo estos CSV **cada 4 semanas** y comparar. Las métricas que
importan, en orden:

1. **Impresiones de las 5 páginas invisibles** — cualquier número mayor a cero
   es la señal de que el paso 1 funcionó. Es la métrica más importante hasta que
   ocurra.
2. **CTR por página** — el problema de fondo una vez destrabada la indexación.
   Objetivo realista: 2,5-3 % en 6 meses.
3. **Posición media del grupo "sueldo líquido"** — de 30 hacia la primera página.
4. **Porcentaje de clics del conversor** — que baje del 73 % significa que el
   sitio se está diversificando.

No mires los clics totales como métrica principal: van a subir igual por el
crecimiento que ya trae el sitio, y eso te puede hacer creer que un cambio
funcionó cuando no hizo nada.
