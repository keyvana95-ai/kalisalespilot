"use strict";

/* Ficha del ciclo comercial y Pipeline por pisos (propuesta 10-11-2026, pendiente de validar con Lorenzo). */

/* Catálogo único de pisos. Normaliza las distintas formas de escribir un piso
   (dobles espacios, "Calle", abreviaturas) y fija cómo se comercializa:
   por habitaciones o como piso completo. Hipótesis: un piso completo es una sola unidad con un solo ciclo. */
const floorCatalog = [
  { name:"Piso Centro", mode:"habitaciones", aliases:["centro","calle centro"] },
  { name:"Piso Norte", mode:"habitaciones", aliases:["norte","calle norte"] },
  { name:"Piso Sur", mode:"completo", aliases:["sur","calle sur"] }
];
const floorKey = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").replace(/^(calle|paseo de la|paseo|piso) /,"").trim();
function catalogFloor(value) {
  const key = floorKey(value);
  return floorCatalog.find(item => floorKey(item.name) === key || item.aliases.some(alias => floorKey(alias) === key))
    ?? { name:String(value ?? "Sin piso").replace(/\s+/g," ").trim(), mode:"habitaciones", aliases:[] };
}
const isWholeFloor = room => room.unit === "piso";
const unitWord = room => isWholeFloor(room) ? "el piso" : "la habitación";
const leaverLabel = room => isWholeFloor(room) ? "Titular saliente" : "Residente saliente";

const cycleBlocks = { comercializacion:"Comercialización", candidaturas:"Candidaturas y renovación", cierre:"Cierre" };
const renewalSeed = {
  "centro-1": { status:"Rechazada", price:730, sentOn:"2026-10-20", respondedOn:"2026-10-24" },
  "centro-2": { status:"Oferta enviada", price:750, sentOn:"2026-11-06" },
  "centro-3": { status:"En espera", price:740, sentOn:"2026-10-15", requestedOn:"2026-11-09" },
  "norte-1": { status:"Sin oferta" },
  "norte-2": { status:"Oferta enviada", price:710, sentOn:"2026-11-04" }
};
const pendingTerm = 7;
let cycleOrigin = "pipeline";
let pendingResident = "";

const addDays = (day, days) => new Date(Date.parse(day) + days * 86400000).toISOString().slice(0,10);
const renewalFor = room => state[room.id].renewal ?? renewalSeed[room.id] ?? { status:"Sin oferta" };
const measuresFor = room => state[room.id].measures ?? (state[room.id].measure ? [{ on:demoDay, note:state[room.id].measure }] : []);
const historyFor = room => state[room.id].history ?? [];
const cycleRoute = () => location.hash.slice(1).split("/");
const cycleLink = (room, block = "") => `#ciclo/${room.id}${block ? "/" + block : ""}`;
const pendingDecision = '<span class="pending-tag">Plazo pendiente de Lorenzo</span>';

function ensureRegistry() {
  state.registry ??= { people:{}, stays:{}, contracts:{}, payments:{} };
  return state.registry;
}

function cycleStage(room) {
  const cycle = state[room.id];
  const renewal = renewalFor(room);
  if (!cycle.opened) return "Aviso T−60";
  if (renewal.status === "Renovación firmada") return "Renovada";
  if (cycle.next?.signed) return "Contrato firmado";
  if (cycle.next) return nextPaymentStatus(room).ready ? "Comprometida · firma interna pendiente" : pendingPaymentsStage;
  if (renewal.status === "Aceptada") return "Renovación aceptada";
  if (candidatesFor(room).some(item => item.stage === pendingPaymentsStage)) return pendingPaymentsStage;
  if (activePrices(room).length) return "En comercialización";
  if (targetPrice(room)) return "Precio fijado";
  return "Ciclo abierto";
}

/* Una sola acción principal: la primera condición que se cumple. */
function primaryStep(room) {
  const cycle = state[room.id];
  const renewal = renewalFor(room);
  const days = dayDiff(demoDay, contractualExit(room));
  if (!cycle.opened) return { type:"open", label:"Abrir ciclo", block:"", why:`El fin contractual llega a ${days} días. Abre el ciclo para empezar el pricing y la comercialización.` };
  if (renewal.status === "Renovación firmada" || cycle.next?.signed) return null;
  if (cycle.next) {
    if (!nextPaymentStatus(room).ready) return { type:"payment-check", label:"Revisar pagos", block:"cierre", why:missingPaymentLabel(room) + ". Comprueba ambos pagos en Base Datos Co-livers." };
    return { type:"signature", label:"Registrar firma interna", block:"cierre", why:"Depósito y Entry Fee comprobados. KALI firma los documentos internamente." };
  }
  if (renewal.status === "Aceptada") return { type:"renewalSign", label:"Registrar firma de renovación", block:"candidaturas", why:"El residente aceptó la renovación. El check-out solo cambia al firmar.", decision:true };
  if (risk(room)[0] === "red" && !measuresFor(room).length) return { type:"measure", label:"Registrar medida", block:"comercializacion", why:`Quedan ${days} días para el check-out y el compromiso sigue pendiente. Registra qué medida tomas: precio, publicación o leads.` };
  if (!targetPrice(room)) return { type:"pricing", label:"Fijar precio objetivo", block:"comercializacion", why:`Sin precio objetivo no se puede ofrecer la renovación ni publicar ${unitWord(room)}.` };
  if (renewal.status === "Sin oferta") return { type:"renewalOffer", label:"Registrar oferta de renovación", block:"candidaturas", why:"La vía interna empieza con la oferta al residente actual. El plazo de respuesta corre desde el envío." };
  if (!activePrices(room).length) return { type:"publication", label:"Registrar anuncio", block:"comercializacion", why:"La vía externa sigue en paralelo: publica en los canales y registra cada anuncio." };
  const pending = candidatesFor(room).find(item => item.stage === pendingPaymentsStage);
  if (pending) return { type:"deposit", label:"Registrar depósito y Entry Fee", block:"cierre", why:`${pending.name} está pendiente de pagos. Comprobar ambos compromete ${unitWord(room)}.` };
  return { type:"candidate", label:"Añadir candidato", block:"candidaturas", why:`${isWholeFloor(room) ? "El piso está publicado" : "La habitación está publicada"}. Registra a cada interesado con su canal y próxima acción.` };
}

function stepButton(room, step) {
  return `<button type="button" class="primary" data-action="${step.type}" data-room="${room.id}">${step.label}</button>`;
}

function secondary(room, type, label, primary, extra = "") {
  return primary?.type === type ? "" : `<button type="button" class="action-link" data-action="${type}" data-room="${room.id}" ${extra}>${label}</button>`;
}

const toggledBlocks = new Map();

/* Bloques abiertos por etapa: el resto queda plegado con una línea de resumen. */
function openBlocks(room, step, target) {
  const cycle = state[room.id];
  const renewal = renewalFor(room);
  let open;
  if (cycle.next?.signed || renewal.status === "Renovación firmada") open = ["cierre"];
  else if (cycle.next) open = renewal.status === "En espera" ? ["candidaturas","cierre"] : ["cierre"];
  else open = ["comercializacion","candidaturas"];
  if (step?.block) open.push(step.block);
  if (target) open.push(target);
  return new Set(open);
}

function blockSummary(room, id) {
  const cycle = state[room.id];
  const renewal = renewalFor(room);
  if (id === "comercializacion") {
    const active = listingsFor(room).filter(item => item.status === "Activo").length;
    const measures = measuresFor(room).length;
    return [targetPrice(room) ? "Objetivo " + money.format(targetPrice(room)) : "Sin precio objetivo",
      active ? `Publicado ${publishedPriceLabel(room)} en ${active} ${active === 1 ? "canal" : "canales"}` : "Sin anuncios activos",
      measures ? measures + (measures === 1 ? " medida" : " medidas") : ""].filter(Boolean).join(" · ");
  }
  if (id === "candidaturas") {
    const active = candidatesFor(room).filter(item => item.stage !== closedStage && item.id !== cycle.next?.candidateId).length;
    const committed = cycle.next?.signed || nextPaymentStatus(room).ready;
    const affected = committed && ["Sin oferta","Oferta enviada","En espera"].includes(renewal.status);
    const status = affected ? cycle.next.signed ? "Sin efecto" : "En espera" : renewal.status;
    return `Renovación: ${status} · ${active} ${active === 1 ? "candidato activo" : "candidatos activos"}`;
  }
  if (cycle.next?.signed) return `Firmado · ${cycle.next.reference}`;
  if (cycle.next) return `${nextDisplayName(room)} · ${nextPaymentStatus(room).ready ? "Depósito y Entry Fee comprobados" : missingPaymentLabel(room)}`;
  if (renewal.status === "Renovación firmada") return "Renovación firmada · " + date(renewal.newExit,true);
  return "Sin compromiso" + (historyFor(room).length ? " · " + historyFor(room).length + " cerrado sin firma" : "");
}

function blockPanel(room, id, number, content, target, open) {
  const key = room.id + "/" + id;
  const isOpen = toggledBlocks.has(key) ? toggledBlocks.get(key) : open.has(id);
  return `<details class="panel cycle-block ${target === id ? "is-target" : ""}" id="bloque-${id}" data-block-key="${key}" ${isOpen ? "open" : ""}>
    <summary class="panel-head"><h2 id="titulo-${id}"><span class="block-number">${number}</span>${cycleBlocks[id]}</h2>
      <span class="block-summary">${safe(blockSummary(room,id))}</span></summary>
    <div class="block-body">${content}</div></details>`;
}

function commercialBlock(room, step) {
  const cycle = state[room.id];
  const target = targetPrice(room);
  const listings = listingsFor(room);
  const measures = measuresFor(room);
  const red = risk(room)[0] === "red";
  const price = `<div class="block-col"><h3>Precio</h3>
    ${fields([["Renta anterior",money.format(currentRent(room)) + " / mes"],["Precio objetivo",target ? money.format(target) + " / mes" : "Por definir"],["Precio publicado",publishedPriceLabel(room)]])}
    ${cycle.pricing?.reason ? `<p class="note">${safe(cycle.pricing.reason)}</p>` : ""}
    ${!cycle.next ? secondary(room,"pricing",target ? "Editar precio" : "Fijar precio objetivo",step) : ""}</div>`;
  const ads = `<div class="block-col"><h3>Anuncios por canal</h3>
    ${listings.length ? `<ul class="listing-items">${listings.map(item => {
      const url = webUrl(item.url);
      const different = item.status === "Activo" && target && item.price !== target;
      return `<li>${url ? `<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(item.channel)}</a>` : safe(item.channel)}
        <small>${safe(item.status)} · ${money.format(item.price)} / mes · ${date(item.publishedOn)}</small>
        ${different ? '<small class="listing-difference">Precio distinto del objetivo</small>' : ""}</li>`;
    }).join("")}</ul>` : '<p class="muted">Sin anuncios registrados.</p>'}
    ${target && !cycle.next ? secondary(room,"publication",listings.length ? "Registrar o actualizar anuncio" : "Registrar anuncio",step) : ""}</div>`;
  const risky = red || measures.length ? `<div class="block-col"><h3>Medidas de riesgo</h3>
    ${measures.length ? `<ul class="measure-items">${measures.map(item => `<li><small>${date(item.on)}</small>${safe(item.note)}</li>`).join("")}</ul>` : '<p class="muted">Sin medidas registradas.</p>'}
    ${red ? `<p class="note">El semáforo sigue en rojo hasta comprobar el depósito y el Entry Fee, aunque haya medidas.</p>${secondary(room,"measure","Registrar medida",step)}` : ""}</div>` : "";
  return `<div class="block-grid">${price}${ads}${risky}</div>`;
}

function renewalPanel(room, step) {
  const cycle = state[room.id];
  const renewal = renewalFor(room);
  const committed = cycle.next?.signed || nextPaymentStatus(room).ready;
  const affected = committed && ["Sin oferta","Oferta enviada","En espera"].includes(renewal.status);
  const status = affected ? cycle.next.signed ? "Sin efecto" : "En espera" : renewal.status;
  const rows = [["Estado",status]];
  if (renewal.price) rows.push(["Precio ofrecido",money.format(renewal.price) + " / mes"]);
  if (renewal.sentOn) rows.push(["Enviada",date(renewal.sentOn)]);
  if (renewal.sentOn && renewal.status === "Oferta enviada" && !affected) rows.push(["Vence",date(addDays(renewal.sentOn,pendingTerm))]);
  if (renewal.respondedOn) rows.push(["Respuesta",date(renewal.respondedOn)]);
  if (renewal.signedOn) rows.push(["Firmada",date(renewal.signedOn)],["Nuevo check-out",date(renewal.newExit)]);
  const waiting = renewal.status === "En espera" && committed && !cycle.next.signed ? `<div class="callout waiting"><div><strong>Solicitud en espera</strong>
    <small>El residente pidió renovar después del compromiso de ${safe(nextDisplayName(room))}. Si KALI registra la firma interna, la renovación queda sin efecto. Si se cierra sin firma, recupera la opción de renovar a ${money.format(renewal.price)}.</small></div></div>` : "";
  const lost = !affected || waiting ? "" : cycle.next.signed ? `<p class="note">KALI registró la firma interna de la nueva estancia. La renovación queda sin efecto y el residente mantiene su check-out contractual (${date(contractualExit(room),true)}).</p>` : `<p class="note">El candidato externo ya pagó el depósito y el Entry Fee. La renovación queda en espera de la firma interna.</p>`;
  const recovered = renewal.recovered && renewal.status === "Aceptada" ? `<p class="note">Opción recuperada al cerrar sin firma el compromiso externo.</p>` : "";
  const accepted = renewal.status === "Aceptada" ? `<p class="note decision">Decisión abierta (Lorenzo): qué estado toma ${unitWord(room)} mientras el residente no firme. Por ahora se sigue comercializando y el semáforo no pasa a verde.</p>` : "";
  const button = committed ? ""
    : renewal.status === "Sin oferta" && targetPrice(room) ? secondary(room,"renewalOffer","Registrar oferta",step)
    : renewal.status === "Oferta enviada" ? secondary(room,"renewalResponse","Registrar respuesta",step)
    : renewal.status === "Aceptada" ? secondary(room,"renewalSign","Registrar firma de renovación",step) : "";
  return `<div class="block-col"><h3>Renovación · ${safe(room.resident)}</h3>
    ${fields(rows)}
    ${renewal.status === "Oferta enviada" && !affected ? `<p class="note">Plazo de respuesta: ${pendingTerm} días desde el envío. ${pendingDecision}</p>` : ""}
    ${waiting}${lost}${recovered}${accepted}
    <p class="rule">El candidato externo compromete la unidad cuando Sales comprueba el depósito y el Entry Fee.</p>
    ${button}</div>`;
}

function candidatesPanel(room, step) {
  const cycle = state[room.id];
  const all = candidatesFor(room);
  const linked = cycle.next?.candidateId;
  const active = all.filter(item => item.stage !== closedStage);
  const closed = all.filter(item => item.stage === closedStage);
  const row = item => {
    const committed = linked === item.id;
    const stage = committed ? nextStage(room) : item.stage;
    return `<li><div><strong>${safe(item.name)}</strong><small>${safe(item.channel)} · ${safe(stage)}</small>
      ${committed ? "" : item.stage === closedStage ? `<small>Motivo: ${safe(item.reason)}</small>` : `<small>Próxima acción: ${safe(item.nextAction || "Sin definir")}</small>`}</div>
      ${committed || !cycle.opened ? "" : `<button type="button" class="action-link" data-action="candidate" data-room="${room.id}" data-candidate="${safe(item.id)}" aria-label="Editar candidato: ${safe(item.name)}">Editar</button>`}</li>`;
  };
  return `<div class="block-col"><h3>Candidatos · ${active.length} ${active.length === 1 ? "activo" : "activos"}</h3>
    ${active.length ? `<ul class="candidate-items">${active.map(row).join("")}</ul>` : '<p class="muted">Sin candidaturas activas.</p>'}
    ${closed.length ? `<details class="registry-group"><summary>${closed.length} ${closed.length === 1 ? "cerrada" : "cerradas"} sin acuerdo</summary><ul class="candidate-items">${closed.map(row).join("")}</ul></details>` : ""}
    ${cycle.opened && !cycle.next?.signed ? secondary(room,"candidate","Añadir candidato",step) : ""}</div>`;
}

function closingBlock(room, step) {
  const cycle = state[room.id];
  const next = cycle.next;
  const renewal = renewalFor(room);
  const history = historyFor(room);
  let body;
  if (next) {
    const payments = nextPayments(room);
    const ready = nextPaymentStatus(room).ready;
    body = `<div class="block-grid two">
      <div class="block-col"><h3>Pagos del compromiso</h3>${fields([["Candidato",nextDisplayName(room)],["Depósito",paymentText(payments.deposit,"Pagado")],["Entry Fee",paymentText(payments.entryFee,"Pagado")],["Check-in previsto",date(next.entry)],["Check-out previsto",date(next.exit)]])}
        ${!next.signed && !ready ? `<p class="note">${missingPaymentLabel(room)}.</p>` : ""}</div>
      <div class="block-col"><h3>Firma interna</h3>${next.signed ? fields([["Referencia",next.reference],["Fecha de firma",date(next.signed)]]) + '<p class="note">Ciclo cerrado. La estancia queda en Base Datos Co-livers.</p>' : `<p class="muted">${ready ? "KALI firma internamente los documentos." : "Disponible cuando Sales compruebe ambos pagos."}</p>`}
        <div class="button-row"><button type="button" class="action-link" data-resident="${safe(nextPersonKey(next,room))}">Abrir estancia del nuevo residente</button>
        ${next.signed ? "" : secondary(room,"closeNoSign","Cerrar sin firma",step)}</div></div>
    </div>`;
  } else if (renewal.status === "Renovación firmada") {
    body = `<div class="block-col"><h3>Renovación firmada</h3>${fields([["Residente",room.resident],["Nuevo check-out",date(renewal.newExit,true)],["Renta",money.format(renewal.price) + " / mes"],["Referencia",renewal.reference]])}
      <p class="note">Ciclo cerrado por renovación. El check-out se actualizó al firmar.</p></div>`;
  } else {
    const pending = candidatesFor(room).find(item => item.stage === pendingPaymentsStage);
    body = `<p class="muted empty-state">Sin compromiso. Registra el depósito y el Entry Fee del candidato.</p>
      ${pending && cycle.opened ? secondary(room,"deposit","Registrar depósito y Entry Fee",step) : ""}`;
  }
  const past = history.length ? `<details class="registry-group"><summary>Historial del ciclo · ${history.length}</summary>
    ${history.map(item => `<div class="registry-record">${fields([["Candidato",item.name],
      ["Depósito",paymentText(item.payments?.deposit ?? (item.deposit == null ? null : { amount:item.deposit,status:"Comprobado" }),"Pagado")],
      ["Entry Fee",paymentText(item.payments?.entryFee,"Pagado")],["Cerrado sin firma",date(item.closedOn)],["Motivo",item.reason]])}</div>`).join("")}</details>` : "";
  return body + past;
}

function cycleView() {
  const [, roomId, block] = cycleRoute();
  const room = rooms.find(item => item.id === roomId);
  if (!room) return heading("Ciclo no encontrado","Vuelve al pipeline para elegir una habitación.");
  const cycle = state[room.id];
  const step = primaryStep(room);
  const openSet = openBlocks(room,step,block);
  const [color, riskLabel] = risk(room);
  const exit = contractualExit(room);
  const plannedExit = cycle.currentDates?.exit;
  const backLabel = ({ jornada:"Mi jornada", pipeline:"Pipeline", "co-livers":"Base Datos Co-livers" })[cycleOrigin] ?? "Pipeline";
  return `<p class="crumb"><a href="#${cycleOrigin}">← ${backLabel}</a></p>
    <header class="page-head cycle-head">
      <p class="eyebrow">CICLO COMERCIAL · FIN CONTRACTUAL ${date(exit,true).toUpperCase()}</p>
      <h1>${locationName(room)}</h1>
      <p class="facts">${leaverLabel(room)}: <button type="button" class="text-button inline" data-resident="${safe(personKey(room.resident))}">${safe(room.resident)}</button>
        <span>Fin contractual ${date(exit,true)}</span>
        ${plannedExit && plannedExit !== exit ? `<span>Check-out previsto ${date(plannedExit,true)}</span>` : ""}
        <span>${room.ready ? "Disponible para check-in desde " + date(room.ready,true) : "Disponibilidad para check-in por confirmar"} <small>(dato de Community)</small></span></p>
      <p class="facts features-line">${unitFeatures(room)}</p>
      <div class="chips"><span class="stage-chip">Etapa · ${cycleStage(room)}</span><span class="risk ${color}">${riskLabel}</span><small>${dayDiff(demoDay,exit)} días hasta el check-out</small></div>
    </header>
    <section class="next-step ${step ? "" : "done"}" aria-label="Siguiente paso">
      <div><p class="eyebrow">SIGUIENTE PASO</p><p>${step ? step.why : `Ciclo cerrado. No quedan acciones comerciales en ${isWholeFloor(room) ? "este piso" : "esta habitación"}.`}</p>
        ${step?.decision ? '<small><span class="pending-tag">Estado pendiente de Lorenzo</span></small>' : ""}</div>
      ${step ? stepButton(room,step) : `<button type="button" class="secondary" data-resident="${safe(cycle.next ? nextPersonKey(cycle.next,room) : personKey(room.resident))}">Abrir estancia</button>`}
    </section>
    ${cycle.opened ? `<div class="stack">
      ${blockPanel(room,"comercializacion","1",commercialBlock(room,step),block,openSet)}
      ${blockPanel(room,"candidaturas","2",`<div class="block-grid two">${renewalPanel(room,step)}${candidatesPanel(room,step)}</div>`,block,openSet)}
      ${blockPanel(room,"cierre","3",closingBlock(room,step),block,openSet)}
    </div>` : '<p class="muted closed-note">Los bloques del ciclo aparecen al abrirlo.</p>'}`;
}

function afterCycleRender() {
  const [, , block] = cycleRoute();
  const target = block && document.getElementById("bloque-" + block);
  if (target) {
    target.open = true;
    target.scrollIntoView({ block:"start" });
    target.querySelector("summary").focus({ preventScroll:true });
  }
}

/* Mi jornada · cada caso es un enlace a su ficha, sin botones propios. */
function jornadaView() {
  const order = { red:0, amber:1, green:2 };
  const items = rooms.map(room => ({ room, step:primaryStep(room), risk:risk(room) })).filter(item => item.step && item.step.type !== "candidate")
    .sort((first,second) => order[first.risk[0]] - order[second.risk[0]] || dayDiff(contractualExit(second.room),contractualExit(first.room)));
  return heading("Mi jornada","Lo que requiere atención hoy. Cada caso abre su ficha del ciclo en el bloque correspondiente.") +
    panel(`Requiere atención · ${items.length}`, columns("Unidad y piso","Riesgo y check-out","Motivo","") + (items.length ? items.map(({room,step,risk:[color,label]}) => `<a class="row case-row" href="${cycleLink(room,step.block)}" data-origin="jornada">
      <div><strong>${isWholeFloor(room) ? safe(room.floor) : unitLabel(room.number)}</strong><small>${isWholeFloor(room) ? "Piso completo" : safe(room.floor)}</small></div>
      <div><span class="risk ${color}">${label}</span><small>${dayDiff(demoDay,contractualExit(room))} días hasta el check-out</small></div>
      <div><strong>${step.label}</strong><small>${step.type === "open" ? "Aviso de check-out a 60 días" : step.type === "signature" ? "Depósito y Entry Fee comprobados" : cycleStage(room)}</small></div>
      <div class="go">Abrir ficha →</div></a>`).join("") : '<p class="empty">No hay casos pendientes hoy.</p>'));
}

/* Pipeline · agrupado por piso. Al entrar se ven los pisos; cada piso se abre para ver sus habitaciones. */
const openFloors = new Map();
const riskOrder = { red:0, amber:1, green:2 };

function pipelineRoomRow(room) {
  const cycle = state[room.id];
  const [color,label] = risk(room);
  const step = primaryStep(room);
  const activeCandidates = candidatesFor(room).filter(item => item.stage !== closedStage && item.id !== cycle.next?.candidateId).length;
  return `<a class="row case-row" href="${cycleLink(room)}" data-origin="pipeline">
    <div><strong>${unitLabel(room.number)}</strong><small>${unitFeatures(room,false)}</small><small>${safe(room.resident)} sale</small></div>
    <div><strong>Check-out: ${date(contractualExit(room))}</strong><small>${room.ready ? "Disponible para check-in desde " + date(room.ready) : "Disponibilidad por confirmar"}</small></div>
    <div><strong>${cycleStage(room)}</strong><small>${cycle.opened ? activeCandidates + (activeCandidates === 1 ? " candidatura activa" : " candidaturas activas") : "Ciclo sin abrir"}</small></div>
    <div><span class="risk ${color}">${label}</span><small>${dayDiff(demoDay,contractualExit(room))} días</small></div>
    <div>${step ? `<span class="next-text">${step.label}</span>` : '<span class="muted">Ciclo cerrado</span>'}</div></a>`;
}

function pipelineView() {
  const groups = new Map();
  for (const room of rooms) {
    const floor = catalogFloor(room.floor);
    if (!groups.has(floor.name)) groups.set(floor.name,{ floor, list:[] });
    groups.get(floor.name).list.push(room);
  }
  const floors = [...groups.values()].map(({floor,list}) => {
    list.sort((first,second) => contractualExit(first).localeCompare(contractualExit(second)));
    const counts = { red:0, amber:0, green:0 };
    for (const room of list) counts[risk(room)[0]]++;
    const worst = list.reduce((min,room) => Math.min(min,riskOrder[risk(room)[0]]),2);
    const toDo = list.filter(room => primaryStep(room)).length;
    const urgent = list.some(room => risk(room)[0] === "red" || (state[room.id].next && !state[room.id].next.signed));
    return { floor, list, counts, worst, toDo, urgent, firstExit:contractualExit(list[0]) };
  }).sort((first,second) => first.worst - second.worst || first.floor.name.localeCompare(second.floor.name,"es"));
  const units = floors.reduce((sum,item) => sum + item.list.length,0);
  const badge = (n,color,text) => n ? `<span class="risk ${color}">${n} ${text}</span>` : "";
  const todo = n => n ? `<strong>${n}</strong> ${n === 1 ? "acción pendiente" : "acciones pendientes"}` : "Sin acciones pendientes";
  return heading("Pipeline comercial","Pisos con unidades en ciclo comercial o con aviso a 60 días. Abre un piso para ver sus habitaciones; un piso completo abre directamente su ficha.") +
    `<p class="directory-count muted">${floors.length} pisos · ${units} ${units === 1 ? "unidad" : "unidades"} en seguimiento · Los pisos con riesgo de vacío o firma interna pendiente se abren solos</p><div class="stack">` +
    floors.map(({floor,list,counts,toDo,urgent,firstExit}) => {
      if (floor.mode === "completo" && list.length === 1) {
        const room = list[0];
        const [color,label] = risk(room);
        const step = primaryStep(room);
        return `<a class="panel floor-group whole-floor" href="${cycleLink(room)}" data-origin="pipeline">
          <div class="floor-head">
            <div class="floor-name"><h2>${safe(floor.name)}</h2><small>Piso completo · check-out ${date(contractualExit(room))} · ${safe(room.resident)} (titular)</small></div>
            <div class="floor-badges"><span class="risk ${color}">${label}</span><small>${cycleStage(room)}</small></div>
            <div class="floor-todo">${step ? `<span class="next-text">${step.label}</span>` : "Ciclo cerrado"}</div>
            <span class="go" aria-hidden="true">→</span>
          </div></a>`;
      }
      const isOpen = openFloors.get(floor.name) ?? urgent;
      return `<details class="panel floor-group pipeline" data-floor="${safe(floor.name)}" ${isOpen ? "open" : ""}>
        <summary class="floor-head">
          <div class="floor-name"><h2>${safe(floor.name)}</h2><small>${list.length} ${list.length === 1 ? "habitación" : "habitaciones"} en seguimiento · próximo check-out ${date(firstExit)}${realEstateRecords[floor.name] ? ` · <a class="text-button inline" href="#pisos/${realEstateRecords[floor.name].slug}">Ficha del piso</a>` : ""}</small></div>
          <div class="floor-badges">${badge(counts.red,"red","en riesgo de vacío")}${badge(counts.amber,"amber","en seguimiento")}${badge(counts.green,"green","sin riesgo")}</div>
          <div class="floor-todo">${todo(toDo)}</div>
        </summary>
        ${columns("Habitación","Check-out y disponibilidad","Etapa comercial","Riesgo de vacío","Próxima acción")}
        ${list.map(pipelineRoomRow).join("")}
      </details>`;
    }).join("") + "</div>";
}

/* Formularios nuevos de la ficha. Devuelve true si el tipo es suyo. */
function cycleForm(type, room, trigger) {
  const cycle = state[room.id];
  const renewal = renewalFor(room);
  if (type === "renewalOffer") {
    show("Registrar oferta de renovación",locationName(room),`
      ${fields([["Residente",room.resident],["Renta actual",money.format(currentRent(room)) + " / mes"],["Precio objetivo",money.format(targetPrice(room)) + " / mes"]])}
      <form data-form="renewalOffer" data-room="${room.id}">
        <div class="fields"><label>Precio ofrecido (€ / mes)<input name="price" type="number" min="1" step=".01" value="${safe(targetPrice(room))}" required></label>
        <label>Fecha de envío<input name="sentOn" type="date" value="${demoDay}" required></label></div>
        <p class="muted">Si un candidato externo completa el depósito y el Entry Fee, la unidad queda comprometida. Plazo de respuesta: ${pendingTerm} días (pendiente de Lorenzo).</p>
        <button type="submit">Guardar oferta</button></form>`,trigger);
  } else if (type === "renewalResponse") {
    show("Registrar respuesta",locationName(room),`
      ${fields([["Residente",room.resident],["Precio ofrecido",money.format(renewal.price) + " / mes"],["Enviada",date(renewal.sentOn,true)]])}
      <form data-form="renewalResponse" data-room="${room.id}">
        <label>Respuesta<select name="answer" required><option value="">Selecciona</option><option>Aceptada</option><option>Rechazada</option></select></label>
        <button type="submit">Guardar respuesta</button></form>`,trigger);
  } else if (type === "renewalSign") {
    show("Registrar firma de renovación",locationName(room),`
      ${fields([["Residente",room.resident],["Precio",money.format(renewal.price) + " / mes"],["Fin contractual actual",date(contractualExit(room),true)]])}
      <form data-form="renewalSign" data-room="${room.id}">
        <div class="fields"><label>Nuevo check-out<input name="newExit" type="date" min="${addDays(contractualExit(room),1)}" value="${addDays(contractualExit(room),182)}" required></label>
        <label>Referencia del contrato<input name="reference" maxlength="48" value="DEMO-REN-${room.id.toUpperCase()}" required></label></div>
        <p class="muted">Al firmar se actualiza el check-out en la estancia y el ciclo se cierra.</p>
        <button type="submit">Registrar firma de prueba</button></form>`,trigger);
  } else if (type === "closeNoSign" && cycle.next && !cycle.next.signed) {
    const payments = nextPayments(room);
    show("Cerrar sin firma",locationName(room),`
      ${fields([["Candidato",nextDisplayName(room)],["Depósito",paymentText(payments.deposit,"Pagado")],["Entry Fee",paymentText(payments.entryFee,"Pagado")]])}
      <form data-form="closeNoSign" data-room="${room.id}">
        <label>Motivo<textarea name="reason" rows="3" maxlength="300" required></textarea></label>
        <p class="muted">Los pagos se conservan en el historial. ${isWholeFloor(room) ? "El piso vuelve" : "La habitación vuelve"} a comercializarse${renewal.status === "En espera" ? " y el residente recupera la opción de renovar" : ""}.</p>
        <button type="submit">Cerrar sin firma</button></form>`,trigger);
  } else return false;
  return true;
}

function cycleSubmit(form, values, cycle) {
  const room = rooms.find(item => item.id === form.dataset.room);
  const renewal = { ...renewalFor(room) };
  if (form.dataset.form === "renewalOffer") {
    cycle.renewal = { status:"Oferta enviada", price:Number(values.price), sentOn:values.sentOn };
    return "Oferta de renovación registrada. El plazo de respuesta corre desde el envío.";
  }
  if (form.dataset.form === "renewalResponse") {
    if (!["Aceptada","Rechazada"].includes(values.answer)) return invalid(form.elements.answer,"Selecciona la respuesta.");
    cycle.renewal = { ...renewal, status:values.answer, respondedOn:demoDay };
    return values.answer === "Aceptada" ? "Renovación aceptada. El check-out cambia al firmar." : "Respuesta registrada. Sigue solo la vía externa.";
  }
  if (form.dataset.form === "renewalSign") {
    if (values.newExit <= contractualExit(room)) return invalid(form.elements.newExit,"El nuevo check-out debe ser posterior al fin contractual actual.");
    const registryData = ensureRegistry();
    const id = "current-" + room.id;
    const previous = registryData.contracts[id] ?? [{ id:"original", reference:"", status:"Vigente", signedOn:"", start:room.entry, end:room.exit, rent:room.rent }];
    registryData.contracts[id] = [...previous, { id:"contract-" + crypto.randomUUID(), reference:values.reference.trim(), status:"Firmado", signedOn:demoDay, start:contractualExit(room), end:values.newExit, rent:renewal.price }];
    cycle.currentDates = { entry:room.entry, exit:values.newExit };
    cycle.renewal = { ...renewal, status:"Renovación firmada", signedOn:demoDay, newExit:values.newExit, reference:values.reference.trim() };
    return "Renovación firmada. El check-out de la estancia se ha actualizado.";
  }
  if (form.dataset.form === "closeNoSign") {
    if (!cycle.next || cycle.next.signed) return;
    if (!values.reason.trim()) return invalid(form.elements.reason,"Indica el motivo.");
    const next = cycle.next;
    const records = registry();
    const stayId = "next-" + room.id;
    cycle.history = [...historyFor(room), { name:nextDisplayName(room),payments:nextPayments(room),contracts:records.contracts[stayId] ?? [],
      closedOn:demoDay,reason:values.reason.trim() }];
    if (next.candidateId) cycle.candidates = candidatesFor(room).map(item => item.id === next.candidateId ? { ...item, stage:closedStage, nextAction:"", reason:"Sin firma: " + values.reason.trim() } : item);
    delete records.payments[stayId];
    delete records.stays[stayId];
    delete records.contracts[stayId];
    cycle.next = null;
    if (renewal.status === "En espera") cycle.renewal = { ...renewal, status:"Aceptada", recovered:true };
    return `Compromiso cerrado sin firma. ${isWholeFloor(room) ? "El piso vuelve" : "La habitación vuelve"} a comercializarse.`;
  }
}

/* Enlaces entre la ficha del residente y el ciclo. */
function residentCycleLinks(stay, editable, key) {
  const room = rooms.find(item => item.id === stay.roomId);
  const links = [];
  if (room && ["Actual","Próxima"].includes(stay.status) && state[room.id].opened) links.push(`<a class="text-button" href="${cycleLink(room)}" data-close-dialog>Ver ciclo comercial</a>`);
  if (!editable && key) links.push(`<a class="text-button" href="#co-livers" data-edit-resident="${safe(key)}">Editar en Base Datos Co-livers</a>`);
  return links.length ? `<p class="stay-links">${links.join("")}</p>` : "";
}

document.addEventListener("click", event => {
  const origin = event.target.closest("[data-origin]");
  if (origin) cycleOrigin = origin.dataset.origin;
  const close = event.target.closest("[data-close-dialog]");
  if (close) { cycleOrigin = "co-livers"; dialogTrigger = null; dialog.close(); }
  const edit = event.target.closest("[data-edit-resident]");
  if (edit) { pendingResident = edit.dataset.editResident; dialogTrigger = null; dialog.close(); }
});

document.addEventListener("click", event => {
  const summary = event.target.closest("details > summary");
  const holder = summary?.parentElement;
  if (!holder) return;
  if (holder.dataset.floor) openFloors.set(holder.dataset.floor, !holder.open);
  if (holder.dataset.blockKey) toggledBlocks.set(holder.dataset.blockKey, !holder.open);
});
