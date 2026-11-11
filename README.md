# KALI Co-Living · Piloto de Sales

Piloto estático con datos ficticios, sin dependencias ni servicios externos.

## Probarlo

Desde esta carpeta, ejecuta `python3 -m http.server 4173 --bind 127.0.0.1` y abre `http://127.0.0.1:4173/`.

0. Al abrir el piloto aparece la **pantalla de inicio** del Sistema Operativo KALI con las ocho áreas (Management, Finance, Legal, HR, Sales, Real Estate, Community y Design). Solo **Sales** está operativa: su tarjeta lleva a **Mi jornada**. Las demás aparecen como **Próximamente**. Desde cualquier pantalla de Sales, **← Inicio** o el logo devuelven al inicio.
1. En **Mi jornada** aparecen solo los casos que requieren atención. Cada caso abre su **ficha del ciclo** en el bloque correspondiente.
2. En **Pipeline** se ven los pisos con su resumen de riesgo y acciones pendientes. Abre **Narciso Serra 8** y pulsa la **Habitación 3**.
3. En **Narciso Serra 8 · Habitación 3**, el bloque **Cierre** muestra una reserva: el nuevo inquilino pagó el depósito y el Entry Fee a la vez y KALI firmó el contrato electrónicamente en ese momento (regla confirmada por Lorenzo el 11-11-2026). La renovación del residente saliente quedó sin efecto. El siguiente paso es el **traspaso**, pendiente del módulo de Community.
4. En la misma habitación prueba **Anular reserva** (por ejemplo, por un pago devuelto): indica el motivo y si el depósito se devuelve o se retiene. La estancia, los pagos y el contrato no se borran; quedan en Base Datos Co-livers como **reserva anulada** y la habitación vuelve a comercializarse. En **Narciso Serra 8 · Habitación 1**, registra el **pago y firma** del Candidato B.
5. En **Habitación 2 · Narciso Serra 8**, registra la respuesta **Aceptada** a la oferta de renovación y después la firma de renovación. El check-out cambia en la estancia.
6. **Santa Engracia 122** se comercializa como piso completo (hipótesis pendiente de confirmar): la tarjeta abre directamente su ficha. Registra la oferta de renovación al titular.
7. En **Habitación 1 · Canillas 43**, abre el ciclo desde su aviso a 60 días.
8. Desde cualquier ficha, **Abrir estancia** muestra la ficha del residente en solo lectura, con enlaces a **Ver ciclo comercial** y **Editar en Base Datos Co-livers**.
9. Abre **Base Datos Co-livers** para buscar residentes actuales, próximos o anteriores. Usa **Añadir residente** para registrar un perfil ficticio, y su ficha para añadir estancias y contratos o comprobar importes. **Lucía Ejemplo** muestra dos estancias con importes y estados de depósito distintos.
10. En **Check-in / Check-out**, la pestaña **Calendario** muestra las fechas por día y la pestaña **Por piso** muestra cada habitación con un semáforo (aviso a 60 días, riesgo de vacío a 45 días sin depósito, siguiente estancia comprometida), quién hace cada check-in y check-out (dato de Community) y una línea temporal de 60 días. En el calendario, selecciona un día para ver sus check-ins y check-outs. Para cambiar una fecha, usa **Editar estancia** en la ficha de **Base Datos Co-livers**.

11. En **Pisos**, el ranking de zonas (barrios y distritos oficiales de Madrid) muestra la renta media firmada por m² del piso y de la habitación y la mediana de comparables externos, con el número de casos de cada cifra. Abre la tarjeta del **Narciso Serra 8**: la ficha, en solo lectura porque la mantiene Real Estate, reúne el piso, los baños, las habitaciones y el mercado de la zona. La **Habitación 3** aparece por debajo de las habitaciones parecidas. Los pisos usan sus nombres reales; solo los datos que constan en el Pipeline de inmuebles de Real Estate (Narciso Serra 8 y Esparteros 11) son reales y se marcan así. El resto de características, las rentas y los residentes son de ejemplo. La sección está pendiente de aprobación de Lorenzo.

La unidad queda reservada cuando el inquilino paga el depósito y el Entry Fee a la vez: en ese momento KALI firma el contrato electrónicamente (Lorenzo, 11-11-2026). Desaparecen el plazo de siete días entre cobro y firma y la solicitud de renovación «En espera». Siguen pendientes de Lorenzo el plazo de respuesta a la oferta de renovación y el estado de una unidad con renovación aceptada sin firmar, y falta confirmar si el inquilino también firma electrónicamente. El catálogo de pisos de `ciclo.js` normaliza las distintas formas de escribir un piso y fija si se comercializa por habitaciones o completo.

La Base Datos Co-livers conserva los campos de la hoja original entre perfil, estancia, contrato y seguimiento. Las comprobaciones guardan importe, estado, fecha y referencia del comprobante. Un alta manual aparece en el directorio y la agenda, y no abre un ciclo comercial.

Los cambios se guardan en el navegador en el que se hicieron. **Reiniciar demostración** restaura el conjunto de ejemplo.

Para una futura prueba en Vercel, esta carpeta puede servir como raíz de un proyecto estático. No contiene Excel, credenciales ni datos de residentes reales.
