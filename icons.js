/* Iconos lineales (trazos de Lucide, licencia ISC). ico("nombre") devuelve un <svg> en línea. */
const iconPaths = {
  jornada:["m3 17 2 2 4-4","m3 7 2 2 4-4","M13 6h8","M13 12h8","M13 18h8"],
  pipeline:["M12 2 2 7l10 5 10-5-10-5z","m2 17 10 5 10-5","m2 12 10 5 10-5"],
  pricing:["M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41z","M7 7h.01"],
  pisos:["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z","M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2","M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2","M10 6h4","M10 10h4","M10 14h4","M10 18h4"],
  users:["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2","M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z","M22 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  calendar:["M8 2v4","M16 2v4","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M3 10h18"],
  alert:["m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3","M12 9v4","M12 17h.01"],
  clock:["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 6v6l4 2"],
  ok:["M22 11.08V12a10 10 0 1 1-5.93-9.14","m9 11 3 3L22 4"],
  pen:["M12 20h9","M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"],
  in:["M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4","m10 17 5-5-5-5","M15 12H3"],
  out:["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","m16 17 5-5-5-5","M21 12H9"],
  right:["M5 12h14","m12 5 7 7-7 7"],
  left:["M19 12H5","m12 19-7-7 7-7"],
  check:["M20 6 9 17l-5-5"],
  trend:["m22 7-8.5 8.5-5-5L2 17","M16 7h6v6"],
  home:["m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]
};
const ico = (name, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${(iconPaths[name] ?? []).map(d => `<path d="${d}"/>`).join("")}</svg>`;
const riskIcon = { red:"alert", amber:"clock", green:"ok" };
/* Iconos de la navegación principal. */
for (const link of document.querySelectorAll(".masthead nav a")) {
  const key = { "#jornada":"jornada", "#pipeline":"pipeline", "#pricing":"pricing", "#pisos":"pisos", "#co-livers":"users", "#check-in-out":"calendar" }[link.getAttribute("href")];
  if (key) link.insertAdjacentHTML("afterbegin", ico(key));
}
const homeLink = document.querySelector(".btn-home");
if (homeLink) homeLink.innerHTML = ico("home") + "Inicio";
