const WHATSAPP_PHONE = "";

function getInitialsFromName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}

async function loadCurrentUser() {
  const nameEl = document.getElementById("user-name");
  const initialsEl = document.getElementById("user-initials");
  if (!nameEl || !initialsEl) return;

  try {
    const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const fullName = data.fullName || data.full_name || data.name || "";
    if (fullName) {
      nameEl.textContent = fullName;
      initialsEl.textContent = getInitialsFromName(fullName);
    }
  } catch (err) {
    console.error("Error cargando usuario actual:", err);
  }
}

function getRoomNumberFromAnyLabel(label) {
  const raw = String(label ?? "").trim();
  if (!raw) return "";
  const m = raw.match(/\d+/g);
  if (m && m.length) return m.join("");
  return raw.replace(/habitaci[oó]n|hab\.?/gi, "").trim();
}

function formatRoomOptionText(room, index) {
  const roomNumber =
    room.room_number ??
    room.roomNumber ??
    room.numero_habitacion ??
    room.numeroHabitacion ??
    room.numero ??
    room.number ??
    room.habitacion ??
    room.code ??
    room.codigo ??
    null;

  if (roomNumber != null) return String(roomNumber).trim();
  const fallbackNum = room.id ?? index + 1;
  return String(fallbackNum).trim();
}

async function loadRooms() {
  const select = document.getElementById("room-select");
  const status = document.getElementById("status");
  if (!select) return;

  try {
    const res = await fetch("/api/rooms", { credentials: "include" });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const rooms = await res.json();

    if (!Array.isArray(rooms) || rooms.length === 0) {
      if (status) {
        status.textContent = "No hay habitaciones registradas en el sistema.";
        status.className = "status error";
      }
      return;
    }

    rooms.forEach((room, index) => {
      const option = document.createElement("option");

      const id =
        room.id ??
        room.room_id ??
        room.roomId ??
        room.number ??
        room.room_number ??
        room.numero_habitacion ??
        room.numero ??
        index + 1;

      const roomText = formatRoomOptionText(room, index);

      option.value = String(id);
      option.textContent = roomText;
      option.dataset.roomNumber = getRoomNumberFromAnyLabel(roomText);
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando habitaciones:", err);
    if (status) {
      status.textContent = "Error cargando habitaciones. Revisa el endpoint /api/rooms en el backend.";
      status.className = "status error";
    }
  }
}

function formatPrice(price) {
  const n = Number(price);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

async function loadProducts() {
  const list = document.getElementById("products-list");
  const status = document.getElementById("status");
  if (!list) return;

  try {
    const res = await fetch("/api/products", { credentials: "include" });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const products = await res.json();

    list.innerHTML = "";

    (Array.isArray(products) ? products : []).forEach((product) => {
      const row = document.createElement("div");
      row.className = "product-row";

      const productId = product.id ?? product.product_id ?? product.productId ?? "";
      const name = product.name ?? product.product_name ?? "Producto";
      const price = Number(product.price);

      row.dataset.productId = String(productId);
      row.dataset.productName = String(name);
      row.dataset.productPrice = Number.isFinite(price) ? String(price) : "0";

      const checkboxCol = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "product-check";
      checkboxCol.appendChild(checkbox);

      const infoCol = document.createElement("div");
      const nameEl = document.createElement("div");
      nameEl.className = "product-name";
      nameEl.textContent = name;

      const priceEl = document.createElement("span");
      priceEl.className = "product-price";
      priceEl.textContent = `Precio: ${formatPrice(price)}`;

      infoCol.appendChild(nameEl);
      infoCol.appendChild(priceEl);

      const qtyCol = document.createElement("div");
      qtyCol.className = "product-qty";

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.min = "0";
      qtyInput.value = "0";
      qtyInput.className = "product-qty-input";

      const qtyLabel = document.createElement("span");
      qtyLabel.textContent = "cant.";

      qtyCol.appendChild(qtyInput);
      qtyCol.appendChild(qtyLabel);

      row.appendChild(checkboxCol);
      row.appendChild(infoCol);
      row.appendChild(qtyCol);

      list.appendChild(row);
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
    if (status) {
      status.textContent = "No se pudieron cargar los productos.";
      status.className = "status error";
    }
  }
}

function sanitizePhone(phone) {
  const s = String(phone || "").trim();
  if (!s) return "";
  return s.replace(/[^\d]/g, "");
}

function absolutizeUrl(u) {
  const raw = String(u || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return location.origin + raw;
  return location.origin + "/" + raw.replace(/^\/+/, "");
}

function buildInvoiceLinkFromCreated(created) {
  const candidates = [
    created?.invoiceUrl,
    created?.pdfUrl,
    created?.pdf_url,
    created?.invoice_url,
    created?.data?.invoiceUrl,
    created?.data?.pdfUrl,
    created?.data?.pdf_url,
    created?.data?.invoice_url
  ].filter(Boolean);

  if (candidates.length) return absolutizeUrl(candidates[0]);

  const id =
    created?.id ??
    created?.consumptionId ??
    created?.consumption_id ??
    created?.data?.id ??
    created?.data?.consumptionId ??
    created?.data?.consumption_id;

  if (id != null) return `${location.origin}/api/consumptions/${id}/invoice.pdf`;
  return "";
}

async function verifyLinkExists(url) {
  if (!url) return false;

  try {
    const res = await fetch(url, { method: "HEAD", credentials: "include" });
    if (res.ok) return true;
  } catch (_) {}

  try {
    const res2 = await fetch(url, { method: "GET", credentials: "include" });
    return res2.ok;
  } catch (_) {
    return false;
  }
}

async function resolveInvoiceLinkWithFallback(created) {
  const url = buildInvoiceLinkFromCreated(created);
  if (!url) return "";

  if (await verifyLinkExists(url)) return url;

  const id =
    created?.id ??
    created?.consumptionId ??
    created?.consumption_id ??
    created?.data?.id ??
    created?.data?.consumptionId ??
    created?.data?.consumption_id;

  if (id == null) return "";

  const base = `${location.origin}/api/consumptions/${id}`;
  const alternatives = [
    `${base}/invoice.pdf`,
    `${base}/invoice`,
    `${base}/pdf`,
    `${location.origin}/api/consumption/${id}/invoice.pdf`,
    `${location.origin}/api/invoices/${id}.pdf`,
    `${location.origin}/api/invoices/${id}/pdf`
  ];

  for (const a of alternatives) {
    if (await verifyLinkExists(a)) return a;
  }

  return "";
}

function buildWhatsappMessage(roomNumber, items, total, note, invoiceLink) {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-CO");
  const hora = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  const lines = [];
  lines.push("Consumo minibar Nattivo");
  lines.push(`Habitación ${roomNumber}`);
  lines.push(`Fecha: ${fecha} – Hora: ${hora}`);
  lines.push("");

  items.forEach((it) => {
    const itemTotal = it.quantity * it.price;
    lines.push(`${it.quantity} × ${it.name} - ${formatPrice(itemTotal)}`);
  });

  const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);
  lines.push("");
  lines.push(`Total de ítems: ${totalQty}`);
  lines.push(`Total: ${formatPrice(total)}`);

  const cleanNote = String(note || "").trim();
  if (cleanNote) {
    lines.push("");
    lines.push(`Nota: ${cleanNote}`);
  }

  if (invoiceLink) {
    lines.push("");
    lines.push(`Cuenta de cobro (PDF): ${invoiceLink}`);
  }

  return lines.join("\n");
}

function openWhatsAppWithMessage(message) {
  const encodedMessage = encodeURIComponent(message);
  const phone = sanitizePhone(WHATSAPP_PHONE);

  const url = phone
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(url, "_blank");
}

async function handleSubmit() {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = "";
    status.className = "status";
  }

  const roomSelect = document.getElementById("room-select");
  const productsList = document.getElementById("products-list");
  const noteInput = document.getElementById("note");
  if (!roomSelect || !productsList) return;

  const roomId = roomSelect.value;
  const selectedOption = roomSelect.options[roomSelect.selectedIndex];
  const roomNumber = getRoomNumberFromAnyLabel(
    selectedOption?.dataset?.roomNumber || selectedOption?.textContent || ""
  );

  if (!roomId || !roomNumber) {
    if (status) {
      status.textContent = "Selecciona una habitación antes de continuar.";
      status.className = "status error";
    }
    return;
  }

  const rows = Array.from(productsList.querySelectorAll(".product-row"));
  const selectedItems = rows
    .map((row) => {
      const checkbox = row.querySelector(".product-check");
      const qtyInput = row.querySelector(".product-qty-input");

      const checked = Boolean(checkbox && checkbox.checked);
      const qty = Number(qtyInput?.value || "0");
      const price = Number(row.dataset.productPrice || "0");
      const name = row.dataset.productName || "Producto";
      const productId = row.dataset.productId || "";

      if (!checked || !Number.isFinite(qty) || qty <= 0) return null;

      return {
        productId,
        name,
        quantity: qty,
        price: Number.isFinite(price) ? price : 0
      };
    })
    .filter(Boolean);

  if (selectedItems.length === 0) {
    if (status) {
      status.textContent = "Selecciona al menos un producto y su cantidad.";
      status.className = "status error";
    }
    return;
  }

  const total = selectedItems.reduce((acc, it) => acc + it.quantity * it.price, 0);
  const note = noteInput ? String(noteInput.value || "") : "";

  const payload = {
    roomId,
    note,
    items: selectedItems.map((x) => ({ productId: x.productId, quantity: x.quantity }))
  };

  try {
    const res = await fetch("/api/consumptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });

    if (!res.ok) throw new Error("Error registrando el consumo");

    let created = null;
    try {
      created = await res.json();
    } catch (_) {
      created = null;
    }

    let invoiceLink = "";
    try {
      invoiceLink = await resolveInvoiceLinkWithFallback(created);
    } catch (_) {
      invoiceLink = "";
    }

    const message = buildWhatsappMessage(roomNumber, selectedItems, total, note, invoiceLink);
    openWhatsAppWithMessage(message);

    if (status) {
      status.textContent = invoiceLink
        ? "Consumo registrado. Se abrió WhatsApp con el enlace del PDF."
        : "Consumo registrado. Se abrió WhatsApp (sin enlace PDF).";
      status.className = "status success";
    }
  } catch (err) {
    console.error("Error al registrar consumo:", err);
    if (status) {
      status.textContent = "Ocurrió un error al registrar el consumo.";
      status.className = "status error";
    }
  }
}

function setReportStatus(msg, kind) {
  const el = document.getElementById("report-status");
  if (!el) return;
  el.textContent = msg || "";
  el.className = `report-status ${kind || ""}`.trim();
}

function normalizeConsumptionRecord(raw) {
  const room =
    raw.roomNumber ??
    raw.room_number ??
    raw.room ??
    raw.habitacion ??
    raw.numero_habitacion ??
    raw.room?.room_number ??
    raw.room?.number ??
    raw.room?.numero_habitacion ??
    raw.room?.numero ??
    "";

  const roomNumber = getRoomNumberFromAnyLabel(room);

  const created =
    raw.created_at ??
    raw.createdAt ??
    raw.date ??
    raw.fecha ??
    raw.timestamp ??
    raw.submitted_at ??
    raw.created ??
    null;

  const createdAt = created ? new Date(created) : null;

  const itemsRaw = raw.items ?? raw.products ?? raw.detalle ?? raw.details ?? raw.consumptions ?? [];
  const items = Array.isArray(itemsRaw)
    ? itemsRaw
        .map((it) => {
          const name = it.name ?? it.product_name ?? it.product?.name ?? it.productName ?? "Producto";
          const quantity = Number(it.quantity ?? it.qty ?? it.cantidad ?? 0);
          const price = Number(it.price ?? it.valor ?? it.product?.price ?? it.unitPrice ?? 0);
          if (!Number.isFinite(quantity) || quantity <= 0) return null;
          return { name, quantity, price: Number.isFinite(price) ? price : 0 };
        })
        .filter(Boolean)
    : [];

  const total = Number(raw.total ?? raw.total_amount ?? raw.totalAmount ?? raw.valor_total ?? NaN);
  const computedTotal = items.reduce((acc, it) => acc + it.quantity * it.price, 0);

  return {
    roomNumber: roomNumber || "N/A",
    createdAt,
    items,
    total: Number.isFinite(total) ? total : computedTotal
  };
}

function groupReportByRoom(records) {
  const map = new Map();

  records.forEach((r) => {
    const key = r.roomNumber || "N/A";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });

  const rooms = Array.from(map.keys()).sort((a, b) => String(a).localeCompare(String(b), "es"));
  return rooms.map((roomNumber) => {
    const list = map.get(roomNumber) || [];
    list.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.getTime() : 0;
      const tb = b.createdAt ? b.createdAt.getTime() : 0;
      return ta - tb;
    });
    const roomTotal = list.reduce((acc, x) => acc + (Number(x.total) || 0), 0);
    const roomItems = list.reduce((acc, x) => acc + x.items.reduce((iAcc, it) => iAcc + (it.quantity || 0), 0), 0);
    return { roomNumber, records: list, roomTotal, roomItems };
  });
}

async function fetchConsumptionsForReport(from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const urls = [
    `/api/consumptions/report?${params.toString()}`,
    `/api/consumptions?${params.toString()}`,
    `/api/consumptions/report`,
    `/api/consumptions`
  ];

  let lastErr = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("No data");
}

function buildReportFilename(from, to) {
  const f = from || "todo";
  const t = to || "todo";
  return `informe-consumos-${f}-${t}.pdf`;
}

async function downloadReportPdf() {
  setReportStatus("", "");

  const jsPDFCtor = window.jspdf?.jsPDF || window.jsPDF;
  if (!jsPDFCtor) {
    setReportStatus("No está cargada la librería del PDF.", "err");
    return;
  }

  const from = document.getElementById("report-from")?.value || "";
  const to = document.getElementById("report-to")?.value || "";

  try {
    const raw = await fetchConsumptionsForReport(from, to);
    const normalized = raw
      .map(normalizeConsumptionRecord)
      .filter((x) => x.items.length > 0 || (x.total && x.total > 0));

    if (normalized.length === 0) {
      setReportStatus("No hay consumos en el rango seleccionado.", "err");
      return;
    }

    const grouped = groupReportByRoom(normalized);
    const grandTotal = normalized.reduce((acc, x) => acc + (Number(x.total) || 0), 0);

    const doc = new jsPDFCtor({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;

    const now = new Date();
    const genDate = now.toLocaleDateString("es-CO");
    const genTime = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

    let y = 70;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("INFORME DE CONSUMOS - MINIBAR NATTIVO", margin, y);

    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Rango: ${from || "—"} a ${to || "—"}`, margin, y);

    y += 16;
    doc.text(`Generado: ${genDate} ${genTime}`, margin, y);

    y += 18;
    doc.setDrawColor(180);
    doc.line(margin, y, pageW - margin, y);

    y += 22;
    doc.setFont("helvetica", "bold");
    doc.text(`Habitaciones con consumo: ${grouped.length}`, margin, y);
    doc.text(`Total general: ${formatPrice(grandTotal)}`, pageW - margin, y, { align: "right" });

    y += 18;
    doc.setFont("helvetica", "normal");

    const ensureSpace = (need) => {
      if (y + need <= pageH - 48) return;
      doc.addPage();
      y = 72;
    };

    grouped.forEach((g) => {
      ensureSpace(80);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`Habitación ${g.roomNumber}`, margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Consumos: ${g.records.length}  Ítems: ${g.roomItems}`, margin, y + 16);
      doc.text(`Total: ${formatPrice(g.roomTotal)}`, pageW - margin, y + 16, { align: "right" });

      y += 30;
      doc.setDrawColor(210);
      doc.line(margin, y, pageW - margin, y);
      y += 18;

      g.records.forEach((r) => {
        ensureSpace(50);

        const d = r.createdAt ? r.createdAt.toLocaleDateString("es-CO") : "—";
        const t = r.createdAt
          ? r.createdAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
          : "—";

        doc.setFont("helvetica", "bold");
        doc.text(`${d}  ${t}`, margin, y);

        doc.setFont("helvetica", "normal");
        doc.text(formatPrice(r.total), pageW - margin, y, { align: "right" });

        y += 16;

        r.items.forEach((it) => {
          ensureSpace(30);
          const lineTotal = it.quantity * it.price;
          doc.text(`${it.quantity} × ${it.name}`, margin, y, { maxWidth: pageW - margin * 2 - 140 });
          doc.text(formatPrice(lineTotal), pageW - margin, y, { align: "right" });
          y += 14;
        });

        y += 8;
        doc.setDrawColor(235);
        doc.line(margin, y, pageW - margin, y);
        y += 14;
      });

      y += 6;
    });

    ensureSpace(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL GENERAL", margin, y);
    doc.text(formatPrice(grandTotal), pageW - margin, y, { align: "right" });

    doc.save(buildReportFilename(from, to));
    setReportStatus("Informe descargado correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setReportStatus("No se pudo generar el informe. Revisa el endpoint de consumos.", "err");
  }
}

function setupMenuToggle() {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("menu-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !toggleBtn) return;

  const toggle = () => {
    sidebar.classList.toggle("sidebar-open");
    if (backdrop) backdrop.classList.toggle("backdrop-visible");
  };

  toggleBtn.addEventListener("click", toggle);
  if (backdrop) backdrop.addEventListener("click", toggle);
}

function init() {
  loadCurrentUser();
  loadRooms();
  loadProducts();

  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) submitBtn.addEventListener("click", handleSubmit);

  const downloadBtn = document.getElementById("download-report-btn");
  if (downloadBtn) downloadBtn.addEventListener("click", downloadReportPdf);

  setupMenuToggle();
}

document.addEventListener("DOMContentLoaded", init);
