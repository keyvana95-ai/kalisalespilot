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
  compass:["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"],
  wallet:["M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1","M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"],
  scale:["m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z","m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z","M7 21h10","M12 3v18","M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"],
  handshake:["m11 17 2 2a1 1 0 1 0 3-3","m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4","m21 3 1 11h-2","M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3","M3 4h8"],
  househeart:["M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M8.62 13.8A2.25 2.25 0 1 1 12 10.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z"],
  pencilruler:["M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13","m8 6 2-2","m18 16 2-2","m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17","M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z","m15 5 4 4"],
  target:["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z","M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"],
  home:["m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]
};
const ico = (name, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${(iconPaths[name] ?? []).map(d => `<path d="${d}"/>`).join("")}</svg>`;
const riskIcon = { red:"alert", amber:"clock", green:"ok" };
/* Iconos de la navegación principal. */
for (const link of document.querySelectorAll(".masthead nav a")) {
  const key = { "#jornada":"jornada", "#objetivos":"target", "#pipeline":"pipeline", "#pricing":"pricing", "#pisos":"pisos", "#co-livers":"users", "#check-in-out":"calendar" }[link.getAttribute("href")];
  if (key) link.insertAdjacentHTML("afterbegin", ico(key));
}
const homeLink = document.querySelector(".btn-home");
if (homeLink) homeLink.innerHTML = ico("home") + "Inicio";
