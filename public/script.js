const plusButtons = document.querySelectorAll(".plus");
const minusButtons = document.querySelectorAll(".minus");
const counts = document.querySelectorAll(".count");
const submitBtn = document.getElementById("submit");
const message = document.getElementById("message");
const warningMessage = document.getElementById("warning-message");

const candyNames = ["Trix", "Hersheys", "Sourpatch", "Snickers", "M&M"];

// Detect when any candy exceeds 3
plusButtons.forEach((plus, index) => {
  plus.addEventListener("click", () => {
    let count = parseInt(counts[index].textContent);
    count++;
    counts[index].textContent = count;
    checkCandyLimit();
  });
});

minusButtons.forEach((minus, index) => {
  minus.addEventListener("click", () => {
    let count = parseInt(counts[index].textContent);
    if (count > 0) {
      count--;
      counts[index].textContent = count;
    }
    checkCandyLimit();
  });
});

function checkCandyLimit() {
  let overLimit = false;
  counts.forEach((c) => {
    if (parseInt(c.textContent) > 3) {
      overLimit = true;
    }
  });

  if (overLimit) {
    warningMessage.textContent = "Not enough yet?👻";
  } else {
    warningMessage.textContent = "";
  }
}

submitBtn.addEventListener("click", () => {
  const quantities = {};

  counts.forEach((c, i) => {
    const count = parseInt(c.textContent);
    if (count > 0) {
      quantities[candyNames[i]] = count;
    }
  });

  if (Object.keys(quantities).length === 0) {
    message.textContent = "👻 Please select at least one candy!";
    return;
  }

  // Show thank-you message immediately (no delay)
  message.textContent = "🎃 Thank you! Have a spooky Halloween!";

  // Try sending to backend in the background
  fetch("http://10.101.56.214:5500/request", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ quantities }),
  })
  .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Backend error:", err);
        // Optionally surface backend error to user:
        // message.textContent = "Error: " + (err.detail || "Could not update inventory");
      } else {
        const data = await res.json().catch(() => ({}));
        console.log("Distributed:", data.distributed);
      }
    })
    .catch((err) => {
      console.error("Backend not reachable:", err);
    });
});