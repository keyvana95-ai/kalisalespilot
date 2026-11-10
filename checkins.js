"use strict";

/* Check-in / Check-out · vista Por piso (vista previa, 10-11-2026).
   Las fechas salen de las estancias (Base Datos Co-livers) y de los ciclos.
   Quién hace cada check-in y check-out lo registra Community; aquí se ve en solo lectura.
   Datos ficticios. */

const occHorizon = 60;
const occWarn = 60;
const occRisk = 45;

/* Estancias de las habitaciones sin ciclo comercial abierto (ficticias). */
const otherStays = {
  "Narciso Serra 8": { 4:["Irene Ejemplo","2026-03-01","2027-02-28","Ana Ejemplo"], 5:["Pablo Ejemplo","2026-04-15","2027-03-31","Jorge Ejemplo"] },
  "Canillas 43": { 3:["Marta Ejemplo","2026-02-01","2027-01-31","Ana Ejemplo"], 4:["Hugo Ejemplo","2026-05-01","2027-04-30","Jorge Ejemplo"] },
  "Luis Vives 14": { 1:["Sara Ejemplo","2026-03-01","2027-02-28","Ana Ejemplo"], 2:["Leo Ejemplo","2026-06-01","2027-05-31","Ana Ejemplo"],
    3:["Julia Ejemplo","2026-02-15","2027-02-14","Jorge Ejemplo"], 4:["Iván Ejemplo","2026-07-01","2027-06-30","Jorge Ejemplo"], 5:["Noa Ejemplo","2026-04-01","2027-03-31","Ana Ejemplo"] },
  "Alonso Castrillo 1": { 1:["Bruno Ejemplo","2026-03-15","2027-03-14","Jorge Ejemplo"], 2:["Lola Ejemplo","2026-05-01","2027-04-30","Ana Ejemplo"],
    3:["Teo Ejemplo","2026-02-01","2027-01-31","Ana Ejemplo"], 4:["Eva Ejemplo","2026-06-15","2027-06-14","Jorge Ejemplo"], 5:["Dani Ejemplo","2026-04-01","2027-03-31","Ana Ejemplo"] },
  "Castellana 229": { 1:["Alba Ejemplo","2026-03-01","2027-02-28","Jorge Ejemplo"], 2:["Raúl Ejemplo","2026-05-15","2027-05-14","Ana Ejemplo"],
    3:["Vera Ejemplo","2026-02-01","2027-01-31","Ana Ejemplo"], 4:["Marc Ejemplo","2026-06-01","2027-05-31","Jorge Ejemplo"] },
  "Esparteros 11": { whole:["Grupo Ejemplo (titular: Carla Ejemplo)","2026-03-01","2027-02-28","Jorge Ejemplo"] },
  "Marcenado 1": { whole:["Grupo Ejemplo (titular: Óscar Ejemplo)","2026-04-01","2027-03-31","Ana Ejemplo"] },
  "Espronceda 7": { whole:["Grupo Ejemplo (titular: Nuria Ejemplo)","2026-05-01","2027-04-30","Ana Ejemplo"] }
};

/* Registro de Community para las habitaciones con ciclo (ficticio). */
const communityLog = {
  "narciso-1":{ checkInBy:"Ana Ejemplo" }, "narciso-2":{ checkInBy:"Jorge Ejemplo" }, "narciso-3":{ checkInBy:"Ana Ejemplo" },
  "canillas-1":{ checkInBy:"Jorge Ejemplo" }, "canillas-2":{ checkInBy:"Ana Ejemplo" }, "santa-engracia":{ checkInBy:"Jorge Ejemplo" }
};

const occStates = {
  none:{ cls:"none", label:"Sin alerta", hint:`Más de ${occWarn} días para el check-out` },
  amber:{ cls:"amber", label:`Aviso a ${occWarn} días`, short:`Aviso ${occWarn} días`, hint:`Entre ${occWarn} y ${occRisk + 1} días, sin depósito de la siguiente estancia` },
  red:{ cls:"red", label:"Riesgo de vacío", hint:`${occRisk} días o menos, sin depósito` },
  green:{ cls:"green", label:"Siguiente estancia comprometida", short:"Comprometida", hint:"Ya hay depósito para el siguiente residente" },
  empty:{ cls:"empty", label:"Vacía", hint:"Habitación sin residente" },
  late:{ cls:"late", label:"Check-out sin registrar", hint:"La fecha ya pasó y Community no ha registrado quién lo hizo" }
};

function occState(exit, hasNext, hasResident, checkOutBy) {
  if (!hasResident) return hasNext ? "green" : "empty";
  const days = dayDiff(demoDay, exit);
  if (days < 0 && !checkOutBy) return "late";
  if (hasNext) return "green";
  return days <= occRisk ? "red" : days <= occWarn ? "amber" : "none";
}

/* Una fila por habitación (o por piso completo): estancia actual y siguiente. */
function occupancyRows(name) {
  const record = realEstateRecords[name];
  const whole = record.mode === "completo";
  const cycleUnits = rooms.filter(room => catalogFloor(room.floor).name === name);
  const numbers = whole ? ["whole"] : Object.keys(record.rooms);
  return numbers.map(number => {
    const unit = whole ? cycleUnits[0] : cycleUnits.find(room => String(room.number) === number);
    if (unit) {
      const cycle = state[unit.id];
      const next = cycle.next;
      const committed = Boolean(next) && (typeof nextPaymentStatus === "function" ? nextPaymentStatus(unit).ready || next.signed : true);
      const renewed = cycle.renewal?.status === "Renovación firmada";
      const exit = renewed ? contractualExit(unit) : cycle.currentDates?.exit ?? contractualExit(unit);
      const log = communityLog[unit.id] ?? {};
      return { number, unit, resident:unit.resident, entry:cycle.currentDates?.entry ?? unit.entry, exit,
        checkInBy:log.checkInBy, checkOutBy:log.checkOutBy,
        next:next ? { name:nextDisplayName(unit), entry:next.entry, committed, signed:Boolean(next.signed) } : null,
        state:occState(exit, committed || renewed, true, log.checkOutBy), link:`#ciclo/${unit.id}` };
    }
    const stay = otherStays[name]?.[number];
    if (!stay) return { number, resident:null, state:"empty", link:`#pisos/${record.slug}` };
    const [resident,entry,exit,checkInBy] = stay;
    return { number, resident, entry, exit, checkInBy, checkOutBy:null, next:null, state:occState(exit,false,true,null), link:`#pisos/${record.slug}` };
  });
}

function occTimeline(row) {
  const pct = day => Math.max(0,Math.min(100,dayDiff(demoDay,day) / occHorizon * 100));
  const parts = [];
  if (row.resident && row.exit) parts.push(`<span class="tl-bar current ${row.state}" style="left:0;width:${pct(row.exit)}%" title="Estancia actual hasta ${date(row.exit,true)}"></span>`);
  if (row.next?.entry && dayDiff(demoDay,row.next.entry) <= occHorizon) {
    const start = pct(row.next.entry);
    parts.push(`<span class="tl-bar next ${row.next.committed ? "committed" : ""}" style="left:${start}%;width:${100 - start}%" title="Siguiente estancia desde ${date(row.next.entry,true)}"></span>`);
  }
  const gap = row.next?.entry && row.exit ? dayDiff(row.exit,row.next.entry) : null;
  return `<div class="tl" role="img" aria-label="${row.resident ? "Estancia actual hasta " + date(row.exit,true) : "Sin residente"}${row.next ? ", siguiente estancia desde " + date(row.next.entry,true) : ""}">
    <span class="tl-track"></span>${parts.join("")}
    <span class="tl-mark" style="left:${occRisk / occHorizon * 100}%" aria-hidden="true"></span>
  </div>${gap != null && gap > 0 ? `<small class="tl-gap">${gap} ${gap === 1 ? "día" : "días"} vacía entre estancias</small>` : row.resident && dayDiff(demoDay,row.exit) <= occHorizon && !row.next ? '<small class="tl-gap open">Sin siguiente estancia</small>' : ""}`;
}

function occupancyView() {
  const pisos = Object.keys(realEstateRecords);
  const all = pisos.flatMap(name => occupancyRows(name).map(row => ({ ...row, piso:name })));
  const total = key => all.filter(row => row.state === key).length;
  const order = ["red","amber","late","green","empty","none"];
  return heading("Check-in / Check-out","Situación de cada habitación por piso. Las fechas se consultan aquí y se cambian en Base Datos Co-livers. Quién hace cada check-in y check-out lo registra Community.") +
    agendaTabs("pisos") + `
    <section class="occ-summary panel" aria-label="Resumen">
      ${order.filter(key => total(key)).map(key => `<span class="occ-chip ${occStates[key].cls}" title="${occStates[key].hint}"><span class="dot"></span>${total(key)} ${occStates[key].label.toLowerCase()}</span>`).join("")}
      <span class="occ-total muted">${all.length} unidades en ${pisos.length} pisos · Hoy ${date(demoDay,true)} · Línea temporal: próximos ${occHorizon} días</span>
    </section>
    <div class="stack">${pisos.map(name => {
      const record = realEstateRecords[name];
      const rows = occupancyRows(name);
      const alerts = rows.filter(row => ["red","amber","late"].includes(row.state)).length;
      const exits = rows.filter(row => row.resident && dayDiff(demoDay,row.exit) >= 0).map(row => row.exit).sort();
      const counts = order.filter(key => rows.some(row => row.state === key)).map(key => `<span class="occ-chip small ${occStates[key].cls}"><span class="dot"></span>${rows.filter(row => row.state === key).length}</span>`).join("");
      return `<section class="panel occ-piso ${alerts ? "has-alerts" : ""}" aria-labelledby="occ-${record.slug}">
        <div class="occ-head">
          <div><h2 id="occ-${record.slug}">${safe(name)}</h2><small>${record.mode === "completo" ? "Piso completo" : rows.length + " habitaciones"}${exits[0] ? " · próximo check-out " + date(exits[0]) : ""}</small></div>
          <div class="occ-counts">${counts}</div>
          <a class="text-button inline" href="#pisos/${record.slug}">Ficha del piso</a>
        </div>
        <div class="occ-table" role="table" aria-label="Habitaciones de ${safe(name)}">
          <div class="occ-row occ-colhead" role="row"><span role="columnheader">Habitación</span><span role="columnheader">Estado</span><span role="columnheader">Residente actual</span><span role="columnheader">Check-in</span><span role="columnheader">Check-out</span><span role="columnheader">Siguiente estancia</span><span role="columnheader">Próximos ${occHorizon} días</span></div>
          ${rows.map(row => {
            const st = occStates[row.state];
            const days = row.resident ? dayDiff(demoDay,row.exit) : null;
            return `<a class="occ-row ${st.cls}" role="row" href="${row.link}" ${row.unit ? 'data-origin="check-in-out/pisos"' : ""}>
              <span role="cell" data-label="Habitación" class="occ-room"><span class="occ-led ${st.cls}" aria-hidden="true"></span><strong>${row.number === "whole" ? "Piso completo" : "Habitación " + row.number}</strong></span>
              <span role="cell" data-label="Estado"><span class="occ-chip ${st.cls}" title="${st.hint}"><span class="dot"></span>${st.short ?? st.label}</span>${days != null ? `<small>${days < 0 ? "Hace " + -days + " días" : days + " días para el check-out"}</small>` : ""}</span>
              <span role="cell" data-label="Residente actual">${row.resident ? safe(row.resident) : '<span class="muted">Sin residente</span>'}</span>
              <span role="cell" data-label="Check-in">${row.entry ? date(row.entry) : "—"}<small>${row.checkInBy ? "Por " + safe(row.checkInBy) : '<span class="pending-cm">Pendiente de Community</span>'}</small></span>
              <span role="cell" data-label="Check-out">${row.exit ? date(row.exit) : "—"}<small>${row.checkOutBy ? "Por " + safe(row.checkOutBy) : row.exit ? (row.state === "late" ? '<span class="pending-cm">Sin registrar por Community</span>' : "Pendiente · Community") : ""}</small></span>
              <span role="cell" data-label="Siguiente estancia">${row.next ? `${safe(row.next.name)}<small>Check-in ${date(row.next.entry)} · ${row.next.signed ? "contrato firmado" : row.next.committed ? "comprometida" : "pagos pendientes"}</small>` : '<span class="muted">—</span>'}</span>
              <span role="cell" data-label="Próximos ${occHorizon} días">${occTimeline(row)}</span>
            </a>`;
          }).join("")}
        </div>
      </section>`;
    }).join("")}</div>
    <section class="panel occ-legend" aria-label="Leyenda">${Object.values(occStates).map(st => `<span class="occ-chip ${st.cls}"><span class="dot"></span>${st.label}</span><small>${st.hint}</small>`).join("")}
      <span class="legend-tl"><span class="tl-mark static"></span></span><small>Marca de ${occRisk} días en la línea temporal</small></section>`;
}

function agendaTabs(active) {
  return `<nav class="agenda-tabs" aria-label="Vistas de check-in y check-out">
    <a href="#check-in-out" ${active === "calendario" ? 'aria-current="page"' : ""}>Calendario</a>
    <a href="#check-in-out/pisos" ${active === "pisos" ? 'aria-current="page"' : ""}>Por piso</a>
  </nav>`;
}
