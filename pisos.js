"use strict";

/* Sección Pisos (vista previa, 10-11-2026). Pendiente de aprobación de Lorenzo.
   Las características las registra el Director de Real Estate desde su apartado.
   Sales las consulta aquí en solo lectura. Datos ficticios en barrios oficiales de Madrid. */

const realEstateRecords = {
  "Piso Centro": {
    slug:"centro", address:"Calle Ejemplo 12, 3.º izq.", barrio:"Universidad", distrito:"Centro", mode:"habitaciones",
    registeredOn:"2026-10-28", score:4, m2:128, livingM2:22, orientation:"Exterior", floorLevel:"3.ª", lift:true,
    outdoor:"Balcón corrido", climate:"Aire acondicionado y calefacción central", appliances:["Lavadora","Secadora","Lavavajillas"],
    renovated:2024, utilities:"Incluidos: luz, agua, gas y wifi",
    transport:[{ type:"Metro", stop:"Noviciado", lines:"L2", minutes:4 },{ type:"Metro", stop:"Tribunal", lines:"L1 · L10", minutes:7 },{ type:"Bus", stop:"San Bernardo", lines:"147", minutes:2 }],
    bathrooms:[{ id:"B1", m2:4.5, suite:3 },{ id:"B2", m2:5.5, shared:[1,2] },{ id:"B3", m2:4, shared:[4,5] }],
    rooms:{
      1:{ m2:11, window:"Exterior", bed:"Doble (135)", wardrobe:"Empotrado", desk:true, balcony:true, ac:true, light:5 },
      2:{ m2:13, window:"Interior", bed:"Doble (135)", wardrobe:"Exento", desk:true, balcony:false, ac:true, light:3 },
      3:{ m2:14, window:"Exterior", bed:"Queen (150)", wardrobe:"Empotrado", desk:true, balcony:false, ac:true, light:4 },
      4:{ m2:12, window:"Exterior", bed:"Doble (135)", wardrobe:"Empotrado", desk:true, balcony:false, ac:true, light:4, rent:760, status:"Ocupada · sin ciclo abierto" },
      5:{ m2:9, window:"Interior", bed:"Individual (105)", wardrobe:"Exento", desk:true, balcony:false, ac:false, light:2, rent:640, status:"Ocupada · sin ciclo abierto" }
    }
  },
  "Piso Norte": {
    slug:"norte", address:"Calle Ejemplo 48, 1.º dcha.", barrio:"Vallehermoso", distrito:"Chamberí", mode:"habitaciones",
    registeredOn:"2026-10-30", score:3, m2:104, livingM2:18, orientation:"Exterior", floorLevel:"1.ª", lift:false,
    outdoor:null, climate:"Calefacción individual de gas", appliances:["Lavadora","Lavavajillas"],
    renovated:null, utilities:"Incluidos: agua y wifi",
    transport:[{ type:"Metro", stop:"Canal", lines:"L2 · L7", minutes:5 },{ type:"Metro", stop:"Quevedo", lines:"L2", minutes:8 }],
    bathrooms:[{ id:"B1", m2:4, suite:3 },{ id:"B2", m2:5, shared:[1,2,4] }],
    rooms:{
      1:{ m2:12, window:"Exterior", bed:"Doble (135)", wardrobe:"Empotrado", desk:true, balcony:false, ac:false, light:4 },
      2:{ m2:11, window:"Interior", bed:"Individual (105)", wardrobe:"Exento", desk:true, balcony:false, ac:false, light:3 },
      3:{ m2:13, window:"Exterior", bed:"Doble (135)", wardrobe:"Empotrado", desk:true, balcony:false, ac:false, light:4, rent:780, status:"Ocupada · sin ciclo abierto" },
      4:{ m2:9, window:"Interior", bed:"Individual (90)", wardrobe:"Exento", desk:false, balcony:false, ac:false, light:2, rent:610, status:"Ocupada · sin ciclo abierto" }
    }
  },
  "Piso Sur": {
    slug:"sur", address:"Calle Ejemplo 7, 5.º", barrio:"Pacífico", distrito:"Retiro", mode:"completo",
    registeredOn:"2026-10-25", score:3, m2:112, livingM2:26, orientation:"Exterior", floorLevel:"5.ª", lift:true,
    outdoor:"Terraza de 8 m²", climate:"Aire acondicionado y calefacción central", appliances:["Lavadora","Secadora","Lavavajillas"],
    renovated:2023, utilities:"No incluidos",
    transport:[{ type:"Metro", stop:"Pacífico", lines:"L1 · L6", minutes:3 },{ type:"Metro", stop:"Menéndez Pelayo", lines:"L1", minutes:9 }],
    bathrooms:[{ id:"B1", m2:4, suite:1 },{ id:"B2", m2:4.5, shared:[2,3] }],
    rooms:{
      1:{ m2:13, window:"Exterior", bed:"Queen (150)", wardrobe:"Empotrado", desk:true, balcony:false, ac:true, light:5 },
      2:{ m2:12, window:"Exterior", bed:"Doble (135)", wardrobe:"Empotrado", desk:true, balcony:false, ac:true, light:4 },
      3:{ m2:11, window:"Interior", bed:"Doble (135)", wardrobe:"Exento", desk:true, balcony:false, ac:true, light:3 }
    }
  }
};

/* Comparables externos de habitaciones registrados por Sales (ficticios). */
const roomComparables = [
  ["Universidad","Centro",10,650,"Exterior","Compartido","Idealista"],["Universidad","Centro",12,720,"Exterior","Compartido","Badi"],
  ["Universidad","Centro",14,850,"Exterior","En suite","Idealista"],["Universidad","Centro",13,800,"Exterior","En suite","Badi"],
  ["Universidad","Centro",9,580,"Interior","Compartido","Idealista"],["Universidad","Centro",11,640,"Interior","Compartido","Badi"],
  ["Universidad","Centro",13,690,"Interior","Compartido","Idealista"],
  ["Embajadores","Centro",10,600,"Interior","Compartido","Idealista"],["Embajadores","Centro",12,690,"Exterior","Compartido","Badi"],
  ["Embajadores","Centro",13,760,"Exterior","En suite","Idealista"],
  ["Vallehermoso","Chamberí",12,700,"Exterior","Compartido","Idealista"],["Vallehermoso","Chamberí",13,820,"Exterior","En suite","Badi"],
  ["Vallehermoso","Chamberí",10,620,"Interior","Compartido","Idealista"],["Vallehermoso","Chamberí",11,650,"Exterior","Compartido","Badi"],
  ["Vallehermoso","Chamberí",14,860,"Exterior","En suite","Idealista"],["Vallehermoso","Chamberí",11,640,"Interior","Compartido","Badi"],
  ["Arapiles","Chamberí",11,680,"Exterior","Compartido","Idealista"],["Arapiles","Chamberí",12,700,"Interior","Compartido","Badi"],
  ["Pacífico","Retiro",12,640,"Exterior","Compartido","Idealista"],["Pacífico","Retiro",11,600,"Interior","Compartido","Badi"],
  ["Pacífico","Retiro",14,760,"Exterior","En suite","Idealista"],["Pacífico","Retiro",10,560,"Exterior","Compartido","Badi"],
  ["Cuatro Caminos","Tetuán",12,560,"Exterior","Compartido","Idealista"],["Cuatro Caminos","Tetuán",10,520,"Interior","Compartido","Badi"],
  ["Cuatro Caminos","Tetuán",13,640,"Exterior","En suite","Idealista"]
].map(([barrio,distrito,m2,rent,window,bath,source]) => ({ barrio,distrito,m2,rent,window,bath,source }));

const fewCases = 3;
const pisosFilter = { distrito:"", mode:"", orientation:"" };
let zoneSort = "signed";
const perM2 = new Intl.NumberFormat("es-ES",{ minimumFractionDigits:1, maximumFractionDigits:1 });
const eurM2 = value => value == null ? "—" : perM2.format(value) + " €/m²";
const avg = list => list.length ? list.reduce((sum,value) => sum + value,0) / list.length : null;
const median = list => {
  if (!list.length) return null;
  const sorted = [...list].sort((a,b) => a - b), mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const casesTag = n => `<span class="cases ${n < fewCases ? "few" : ""}" title="${n < fewCases ? "Pocos casos: tómalo como orientación" : "Número de casos"}">n = ${n}</span>`;
const zoneName = record => `${record.barrio} · ${record.distrito}`;
const pending = '<span class="pending-re">Pendiente de Real Estate</span>';
const show2 = value => value == null || value === "" ? pending : safe(value);

function bathOf(record, number) {
  const bath = record.bathrooms.find(item => item.suite === number || item.shared?.includes(number));
  if (!bath) return { label:"Sin asignar", type:"" };
  return bath.suite === number ? { label:`En suite (${bath.id})`, type:"En suite" } : { label:`Compartido entre ${bath.shared.length} (${bath.id})`, type:"Compartido" };
}

/* Habitaciones del piso con su renta firmada: la del ciclo si existe, si no la registrada. */
function pisoRooms(name) {
  const record = realEstateRecords[name];
  return Object.entries(record.rooms).map(([number,data]) => {
    const unit = rooms.find(room => catalogFloor(room.floor).name === name && String(room.number) === number);
    const rent = record.mode === "completo" ? null : unit ? currentRent(unit) : data.rent;
    return { number:Number(number), ...data, rent, unit, bath:bathOf(record,Number(number)), perM2:rent ? rent / data.m2 : null };
  });
}

function pisoRent(name) {
  const record = realEstateRecords[name];
  if (record.mode === "completo") {
    const unit = rooms.find(room => catalogFloor(room.floor).name === name);
    return unit ? currentRent(unit) : null;
  }
  return pisoRooms(name).reduce((sum,room) => sum + (room.rent ?? 0),0);
}

function zoneStats() {
  const zones = new Map();
  const get = (barrio,distrito) => {
    const key = barrio + "|" + distrito;
    if (!zones.has(key)) zones.set(key,{ barrio,distrito,pisos:[],roomPerM2:[],pisoPerM2:[],comps:[] });
    return zones.get(key);
  };
  for (const [name,record] of Object.entries(realEstateRecords)) {
    const zone = get(record.barrio,record.distrito);
    zone.pisos.push(name);
    zone.pisoPerM2.push(pisoRent(name) / record.m2);
    if (record.mode !== "completo") zone.roomPerM2.push(...pisoRooms(name).map(room => room.perM2));
  }
  for (const comp of roomComparables) get(comp.barrio,comp.distrito).comps.push(comp);
  return [...zones.values()].map(zone => ({ ...zone,
    signedPisoM2:avg(zone.pisoPerM2), signedRoomM2:avg(zone.roomPerM2),
    compMedian:median(zone.comps.map(item => item.rent)), compMedianM2:median(zone.comps.map(item => item.rent / item.m2)) }));
}

function similarComparables(record, room) {
  return roomComparables.filter(item => item.distrito === record.distrito && Math.abs(item.m2 - room.m2) <= 2 &&
    item.window === room.window && item.bath === room.bath.type);
}

/* Línea de características para el Pipeline y la ficha del ciclo. */
function unitFeatures(room, withLink = true) {
  const name = catalogFloor(room.floor).name;
  const record = realEstateRecords[name];
  if (!record) return "";
  let text;
  if (room.unit === "piso" || record.mode === "completo") {
    text = `${record.m2} m² · ${Object.keys(record.rooms).length} habitaciones · ${record.bathrooms.length} baños · ${record.barrio}`;
  } else {
    const data = record.rooms[room.number];
    if (!data) return "";
    text = `${data.m2} m² · ventana ${data.window.toLowerCase()} · baño ${bathOf(record,room.number).type.toLowerCase()} · ${record.barrio}`;
  }
  return withLink ? `<span class="unit-features">${safe(text)} · <a href="#pisos/${record.slug}" class="text-button inline">Ficha del piso</a></span>` : safe(text);
}

function zoneRanking() {
  const stats = zoneStats();
  const key = zoneSort === "signed" ? "signedRoomM2" : "compMedianM2";
  stats.sort((a,b) => (b[key] ?? -1) - (a[key] ?? -1));
  const best = stats[0]?.[key];
  return `<section class="panel zone-panel" aria-labelledby="zonas-titulo">
    <div class="panel-head"><div><h2 id="zonas-titulo">Zonas · dónde se cobra más</h2>
      <small class="muted">Barrios y distritos oficiales de Madrid. Media de lo firmado por KALI y mediana de comparables externos de habitaciones.</small></div>
      <div class="sort-toggle" role="group" aria-label="Ordenar zonas por">
        <button type="button" class="${zoneSort === "signed" ? "" : "secondary"}" data-zone-sort="signed" aria-pressed="${zoneSort === "signed"}">Renta firmada KALI</button>
        <button type="button" class="${zoneSort === "market" ? "" : "secondary"}" data-zone-sort="market" aria-pressed="${zoneSort === "market"}">Comparables externos</button>
      </div></div>
    <div class="zone-table" role="table" aria-label="Ranking de zonas">
      <div class="zone-row zone-head" role="row"><span role="columnheader">Zona</span><span role="columnheader">Renta media firmada · €/m² piso</span><span role="columnheader">Renta media firmada · €/m² habitación</span><span role="columnheader">Comparables · mediana €/mes</span><span role="columnheader">Comparables · mediana €/m²</span></div>
      ${stats.map(zone => {
        const value = zone[key];
        const width = value && best ? Math.round(value / best * 100) : 0;
        return `<div class="zone-row" role="row">
          <span role="cell"><strong>${safe(zone.barrio)}</strong><small>${safe(zone.distrito)}${zone.pisos.length ? " · " + zone.pisos.map(safe).join(", ") : " · sin pisos de KALI"}</small>
            <span class="zone-bar" aria-hidden="true"><span style="width:${width}%"></span></span></span>
          <span role="cell" data-label="€/m² piso">${zone.pisos.length ? eurM2(zone.signedPisoM2) + " " + casesTag(zone.pisoPerM2.length) : '<span class="muted">—</span>'}</span>
          <span role="cell" data-label="€/m² habitación">${zone.roomPerM2.length ? eurM2(zone.signedRoomM2) + " " + casesTag(zone.roomPerM2.length) : '<span class="muted">—</span>'}</span>
          <span role="cell" data-label="Comparables €/mes">${zone.comps.length ? money.format(zone.compMedian) + " " + casesTag(zone.comps.length) : '<span class="muted">—</span>'}</span>
          <span role="cell" data-label="Comparables €/m²">${zone.comps.length ? eurM2(zone.compMedianM2) : '<span class="muted">—</span>'}</span>
        </div>`;
      }).join("")}
    </div>
    <p class="zone-note muted">€/m² piso = rentas firmadas del piso ÷ m² totales. €/m² habitación = renta firmada ÷ m² de la habitación. Con n &lt; ${fewCases}, la cifra es solo orientativa.</p>
  </section>`;
}

function pisosListView() {
  const stats = zoneStats();
  const distritos = [...new Set(Object.values(realEstateRecords).map(item => item.distrito))].sort((a,b) => a.localeCompare(b,"es"));
  const list = Object.entries(realEstateRecords).filter(([,record]) =>
    (!pisosFilter.distrito || record.distrito === pisosFilter.distrito) && (!pisosFilter.mode || record.mode === pisosFilter.mode) &&
    (!pisosFilter.orientation || record.orientation === pisosFilter.orientation));
  const select = (key,label,options) => `<label>${label}<select data-pisos-filter="${key}"><option value="">Todos</option>${options.map(([value,text]) => `<option value="${safe(value)}" ${pisosFilter[key] === value ? "selected" : ""}>${safe(text)}</option>`).join("")}</select></label>`;
  return heading("Pisos","Características de cada piso y sus habitaciones, y referencias de mercado para fijar precios. Los datos los registra Real Estate; aquí se consultan en solo lectura.") +
    `<p class="proposal-tag"><span class="pending-tag">Sección propuesta · pendiente de aprobación de Lorenzo</span></p>
    <div class="stack">${zoneRanking()}
    <section class="pisos-toolbar" aria-label="Filtros">${select("distrito","Distrito",distritos.map(item => [item,item]))}${select("mode","Modalidad",[["habitaciones","Por habitaciones"],["completo","Piso completo"]])}${select("orientation","Piso",[["Exterior","Exterior"],["Interior","Interior"]])}</section>
    <p class="directory-count muted">${list.length} ${list.length === 1 ? "piso" : "pisos"}</p>
    <div class="pisos-grid">${list.map(([name,record]) => {
      const zone = stats.find(item => item.barrio === record.barrio && item.distrito === record.distrito);
      const roomsList = pisoRooms(name);
      const roomAvg = record.mode === "completo" ? null : avg(roomsList.map(room => room.perM2));
      const nearest = [...record.transport].sort((a,b) => a.minutes - b.minutes)[0];
      const vsMarket = roomAvg && zone?.compMedianM2 ? (roomAvg / zone.compMedianM2 - 1) * 100 : null;
      return `<a class="panel piso-card" href="#pisos/${record.slug}">
        <div class="piso-card-head"><h2>${safe(name)}</h2><span class="muted">${safe(zoneName(record))}</span></div>
        <p class="piso-facts">${record.m2} m² · ${roomsList.length} habitaciones · ${record.bathrooms.length} baños · ${safe(record.orientation.toLowerCase())}${record.mode === "completo" ? " · piso completo" : ""}</p>
        <p class="piso-transport">${safe(nearest.type)} ${safe(nearest.stop)} (${safe(nearest.lines)}) · ${nearest.minutes} min a pie</p>
        <dl class="piso-metrics">
          <div><dt>€/m² piso</dt><dd>${eurM2(pisoRent(name) / record.m2)}</dd></div>
          <div><dt>€/m² habitación (media)</dt><dd>${roomAvg ? eurM2(roomAvg) : "No aplica"}</dd></div>
          <div><dt>Mercado de la zona</dt><dd>${zone?.comps.length ? eurM2(zone.compMedianM2) + " " + casesTag(zone.comps.length) : "Sin comparables"}</dd></div>
        </dl>
        ${vsMarket == null ? "" : `<p class="vs-market ${vsMarket < -5 ? "below" : vsMarket > 5 ? "above" : ""}">${vsMarket < -5 ? "Por debajo del" : vsMarket > 5 ? "Por encima del" : "En línea con el"} mercado de la zona (${vsMarket > 0 ? "+" : ""}${perM2.format(vsMarket)} % en €/m² de habitación)</p>`}
        <span class="go" aria-hidden="true">Abrir ficha →</span>
      </a>`;
    }).join("") || '<p class="empty">No hay pisos con esos filtros.</p>'}</div></div>`;
}

function pisoDetailView(slug) {
  const entry = Object.entries(realEstateRecords).find(([,record]) => record.slug === slug);
  if (!entry) return heading("Piso no encontrado","Vuelve a la lista de pisos.");
  const [name,record] = entry;
  const roomsList = pisoRooms(name);
  const zone = zoneStats().find(item => item.barrio === record.barrio && item.distrito === record.distrito);
  const whole = record.mode === "completo";
  const yes = value => value ? "Sí" : "No";
  const cycleOf = room => room.unit ? `<a class="text-button inline" href="#ciclo/${room.unit.id}" data-origin="pipeline">${safe(cycleStage(room.unit))}</a>` : `<span class="muted">${safe(room.status ?? "Sin ciclo")}</span>`;
  const extras = room => [room.balcony && "Balcón", room.ac && "Aire", room.desk && "Escritorio", "Armario " + room.wardrobe.toLowerCase()].filter(Boolean).join(" · ");
  const wholeUnit = whole ? rooms.find(room => catalogFloor(room.floor).name === name) : null;
  return `<p class="crumb"><a href="#pisos">← Pisos</a></p>
    <header class="page-head cycle-head">
      <p class="eyebrow">FICHA DEL PISO · REGISTRADO POR REAL ESTATE EL ${date(record.registeredOn,true).toUpperCase()}</p>
      <h1>${safe(name)}</h1>
      <p class="facts"><span>${safe(record.address)}</span><span><strong>${safe(zoneName(record))}</strong></span><span>${whole ? "Piso completo" : "Por habitaciones"}</span><span>Puntaje de la dirección ${record.score}/5</span></p>
      <div class="chips"><span class="readonly-chip">Solo lectura · lo mantiene Real Estate</span>${whole && wholeUnit ? `<a class="text-button inline" href="#ciclo/${wholeUnit.id}" data-origin="pipeline">Ver ciclo comercial del piso</a>` : ""}</div>
    </header>
    <div class="stack">
      <section class="panel"><div class="panel-head"><h2>El piso</h2></div><div class="block-body">
        <div class="piso-fields">${fields([["m² totales",record.m2 + " m²"],["m² del salón",record.livingM2 + " m²"],["Exterior / interior",record.orientation],["Planta",record.floorLevel],["Ascensor",yes(record.lift)],["Terraza o balcón",record.outdoor ?? "No"],["Climatización",record.climate],["Electrodomésticos",record.appliances.join(", ")],["Última reforma",record.renovated],["Gastos",record.utilities],["Baños",record.bathrooms.length + " (" + record.bathrooms.filter(item => item.suite).length + " en suite)"],["Habitaciones",roomsList.length]]).replace(/<dd>Sin registrar<\/dd>/g,`<dd>${pending}</dd>`)}</div>
        <div><h3>Transporte público cercano</h3><ul class="transport-list">${record.transport.map(item => `<li><span class="transport-type">${safe(item.type)}</span> <strong>${safe(item.stop)}</strong> · ${safe(item.lines)} <small>${item.minutes} min a pie</small></li>`).join("")}</ul></div>
      </div></section>
      <section class="panel"><div class="panel-head"><h2>Baños</h2><span class="muted">${record.bathrooms.length} baños · ${perM2.format(record.bathrooms.reduce((sum,item) => sum + item.m2,0))} m² en total</span></div>
        <div class="data-table bath-table" role="table">
          <div class="dt-row dt-head" role="row"><span role="columnheader">Baño</span><span role="columnheader">m²</span><span role="columnheader">Uso</span></div>
          ${record.bathrooms.map(item => `<div class="dt-row" role="row"><span role="cell" data-label="Baño"><strong>${item.id}</strong></span><span role="cell" data-label="m²">${perM2.format(item.m2)} m²</span><span role="cell" data-label="Uso">${item.suite ? `En suite · habitación ${item.suite}` : `Compartido · habitaciones ${item.shared.join(", ")}`}</span></div>`).join("")}
        </div></section>
      <section class="panel"><div class="panel-head"><h2>Habitaciones</h2><span class="muted">${roomsList.reduce((sum,room) => sum + room.m2,0)} m² en habitaciones · ${record.m2 - roomsList.reduce((sum,room) => sum + room.m2,0)} m² de zonas comunes y baños</span></div>
        <div class="data-table room-table" role="table">
          <div class="dt-row dt-head" role="row"><span role="columnheader">Habitación</span><span role="columnheader">m²</span><span role="columnheader">Ventana</span><span role="columnheader">Baño</span><span role="columnheader">Cama y extras</span><span role="columnheader">${whole ? "Luz natural" : "Renta firmada"}</span><span role="columnheader">${whole ? "" : "€/m²"}</span><span role="columnheader">${whole ? "" : "Ciclo"}</span></div>
          ${roomsList.map(room => `<div class="dt-row" role="row">
            <span role="cell" data-label="Habitación"><strong>Habitación ${room.number}</strong></span>
            <span role="cell" data-label="m²">${room.m2} m²</span>
            <span role="cell" data-label="Ventana"><span class="window ${room.window === "Exterior" ? "ext" : "int"}">${room.window}</span></span>
            <span role="cell" data-label="Baño">${safe(room.bath.label)}</span>
            <span role="cell" data-label="Cama y extras">${safe(room.bed)}<small>${safe(extras(room))} · luz ${room.light}/5</small></span>
            <span role="cell" data-label="${whole ? "Luz natural" : "Renta firmada"}">${whole ? room.light + "/5" : money.format(room.rent) + " / mes"}</span>
            <span role="cell" data-label="€/m²">${whole ? "" : eurM2(room.perM2)}</span>
            <span role="cell" data-label="Ciclo">${whole ? "" : cycleOf(room)}</span>
          </div>`).join("")}
        </div></section>
      <section class="panel"><div class="panel-head"><h2>Mercado de la zona · ${safe(zoneName(record))}</h2></div><div class="block-body">
        <div class="market-cards">
          <div class="market-card"><small>€/m² de este piso</small><strong>${eurM2(pisoRent(name) / record.m2)}</strong><span class="muted">${money.format(pisoRent(name))} / mes ÷ ${record.m2} m²</span></div>
          <div class="market-card"><small>Renta media firmada en la zona · €/m² piso</small><strong>${eurM2(zone.signedPisoM2)}</strong><span>${casesTag(zone.pisoPerM2.length)} ${zone.pisos.length === 1 ? '<span class="muted">Único piso de KALI en la zona</span>' : ""}</span></div>
          ${whole ? "" : `<div class="market-card"><small>Renta media firmada en la zona · €/m² habitación</small><strong>${eurM2(zone.signedRoomM2)}</strong><span>${casesTag(zone.roomPerM2.length)}</span></div>`}
          <div class="market-card"><small>Mediana de comparables externos</small><strong>${zone.comps.length ? money.format(zone.compMedian) + " / mes" : "Sin comparables"}</strong><span>${zone.comps.length ? eurM2(zone.compMedianM2) + " · " + casesTag(zone.comps.length) : ""}</span></div>
        </div>
        ${whole ? '<p class="muted">Los comparables externos son de habitaciones: para un piso completo sirven como contexto de la zona, no como referencia directa de precio.</p>' : `<h3>Cada habitación frente a habitaciones parecidas</h3>
        <p class="muted">Parecidas: mismo distrito, ±2 m², mismo tipo de ventana y de baño.</p>
        <div class="data-table compare-table" role="table">
          <div class="dt-row dt-head" role="row"><span role="columnheader">Habitación</span><span role="columnheader">Renta firmada</span><span role="columnheader">Mediana de parecidas</span><span role="columnheader">Diferencia</span></div>
          ${roomsList.map(room => {
            const similar = similarComparables(record,room);
            const ref = median(similar.map(item => item.rent));
            const diff = ref ? room.rent - ref : null;
            return `<div class="dt-row" role="row">
              <span role="cell" data-label="Habitación"><strong>Habitación ${room.number}</strong><small>${room.m2} m² · ${room.window.toLowerCase()} · ${room.bath.type.toLowerCase()}</small></span>
              <span role="cell" data-label="Renta firmada">${money.format(room.rent)}</span>
              <span role="cell" data-label="Mediana de parecidas">${ref ? money.format(ref) + " " + casesTag(similar.length) : '<span class="muted">Sin comparables parecidos</span>'}</span>
              <span role="cell" data-label="Diferencia">${diff == null ? "—" : `<span class="diff ${diff < -20 ? "below" : diff > 20 ? "above" : ""}">${diff > 0 ? "+" : ""}${money.format(diff)}${diff < -20 ? " · margen para subir" : diff > 20 ? " · por encima del mercado" : " · en línea"}</span>`}</span>
            </div>`;
          }).join("")}
        </div>`}
      </div></section>
    </div>`;
}

function pisosView() {
  const [, slug] = location.hash.slice(1).split("/");
  return slug ? pisoDetailView(slug) : pisosListView();
}

document.addEventListener("DOMContentLoaded", () => {
main.addEventListener("change", event => {
  const key = event.target.dataset?.pisosFilter;
  if (!key) return;
  pisosFilter[key] = event.target.value;
  render();
  main.querySelector(`[data-pisos-filter="${key}"]`)?.focus();
});
main.addEventListener("click", event => {
  const sort = event.target.closest("[data-zone-sort]");
  if (!sort) return;
  zoneSort = sort.dataset.zoneSort;
  render();
  main.querySelector(`[data-zone-sort="${zoneSort}"]`)?.focus();
});
});
