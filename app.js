"use strict";

const storageKey = "kali-sales-pilot-v2";
const demoDay = "2026-11-10";
const channels = ["Idealista", "Portales asociados", "Grupos de Facebook", "Web de KALI"];
const listingStatuses = ["Activo", "Pausado", "Retirado"];
const candidateChannels = [...channels, "Contacto directo", "Otro"];
const pendingPaymentsStage = "Pendiente de pagos";
const internalSignatureStage = "Pendiente de firma interna";
const candidateStages = ["Nuevo", "En conversación", pendingPaymentsStage, "Cerrado sin acuerdo"];
const closedStage = "Cerrado sin acuerdo";
const rooms = [
  { id:"centro-1", number:1, floor:"Piso Centro", exit:"2026-12-12", ready:"2026-12-15", rent:700, target:730, listings:[{ channel:"Idealista", status:"Activo", price:720, publishedOn:"2026-11-01", url:"https://example.com/kali/centro-1-idealista" },{ channel:"Web de KALI", status:"Activo", price:720, publishedOn:"2026-11-01", url:"https://example.com/kali/centro-1-web" }], candidates:[{ id:"demo-a", name:"Candidato A", channel:"Idealista", stage:"En conversación", nextAction:"Compartir las fotos" },{ id:"demo-b", name:"Candidato B", channel:"Web de KALI", stage:"Pendiente de depósito", nextAction:"Comprobar el cobro" }], renewal:"Oferta rechazada · 730 €", resident:"Lucía Ejemplo", entry:"2026-06-12" },
  { id:"centro-2", number:2, floor:"Piso Centro", exit:"2027-01-03", rent:725, target:760, listings:[{ channel:"Idealista", status:"Activo", price:760, publishedOn:"2026-11-06", url:"https://example.com/kali/centro-2-idealista" }], candidates:[{ id:"demo-c", name:"Candidato C", channel:"Idealista", stage:"En conversación", nextAction:"Confirmar sus fechas" }], renewal:"Oferta enviada · 750 €", resident:"Nora Ejemplo", entry:"2026-09-03" },
  { id:"centro-3", number:3, floor:"Piso Centro", exit:"2026-12-08", ready:"2026-12-10", rent:715, target:740, listings:[{ channel:"Idealista", status:"Pausado", price:740, publishedOn:"2026-10-25", url:"https://example.com/kali/centro-3-idealista" }], candidates:[], renewal:"Sin solicitud en espera", resident:"Mateo Ejemplo", entry:"2026-06-08" },
  { id:"norte-1", number:1, floor:"Piso Norte", exit:"2027-01-09", rent:690, listings:[], candidates:[], renewal:"Oferta pendiente de pricing", resident:"Elena Ejemplo", entry:"2026-07-09" },
  { id:"norte-2", number:2, floor:"Piso Norte", exit:"2026-12-28", ready:"2027-01-02", rent:680, target:710, listings:[{ channel:"Idealista", status:"Activo", price:710, publishedOn:"2026-11-04", url:"https://example.com/kali/norte-2-idealista" },{ channel:"Grupos de Facebook", status:"Activo", price:710, publishedOn:"2026-11-05", url:"https://example.com/kali/norte-2-facebook" }], candidates:[{ id:"demo-d", name:"Candidato D", channel:"Grupos de Facebook", stage:"Nuevo", nextAction:"Enviar las fotos vigentes" }], renewal:"", resident:"Sofía Ejemplo", entry:"2026-06-28" },
  { id:"sur", unit:"piso", number:null, floor:"Piso Sur", exit:"2026-12-31", ready:"2027-01-03", rent:3100, target:3400, listings:[{ channel:"Idealista", status:"Activo", price:3400, publishedOn:"2026-11-03", url:"https://example.com/kali/piso-sur-idealista" }], candidates:[{ id:"demo-e", name:"Grupo E (3 personas)", channel:"Idealista", stage:"En conversación", nextAction:"Enviar las fotos del piso" }], renewal:"", resident:"Tomás Ejemplo", entry:"2026-01-01" }
];
const people = {
  "Lucía Ejemplo": ["P-001","lucia@example.com","España","27","Mujer","Diseño","Estudio de ejemplo","Híbrido"],
  "Nora Ejemplo": ["P-002","nora@example.com","Francia","24","Mujer","Estudiante","Centro de ejemplo","Presencial"],
  "Mateo Ejemplo": ["P-003","mateo@example.com","Argentina","30","Hombre","Desarrollo","Empresa de ejemplo","Remoto"],
  "Elena Ejemplo": ["P-004","elena@example.com","España","28","Mujer","Docencia","Centro de ejemplo","Presencial"],
  "Daniel Ejemplo": ["P-005","daniel@example.com","México","29","Hombre","Consultoría","Empresa de ejemplo","Híbrido"],
  "Andrea Ejemplo": ["P-006","andrea@example.com","Italia","26","Mujer","Analista","Empresa de ejemplo","Híbrido"],
  "Clara Ejemplo": ["P-007","clara@example.com","Italia"],
  "Sofía Ejemplo": ["P-008","sofia@example.com","Portugal","25","Mujer","Marketing","Empresa de ejemplo","Híbrido"],
  "Tomás Ejemplo": ["P-009","tomas@example.com","Alemania","34","Hombre","Ingeniería","Empresa de ejemplo","Presencial"]
};
const previousStays = [
  { name:"Lucía Ejemplo", floor:"Piso Norte", number:2, entry:"2026-01-12", exit:"2026-06-12", rent:660, deposit:650, reference:"DEMO-C07" },
  { name:"Clara Ejemplo", floor:"Piso Norte", number:3, entry:"2026-05-01", exit:"2026-10-01", rent:680, deposit:680, reference:"DEMO-C09" }
];
const money = new Intl.NumberFormat("es-ES", { style:"currency", currency:"EUR", minimumFractionDigits:0, maximumFractionDigits:2 });
const shortDate = new Intl.DateTimeFormat("es-ES", { day:"numeric", month:"short", timeZone:"UTC" });
const fullDate = new Intl.DateTimeFormat("es-ES", { day:"numeric", month:"short", year:"numeric", timeZone:"UTC" });
const monthDate = new Intl.DateTimeFormat("es-ES", { month:"long", year:"numeric", timeZone:"UTC" });
const main = document.querySelector("#main");
const feedback = document.querySelector("#feedback");
const dialog = document.querySelector("#dialog");
const dialogBody = document.querySelector("#dialog-body");
const directoryFilter = { query:"", scope:"current" };
let agendaMonth = "";
let agendaDay = "";
let dialogTrigger;
let state = load();

function seed() {
  return {
    "centro-1": { opened:true, measure:"", next:null },
    "centro-2": { opened:true, measure:"", next:null },
    "centro-3": { opened:true, measure:"", next:{ name:"Daniel Ejemplo", rent:740, deposit:740, entryFee:100, paid:"2026-11-08", entry:"2026-12-10", exit:"2027-06-10", signed:null, reference:null } },
    "norte-1": { opened:false, measure:"", next:null },
    "norte-2": { opened:true, measure:"", next:null },
    "sur": { opened:true, measure:"", next:null }
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
const unitLabel = number => number == null ? "Piso completo" : `Habitación ${number}`;
const locationName = room => room.unit === "piso" ? `${room.floor} · piso completo` : `Habitación ${room.number} · ${room.floor}`;
const view = () => location.hash.startsWith("#ciclo/") ? "ciclo" : location.hash.startsWith("#pisos/") ? "pisos" : ["pipeline", "pricing", "pisos", "co-livers", "check-in-out"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "jornada";
const action = (room, type, label, style = "secondary") => `<button type="button" class="${style}" data-action="${type}" data-room="${room.id}">${label}</button>`;
const fields = entries => `<dl class="fields">${entries.map(([label, value]) => `<div><dt>${safe(label)}</dt><dd>${safe(value)}</dd></div>`).join("")}</dl>`;
const heading = (label, intro) => `<header class="page-head"><p class="eyebrow">SALES · DEMOSTRACIÓN DEL 10 NOV 2026</p><h1>${label}</h1><p class="intro">${intro}</p></header>`;
const columns = (...labels) => `<div class="columns" aria-hidden="true">${labels.map(label => `<span>${label}</span>`).join("")}</div>`;
const panel = (title, content, style = "") => `<section class="panel ${style}"><div class="panel-head"><h2>${title}</h2></div>${content}</section>`;
const targetPrice = room => state[room.id].pricing?.target ?? room.target;
const currentTerms = room => [...(registry().contracts["current-" + room.id] ?? [])]
  .filter(contract => ["Firmado","Vigente"].includes(contract.status)).sort((first,second) => second.start.localeCompare(first.start))[0];
const currentRent = room => currentTerms(room)?.rent ?? room.rent;
const contractualExit = room => currentTerms(room)?.end ?? room.exit;
const listingsFor = room => state[room.id].listings ?? room.listings;
const candidatesFor = room => (state[room.id].candidates ?? room.candidates).map(item =>
  item.stage === "Pendiente de depósito" ? { ...item,stage:pendingPaymentsStage } : item);
const nextPayments = room => {
  const next = state[room.id].next;
  return next ? stayPayments({ ...next,id:"next-" + room.id }) : {};
};
const nextPaymentStatus = room => commitmentPayments(nextPayments(room));
const nextStage = room => state[room.id].next?.signed ? "Contrato firmado" : nextPaymentStatus(room).ready ? internalSignatureStage : pendingPaymentsStage;
const missingPaymentLabel = room => "Falta comprobar: " + nextPaymentStatus(room).missing.map(key => key === "deposit" ? "depósito" : "Entry Fee").join(" y ");
const activePrices = room => [...new Set(listingsFor(room).filter(item => item.status === "Activo").map(item => item.price))];
const publishedPriceLabel = room => {
  const prices = activePrices(room);
  return prices.length > 1 ? "Varía por canal" : prices.length ? money.format(prices[0]) + " / mes" : "Sin anuncios activos";
};

function webUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function comparableRow(comparable = {}) {
  return `<div class="comparable-row">
    <label>Enlace al anuncio<input type="url" data-comparable-url maxlength="500" value="${safe(comparable.url ?? "")}" placeholder="https://…"></label>
    <label>Renta mensual (€)<input type="number" data-comparable-rent min=".01" step=".01" value="${safe(comparable.rent ?? "")}"></label>
    <button type="button" class="secondary" data-remove-comparable>Quitar</button>
  </div>`;
}

function pricingDetail(room, standalone = false) {
  const cycle = state[room.id];
  const pricing = cycle.pricing;
  const target = targetPrice(room);
  const comparables = (pricing?.comparables ?? []).filter(item => webUrl(item.url));
  const rents = comparables.map(item => item.rent);
  const range = rents.length ? `${money.format(Math.min(...rents))} – ${money.format(Math.max(...rents))}` : "Sin comparables";
  return `<div>
    ${fields([["Renta anterior",money.format(currentRent(room))],["Precio objetivo",target ? money.format(target) : "Por definir"],["Precio publicado",publishedPriceLabel(room)]])}
    ${pricing ? `<dl class="pricing-context"><div><dt>Comparativa</dt><dd>${safe([pricing.zone,pricing.type,date(pricing.reviewed,true)].filter(Boolean).join(" · "))} · ${range}</dd></div><div><dt>Justificación</dt><dd>${safe(pricing.reason)}</dd></div></dl>` : ""}
    ${comparables.length ? `<ul class="comparable-links">${comparables.map((item,index) => `<li><a href="${safe(webUrl(item.url))}" target="_blank" rel="noopener noreferrer">Comparable ${index + 1} · ${money.format(item.rent)} / mes</a></li>`).join("")}</ul>` : ""}
    ${cycle.opened && !cycle.next && (standalone || target || risk(room)[0] === "red") ? action(room,"pricing",pricing ? "Editar pricing" : "Abrir pricing") : ""}
  </div>`;
}

function risk(room) {
  if (state[room.id].renewal?.status === "Renovación firmada") return ["green", "Sin riesgo · renovada"];
  if (state[room.id].next?.signed) return ["green", "Sin riesgo · contrato firmado"];
  if (nextPaymentStatus(room).ready) return ["green", "Sin riesgo · pagos comprobados"];
  return dayDiff(demoDay, contractualExit(room)) <= 45 ? ["red", "Riesgo de vacío"] : ["amber", "Seguimiento comercial"];
}

function pricingView() {
  const ordered = [...rooms].sort((first,second) => Number(Boolean(targetPrice(first))) - Number(Boolean(targetPrice(second))));
  return heading("Pricing","Consulta la renta anterior, guarda comparables y fija un precio objetivo por unidad y ciclo.") +
    `<div class="stack pricing-board">${ordered.map(room => {
      const cycle = state[room.id];
      const next = !cycle.opened ? `<a class="text-button" href="#ciclo/${room.id}" data-origin="pipeline">Abrir la ficha del ciclo</a>`
        : listingsFor(room).length ? action(room,"publication","Gestionar anuncios")
        : !cycle.next && targetPrice(room) ? action(room,"publication","Preparar publicación") : "";
      return `<section class="panel">
        <div class="panel-head"><h2>${locationName(room)}</h2><span class="muted">${cycle.next ? nextStage(room) : targetPrice(room) ? "Precio objetivo definido" : "Precio objetivo pendiente"}</span></div>
        <div class="pricing-room">${pricingDetail(room,true)}${next}</div>
      </section>`;
    }).join("")}</div>`;
}

const personKey = name => Object.hasOwn(people,name) ? people[name][0] : null;
const nextPersonKey = (next,room) => next.candidateId ? "candidate-" + next.candidateId : personKey(next.name) ?? "next-" + room.id;
const nextDisplayName = room => {
  const next = state[room.id].next;
  return registry().people[nextPersonKey(next,room)]?.name ?? next.name;
};
const directoryToken = value => value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const stayBadge = status => `<span class="stay-status ${({ Actual:"current", "Próxima":"next", Anterior:"past" })[status] ?? "past"}">${status}</span>`;

function directoryProfiles() {
  const records = registry();
  const profiles = new Map();
  function add(key,name,stay,profile = []) {
    if (!profiles.has(key)) {
      const fields = { ...originalProfile(name,profile),...records.people[key] };
      profiles.set(key,{ key,name:fields.name,profile:fields,stays:[] });
    }
    if (stay) profiles.get(key).stays.push(stay);
  }
  for (const room of rooms) {
    const { floor,number,rent,entry,exit,resident } = room;
    const cycle = state[room.id];
    const currentId = "current-" + room.id;
    const nextId = "next-" + room.id;
    add(personKey(resident),resident,{ floor,number,rent,entry,exit,...cycle.currentDates,...records.stays[currentId],id:currentId,link:"current",
      contractStart:entry,contractExit:exit,roomId:room.id,deposit:rent,status:"Actual",contract:"Vigente" },people[resident]);
    const next = cycle.next;
    if (next) add(nextPersonKey(next,room),next.name,{ ...next,...records.stays[nextId],id:nextId,link:"next",floor,number,roomId:room.id,status:"Próxima",contract:next.signed ? "Firmado" : "Firma pendiente" },
      !next.candidateId && personKey(next.name) ? people[next.name] : []);
  }
  for (const [index,stay] of previousStays.entries()) {
    const id = "past-" + index;
    const roomId = rooms.find(room => room.floor === stay.floor && room.number === stay.number)?.id ?? "archive-" + index;
    add(personKey(stay.name),stay.name,{ ...stay,roomId,status:"Anterior",contract:"Finalizado",returned:true,...records.stays[id],id },people[stay.name]);
  }
  for (const [key,profile] of Object.entries(records.people)) add(key,profile.name);
  for (const [id,stay] of Object.entries(records.stays)) {
    const person = profiles.get(stay.personKey);
    if (id.startsWith("stay-") && person) person.stays.push({ ...stay,id });
  }
  const order = { Actual:0, "Próxima":1, Anterior:2 };
  for (const person of profiles.values()) person.stays.sort((first,second) => order[first.status] - order[second.status] || second.entry.localeCompare(first.entry));
  return profiles;
}

function agendaEvents() {
  return [...directoryProfiles().values()].flatMap(person => person.stays.flatMap(stay => [
    { type:"in", day:stay.entry, person, stay },{ type:"out", day:stay.exit, person, stay }
  ])).filter(event => event.day).sort((first,second) => first.day.localeCompare(second.day));
}

function agendaView() {
  const events = agendaEvents();
  if (!agendaMonth) {
    agendaDay = events.find(event => event.day >= demoDay)?.day ?? demoDay;
    agendaMonth = agendaDay.slice(0,7);
  }
  const monthEvents = events.filter(event => event.day.startsWith(agendaMonth + "-"));
  const dayEvents = monthEvents.filter(event => event.day === agendaDay);
  const firstDay = new Date(agendaMonth + "-01");
  const offset = (firstDay.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(firstDay.getUTCFullYear(),firstDay.getUTCMonth() + 1,0)).getUTCDate();
  const emptyCell = '<span class="agenda-blank" aria-hidden="true"></span>';
  const cells = Array.from({length:days},(_,index) => {
    const day = agendaMonth + "-" + String(index + 1).padStart(2,"0");
    const entries = monthEvents.filter(event => event.day === day && event.type === "in").length;
    const exits = monthEvents.filter(event => event.day === day && event.type === "out").length;
    return `<button type="button" class="agenda-day" data-agenda-day="${day}" aria-pressed="${day === agendaDay}" aria-label="${date(day,true)}, ${entries} check-in${entries === 1 ? "" : "s"}, ${exits} check-out${exits === 1 ? "" : "s"}">
      <span>${index + 1}</span><span class="agenda-marks" aria-hidden="true">${entries ? `<span class="agenda-in">${entries}</span>` : ""}${exits ? `<span class="agenda-out">${exits}</span>` : ""}</span>
    </button>`;
  }).join("");
  return heading("Check-in / Check-out","Consulta las fechas de check-in y check-out. Para registrarlas o cambiarlas, abre Base Datos Co-livers.") + `
    <div class="stack">
      <section class="panel agenda" aria-label="Calendario mensual">
        <div class="panel-head agenda-head"><button type="button" class="secondary" data-agenda-month="-1" aria-label="Mes anterior">‹</button>
          <h2>${monthDate.format(firstDay)}</h2><button type="button" class="secondary" data-agenda-month="1" aria-label="Mes siguiente">›</button></div>
        <div class="agenda-grid">
          ${["L","M","X","J","V","S","D"].map(label => `<span class="agenda-weekday" aria-hidden="true">${label}</span>`).join("")}
          ${emptyCell.repeat(offset)}${cells}${emptyCell.repeat((7 - (offset + days) % 7) % 7)}
        </div>
        <div class="agenda-legend"><span class="agenda-in">Check-in</span><span class="agenda-out">Check-out</span><small>Fechas de la ficha de estancia</small></div>
      </section>
      ${panel(date(agendaDay,true),dayEvents.length ? dayEvents.map(({type,person,stay}) => `<div class="notice">
        <div><span class="${type === "in" ? "agenda-in" : "agenda-out"}">${type === "in" ? "Check-in" : "Check-out"}</span>
        <strong> ${safe(person.name)}</strong><small>${safe(stay.floor)} · ${unitLabel(stay.number)} · ${stay.link === "next" ? nextStage(rooms.find(room => room.id === stay.roomId)) : stay.status === "Anterior" ? "Histórico" : "Fecha de estancia"}</small></div>
        <button type="button" class="text-button" data-resident="${safe(person.key)}">Abrir ficha</button></div>`).join("") : '<p class="empty">No hay check-ins ni check-outs para este día.</p>')}
    </div>`;
}

function directoryView() {
  return heading("Base Datos Co-livers","Busca un residente y consulta sus estancias y contratos desde una sola ficha.") + `
    <div class="directory-controls"><div class="directory-toolbar">
      <label>Buscar residente<input type="search" id="resident-search" placeholder="Nombre, piso o habitación" value="${safe(directoryFilter.query)}"></label>
      <label>Mostrar<select id="resident-scope">
        <option value="current" ${directoryFilter.scope === "current" ? "selected" : ""}>Actuales y próximos</option>
        <option value="old" ${directoryFilter.scope === "old" ? "selected" : ""}>Anteriores</option>
        <option value="all" ${directoryFilter.scope === "all" ? "selected" : ""}>Todos</option>
      </select></label>
    </div>${recordButton("profile","Añadir residente","","","","primary")}</div>
    <p class="directory-count muted" id="resident-count" role="status"></p>
    <section class="panel directory-list" aria-label="Directorio de residentes">
      <table aria-label="Base Datos Co-livers">
        <thead><tr><th scope="col">Nombre</th><th scope="col" class="directory-desktop">Piso</th><th scope="col" class="directory-desktop">Habitación</th><th scope="col">Estado de la estancia</th></tr></thead>
        <tbody id="resident-rows"></tbody>
      </table>
    </section>`;
}

function renderDirectoryRows() {
  const query = directoryToken(directoryFilter.query.trim());
  const visible = [...directoryProfiles().values()].filter(person => {
    const stay = person.stays[0];
    return (directoryFilter.scope === "all" || (directoryFilter.scope === "old") === (stay?.status === "Anterior")) &&
      directoryToken(stay ? `${person.name} ${stay.floor} habitación ${stay.number}` : person.name).includes(query);
  });
  document.querySelector("#resident-count").textContent = visible.length + (visible.length === 1 ? " residente" : " residentes");
  document.querySelector("#resident-rows").innerHTML = visible.length ? visible.map(person => {
    const stay = person.stays[0];
    return `<tr>
      <td><button class="text-button resident-name" type="button" data-resident="${safe(person.key)}" aria-haspopup="dialog">${safe(person.name)}</button>${stay ? `<small class="directory-mobile">${safe(stay.floor)} · Hab. ${stay.number}</small>` : ""}</td>
      <td class="directory-desktop">${safe(stay?.floor ?? "—")}</td><td class="directory-desktop">${stay?.number ?? "—"}</td><td>${stayBadge(stay?.status ?? "Sin estancia")}</td>
    </tr>`;
  }).join("") : '<tr><td colspan="4">No hay residentes que coincidan.</td></tr>';
}

function render() {
  const active = view();
  main.innerHTML = ({ jornada:jornadaView, pipeline:pipelineView, ciclo:cycleView, pricing:pricingView, pisos:pisosView, "co-livers":directoryView, "check-in-out":agendaView })[active]();
  if (active === "co-livers") renderDirectoryRows();
  if (active === "ciclo") afterCycleRender();
  if (active === "co-livers" && pendingResident) {
    const key = pendingResident;
    pendingResident = "";
    showResident(key,main.querySelector(`[data-resident="${CSS.escape(key)}"]`));
  }
  const navActive = active === "ciclo" ? (cycleOrigin === "jornada" ? "jornada" : cycleOrigin === "co-livers" ? "co-livers" : "pipeline") : active;
  for (const link of document.querySelectorAll("nav a")) {
    if (link.hash === "#" + navActive) link.setAttribute("aria-current","page");
    else link.removeAttribute("aria-current");
  }
}

function announce(message, persisted = true) {
  feedback.textContent = message + (persisted ? "" : " El navegador solo guardará este cambio mientras la página siga abierta.");
}

function show(title, context, content, trigger) {
  dialogTrigger = trigger;
  document.querySelector("#dialog-title").textContent = title;
  document.querySelector("#dialog-context").textContent = context;
  dialogBody.innerHTML = content;
  if (!dialog.open) dialog.showModal();
  else dialog.querySelector(".dialog-head button").focus();
  dialog.scrollTop = 0;
}

function showResident(key,trigger) {
  const person = directoryProfiles().get(key);
  if (!person) return;
  const editable = view() === "co-livers";
  show(person.name,"Ficha del residente",`
    <section><div class="registry-heading"><h3>Datos personales</h3>${editable ? recordButton("profile","Editar perfil",key) : ""}</div>${fields(profileFields.map(([name,label]) => [label,person.profile[name] || null]))}</section>
    <section><div class="registry-heading"><h3>Estancias y contratos</h3>${editable ? recordButton("stay","Añadir estancia",key) : ""}</div>
      ${person.stays.length ? "" : '<p class="muted">Este residente todavía no tiene estancias.</p>'}
      ${person.stays.map(stay => {
      const contract = latestContract(stay);
      const payments = stayPayments(stay);
      const rent = contract?.rent ?? stay.rent;
      const deposit = payments.refund?.status === "Comprobado" && payments.refund.amount === payments.deposit?.amount
        ? paymentText(payments.refund,"Devuelto") : paymentText(payments.deposit,"Pagado");
      return `<article class="resident-stay">
      <p><strong>${safe(stay.floor)} · ${unitLabel(stay.number)}</strong> ${stayBadge(stay.status)}</p>
      ${fields([["Check-in",date(stay.entry,true)],["Check-out",date(stay.exit,true)],["Renta",rent == null ? null : money.format(rent) + " / mes"],["Depósito",deposit],
        ["Contrato",stay.link === "next" && !stay.signed ? commitmentPayments(payments).ready ? internalSignatureStage : pendingPaymentsStage : contract?.status ?? stay.contract ?? "Sin registrar"],
        ...(contract?.end && contract.end !== stay.exit ? [["Fin contractual",date(contract.end,true)]] : [])])}
      ${editable ? recordButton("stay","Editar estancia",key,stay.id) : ""}
      ${residentCycleLinks(stay,editable,key)}
      <details class="registry-group"><summary>Contratos${stayContracts(stay).length ? " · " + stayContracts(stay).length : ""}</summary>
        ${stayContracts(stay).map(item => `<div class="registry-record">${fields([["Referencia",item.reference || null],["Estado",item.status],["Fecha de firma",item.signedOn ? date(item.signedOn,true) : null],["Inicio contractual",date(item.start,true)],["Fin contractual",date(item.end,true)],["Duración (meses)",item.months],["Renta",money.format(item.rent) + " / mes"],["Condiciones o notas",item.terms || null]])}${editable ? recordButton("contract","Editar contrato",key,stay.id,item.id) : ""}</div>`).join("")}
        ${editable ? recordButton("contract","Añadir contrato",key,stay.id) : ""}
      </details>
      <details class="registry-group"><summary>Importes y comprobaciones</summary>
        ${paymentFields.map(([name,label]) => {
          const payment = payments[name];
          return `<div class="registry-record"><h4>${label}</h4>${fields([["Importe y estado",paymentText(payment,name === "refund" ? "Devuelto" : "Pagado")],["Fecha de comprobación",payment?.on ? date(payment.on,true) : null],["Referencia del comprobante",payment?.proof || null]])}</div>`;
        }).join("")}${editable ? recordButton("payments","Editar importes",key,stay.id) : ""}
      </details>
      <details class="registry-group"><summary>Seguimiento y notas</summary>${fields(followUpFields.map(([name,label]) => [label,stay[name] || null]))}</details>
    </article>`;
    }).join("")}</section>`,trigger);
}

function formFor(type, room, trigger) {
  if (cycleForm(type, room, trigger)) return;
  const cycle = state[room.id];
  const next = cycle.next;
  if (type === "candidate" && cycle.opened) {
    const id = trigger.dataset.candidate;
    const candidate = id ? candidatesFor(room).find(item => item.id === id) : null;
    if (id && (!candidate || next?.candidateId === id)) return;
    const closed = candidate?.stage === closedStage;
    show(candidate ? "Editar candidato" : "Añadir candidato",locationName(room),`
      <p class="muted">Usa un nombre ficticio para esta prueba.</p>
      <form data-form="candidate" data-room="${room.id}" data-candidate="${safe(candidate?.id ?? "")}">
        <label>Nombre del candidato<input name="name" maxlength="100" value="${safe(candidate?.name ?? "")}" required></label>
        <div class="fields">
          <label>Canal de origen<select name="channel" required><option value="">Selecciona un canal</option>${candidateChannels.map(channel => `<option ${channel === candidate?.channel ? "selected" : ""}>${channel}</option>`).join("")}</select></label>
          <label>Etapa<select name="stage" required>${candidateStages.map(stage => `<option ${stage === candidate?.stage ? "selected" : ""}>${stage}</option>`).join("")}</select></label>
        </div>
        <label ${closed ? "hidden" : ""}>Próxima acción<input name="nextAction" maxlength="200" value="${safe(candidate?.nextAction ?? "")}" ${closed ? "disabled" : ""}></label>
        <label ${closed ? "" : "hidden"}>Motivo de cierre<textarea name="reason" rows="3" maxlength="300" ${closed ? "required" : "disabled"}>${safe(candidate?.reason ?? "")}</textarea></label>
        <button type="submit">Guardar candidato</button>
      </form>`,trigger);
  } else if (type === "pricing" && cycle.opened && !next) {
    const pricing = cycle.pricing;
    show("Pricing de la habitación",locationName(room),`
      ${fields([["Renta anterior",money.format(currentRent(room)) + " / mes"],["Precio publicado",publishedPriceLabel(room)]])}
      <form data-form="pricing" data-room="${room.id}">
        <div class="fields">
          <label>Zona<input name="zone" maxlength="80" value="${safe(pricing?.zone ?? "")}"></label>
          <label>Tipología<input name="type" maxlength="80" value="${safe(pricing?.type ?? "Habitación")}"></label>
          <label>Fecha de revisión<input name="reviewed" type="date" value="${safe(pricing?.reviewed ?? demoDay)}" required></label>
        </div>
        <fieldset class="comparables"><legend>Anuncios comparables</legend>
          <p class="muted">Puedes guardar el objetivo sin comparables. Si añades un anuncio, indica su enlace y renta mensual.</p>
          <div data-comparables>${(pricing?.comparables?.length ? pricing.comparables : [{}]).map(comparableRow).join("")}</div>
          <button type="button" class="secondary" data-add-comparable>Añadir comparable</button>
        </fieldset>
        <label>Precio objetivo (€ / mes)<input name="target" type="number" min=".01" step=".01" value="${safe(targetPrice(room) ?? "")}" required></label>
        <label>Justificación<textarea name="reason" rows="3" maxlength="500" required>${safe(pricing?.reason ?? "")}</textarea></label>
        <button type="submit">Guardar precio objetivo</button>
      </form>`,trigger);
  } else if (type === "publication" && cycle.opened && (targetPrice(room) || listingsFor(room).length)) {
    const existing = listingsFor(room)[0];
    const target = targetPrice(room);
    show(existing ? "Gestionar anuncios" : "Preparar publicación",locationName(room),`
      ${fields([["Precio objetivo",target ? money.format(target) + " / mes" : "Por definir"],["Disponible para check-in desde",date(room.ready,true)],["Precio publicado",publishedPriceLabel(room)]])}
      <p class="muted">Registra aquí el anuncio que Sales publica manualmente en el canal. Seleccionar un canal ya registrado permite actualizar su ficha.</p>
      <form data-form="publication" data-room="${room.id}">
        <div class="fields">
          <label>Canal<select name="channel" required><option value="">Selecciona un canal</option>${channels.map(channel => `<option ${channel === existing?.channel ? "selected" : ""}>${channel}</option>`).join("")}</select></label>
          <label>Estado<select name="status" required>${listingStatuses.map(status => `<option ${status === existing?.status ? "selected" : ""}>${status}</option>`).join("")}</select></label>
          <label>Fecha de publicación<input name="publishedOn" type="date" value="${existing?.publishedOn ?? demoDay}" required></label>
        </div>
        <label>Enlace al anuncio<input name="url" type="url" maxlength="500" placeholder="https://…" value="${safe(existing?.url ?? "")}" required></label>
        <label>Precio anunciado (€ / mes)<input name="price" type="number" min=".01" step=".01" value="${safe(existing?.price ?? target ?? "")}" required></label>
        <button type="submit">Guardar anuncio</button>
      </form>`,trigger);
  } else if (type === "measure") {
    show("Registrar medida",locationName(room),`<form data-form="measure" data-room="${room.id}"><label>Medida tomada<textarea name="note" required maxlength="300" rows="3"></textarea></label><button type="submit">Guardar medida</button></form>`,trigger);
  } else if (type === "deposit" && !next && cycle.opened) {
    const pending = candidatesFor(room).filter(candidate => candidate.stage === pendingPaymentsStage);
    show("Registrar depósito y Entry Fee",locationName(room),`<p>Registra ambos cobros de prueba. Al confirmarlos, la unidad queda comprometida y KALI puede firmar internamente.</p>
      <form data-form="deposit" data-room="${room.id}">
        <label>Candidato<select name="candidate" required>${pending.map(item => `<option value="${safe(item.id)}">${safe(item.name)}</option>`).join("")}<option value="demo">Andrea Ejemplo (simulación)</option></select></label>
        <div class="fields"><label>Depósito pagado (€)<input name="deposit" type="number" min=".01" step=".01" value="${room.target ?? room.rent}" required></label><label>Entry Fee pagado (€)<input name="entryFee" type="number" min=".01" step=".01" required></label><label>Renta mensual (€)<input name="rent" type="number" min="1" step=".01" value="${activePrices(room).length === 1 ? activePrices(room)[0] : activePrices(room).length > 1 ? "" : targetPrice(room) ?? room.rent}" required></label><label>Check-in previsto<input name="entry" type="date" min="${room.ready ?? room.exit}" value="${room.ready ?? ""}" required></label><label>Check-out previsto<input name="exit" type="date" required></label></div><button type="submit">Confirmar ambos pagos de prueba</button></form>`,trigger);
  } else if (type === "payment-check" && next && !next.signed && !nextPaymentStatus(room).ready) {
    pendingResident = nextPersonKey(next,room);
    location.hash = "co-livers";
  } else if (type === "signature" && next && !next.signed && nextPaymentStatus(room).ready) {
    const payments = nextPayments(room);
    show("Registrar firma interna",locationName(room),`${fields([["Inquilino",nextDisplayName(room)],["Depósito",paymentText(payments.deposit,"Pagado")],["Entry Fee",paymentText(payments.entryFee,"Pagado")],["Check-in",date(next.entry,true)]])}
      <form data-form="signature" data-room="${room.id}"><label>Referencia del contrato<input name="reference" required maxlength="48" value="DEMO-${room.id.toUpperCase()}"></label><p class="muted">Registra la firma de los documentos por KALI. La referencia queda vinculada a la estancia en Base Datos Co-livers.</p><button type="submit">Guardar firma interna</button></form>`,trigger);
  }
}

main.addEventListener("click", event => {
  const record = event.target.closest("[data-record]");
  if (record) return registryForm(record);
  const monthButton = event.target.closest("[data-agenda-month]");
  const dayButton = event.target.closest("[data-agenda-day]");
  if (monthButton || dayButton) {
    if (monthButton) {
      const month = new Date(agendaMonth + "-01");
      month.setUTCMonth(month.getUTCMonth() + Number(monthButton.dataset.agendaMonth));
      agendaMonth = month.toISOString().slice(0,7);
      agendaDay = agendaEvents().find(item => item.day.startsWith(agendaMonth + "-"))?.day ?? agendaMonth + "-01";
    } else {
      agendaDay = dayButton.dataset.agendaDay;
    }
    render();
    if (monthButton) main.querySelector(`[data-agenda-month="${monthButton.dataset.agendaMonth}"]`)?.focus();
    else main.querySelector(`[data-agenda-day="${agendaDay}"]`)?.focus();
    return;
  }
  const residentButton = event.target.closest("[data-resident]");
  if (residentButton) return showResident(residentButton.dataset.resident,residentButton);
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const room = rooms.find(item => item.id === trigger.dataset.room);
  const type = trigger.dataset.action;
  if (type === "open") {
    if (state[room.id].opened) return;
    state[room.id].opened = true;
    announce("Ciclo abierto. La tarea del radar queda cerrada.",save());
    render();
  } else if (type === "resident") {
    const next = state[room.id].next;
    showResident(next ? nextPersonKey(next,room) : personKey(room.resident),trigger);
  } else {
    formFor(type,room,trigger);
  }
});

main.addEventListener("input", event => {
  if (event.target.id !== "resident-search") return;
  directoryFilter.query = event.target.value;
  renderDirectoryRows();
});
main.addEventListener("change", event => {
  if (event.target.id !== "resident-scope") return;
  directoryFilter.scope = event.target.value;
  renderDirectoryRows();
});

dialogBody.addEventListener("submit", event => {
  const form = event.target;
  if (!form.dataset.form) return;
  event.preventDefault();
  const cycle = state[form.dataset.room];
  const values = Object.fromEntries(new FormData(form));
  let message;
  if (form.dataset.form === "registry") {
    const result = saveRegistryForm(form,values);
    if (!result) return;
    const persisted = save();
    if (!form.dataset.person) {
      directoryFilter.query = "";
      directoryFilter.scope = "current";
    }
    render();
    const trigger = main.querySelector(`[data-resident="${CSS.escape(result.residentKey)}"]`) ?? main.querySelector('[data-record="profile"]');
    showResident(result.residentKey,trigger);
    announce(result.message,persisted);
    return;
  }
  if (form.dataset.form === "candidate") {
    const room = rooms.find(item => item.id === form.dataset.room);
    const previous = candidatesFor(room);
    const id = form.dataset.candidate;
    if (!cycle.opened || (id && (!previous.some(item => item.id === id) || cycle.next?.candidateId === id))) return;
    if (!candidateChannels.includes(values.channel) || !candidateStages.includes(values.stage)) return;
    if (!values.name.trim()) return invalid(form.elements.name,"Indica un nombre para la candidatura.");
    const closed = values.stage === closedStage;
    if (closed && !values.reason.trim()) return invalid(form.elements.reason,"Indica por qué se cerró la candidatura.");
    const candidate = { id:id || crypto.randomUUID(), name:values.name.trim(), channel:values.channel, stage:values.stage,
      nextAction:closed ? "" : values.nextAction.trim(), reason:closed ? values.reason.trim() : "" };
    cycle.candidates = id ? previous.map(item => item.id === id ? candidate : item) : [...previous,candidate];
    message = closed ? "Candidatura cerrada. El motivo queda en el historial." : "Candidato guardado en el pipeline.";
  } else if (form.dataset.form === "pricing") {
    if (!cycle.opened || cycle.next) return;
    if (!values.reason.trim()) return invalid(form.elements.reason,"Explica brevemente cómo fijaste el precio.");
    const comparables = [];
    for (const row of form.querySelectorAll(".comparable-row")) {
      const link = row.querySelector("[data-comparable-url]");
      const rent = row.querySelector("[data-comparable-rent]");
      if (!link.value && !rent.value) continue;
      const url = webUrl(link.value);
      if (!url) return invalid(link,"Introduce un enlace válido que empiece por https:// o http://.");
      if (!rent.value) return invalid(rent,"Introduce la renta mensual del anuncio.");
      comparables.push({ url, rent:Number(rent.value) });
    }
    cycle.pricing = { target:Number(values.target), reason:values.reason.trim(), zone:values.zone.trim(), type:values.type.trim(), reviewed:values.reviewed, comparables };
    message = "Precio objetivo guardado en el pipeline.";
  } else if (form.dataset.form === "publication") {
    const room = rooms.find(item => item.id === form.dataset.room);
    const previous = listingsFor(room);
    if (!cycle.opened || (!targetPrice(room) && !previous.length)) return;
    if (!channels.includes(values.channel) || !listingStatuses.includes(values.status)) return;
    const url = webUrl(values.url);
    if (!url) return invalid(form.elements.url,"Introduce un enlace válido que empiece por https:// o http://.");
    const listing = { channel:values.channel, status:values.status, url, price:Number(values.price), publishedOn:values.publishedOn };
    cycle.listings = channels.flatMap(channel => channel === listing.channel ? [listing] : previous.filter(item => item.channel === channel));
    message = "Anuncio guardado en " + listing.channel + ".";
  } else if (form.dataset.form === "measure") {
    if (!values.note.trim()) return invalid(form.elements.note,"Escribe la medida tomada.");
    cycle.measure = values.note.trim();
    cycle.measures = [...measuresFor(rooms.find(item => item.id === form.dataset.room)), { on:demoDay, note:cycle.measure }];
    message = "Medida registrada. El riesgo sigue visible hasta comprobar el depósito y el Entry Fee.";
  } else if (form.dataset.form === "deposit") {
    if (cycle.next || !cycle.opened) return;
    if (values.exit <= values.entry) return invalid(form.elements.exit,"El check-out debe ser posterior al check-in.");
    const room = rooms.find(item => item.id === form.dataset.room);
    if (conflictingStay(room.id,values.entry,values.exit)) return invalid(form.elements.exit,"La habitación ya tiene otra estancia en esas fechas.");
    const candidate = candidatesFor(room).find(item => item.id === values.candidate && item.stage === pendingPaymentsStage);
    if (values.candidate !== "demo" && !candidate) return invalid(form.elements.candidate,"Selecciona un candidato pendiente de pagos.");
    cycle.next = { name:candidate?.name ?? "Andrea Ejemplo", candidateId:candidate?.id ?? null, rent:Number(values.rent), deposit:Number(values.deposit), entryFee:Number(values.entryFee), paid:demoDay, entry:values.entry, exit:values.exit, signed:null, reference:null };
    message = "Depósito y Entry Fee comprobados. Unidad comprometida y pendiente de firma interna.";
  } else if (["renewalOffer","renewalResponse","renewalSign","closeNoSign"].includes(form.dataset.form)) {
    message = cycleSubmit(form,values,cycle);
    if (!message) return;
  } else if (form.dataset.form === "signature") {
    if (!cycle.next || cycle.next.signed) return;
    const room = rooms.find(item => item.id === form.dataset.room);
    if (!nextPaymentStatus(room).ready) return invalid(form.elements.reference,"Comprueba el depósito y el Entry Fee antes de registrar la firma interna.");
    if (!values.reference.trim()) return invalid(form.elements.reference,"Escribe la referencia del contrato.");
    cycle.next.signed = demoDay;
    cycle.next.reference = values.reference.trim();
    cycle.next.contractExit = cycle.next.exit;
    const contracts = registry().contracts["next-" + form.dataset.room];
    if (contracts) {
      const draft = contracts.find(item => item.reference === cycle.next.reference && item.status === "Pendiente de firma");
      if (draft) {
        draft.signedOn = demoDay;
        draft.status = "Firmado";
        Object.assign(cycle.next,{ contractExit:draft.end,rent:draft.rent });
      } else {
        contracts.push({ id:"contract-" + crypto.randomUUID(),reference:cycle.next.reference,status:"Firmado",signedOn:demoDay,
          start:cycle.next.entry,end:cycle.next.exit,rent:cycle.next.rent });
      }
    }
    message = "Firma interna registrada en la ficha de la estancia.";
  } else return;
  const persisted = save();
  dialog.close();
  render();
  announce(message,persisted);
  const residentKey = dialogTrigger?.dataset.resident;
  const focusTarget = residentKey ? `[data-resident="${CSS.escape(residentKey)}"]` : `[data-room="${form.dataset.room}"]`;
  main.querySelector(focusTarget)?.focus();
});

function invalid(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
}

dialogBody.addEventListener("input", event => {
  const input = event.target;
  input.setCustomValidity?.("");
  if (["entry","room"].includes(input.name)) input.form?.elements.exit?.setCustomValidity("");
  if (input.name === "start") input.form?.elements.end?.setCustomValidity("");
  if (input.name === "depositAmount") input.form?.elements.refundAmount?.setCustomValidity("");
  if (input.name.endsWith("Status")) input.form?.elements[input.name.replace(/Status$/,"Amount")]?.setCustomValidity("");
});
dialogBody.addEventListener("change", event => {
  const form = event.target.form;
  if (event.target.name === "stage" && form?.dataset.form === "candidate") {
    const closed = event.target.value === closedStage;
    form.elements.reason.closest("label").hidden = !closed;
    form.elements.reason.disabled = !closed;
    form.elements.reason.required = closed;
    form.elements.nextAction.closest("label").hidden = closed;
    form.elements.nextAction.disabled = closed;
    return;
  }
  if (event.target.name !== "channel" || form?.dataset.form !== "publication") return;
  const room = rooms.find(item => item.id === form.dataset.room);
  const listing = listingsFor(room).find(item => item.channel === event.target.value);
  form.elements.status.value = listing?.status ?? "Activo";
  form.elements.publishedOn.value = listing?.publishedOn ?? demoDay;
  form.elements.price.value = listing?.price ?? targetPrice(room) ?? "";
  form.elements.url.value = listing?.url ?? "";
  form.elements.url.setCustomValidity("");
});
dialogBody.addEventListener("click", event => {
  const record = event.target.closest("[data-record]");
  if (record?.dataset.record === "back") return showResident(record.dataset.person,dialogTrigger);
  if (record) return registryForm(record);
  const add = event.target.closest("[data-add-comparable]");
  const remove = event.target.closest("[data-remove-comparable]");
  if (add) {
    const list = dialogBody.querySelector("[data-comparables]");
    list.insertAdjacentHTML("beforeend",comparableRow());
    list.lastElementChild.querySelector("input").focus();
  } else if (remove) {
    remove.closest(".comparable-row").remove();
    dialogBody.querySelector("[data-add-comparable]").focus();
  }
});
dialog.addEventListener("close", () => {
  if (dialogTrigger?.isConnected) dialogTrigger.focus();
});
window.addEventListener("hashchange", () => {
  render();
  if (view() !== "ciclo") main.focus();
});
document.querySelector("#reset").addEventListener("click", event => {
  show("Reiniciar demostración","PILOTO LOCAL",'<p>Se eliminarán los cambios de prueba de este navegador.</p><form method="dialog"><button value="reset">Restaurar datos de ejemplo</button></form>',event.currentTarget);
});
dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "reset") return;
  dialog.returnValue = "";
  state = seed();
  agendaMonth = "";
  agendaDay = "";
  const persisted = save();
  if (view() === "jornada") render();
  else location.hash = "jornada";
  announce("Datos de ejemplo restaurados.",persisted);
});
render();
