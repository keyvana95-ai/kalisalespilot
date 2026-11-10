"use strict";

const profileFields = [
  ["name","Nombre completo"],["document","Documento de identidad"],["phone","Teléfono","tel"],["email","Correo electrónico","email"],
  ["nationality","Nacionalidad"],["age","Edad","number"],["gender","Género"],["occupation","Ocupación"],
  ["company","Empresa o centro de estudios"],["mode","Modalidad de trabajo"]
];
const followUpFields = [
  ["cleanliness","Limpieza"],["social","Convivencia"],["issues","Incidencias (sí/no)"],
  ["wouldRenew","¿Renovaría?"],["wouldAccept","¿Volvería a aceptar?"],["notes","Notas"]
];
const paymentFields = [
  ["deposit","Depósito"],["refund","Devolución del depósito"],["entryFee","Entry Fee"],["exitFee","Exit Fee"]
];
const contractStates = ["Pendiente de firma","Firmado","Vigente","Finalizado"];
const stayStates = ["Actual","Próxima","Anterior"];

function registry() {
  return state.registry ?? { people:{}, stays:{}, contracts:{}, payments:{} };
}

function originalProfile(name, source = []) {
  const [document,email,nationality,age,gender,occupation,company,mode] = source;
  return { name,document,email,nationality,age,gender,occupation,company,mode };
}

function stayContracts(stay) {
  return registry().contracts[stay.id] ?? (stay.contract === "Firma pendiente" && !stay.reference ? [] : stay.contract ? [{
    id:"original", reference:stay.reference ?? "", status:stay.contract, signedOn:stay.signed ?? "",
    start:stay.contractStart ?? stay.entry, end:stay.contractExit ?? stay.exit, rent:stay.rent
  }] : []);
}

function latestContract(stay) {
  const ordered = [...stayContracts(stay)].sort((first,second) => second.start.localeCompare(first.start));
  return ordered.find(item => ["Firmado","Vigente"].includes(item.status)) ?? ordered[0];
}

function stayPayments(stay) {
  const defaults = stay.deposit == null ? {} : { deposit:{ amount:stay.deposit, status:"Comprobado", on:stay.paid ?? "" } };
  if (stay.returned) defaults.refund = { amount:stay.deposit, status:"Comprobado", on:"" };
  if (stay.entryFee != null) defaults.entryFee = { amount:stay.entryFee, status:"Comprobado", on:stay.entryFeePaid ?? stay.paid ?? "" };
  return { ...defaults,...registry().payments[stay.id] };
}

function commitmentPayments(payments) {
  const missing = ["deposit","entryFee"].filter(key => payments[key]?.status !== "Comprobado" || !(payments[key].amount > 0));
  return { ready:!missing.length, missing };
}

function paymentText(payment, verifiedLabel = "Comprobado") {
  if (payment?.amount == null) return "Sin registrar";
  return money.format(payment.amount) + " · " + (payment.status === "Comprobado" ? verifiedLabel : "Pendiente");
}

function formInput(key,label,value,type = "text",options = "") {
  return `<label>${label}<input name="${key}" type="${type}" value="${safe(value ?? "")}" ${options}></label>`;
}

function formSelect(key,label,values,selected,placeholder = "") {
  return `<label>${label}<select name="${key}" ${placeholder ? "" : "required"}>
    ${placeholder ? `<option value="">${placeholder}</option>` : ""}
    ${values.map(value => `<option ${value === selected ? "selected" : ""}>${safe(value)}</option>`).join("")}
  </select></label>`;
}

function recordButton(kind,label,person = "",stay = "",contract = "",style = "secondary") {
  return `<button type="button" class="${style}" data-record="${kind}" data-person="${safe(person)}" data-record-stay="${safe(stay)}" data-contract="${safe(contract)}">${label}</button>`;
}

function roomChoices(stay) {
  const choices = rooms.map(room => ({ id:room.id, label:locationName(room) }));
  if (stay?.roomId && !choices.some(room => room.id === stay.roomId)) {
    choices.push({ id:stay.roomId, label:`${unitLabel(stay.number)} · ${stay.floor}` });
  }
  return choices;
}

function registryForm(trigger) {
  if (view() !== "co-livers") return;
  const { record:kind,person:key,recordStay:stayId,contract:contractId } = trigger.dataset;
  const person = directoryProfiles().get(key);
  const stay = person?.stays.find(item => item.id === stayId);
  const originalTrigger = dialog.open ? dialogTrigger : trigger;
  if ((key && !person) || (stayId && !stay)) return;
  let title;
  let content;
  if (kind === "profile") {
    title = person ? "Editar perfil" : "Añadir residente";
    content = `<p class="muted">Usa datos ficticios. Puedes añadir la estancia después de guardar el perfil.</p><div class="fields">
      ${profileFields.map(([name,label,type]) => formInput(name,label,person?.profile[name],type,
        name === "name" ? 'required maxlength="120"' : type === "number" ? 'min="0" max="120" step="1"' : 'maxlength="160"')).join("")}</div>`;
  } else if (kind === "stay" && person) {
    title = stay ? "Editar estancia" : "Añadir estancia";
    const linked = stay?.link;
    content = `<div class="fields">
      ${linked ? `<p><strong>${unitLabel(stay.number)} · ${safe(stay.floor)}</strong><br><small>Asignación vinculada al ciclo comercial</small></p>` :
        `<label>Habitación y piso<select name="room" required><option value="">Selecciona una habitación</option>
          ${roomChoices(stay).map(room => `<option value="${safe(room.id)}" ${room.id === stay?.roomId ? "selected" : ""}>${safe(room.label)}</option>`).join("")}</select></label>`}
      ${formInput("entry","Check-in",stay?.entry,"date","required")}
      ${formInput("exit","Check-out",stay?.exit,"date","required")}
      ${linked ? "" : formSelect("status","Estado de la estancia",stayStates,stay?.status ?? "Próxima")}
      </div>
      <details class="registry-group"><summary>Seguimiento y notas</summary><div class="fields">
        ${followUpFields.filter(([name]) => name !== "notes").map(([name,label]) => ["issues","wouldRenew","wouldAccept"].includes(name) ?
          formSelect(name,label,["Sí","No"],stay?.[name],"Sin registrar") : formInput(name,label,stay?.[name],"text",'maxlength="160"')).join("")}
      </div><label>Notas<textarea name="notes" rows="3" maxlength="800">${safe(stay?.notes ?? "")}</textarea></label></details>`;
  } else if (kind === "contract" && stay) {
    const contract = stayContracts(stay).find(item => item.id === contractId);
    title = contract ? "Editar contrato" : "Añadir contrato";
    content = `<div class="fields">
      ${formInput("reference","Referencia",contract?.reference,"text",'maxlength="100"')}
      ${formSelect("status","Estado del contrato",contractStates,contract?.status ?? "Pendiente de firma")}
      ${formInput("signedOn","Fecha de firma",contract?.signedOn,"date")}
      ${formInput("start","Inicio contractual",contract?.start ?? stay.entry,"date","required")}
      ${formInput("end","Fin contractual",contract?.end ?? stay.exit,"date","required")}
      ${formInput("months","Duración (meses)",contract?.months,"number",'min=".5" step=".5"')}
      ${formInput("rent","Renta mensual (€)",contract?.rent ?? stay.rent,"number",'min="0" step=".01" required')}
      </div><label>Condiciones o notas<textarea name="terms" rows="3" maxlength="800">${safe(contract?.terms ?? "")}</textarea></label>`;
  } else if (kind === "payments" && stay) {
    title = "Editar importes y comprobaciones";
    const payments = stayPayments(stay);
    content = paymentFields.map(([name,label]) => {
      const payment = payments[name] ?? {};
      return `<fieldset class="registry-payment"><legend>${label}</legend><div class="fields">
        ${formInput(name + "Amount","Importe (€)",payment.amount,"number",'min="0" step=".01"')}
        ${formSelect(name + "Status","Comprobación",["Pendiente","Comprobado"],payment.status ?? "Pendiente")}
        ${formInput(name + "On","Fecha de comprobación",payment.on,"date")}
        ${formInput(name + "Proof","Referencia del comprobante",payment.proof,"text",'maxlength="220"')}
      </div></fieldset>`;
    }).join("");
  } else {
    return;
  }
  show(title,person?.name ?? "Base Datos Co-livers",`<form data-form="registry" data-record-kind="${kind}" data-person="${safe(key)}" data-record-stay="${safe(stayId)}" data-contract="${safe(contractId)}">
    ${content}<div class="registry-actions">${person ? recordButton("back","Volver a la ficha",key) : ""}<button type="submit">Guardar</button></div>
  </form>`,originalTrigger);
}

function conflictingStay(roomId,entry,exit,except = "") {
  return [...directoryProfiles().values()].some(person => person.stays.some(stay =>
    stay.id !== except && stay.roomId === roomId && entry < stay.exit && stay.entry < exit));
}

function saveRegistryForm(form,values) {
  if (view() !== "co-livers") return;
  const { recordKind:kind,person:key,recordStay:stayId,contract:contractId } = form.dataset;
  const profiles = directoryProfiles();
  const person = profiles.get(key);
  const stay = person?.stays.find(item => item.id === stayId);
  if ((key && !person) || (stayId && !stay)) return;
  const data = registry();
  let residentKey = key;
  let message;
  if (kind === "profile") {
    if (!values.name.trim()) return invalid(form.elements.name,"Indica el nombre del residente.");
    const document = directoryToken(values.document.trim());
    if (document && [...profiles.values()].some(item => item.key !== key && directoryToken(item.profile.document ?? "") === document)) {
      return invalid(form.elements.document,"Ya existe un residente con este documento.");
    }
    residentKey ||= "resident-" + crypto.randomUUID();
    data.people[residentKey] = Object.fromEntries(profileFields.map(([name]) => [name,values[name].trim()]));
    message = "Perfil guardado.";
  } else if (kind === "stay" && person) {
    if (values.exit <= values.entry) return invalid(form.elements.exit,"El check-out debe ser posterior al check-in.");
    const roomId = stay?.link ? stay.roomId : values.room;
    const room = rooms.find(item => item.id === roomId) ?? (roomId === stay?.roomId ? stay : null);
    if (!room || (!stay?.link && !stayStates.includes(values.status))) return;
    const changed = !stay || roomId !== stay.roomId || values.entry !== stay.entry || values.exit !== stay.exit;
    if (changed && conflictingStay(roomId,values.entry,values.exit,stayId)) return invalid(form.elements.exit,"La habitación ya tiene otra estancia en esas fechas.");
    const id = stayId || "stay-" + crypto.randomUUID();
    const dates = { entry:values.entry,exit:values.exit };
    const followUp = Object.fromEntries(followUpFields.map(([name]) => [name,values[name].trim()]));
    if (stay?.link) {
      const cycle = state[roomId];
      if (stay.link === "next") {
        if (cycle.next.signed) cycle.next.contractExit ??= cycle.next.exit;
        Object.assign(cycle.next,dates);
      } else cycle.currentDates = dates;
      data.stays[id] = followUp;
    } else {
      data.stays[id] = { ...followUp,...dates,personKey:key,roomId,floor:room.floor,number:room.number,status:values.status };
    }
    message = "Estancia guardada. La agenda refleja sus fechas.";
  } else if (kind === "contract" && stay) {
    const contracts = stayContracts(stay);
    if (!contractStates.includes(values.status) || (contractId && !contracts.some(item => item.id === contractId))) return;
    if (values.end <= values.start) return invalid(form.elements.end,"El fin contractual debe ser posterior al inicio.");
    if (stay.status === "Próxima" && ["Firmado","Vigente"].includes(values.status) &&
        !(stay.signed || contracts.some(item => item.signedOn && ["Firmado","Vigente"].includes(item.status))) &&
        !commitmentPayments(stayPayments(stay)).ready) {
      return invalid(form.elements.status,"Comprueba el depósito y el Entry Fee antes de registrar la firma interna.");
    }
    if ((values.status === "Firmado" || (stay.link === "next" && values.status === "Vigente")) && !values.signedOn) return invalid(form.elements.signedOn,"Indica la fecha de firma.");
    const contract = { ...values,id:contractId || "contract-" + crypto.randomUUID(),reference:values.reference.trim(),terms:values.terms.trim(),
      rent:Number(values.rent),months:values.months ? Number(values.months) : null };
    if (contract.reference && contracts.some(item => item.id !== contractId && directoryToken(item.reference) === directoryToken(contract.reference))) {
      return invalid(form.elements.reference,"Ya existe un contrato con esta referencia en la estancia.");
    }
    const updated = contractId ? contracts.map(item => item.id === contractId ? contract : item) : [...contracts,contract];
    if (stay.link === "next") {
      const cycle = state[stay.roomId];
      const signed = updated.filter(item => item.signedOn && ["Firmado","Vigente"].includes(item.status))
        .sort((first,second) => second.start.localeCompare(first.start))[0];
      if (!signed && cycle.next.signed) return invalid(form.elements.status,"La estancia ya tiene una firma registrada.");
      if (signed) Object.assign(cycle.next,{ signed:signed.signedOn,reference:signed.reference,contractExit:signed.end,rent:signed.rent });
    }
    data.contracts[stayId] = updated;
    message = "Contrato guardado en el historial de la estancia.";
  } else if (kind === "payments" && stay) {
    const payments = {};
    for (const [name] of paymentFields) {
      const amount = values[name + "Amount"] === "" ? null : Number(values[name + "Amount"]);
      const status = values[name + "Status"];
      if (!["Pendiente","Comprobado"].includes(status)) return;
      if (status === "Comprobado" && amount === null) return invalid(form.elements[name + "Amount"],"Indica el importe comprobado.");
      payments[name] = { amount,status,on:values[name + "On"],proof:values[name + "Proof"].trim() };
    }
    if (payments.refund.status === "Comprobado" && payments.deposit.amount != null && payments.refund.amount > payments.deposit.amount) {
      return invalid(form.elements.refundAmount,"La devolución no puede superar el depósito registrado.");
    }
    if (stay.link === "next" && commitmentPayments(stayPayments(stay)).ready) {
      const missing = commitmentPayments(payments).missing[0];
      if (missing) {
        const field = payments[missing].status === "Comprobado" ? missing + "Amount" : missing + "Status";
        return invalid(form.elements[field],"Este pago ya forma parte de un compromiso registrado.");
      }
    }
    data.payments[stayId] = payments;
    if (stay.link === "next") {
      const next = state[stay.roomId].next;
      next.deposit = payments.deposit.amount;
      next.paid = payments.deposit.on || null;
    }
    message = "Importes y comprobaciones guardados.";
  } else {
    return;
  }
  state.registry = data;
  return { residentKey,message };
}
