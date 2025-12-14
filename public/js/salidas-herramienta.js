const WHATSAPP_PHONE = "";

function getInitialsFromName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}

async function loadCurrentUser() {
  const nameEl = document.getElementById("user-name");
  const initialsEl = document.getElementById("user-initials");
  if (!nameEl || !initialsEl) return;

  try {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include"
    });

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

function formatRoomLabel(room, index) {
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

  const floor = room.floor ?? room.piso ?? room.nivel ?? null;

  if (roomNumber && floor) return `Piso ${floor} · Hab. ${roomNumber}`;
  if (roomNumber) return `Hab. ${roomNumber}`;

  const fallbackNum = room.id ?? index + 1;
  return `Hab. ${fallbackNum}`;
}

async function loadRooms() {
  const select = document.getElementById("room-select");
  const status = document.getElementById("status");
  if (!select) return;

  try {
    const res = await fetch("/api/rooms");
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

      option.value = id;
      option.textContent = formatRoomLabel(room, index);
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando habitaciones:", err);
    if (status) {
      status.textContent =
        "Error cargando habitaciones. Revisa el endpoint /api/rooms en el backend.";
      status.className = "status error";
    }
  }
}

function formatPrice(price) {
  if (price == null) return "";
  const n = Number(price);
  if (Number.isNaN(n)) return "";
  return n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });
}

async function loadProducts() {
  const list = document.getElementById("products-list");
  const status = document.getElementById("status");
  if (!list) return;

  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const products = await res.json();

    list.innerHTML = "";

    products.forEach((product) => {
      const row = document.createElement("div");
      row.className = "product-row";

      const productId =
        product.id ?? product.product_id ?? product.productId;

      row.dataset.productId = productId;

      const checkboxCol = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "product-check";
      checkboxCol.appendChild(checkbox);

      const infoCol = document.createElement("div");
      const nameEl = document.createElement("div");
      nameEl.className = "product-name";
      nameEl.textContent =
        product.name ?? product.product_name ?? "Producto";

      const priceEl = document.createElement("span");
      priceEl.className = "product-price";
      priceEl.textContent = `Precio: ${formatPrice(product.price)}`;

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

function buildWhatsappMessage(roomLabel, items, note) {
  const lines = [];

  const now = new Date();
  const fecha = now.toLocaleDateString("es-CO");
  const hora = now.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  });

  lines.push(`Habitación ${roomLabel} – Consumos minibar`);
  lines.push(`Fecha: ${fecha} – Hora: ${hora}`);
  lines.push("");

  items.forEach((item) => {
    lines.push(`${item.quantity} × ${item.name}`);
  });

  const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);
  lines.push("");
  lines.push(`Total de ítems: ${totalQty}`);

  if (note && note.trim().length > 0) {
    lines.push("");
    lines.push(`Nota: ${note.trim()}`);
  }

  return lines.join("\n");
}

async function handleSubmit() {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = "";
    status.className = "status";
  }

  const roomSelect = document.getElementById("room-select");
  const noteInput = document.getElementById("note");
  const productsList = document.getElementById("products-list");

  if (!roomSelect || !productsList) return;

  const roomId = roomSelect.value;
  const roomLabel =
    roomSelect.options[roomSelect.selectedIndex]?.textContent || "";

  if (!roomId) {
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
      const nameEl = row.querySelector(".product-name");

      const checked = checkbox?.checked;
      const qty = Number(qtyInput?.value || "0");

      if (!checked || qty <= 0) return null;

      return {
        productId: row.dataset.productId,
        name: nameEl?.textContent || "Producto",
        quantity: qty
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

  const note = noteInput ? noteInput.value : "";

  const payload = {
    roomId,
    note,
    items: selectedItems
  };

  try {
    const res = await fetch("/api/consumptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("Error registrando el consumo");
    }

    const message = buildWhatsappMessage(roomLabel, selectedItems, note);
    const encodedMessage = encodeURIComponent(message);

    const url =
      WHATSAPP_PHONE && WHATSAPP_PHONE.trim().length > 0
        ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`
        : `https://wa.me/?text=${encodedMessage}`;

    window.open(url, "_blank");

    if (status) {
      status.textContent =
        "Consumo registrado. Se abrió WhatsApp con el mensaje.";
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

function setupMenuToggle() {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("menu-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");

  if (!sidebar || !toggleBtn) return;

  const toggle = () => {
    sidebar.classList.toggle("sidebar-open");
    if (backdrop) {
      backdrop.classList.toggle("backdrop-visible");
    }
  };

  toggleBtn.addEventListener("click", toggle);
  if (backdrop) {
    backdrop.addEventListener("click", toggle);
  }
}

function init() {
  loadCurrentUser();
  loadRooms();
  loadProducts();

  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", handleSubmit);
  }

  setupMenuToggle();
}

document.addEventListener("DOMContentLoaded", init);
