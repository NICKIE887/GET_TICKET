<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GETTICKET PRO</title>

<script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
<script src="https://unpkg.com/html5-qrcode"></script>

<style>
body{font-family:system-ui;margin:0;background:#f5f5f5}
.nav{display:flex;justify-content:space-between;padding:15px;background:#fff}
.btn{padding:10px 16px;border:none;border-radius:20px;background:#0a7f5a;color:white;cursor:pointer;margin:5px}
.card{background:#fff;padding:15px;border-radius:15px;margin:10px}
input{padding:10px;margin:5px;width:100%}
h2{margin-top:0}
</style>
</head>

<body>

<div class="nav">
  <b>GETTICKET</b>
  <div>
    <button class="btn" onclick="show('pay')">Pay</button>
    <button class="btn" onclick="show('scan')">Scan</button>
    <button class="btn" onclick="show('admin')">Admin</button>
    <button class="btn" onclick="show('create')">Create Event</button>
  </div>
</div>

<div id="app"></div>

<script>
const API = "https://your-vercel-app.vercel.app/api"; // 🔁 CHANGE THIS

function show(page){
  if(page==='pay') payUI();
  if(page==='scan') scanUI();
  if(page==='admin') adminUI();
  if(page==='create') createUI();
}

/* ================= PAYMENT ================= */
function payUI(){
  app.innerHTML = `
    <div class="card">
      <h2>Pay with M-Pesa</h2>
      <input id="phone" placeholder="2547XXXXXXXX">
      <input id="amount" placeholder="Amount">
      <button class="btn" onclick="pay()">Pay</button>
      <p id="status"></p>
      <canvas id="qr"></canvas>
    </div>`;
}

async function pay(){
  const phone = document.getElementById("phone").value;
  const amount = document.getElementById("amount").value;
  const status = document.getElementById("status");

  status.innerText="Processing payment...";

  await fetch(API+"/pay",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({phone,amount})
  });

  status.innerText="Waiting for confirmation...";

  const interval=setInterval(async()=>{
    const res=await fetch(API+"/status?phone="+phone);
    const data=await res.json();

    if(data.status==="SUCCESS"){
      clearInterval(interval);
      status.innerText="✅ Payment Successful";

      QRCode.toCanvas(
        document.getElementById("qr"),
        data.mpesa_receipt || phone
      );
    }
  },3000);
}

/* ================= QR SCANNER ================= */
function scanUI(){
  app.innerHTML = `
    <div class="card">
      <h2>Scan Ticket</h2>
      <div id="reader"></div>
    </div>`;

  const scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (text)=>{
      const res = await fetch(API+"/scan",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({code:text})
      });

      const data=await res.json();

      alert(data.success ? "✅ Access Granted" : "❌ " + data.error);
    }
  );
}

/* ================= ADMIN DASHBOARD ================= */
async function adminUI(){
  const res = await fetch(API+"/admin");
  const data = await res.json();

  app.innerHTML = `
    <div class="card">
      <h2>Admin Dashboard</h2>
      <p>Events: ${data.total_events}</p>
      <p>Tickets: ${data.total_tickets}</p>
      <p>Revenue: KES ${data.total_revenue}</p>
      <p>Check-ins: ${data.checked_in}</p>
    </div>`;
}

/* ================= CREATE EVENT ================= */
function createUI(){
  app.innerHTML = `
    <div class="card">
      <h2>Create Event</h2>
      <input id="title" placeholder="Title">
      <input id="location" placeholder="Location">
      <input id="price" placeholder="Price">
      <input id="date" type="datetime-local">
      <input id="capacity" placeholder="Capacity">
      <button class="btn" onclick="createEvent()">Create</button>
    </div>`;
}

async function createEvent(){
  await fetch(API+"/create-event",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"YOUR_ADMIN_KEY" // 🔐 secure this
    },
    body:JSON.stringify({
      title:document.getElementById("title").value,
      location:document.getElementById("location").value,
      price:document.getElementById("price").value,
      date:document.getElementById("date").value,
      capacity:document.getElementById("capacity").value
    })
  });

  alert("✅ Event created");
}

/* INIT */
payUI();
</script>

</body>
</html>