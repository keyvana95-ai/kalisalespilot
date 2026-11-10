"use strict";

const storageKey = "kali-sales-pilot-v1";
const demoDay = "2026-11-10";
const rooms = [
  { id:"centro-1", number:1, floor:"Piso Centro", exit:"2026-12-12", ready:"2026-12-15", rent:700, target:730, published:720, listings:["Idealista · Activo · 720 € · 1 nov","Web de KALI · Activo · 720 € · 1 nov"], candidates:["Candidato A · En conversación","Candidato B · Pendiente de depósito"], renewal:"Oferta rechazada · 730 €", resident:"Lucía Ejemplo", entry:"2026-06-12" },
  { id:"centro-2", number:2, floor:"Piso Centro", exit:"2027-01-03", rent:725, target:760, published:760, listings:["Idealista · Activo · 760 € · 6 nov"], candidates:["Candidato C · En conversación"], renewal:"Oferta enviada · 750 €", resident:"Nora Ejemplo", entry:"2026-09-03" },
  { id:"centro-3", number:3, floor:"Piso Centro", exit:"2026-12-08", ready:"2026-12-10", rent:715, target:740, published:740, listings:["Idealista · Pausado · 740 € · 25 oct"], candidates:[], renewal:"Sin solicitud en espera", resident:"Mateo Ejemplo", entry:"2026-06-08" },
  { id:"norte-1", number:1, floor:"Piso Norte", exit:"2027-01-09", rent:690, listings:[], candidates:[], renewal:"Oferta pendiente de pricing", resident:"Elena Ejemplo", entry:"2026-07-09" }
];
const people = {
  "Lucía Ejemplo": ["P-001","lucia@example.com","España","27","Mujer","Diseño","Estudio de ejemplo","Híbrido"],
  "Nora Ejemplo": ["P-002","nora@example.com","Francia","24","Mujer","Estudiante","Centro de ejemplo","Presencial"],
  "Mateo Ejemplo": ["P-003","mateo@example.com","Argentina","30","Hombre","Desarrollo","Empresa de ejemplo","Remoto"],
  "Elena Ejemplo": ["P-004","elena@example.com","España","28","Mujer","Docencia","Centro de ejemplo","Presencial"],
  "Daniel Ejemplo": ["P-005","daniel@example.com","México","29","Hombre","Consultoría","Empresa de ejemplo","Híbrido"],
  "Andrea Ejemplo": ["P-006","andrea@example.com","Italia","26","Mujer","Analista","Empresa de ejemplo","Híbrido"]
};
const money = new Intl.NumberFormat("es-ES", { style:"currency", currency:"EUR", minimumFractionDigits:0, maximumFractionDigits:2 });
const shortDate = new Intl.DateTimeFormat("es-ES", { day:"numeric", month:"short", timeZone:"UTC" });
const fullDate = new Intl.DateTimeFormat("es-ES", { day:"numeric", month:"short", year:"numeric", timeZone:"UTC" });
const main = document.querySelector("#main");
const feedback = document.querySelector("#feedback");
const dialog = document.querySelector("#dialog");
const dialogBody = document.querySelector("#dialog-body");
const expanded = new Set();
let dialogTrigger;
let state = load();

function seed() {
  return {
    "centro-1": { opened:true, measure:"", next:null },
    "centro-2": { opened:true, measure:"", next:null },
    "centro-3": { opened:true, measure:"", next:{ name:"Daniel Ejemplo", rent:740, deposit:740, paid:"2026-11-08", entry:"2026-12-10", exit:"2027-06-10", signed:null, reference:null } },
    "norte-1": { opened:false, measure:"", next:null }
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && rooms.every(room => typeof saved[room.id]?.opened === "boolean")) return saved;
  } catch {}
  return seed();
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function safe(value) {
  return String(value ?? "Sin registrar").replace(/[&<>"']/g, mark => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[mark]);
}

const date = (value, full = false) => value ? (full ? fullDate : shortDate).format(new Date(value)) : "Por confirmar";
const dayDiff = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const locationName = room => `Habitación ${room.number} · ${room.floor}`;
const view = () => ["pipeline", "community"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "jornada";
const action = (room, type, label, style = "secondary") => `<button type="button" class="${style}" data-action="${type}" data-room="${room.id}">${label}</button>`;
const fields = entries => `<dl class="fields">${entries.map(([label, value]) => `<div><dt>${safe(label)}</dt><dd>${safe(value)}</dd></div>`).join("")}</dl>`;
const heading = (label, intro) => `<header class="page-head"><p class="eyebrow">SALES · DEMOSTRACIÓN DEL 10 NOV 2026</p><h1>${label}</h1><p class="intro">${intro}</p></header>`;
const columns = (...labels) => `<div class="columns" aria-hidden="true">${labels.map(label => `<span>${label}</span>`).join("")}</div>`;
const list = (items, fallback) => items.length ? `<ul>${items.map(item => `<li>${safe(item)}</li>`).join("")}</ul>` : `<p class="muted">${fallback}</p>`;
const panel = (title, content, style = "") => `<section class="panel ${style}"><div class="panel-head"><h2>${title}</h2></div>${content}</section>`;

function risk(room) {
  if (state[room.id].next) return ["green", "Comprometida"];
  return dayDiff(demoDay, room.exit) <= 45 ? ["red", "Riesgo de vacío"] : ["amber", "Seguimiento comercial"];
}

function roomRow(room, pipeline) {
  const cycle = state[room.id];
  const key = `${view()}-${room.id}`;
  const open = expanded.has(key);
  const [color, label] = risk(room);
  const candidates = [...room.candidates];
  if (cycle.next) candidates.push(`${cycle.next.name} · ${cycle.next.signed ? "Contrato firmado" : "Depósito cobrado"}`);
  const stage = cycle.next?.signed ? "Contrato firmado" : cycle.next ? "Firma pendiente" : room.published ? "En comercialización" : "Ciclo abierto";
  const nextAction = !cycle.opened ? action(room,"open","Abrir en el pipeline","primary")
    : cycle.next?.signed ? action(room,"resident","Abrir ficha")
    : cycle.next ? action(room,"signature","Revisar firma")
    : color === "red" && !cycle.measure ? action(room,"measure","Registrar medida")
    : cycle.measure ? `<span class="muted">Medida registrada</span>`
    : pipeline ? action(room,"pipeline",candidates.length ? "Ver candidatos" : "Abrir pricing") : action(room,"pipeline","Ver pipeline");
  const overview = fields([["Precio publicado",room.published ? money.format(room.published) + " / mes" : "Por definir"],["Candidatos",candidates.length],["Última medida",cycle.measure || "Sin medida registrada"]]);
  const sheet = pipeline ? `<div class="details-pair">
    <section><h3>Candidatos</h3>${list(candidates,"Sin candidaturas registradas")}</section>
    <section><h3>Renovación</h3><p>${safe(room.renewal)}</p></section>
    <section><h3>Pricing</h3>${fields([["Renta anterior",money.format(room.rent)],["Precio objetivo",room.target ? money.format(room.target) : "Por definir"],["Precio publicado",room.published ? money.format(room.published) : "Sin publicar"]])}</section>
    <section><h3>Anuncios</h3>${list(room.listings,"Sin anuncios publicados")}</section>
  </div>` : "";
  return `<article>
    <div class="row">
      <button type="button" class="text-button room-toggle" data-action="expand" data-room="${room.id}" aria-controls="detail-${key}" aria-expanded="${open}">Habitación ${room.number}<small>${room.floor}</small></button>
      ${pipeline ? `<div><strong>Sale ${date(room.exit)}</strong><small>${room.ready ? "Entrada desde " + date(room.ready) : "Entrada por confirmar"}</small></div><div><strong>${stage}</strong><small>${candidates.length} candidaturas</small></div>` : ""}
      <div><span class="risk ${color}">${label}</span><small>${dayDiff(demoDay,room.exit)} días hasta la salida</small></div>
      ${pipeline ? "" : `<div><strong>${stage === "Ciclo abierto" && !cycle.opened ? "Aviso a 60 días" : stage}</strong><small>${cycle.next ? "Depósito cobrado" : "Sin depósito"}</small></div>`}
      <div class="row-action">${nextAction}</div>
    </div>
    <div class="details" id="detail-${key}" ${open ? "" : "hidden"}>
      <div class="detail-top">${overview}${action(room,"resident","Abrir ficha")}</div>
      ${sheet}
      ${pipeline && !cycle.next ? `<div>${action(room,"deposit","Simular depósito")}</div>` : ""}
    </div>
  </article>`;
}

function dashboard() {
  const pending = rooms.filter(room => !state[room.id].opened);
  const signatures = rooms.filter(room => state[room.id].next && !state[room.id].next.signed);
  return heading("Mi jornada","Revisa la situación de cada habitación y pasa al pipeline cuando haya una acción comercial.") +
    `<div class="stack">
      ${panel("Semáforo de habitaciones", columns("Habitación y piso","Riesgo y salida","Etapa comercial","Próxima acción") + rooms.map(room => roomRow(room,false)).join(""))}
      ${panel("Acciones de hoy", pending.length ? pending.map(room => `<div class="task"><div><strong>${locationName(room)}</strong><br><small>Aviso de salida a 60 días</small></div>${action(room,"open","Abrir en el pipeline","primary")}</div>`).join("") : '<p class="empty">Los avisos de apertura ya se han atendido.</p>')}
      ${panel("Firmas pendientes", signatures.length ? signatures.map(room => `<div class="task"><div><strong>${locationName(room)}</strong><br><small>Depósito cobrado el ${date(state[room.id].next.paid)} · ${dayDiff(state[room.id].next.paid,demoDay)} días</small></div>${action(room,"signature","Revisar firma")}</div>`).join("") : '<p class="empty">No quedan firmas pendientes.</p>')}
    </div>`;
}

function pipeline() {
  const available = rooms.filter(room => state[room.id].opened);
  return heading("Pipeline comercial","Una fila por habitación y ciclo, con su etapa, riesgo, candidatos y publicaciones.") +
    panel(`Ciclos comerciales · ${available.length}`,columns("Habitación y piso","Salida y disponibilidad","Etapa comercial","Riesgo de vacío","Próxima acción") + available.map(room => roomRow(room,true)).join(""),"pipeline");
}

function community() {
  const confirmed = rooms.filter(room => state[room.id].next?.signed);
  return heading("Entradas confirmadas","Vista de Community en el piloto. Cada firma registrada genera un aviso interno.") +
    panel("Avisos de entrada", confirmed.length ? confirmed.map(room => {
      const next = state[room.id].next;
      return `<article class="notice"><div><strong>${locationName(room)}</strong><p>${safe(next.name)} · Check-in ${date(next.entry,true)}</p><small>Aviso generado al registrar la firma · ${date(next.signed,true)}</small></div>${action(room,"resident","Abrir ficha")}</article>`;
    }).join("") : '<p class="empty">Todavía no hay entradas confirmadas. Registra una firma en Sales para probar el aviso.</p>');
}

function render() {
  const active = view();
  main.innerHTML = ({ jornada:dashboard, pipeline, community })[active]();
  for (const link of document.querySelectorAll("nav a")) {
    if (link.hash === "#" + active) link.setAttribute("aria-current","page");
    else link.removeAttribute("aria-current");
  }
  const count = rooms.filter(room => state[room.id].next?.signed).length;
  const badge = document.querySelector("#community-count");
  badge.hidden = !count;
  badge.textContent = count;
}

function announce(message, persisted = true) {
  feedback.textContent = message + (persisted ? "" : " El navegador solo guardará este cambio mientras la página siga abierta.");
}

function show(title, context, content, trigger) {
  dialogTrigger = trigger;
  document.querySelector("#dialog-title").textContent = title;
  document.querySelector("#dialog-context").textContent = context;
  dialogBody.innerHTML = content;
  dialog.showModal();
  dialog.scrollTop = 0;
}

function resident(room, trigger) {
  const next = state[room.id].next;
  const name = next?.name ?? room.resident;
  const [documentId,email,nationality,age,gender,occupation,company,mode] = people[name];
  show(name, locationName(room) + (next ? " · Próxima estancia" : " · Estancia actual"),
    `<section><h3>Datos personales</h3>${fields([["Nombre",name],["Documento",documentId],["Teléfono","Sin registrar"],["Correo",email],["Nacionalidad",nationality],["Edad",age],["Género",gender],["Ocupación",occupation],["Empresa o centro de estudios",company],["Modalidad de trabajo",mode]])}</section>
    <section><h3>Datos financieros</h3>${fields([["Renta",money.format(next?.rent ?? room.rent) + " / mes"],["Depósito pagado",money.format(next?.deposit ?? room.rent)],["Fecha de cobro",next ? date(next.paid,true) : "Sin registrar"],["Depósito devuelto","Sin devolución registrada"],["Entry Fee","Sin registrar"],["Exit Fee","Sin registrar"]])}</section>
    <section><h3>Check-in, check-out y contrato</h3>${fields([["Check-in",date(next?.entry ?? room.entry,true)],["Check-out",date(next?.exit ?? room.exit,true)],["Contrato",next ? next.signed ? "Firmado" : "Firma pendiente" : "Vigente"],["Referencia",next?.reference ?? "Sin registrar"],["Fecha de firma",next?.signed ? date(next.signed,true) : "Sin registrar"]])}</section>`,trigger);
}

function formFor(type, room, trigger) {
  const cycle = state[room.id];
  const next = cycle.next;
  if (type === "measure") {
    show("Registrar medida",locationName(room),`<form data-form="measure" data-room="${room.id}"><label>Medida tomada<textarea name="note" required maxlength="300" rows="3">${safe(cycle.measure)}</textarea></label><button type="submit">Guardar medida</button></form>`,trigger);
  } else if (type === "deposit" && !next && cycle.opened) {
    show("Simular depósito",locationName(room),`<p>Se vinculará la próxima estancia a Andrea Ejemplo. El cobro compromete la habitación y deja pendiente la firma.</p>
      <form data-form="deposit" data-room="${room.id}"><div class="fields"><label>Depósito pagado (€)<input name="deposit" type="number" min="1" step=".01" value="${room.target ?? room.rent}" required></label><label>Renta mensual (€)<input name="rent" type="number" min="1" step=".01" value="${room.target ?? room.rent}" required></label><label>Check-in previsto<input name="entry" type="date" min="${room.ready ?? room.exit}" value="${room.ready ?? ""}" required></label><label>Check-out previsto<input name="exit" type="date" required></label></div><button type="submit">Registrar depósito de prueba</button></form>`,trigger);
  } else if (type === "signature" && next && !next.signed) {
    show("Firma pendiente",locationName(room),`${fields([["Inquilino",next.name],["Depósito",money.format(next.deposit) + " · " + date(next.paid,true)],["Días desde el cobro",dayDiff(next.paid,demoDay)],["Check-in",date(next.entry,true)]])}
      <form data-form="signature" data-room="${room.id}"><label>Referencia del contrato<input name="reference" required maxlength="48" value="DEMO-${room.id.toUpperCase()}"></label><p class="muted">Al registrar la firma se generará un aviso dentro de la vista Community del piloto.</p><button type="submit">Registrar firma de prueba</button></form>`,trigger);
  }
}

function routePipeline(room) {
  expanded.add("pipeline-" + room.id);
  if (view() === "pipeline") render();
  else location.hash = "pipeline";
}

main.addEventListener("click", event => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const room = rooms.find(item => item.id === trigger.dataset.room);
  const type = trigger.dataset.action;
  if (type === "expand") {
    const key = view() + "-" + room.id;
    const detail = document.getElementById("detail-" + key);
    if (expanded.has(key)) expanded.delete(key);
    else expanded.add(key);
    detail.hidden = !expanded.has(key);
    trigger.setAttribute("aria-expanded",String(!detail.hidden));
  } else if (type === "open") {
    if (state[room.id].opened) return;
    state[room.id].opened = true;
    announce("Ciclo abierto. La tarea del radar queda cerrada.",save());
    routePipeline(room);
  } else if (type === "pipeline") {
    routePipeline(room);
  } else if (type === "resident") {
    resident(room,trigger);
  } else {
    formFor(type,room,trigger);
  }
});

dialogBody.addEventListener("submit", event => {
  const form = event.target;
  if (!form.dataset.form) return;
  event.preventDefault();
  const cycle = state[form.dataset.room];
  const values = Object.fromEntries(new FormData(form));
  let message;
  if (form.dataset.form === "measure") {
    if (!values.note.trim()) return invalid(form.elements.note,"Escribe la medida tomada.");
    cycle.measure = values.note.trim();
    message = "Medida registrada. El riesgo sigue visible hasta el cobro del depósito.";
  } else if (form.dataset.form === "deposit") {
    if (cycle.next || !cycle.opened) return;
    if (values.exit <= values.entry) return invalid(form.elements.exit,"El check-out debe ser posterior al check-in.");
    cycle.next = { name:"Andrea Ejemplo", rent:Number(values.rent), deposit:Number(values.deposit), paid:demoDay, entry:values.entry, exit:values.exit, signed:null, reference:null };
    message = "Depósito registrado. Habitación comprometida y firma pendiente.";
  } else {
    if (!cycle.next || cycle.next.signed) return;
    if (!values.reference.trim()) return invalid(form.elements.reference,"Escribe la referencia del contrato.");
    cycle.next.signed = demoDay;
    cycle.next.reference = values.reference.trim();
    message = "Firma registrada. Community tiene un aviso de entrada.";
  }
  const persisted = save();
  dialog.close();
  render();
  announce(message,persisted);
  main.querySelector(`[data-room="${form.dataset.room}"]`)?.focus();
});

function invalid(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
}

dialogBody.addEventListener("input", event => event.target.setCustomValidity?.(""));
dialog.addEventListener("close", () => {
  if (dialogTrigger?.isConnected) dialogTrigger.focus();
});
window.addEventListener("hashchange", () => {
  render();
  main.focus();
});
document.querySelector("#reset").addEventListener("click", event => {
  show("Reiniciar demostración","PILOTO LOCAL",'<p>Se eliminarán los cambios de prueba de este navegador.</p><form method="dialog"><button value="reset">Restaurar datos de ejemplo</button></form>',event.currentTarget);
});
dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "reset") return;
  dialog.returnValue = "";
  state = seed();
  expanded.clear();
  const persisted = save();
  if (view() === "jornada") render();
  else location.hash = "jornada";
  announce("Datos de ejemplo restaurados.",persisted);
});
render();
