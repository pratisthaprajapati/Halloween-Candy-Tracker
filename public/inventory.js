document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#inventory-table tbody");
  const saveBtn = document.getElementById("save-inventory");
  const msg = document.getElementById("inv-message");

  async function loadInventory() {
    try {
      const res = await fetch("http://10.101.56.214:5500/inventory");
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      tableBody.innerHTML = "";
      data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td><input type="number" min="0" value="${item.quantity}" data-id="${item.id}"></td>
          <td><button class="reset-row" data-id="${item.id}">Reset</button></td>
        `;
        tableBody.appendChild(tr);
      });
      msg.textContent = "";
    } catch (e) {
      msg.textContent = "Could not load inventory";
      console.error(e);
    }
  }

  saveBtn.addEventListener("click", async () => {
    const inputs = Array.from(document.querySelectorAll("#inventory-table input[type=number]"));
    const updates = {};
    inputs.forEach(inp => {
      const id = inp.getAttribute("data-id");
      const val = parseInt(inp.value, 10) || 0;
      updates[id] = val;
    });

    try {
      const res = await fetch("http://10.101.56.214:5500/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
      const txt = await res.text();
      if (!res.ok) {
        console.error("Save failed:", txt);
        msg.textContent = "Save failed: " + res.status;
        return;
      }
      msg.textContent = "Saved";
      await loadInventory();
    } catch (e) {
      console.error(e);
      msg.textContent = "Network error";
    }
  });

  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("reset-row")) {
      loadInventory();
    }
  });

  loadInventory();
});