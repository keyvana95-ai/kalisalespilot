"use strict";

/* Mis objetivos · objetivos trimestrales del Director de Sales e informe semanal para management.
   Los KPI salen de la ficha del puesto (pp. 13-14, todos en estado propuesta).
   Valores y metas son DATOS DE EJEMPLO: las metas las fija Lorenzo. */

const quarter = { id:"T4 2026", label:"4.º trimestre 2026", start:"2026-10-01", end:"2026-12-31", months:["Oct","Nov","Dic"] };
const objStorageKey = "kali-objetivos-v1";

/* kind: "acc" acumulativa (se compara con el ritmo esperado) · "rate" promedio o tasa (se compara con la meta).
   better: "up" cuanto más alto mejor · "down" cuanto más bajo mejor. */
const objectiveCatalog = [
  { id:"vacio", group:"resultado", name:"Días de vacío por unidad", unit:"días", kind:"rate", better:"down", target:5, value:6.2, lastWeek:6.8,
    history:[9.1,8.0,7.4], months:[6.8,5.4,null], calc:"Check-in del nuevo residente − check-out del anterior, media de las unidades que rotaron.", source:"Pipeline + Base Datos Co-livers",
    cases:[{ text:"Canillas 43 · Habitación 3", note:"9 días de vacío en octubre" },{ text:"Luis Vives 14 · Habitación 2", note:"7 días de vacío en octubre" },{ text:"Narciso Serra 8 · Habitación 1", note:"En riesgo de vacío: 32 días, pagos pendientes", href:"#ciclo/narciso-1" }],
    recover:{ label:"Ver unidades en riesgo en Mi jornada", href:"#jornada" } },
  { id:"firmadas", group:"resultado", name:"Unidades firmadas antes del check-out", unit:"unidades", kind:"acc", better:"up", target:18, value:7, lastWeek:6,
    history:[14,17,15], months:[5,2,null], calc:"Firmas con fecha anterior al check-out del residente saliente, acumuladas en el trimestre.", source:"Pipeline (fecha de firma, check-out)",
    cases:[{ text:"Narciso Serra 8 · Habitación 3", note:"Comprometida, falta la firma interna", href:"#ciclo/narciso-3" },{ text:"Santa Engracia 122", note:"Oferta de renovación por enviar · check-out 31 dic", href:"#ciclo/santa-engracia" }],
    recover:{ label:"Ver firmas pendientes en Pipeline", href:"#pipeline" } },
  { id:"renovacion", group:"resultado", name:"Tasa de renovación", unit:"%", kind:"rate", better:"up", target:40, value:37, lastWeek:37,
    history:[31,35,38], months:[40,33,null], calc:"Renovaciones firmadas ÷ contratos que vencen en el trimestre.", source:"Base Datos Co-livers + solicitudes de residentes",
    cases:[{ text:"Narciso Serra 8 · Habitación 3", note:"El residente pidió renovar después del compromiso externo", href:"#ciclo/narciso-3" },{ text:"Santa Engracia 122", note:"Oferta de renovación por registrar", href:"#ciclo/santa-engracia" }],
    recover:{ label:"Ver ofertas de renovación en Mi jornada", href:"#jornada" } },
  { id:"incremento", group:"resultado", name:"Incremento de renta", unit:"%", kind:"rate", better:"up", target:4, value:4.6, lastWeek:4.4,
    history:[3.1,3.8,4.2], months:[4.9,4.1,null], calc:"(Precio de firma − precio anterior) ÷ precio anterior, media de las firmas del trimestre.", source:"Pricing",
    cases:[{ text:"Narciso Serra 8 · Habitación 3", note:"740 € frente a 715 € (+3,5 %)", href:"#ciclo/narciso-3" }],
    recover:{ label:"Ver Pricing", href:"#pricing" } },
  { id:"desviacion", group:"resultado", name:"Desviación sobre el precio objetivo", unit:"%", kind:"rate", better:"down", target:2, value:1.3, lastWeek:1.6, absolute:true,
    history:[3.4,2.6,1.9], months:[1.1,1.6,null], calc:"|Precio de firma − precio objetivo| ÷ precio objetivo, media de las firmas del trimestre.", source:"Pricing",
    cases:[{ text:"Narciso Serra 8 · Habitación 1", note:"Publicado a 720 € con objetivo de 730 €", href:"#ciclo/narciso-1" }],
    recover:{ label:"Ver Pricing", href:"#pricing" } },
  { id:"aTiempo", group:"proceso", name:"Ciclos abiertos a tiempo", unit:"%", kind:"rate", better:"up", target:100, value:92, lastWeek:90, calc:"Unidades con el ciclo abierto 60 días o más antes del check-out ÷ salidas del periodo.", source:"Base Datos Co-livers + Pipeline" },
  { id:"alerta", group:"proceso", name:"Unidades en alerta de vacío", unit:"%", kind:"rate", better:"down", target:10, value:11, lastWeek:11, calc:"Unidades que llegan a 45 días del check-out sin depósito ÷ salidas del periodo.", source:"Base Datos Co-livers + Pipeline" },
  { id:"comercializacion", group:"proceso", name:"Días de comercialización", unit:"días", kind:"rate", better:"down", target:25, value:21, lastWeek:22, calc:"Fecha de firma − fecha de inicio de la comercialización.", source:"Pipeline", noData:true },
  { id:"leads", group:"proceso", name:"Leads por unidad publicada", unit:"leads", kind:"rate", better:"up", target:8, value:6.5, lastWeek:6.1, calc:"Leads del periodo ÷ unidades publicadas.", source:"Pipeline (leads semanales y mensuales)", noData:true },
  { id:"noCierre", group:"proceso", name:"Motivos de no cierre", calc:"Recuento por motivo.", source:"Pipeline (razón del no cierre)", noData:true,
    reasons:[["Precio",4],["Fechas",3],["Perfil",1]] }
];

/* Informes de semanas anteriores del trimestre (ejemplo). */
const pastReports = [
  { week:1, cut:"2026-10-06", counts:[1,2,2] },{ week:2, cut:"2026-10-13", counts:[2,1,2] },{ week:3, cut:"2026-10-20", counts:[2,2,1] },
  { week:4, cut:"2026-10-27", counts:[2,2,1] },{ week:5, cut:"2026-11-03", counts:[2,1,2] }
];

function objSeed() {
  return {
    targets:{},
    targetLog:[],
    agreements:[
      { id:"a1", text:"Reforzar la publicación de Narciso Serra 8 · Habitación 1 en portales y grupos", owner:"Sales", due:"2026-11-07", done:true, week:5 },
      { id:"a2", text:"Revisar el precio objetivo de Canillas 43 antes de abrir su ciclo", owner:"Sales", due:"2026-11-10", done:false, week:5 },
      { id:"a3", text:"Confirmar el Entry Fee para estancias de menos de 6 meses", owner:"Management", due:"2026-11-12", done:false, week:5 }
    ]
  };
}
function objLoad() {
  try { const saved = JSON.parse(localStorage.getItem(objStorageKey)); if (saved?.agreements) return saved; } catch {}
  return objSeed();
}
let objState = objLoad();
const objSave = () => { try { localStorage.setItem(objStorageKey, JSON.stringify(objState)); return true; } catch { return false; } };

/* Cálculos del trimestre */
const qDiff = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const qDays = qDiff(quarter.start, quarter.end) + 1;
const qElapsed = () => Math.min(qDays, qDiff(quarter.start, demoDay) + 1);
const qWeeks = Math.round(qDays / 7);
const qWeek = () => Math.min(qWeeks, Math.ceil(qElapsed() / 7));
const targetOf = kpi => objState.targets[kpi.id] ?? kpi.target;
const num = new Intl.NumberFormat("es-ES", { maximumFractionDigits:1 });
const fmt = (kpi, value) => value == null ? "—" : kpi.unit === "%" ? num.format(value) + " %" : num.format(value) + " " + kpi.unit;

function evaluate(kpi) {
  if (kpi.target == null) return null;
  const target = targetOf(kpi);
  const expected = kpi.kind === "acc" ? target * qElapsed() / qDays : target;
  const ratio = kpi.better === "up" ? kpi.value / expected : expected / kpi.value;
  const color = ratio >= 1 ? "green" : ratio >= 0.9 ? "amber" : "red";
  const label = { green:"En objetivo", amber:"Cerca del objetivo", red:"Fuera de objetivo" }[color];
  const progress = kpi.better === "up" ? kpi.value / target : Math.min(1.5, target / kpi.value);
  const projection = kpi.kind === "acc" ? kpi.value / qElapsed() * qDays : null;
  const delta = kpi.lastWeek == null ? 0 : kpi.value - kpi.lastWeek;
  const improving = delta === 0 ? 0 : (delta > 0) === (kpi.better === "up") ? 1 : -1;
  return { target, expected, ratio, color, label, progress, projection, delta, improving };
}
const deltaTag = (kpi, ev) => ev.delta === 0 ? '<span class="delta flat">= sin cambio</span>' :
  `<span class="delta ${ev.improving > 0 ? "good" : "bad"}">${ev.delta > 0 ? "↑" : "↓"} ${num.format(Math.abs(ev.delta))}${kpi.unit === "%" ? " pp" : ""} vs. semana anterior</span>`;

function sparkline(kpi) {
  const values = [...kpi.history, kpi.value];
  const max = Math.max(...values, targetOf(kpi)), min = Math.min(...values, targetOf(kpi)) * 0.85;
  const x = i => 6 + i * (108 / (values.length - 1)), y = v => 34 - (v - min) / (max - min || 1) * 28;
  const ty = y(targetOf(kpi));
  return `<svg class="spark" viewBox="0 0 120 40" role="img" aria-label="Tendencia de los últimos cuatro trimestres">
    <line x1="0" x2="120" y1="${ty}" y2="${ty}" class="spark-target"/>
    <polyline points="${values.map((v,i) => x(i) + "," + y(v)).join(" ")}" class="spark-line"/>
    ${values.map((v,i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === values.length - 1 ? 3.2 : 2}" class="${i === values.length - 1 ? "spark-now" : "spark-dot"}"/>`).join("")}
  </svg><span class="spark-labels"><span>T1</span><span>T2</span><span>T3</span><span>T4</span></span>`;
}

function kpiCard(kpi) {
  const ev = evaluate(kpi);
  const pct = Math.max(2, Math.min(100, ev.progress * 100));
  const pace = kpi.kind === "acc" ? Math.min(100, qElapsed() / qDays * 100) : null;
  const log = objState.targetLog.filter(item => item.kpi === kpi.id).at(-1);
  return `<article class="obj-card ${ev.color}" id="obj-${kpi.id}">
    <header class="obj-card-head"><h3>${kpi.name}</h3>${riskTag(ev.color,ev.label)}</header>
    <div class="obj-figures">
      <div><strong>${fmt(kpi,kpi.value)}</strong><small>${kpi.better === "down" ? "Meta ≤ " : "Meta "}${fmt(kpi,ev.target)}${kpi.kind === "acc" ? " en el trimestre" : ""}</small></div>
      <div class="obj-spark">${sparkline(kpi)}</div>
    </div>
    <div class="obj-bar" aria-hidden="true"><span class="obj-fill" style="width:${pct}%"></span>${pace != null ? `<span class="obj-pace" style="left:${pace}%" title="Ritmo esperado a hoy"></span>` : ""}</div>
    <p class="obj-meta">${deltaTag(kpi,ev)}${kpi.kind === "acc" ? `<span>Esperado a hoy: ${num.format(ev.expected)} · A este ritmo cerrarás el ${quarter.id.split(" ")[0]} con <b>${Math.round(ev.projection)}</b> de ${ev.target}</span>` : ""}</p>
    <div class="obj-months">${quarter.months.map((month,i) => `<span><small>${month}</small>${kpi.months[i] == null ? "—" : fmt(kpi,kpi.months[i])}</span>`).join("")}</div>
    <details class="obj-cases"><summary>Casos que explican la cifra · ${kpi.cases.length}</summary>
      <ul>${kpi.cases.map(item => `<li>${item.href ? `<a href="${item.href}" data-origin="pipeline">${safe(item.text)}</a>` : `<strong>${safe(item.text)}</strong>`}<small>${safe(item.note)}</small></li>`).join("")}</ul>
      <p class="obj-calc"><b>Cálculo:</b> ${kpi.calc} <b>Fuente:</b> ${kpi.source}</p>
    </details>
    <footer class="obj-card-foot"><span class="pending-tag">${log ? `Meta cambiada por ${safe(log.by)} el ${date(log.day)}` : "Meta de ejemplo · pendiente de Lorenzo"}</span>${ev.color !== "green" ? `<a class="text-button inline" href="${kpi.recover.href}">${kpi.recover.label} →</a>` : ""}</footer>
  </article>`;
}

function processRow(kpi) {
  if (kpi.reasons) return `<div class="proc-row"><span class="proc-name">${kpi.name}${kpi.noData ? ' <span class="example-chip">Sin dato en el piloto</span>' : ""}</span>
    <span class="proc-reasons">${kpi.reasons.map(([label,n]) => `<span><i style="width:${n * 18}px"></i>${label} · ${n}</span>`).join("")}</span><span></span></div>`;
  const ev = evaluate(kpi);
  return `<div class="proc-row"><span class="proc-name">${kpi.name}${kpi.noData ? ' <span class="example-chip">Sin dato en el piloto</span>' : ""}<small>${kpi.calc}</small></span>
    <span class="proc-value"><strong>${fmt(kpi,kpi.value)}</strong><small>${kpi.better === "down" ? "Meta ≤ " : "Meta "}${fmt(kpi,ev.target)}</small></span>
    <span>${riskTag(ev.color,ev.label)}</span></div>`;
}

function quarterProgress() {
  const pct = qElapsed() / qDays * 100;
  return `<div class="q-progress"><div class="q-progress-head"><strong>${quarter.label}</strong><span>Día ${qElapsed()} de ${qDays} · semana ${qWeek()} de ${qWeeks} · datos a ${date(demoDay,true)}</span></div>
    <div class="q-track" aria-hidden="true"><span style="width:${pct}%"></span>${quarter.months.map((m,i) => `<i style="left:${[0,33.7,66.3][i]}%">${m}</i>`).join("")}</div></div>`;
}

function objectiveSummary() {
  const evs = objectiveCatalog.filter(k => k.group === "resultado").map(evaluate);
  return ["green","amber","red"].map(color => evs.filter(ev => ev.color === color).length);
}

function objetivosView() {
  const results = objectiveCatalog.filter(k => k.group === "resultado");
  const process = objectiveCatalog.filter(k => k.group === "proceso");
  const [g,a,r] = objectiveSummary();
  return heading("Mis objetivos",`Objetivos trimestrales del Director de Sales y su avance. Se repasan cada semana con management.`) + `
    <p class="proposal-tag"><span class="pending-tag">Datos y metas de ejemplo · las metas las fija Lorenzo</span></p>
    <section class="obj-top">
      ${quarterProgress()}
      <div class="obj-summary"><span class="sum green"><b>${g}</b> en objetivo</span><span class="sum amber"><b>${a}</b> cerca</span><span class="sum red"><b>${r}</b> fuera</span>
        <a class="button-link" href="#objetivos/informe">${ico("jornada")}Generar informe semanal</a></div>
    </section>
    <h2 class="section-title">Objetivos de resultado</h2>
    <div class="obj-grid">${results.map(kpiCard).join("")}</div>
    <h2 class="section-title">Diagnóstico de proceso</h2>
    <section class="panel proc-panel">${process.map(processRow).join("")}</section>
    <h2 class="section-title">Informes semanales del trimestre</h2>
    <section class="panel report-list">
      ${[...pastReports, { week:qWeek(), cut:demoDay, counts:[g,a,r], current:true }].reverse().map(item => `<${item.current ? 'a href="#objetivos/informe"' : "div"} class="report-row ${item.current ? "current" : ""}">
        <span><strong>Semana ${item.week}</strong><small>Corte ${date(item.cut,true)}</small></span>
        <span class="report-dots">${["green","amber","red"].map((c,i) => `<span class="sum ${c}"><b>${item.counts[i]}</b></span>`).join("")}</span>
        <span>${item.current ? '<b class="next-text">Informe de esta semana →</b>' : '<small class="muted">Archivado</small>'}</span></${item.current ? "a" : "div"}>`).join("")}
    </section>`;
}

/* Informe semanal para la reunión con management */
function weekAhead() {
  const limit = addDays(demoDay,7);
  const radar = rooms.filter(room => { const t60 = addDays(contractualExit(room),-60); return t60 >= demoDay && t60 <= limit; });
  const moves = agendaEvents().filter(event => event.day >= demoDay && event.day <= addDays(demoDay,14));
  const signs = rooms.filter(room => primaryStep(room)?.type === "signature");
  return { radar, moves, signs };
}

function reportView() {
  const results = objectiveCatalog.filter(k => k.group === "resultado");
  const [g,a,r] = objectiveSummary();
  const reds = results.filter(k => evaluate(k).color !== "green");
  const prevWeek = qWeek() - 1;
  const lastAgreements = objState.agreements.filter(item => item.week === prevWeek);
  const newAgreements = objState.agreements.filter(item => item.week === qWeek());
  const { radar, moves, signs } = weekAhead();
  const anon = name => String(name).split(" ")[0] + " " + String(name).split(" ").slice(1).map(part => part[0] + ".").join(" ");
  return `<p class="crumb no-print"><a href="#objetivos">${ico("left")}Mis objetivos</a></p>
  <article class="report" aria-label="Informe semanal de objetivos">
    <header class="report-head">
      <div><p class="eyebrow"><span>Informe semanal · Sales</span></p><h1>Semana ${qWeek()} de ${qWeeks} · ${quarter.id}</h1>
      <p class="intro">Reunión semanal con management · Fecha de corte ${date(demoDay,true)} · Elaborado por el Director de Sales</p></div>
      <div class="report-actions no-print"><button type="button" class="secondary" data-report="present">${ico("calendar")}Modo reunión</button><button type="button" data-report="print">${ico("jornada")}Imprimir o guardar en PDF</button></div>
    </header>
    <p class="report-note"><span class="pending-tag">Datos y metas de ejemplo · las metas las fija Lorenzo</span></p>
    ${quarterProgress()}
    <section class="report-block"><h2><span class="n">1</span>Resumen</h2>
      <p class="report-lead"><b class="green-t">${g} ${g === 1 ? "objetivo" : "objetivos"} en verde</b>, <b class="amber-t">${a} en ámbar</b> y <b class="red-t">${r} en rojo</b>. ${reds.length ? `Requieren atención: ${reds.map(k => k.name.toLowerCase()).join(", ")}.` : "Todos los objetivos van en línea."}</p></section>
    <section class="report-block"><h2><span class="n">2</span>Semáforo de objetivos</h2>
      <div class="rep-table" role="table">
        <div class="rep-row rep-head" role="row"><span>Objetivo</span><span>Actual</span><span>Meta del trimestre</span><span>Estado</span><span>Semana anterior</span></div>
        ${results.map(kpi => { const ev = evaluate(kpi); return `<div class="rep-row" role="row"><span><strong>${kpi.name}</strong>${kpi.kind === "acc" ? `<small>Esperado a hoy ${num.format(ev.expected)} · proyección ${Math.round(ev.projection)}</small>` : ""}</span>
          <span><b>${fmt(kpi,kpi.value)}</b></span><span>${kpi.better === "down" ? "≤ " : ""}${fmt(kpi,ev.target)}</span><span>${riskTag(ev.color,ev.label)}</span><span>${deltaTag(kpi,ev)}</span></div>`; }).join("")}
      </div></section>
    <section class="report-block"><h2><span class="n">3</span>Casos que explican las cifras</h2>
      ${reds.map(kpi => `<div class="rep-cases"><h3>${riskTag(evaluate(kpi).color,"")}${kpi.name}</h3><ul>${kpi.cases.map(item => `<li><strong>${safe(item.text)}</strong> · ${safe(item.note)}</li>`).join("")}</ul></div>`).join("") || '<p class="muted">Sin objetivos fuera de línea.</p>'}</section>
    <section class="report-block"><h2><span class="n">4</span>Decisiones que se piden a management</h2>
      <div class="decisions">
        <div class="decision"><p class="eyebrow">Fee · fuera de la autoridad de Sales</p><h3>Narciso Serra 8 · Habitación 1</h3>
          <dl><div><dt>Decisión solicitada</dt><dd>Rebajar el Entry Fee de 100 € a 50 € para cerrar con uno de los 2 candidatos activos.</dd></div><div><dt>Plazo</dt><dd>${date(addDays(demoDay,3),true)}</dd></div><div><dt>Impacto</dt><dd>Hasta 15 días de vacío (≈ 350 €) si no cierra antes del check-out del 12 dic.</dd></div><div><dt>Recomendación</dt><dd>Aprobar: el coste (50 €) es menor que una semana de vacío.</dd></div></dl></div>
        <div class="decision"><p class="eyebrow">Cláusula no estándar</p><h3>Canillas 43 · Habitación 2</h3>
          <dl><div><dt>Decisión solicitada</dt><dd>Aceptar una estancia de 4 meses con salida anticipada pactada.</dd></div><div><dt>Plazo</dt><dd>${date(addDays(demoDay,7),true)}</dd></div><div><dt>Impacto</dt><dd>Evita 20 días de vacío; nueva rotación en marzo.</dd></div><div><dt>Recomendación</dt><dd>Aprobar con un precio un 3 % superior.</dd></div></dl></div>
      </div><p class="muted small-note">Ejemplos ficticios. Según la ficha del puesto, se escalan los fees y las cláusulas de contrato no estándar.</p></section>
    <section class="report-block"><h2><span class="n">5</span>Acuerdos de la semana anterior</h2>
      <ul class="agreements">${lastAgreements.map(item => `<li class="${item.done ? "done" : ""}"><button type="button" class="check no-print" data-agreement="${item.id}" aria-pressed="${item.done}" aria-label="Marcar como ${item.done ? "pendiente" : "hecho"}">${item.done ? ico("check") : ""}</button>
        <span><strong>${safe(item.text)}</strong><small>${safe(item.owner)} · para el ${date(item.due)}</small></span><span class="stay-status ${item.done ? "current" : "next"}">${item.done ? "Hecho" : "Pendiente"}</span></li>`).join("") || '<li class="muted">Sin acuerdos registrados la semana anterior.</li>'}</ul></section>
    <section class="report-block"><h2><span class="n">6</span>Próxima semana</h2>
      <div class="ahead">
        <div><h3>Salidas que llegan a 60 días</h3>${radar.length ? `<ul>${radar.map(room => `<li>${safe(locationName(room))} · aviso el ${date(addDays(contractualExit(room),-60))}</li>`).join("")}</ul>` : '<p class="muted">Ninguna en los próximos 7 días.</p>'}</div>
        <div><h3>Check-ins y check-outs (14 días)</h3>${moves.length ? `<ul>${moves.map(event => `<li>${date(event.day)} · ${event.type === "in" ? "Check-in" : "Check-out"} · ${safe(event.stay.floor)} · ${unitLabel(event.stay.number)} <small>(${safe(anon(event.person.name))})</small></li>`).join("")}</ul>` : '<p class="muted">Sin movimientos.</p>'}</div>
        <div><h3>Firmas previstas</h3>${signs.length ? `<ul>${signs.map(room => `<li>${safe(locationName(room))} · firma interna pendiente</li>`).join("")}</ul>` : '<p class="muted">Ninguna.</p>'}</div>
      </div></section>
    <section class="report-block meeting"><h2><span class="n">7</span>Registro de la reunión</h2>
      <p class="muted">Lo que se acuerde hoy aparecerá en el apartado 5 del informe de la semana que viene.</p>
      <ul class="agreements">${newAgreements.map(item => `<li><span class="check-static">${ico("check")}</span><span><strong>${safe(item.text)}</strong><small>${safe(item.owner)} · para el ${date(item.due)}</small></span><span class="stay-status next">Nuevo</span></li>`).join("") || '<li class="muted">Aún no hay acuerdos de esta reunión.</li>'}</ul>
      <form class="meeting-form no-print" data-obj-form="agreement">
        <label class="wide">Acuerdo<input name="text" required maxlength="200" placeholder="Qué se ha acordado"></label>
        <label>Responsable<select name="owner"><option>Sales</option><option>Management</option></select></label>
        <label>Para cuándo<input type="date" name="due" required value="${addDays(demoDay,7)}"></label>
        <button type="submit">Añadir acuerdo</button>
      </form>
      <form class="meeting-form no-print" data-obj-form="target">
        <label class="wide">Cambio de meta<select name="kpi">${results.map(kpi => `<option value="${kpi.id}">${kpi.name} · meta actual ${fmt(kpi,targetOf(kpi))}</option>`).join("")}</select></label>
        <label>Nueva meta<input type="number" name="value" step="0.1" min="0" required></label>
        <label>Decidido por<select name="by"><option>Management</option></select></label>
        <button type="submit" class="secondary">Registrar cambio de meta</button>
      </form>
      ${objState.targetLog.length ? `<ul class="target-log">${objState.targetLog.map(item => { const kpi = objectiveCatalog.find(k => k.id === item.kpi); return `<li>${safe(kpi.name)}: ${fmt(kpi,item.from)} → <b>${fmt(kpi,item.to)}</b> · ${safe(item.by)} · ${date(item.day,true)}</li>`; }).join("")}</ul>` : ""}
    </section>
  </article>`;
}

document.addEventListener("submit", event => {
  const form = event.target.closest("[data-obj-form]");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.dataset.objForm === "agreement") {
    objState.agreements.push({ id:"a" + Date.now(), text:data.text.trim(), owner:data.owner, due:data.due, done:false, week:qWeek() });
    announce("Acuerdo añadido al registro de la reunión.", objSave());
  } else {
    const kpi = objectiveCatalog.find(k => k.id === data.kpi);
    objState.targetLog.push({ kpi:kpi.id, from:targetOf(kpi), to:Number(data.value), by:data.by, day:demoDay });
    objState.targets[kpi.id] = Number(data.value);
    announce("Meta actualizada. El semáforo ya usa la nueva meta.", objSave());
  }
  render();
});
document.addEventListener("click", event => {
  const toggle = event.target.closest("[data-agreement]");
  if (toggle) {
    const item = objState.agreements.find(a => a.id === toggle.dataset.agreement);
    item.done = !item.done; objSave(); render(); return;
  }
  const action = event.target.closest("[data-report]");
  if (!action) return;
  if (action.dataset.report === "print") window.print();
  else {
    document.body.classList.toggle("presenting");
    if (document.body.classList.contains("presenting")) document.documentElement.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen?.();
  }
});
document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement) document.body.classList.remove("presenting"); });
/* Reiniciar demostración también restaura los objetivos. */
document.querySelector("#dialog")?.addEventListener("close", event => { if (event.target.returnValue === "reset") { objState = objSeed(); objSave(); } });
