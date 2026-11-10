"use strict";

/* Pantalla de inicio del Sistema Operativo KALI. Solo Sales está operativa. */
const departments = [
  { name:"MANAGEMENT", text:"Dirección general y seguimiento de la operación." },
  { name:"FINANCE", text:"Cobros, fianzas y tesorería." },
  { name:"LEGAL", text:"Contratos y normativa." },
  { name:"HR", text:"Gestión de personas y equipo interno." },
  { name:"SALES", text:"Captación, pricing, comercialización y firma.", href:"#jornada" },
  { name:"REAL ESTATE", text:"Captación de pisos y ficha de los inmuebles." },
  { name:"COMMUNITY", text:"Experiencia del co-liver, convivencia, incidencias y servicios en piso." },
  { name:"DESIGN", text:"Reforma y diseño interior de los pisos." }
];

function hubView() {
  return `<section class="hub" aria-labelledby="hub-title">
    <header class="hub-brand">
      <img src="./kali-logo-crema.svg" width="190" height="60" alt="KALI Co-Living">
      <h1 id="hub-title" class="hub-subtitle">Sistema Operativo KALI</h1>
      <p class="hub-tagline">Selecciona un área para acceder a sus flujos y paneles.</p>
    </header>
    <ul class="dept-grid" role="list">
      ${departments.map((dept,index) => {
        const code = `DEP · ${String(index + 1).padStart(2,"0")}`;
        const body = `<div class="card-top"><span class="dept-code">${code}</span>${dept.href ? '<span class="badge-pilot">Piloto activo</span>' : '<span class="badge-soon">Próximamente</span>'}</div>
          <h2 class="dept-title">${dept.name}</h2><p class="dept-desc">${dept.text}</p>`;
        return `<li>${dept.href
          ? `<a class="dept-card active-pilot" href="${dept.href}">${body}<span class="card-footer"><span>Abrir Mi jornada</span><span aria-hidden="true">→</span></span></a>`
          : `<div class="dept-card is-soon" aria-disabled="true">${body}</div>`}</li>`;
      }).join("")}
    </ul>
  </section>`;
}
