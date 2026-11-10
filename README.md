# KALI Co-Living · Piloto de Sales

Piloto estático con datos ficticios, sin dependencias ni servicios externos.

## Probarlo

Desde esta carpeta, ejecuta `python3 -m http.server 4173 --bind 127.0.0.1` y abre `http://127.0.0.1:4173/`.

1. En **Mi jornada** aparecen solo los casos que requieren atención. Cada caso abre su **ficha del ciclo** en el bloque correspondiente.
2. En **Pipeline** se ven los pisos con su resumen de riesgo y acciones pendientes. Abre **Piso Centro** y pulsa la **Habitación 3**.
3. En **Cierre**, comprueba el depósito y el Entry Fee del ejemplo. Con ambos comprobados, el siguiente paso es **Registrar firma interna**. Al guardar la firma de prueba, la renovación del residente saliente queda sin efecto.
4. En la **Habitación 3**, antes de firmar, prueba **Cerrar sin firma**: el compromiso pasa al historial, la habitación vuelve a comercializarse y el residente recupera la opción de renovar.
5. En **Habitación 2 · Piso Centro**, registra la respuesta **Aceptada** a la oferta de renovación y después la firma de renovación. El check-out cambia en la estancia.
6. **Piso Sur** se comercializa como piso completo (hipótesis pendiente de confirmar): la tarjeta abre directamente su ficha. Registra la oferta de renovación al titular.
7. En **Habitación 1 · Piso Norte**, abre el ciclo desde su aviso a 60 días.
8. Desde cualquier ficha, **Abrir estancia** muestra la ficha del residente en solo lectura, con enlaces a **Ver ciclo comercial** y **Editar en Base Datos Co-livers**.
9. Abre **Base Datos Co-livers** para buscar residentes actuales, próximos o anteriores. Usa **Añadir residente** para registrar un perfil ficticio, y su ficha para añadir estancias y contratos o comprobar importes. **Lucía Ejemplo** muestra dos estancias con importes y estados de depósito distintos.
10. En **Check-in / Check-out**, selecciona un día del calendario para ver sus check-ins y check-outs. Para cambiar una fecha, usa **Editar estancia** en la ficha de **Base Datos Co-livers**.

11. En **Pisos**, el ranking de zonas (barrios y distritos oficiales de Madrid) muestra la renta media firmada por m² del piso y de la habitación y la mediana de comparables externos, con el número de casos de cada cifra. Abre la tarjeta del **Piso Centro**: la ficha, en solo lectura porque la mantiene Real Estate, reúne el piso, los baños, las habitaciones y el mercado de la zona. La **Habitación 3** aparece por debajo de las habitaciones parecidas. La sección está pendiente de aprobación de Lorenzo.

La unidad queda comprometida cuando Sales comprueba el depósito y el Entry Fee. KALI firma después internamente. Los registros anteriores que solo tienen el depósito quedan pendientes de comprobar el Entry Fee. El plazo de respuesta de siete días para la oferta de renovación y el estado de una unidad con renovación aceptada sin firmar siguen pendientes de Lorenzo. El catálogo de pisos de `ciclo.js` normaliza las distintas formas de escribir un piso y fija si se comercializa por habitaciones o completo.

La Base Datos Co-livers conserva los campos de la hoja original entre perfil, estancia, contrato y seguimiento. Las comprobaciones guardan importe, estado, fecha y referencia del comprobante. Un alta manual aparece en el directorio y la agenda, y no abre un ciclo comercial.

Los cambios se guardan en el navegador en el que se hicieron. **Reiniciar demostración** restaura el conjunto de ejemplo.

Para una futura prueba en Vercel, esta carpeta puede servir como raíz de un proyecto estático. No contiene Excel, credenciales ni datos de residentes reales.
