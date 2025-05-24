function interpretColor(rgb) {
  const isClose = (a, b, tolerance = 20) => Math.abs(a - b) <= tolerance;

  if (isClose(rgb.r, 145) && isClose(rgb.g, 111) && isClose(rgb.b, 116)) {
    return "Sangat Layak Dikonsumsi";
  } else if (isClose(rgb.r, 158) && isClose(rgb.g, 126) && isClose(rgb.b, 116)) {
    return "Masih Layak Dikonsumsi";
  } else if (isClose(rgb.r, 165) && isClose(rgb.g, 143) && isClose(rgb.b, 123)) {
    return "Tidak Layak Dikonsumsi";
  } else {
    return "Tidak Dikenali";
  }
}

function getPriceByQuality(quality) {
  switch(quality) {
    case "Sangat Layak Dikonsumsi": return "Rp 25.000";
    case "Masih Layak Dikonsumsi": return "Rp 10.000";
    case "Tidak Layak Dikonsumsi": return "Rp 0 (buang)";
    default: return "Harga tidak tersedia";
  }
}

function updateDisplay(rgb) {
  const quality = interpretColor(rgb);
  const price = getPriceByQuality(quality);
  document.getElementById("quality").innerText = "Kualitas: " + quality;
  document.getElementById("price").innerText = "Harga: " + price;
  document.getElementById("colorBox").style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  saveScanHistory(rgb, quality, price);
  renderHistory();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  const canvas = document.getElementById('uploadedCanvas');
  const ctx = canvas.getContext('2d');

  const reader = new FileReader();
  reader.onload = function(e) {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const centerX = canvas.width / 3;
    const centerY = canvas.height / 3;
    const width = canvas.width / 3;
    const height = canvas.height / 3;
    const imageData = ctx.getImageData(centerX, centerY, width, height).data;

    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i];
      g += imageData[i + 1];
      b += imageData[i + 2];
      count++;
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    updateDisplay({ r, g, b });
  };
}

function generateQR() {
  const r = parseInt(document.getElementById("r").value);
  const g = parseInt(document.getElementById("g").value);
  const b = parseInt(document.getElementById("b").value);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    alert("Harap masukkan nilai RGB yang valid (0-255)");
    return;
  }

  const qr = new QRious({
    element: document.getElementById("qrCanvas"),
    size: 200,
    value: JSON.stringify({ r, g, b })
  });
}

function generateQRFromLastScan() {
  const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
  if (history.length === 0) {
    alert("Belum ada data scan.");
    return;
  }

  const latest = history[history.length - 1];
  const qr = new QRious({
    element: document.getElementById("qrCanvas"),
    size: 200,
    value: JSON.stringify({
      rgb: latest.rgb,
      kualitas: latest.quality,
      harga: latest.price,
      waktu: latest.timestamp
    })
  });
}

function saveScanHistory(rgb, quality, price) {
  const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
  const timestamp = new Date().toLocaleString("id-ID");
  history.push({ rgb, quality, price, timestamp });
  localStorage.setItem("scanHistory", JSON.stringify(history));
}

function renderHistory() {
  const historyList = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem("scanHistory") || "[]").reverse();
  historyList.innerHTML = "";

  history.forEach(item => {
    const li = document.createElement("li");
    li.style.marginBottom = "10px";
    li.innerHTML = `
      <strong>${item.timestamp}</strong><br>
      Warna: rgb(${item.rgb.r}, ${item.rgb.g}, ${item.rgb.b})<br>
      Kualitas: ${item.quality}<br>
      Harga: ${item.price}
    `;
    historyList.appendChild(li);
  });
}

window.onload = function() {
  renderHistory();
};
