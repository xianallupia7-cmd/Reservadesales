(async () => {
  // 1. IMPORTEM LES EINES (Versió compatible)
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getFirestore, doc, onSnapshot, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

  // 2. LES TEVES CLAUS REALS
  const firebaseConfig = {
    apiKey: "AIzaSyAeiD6TWv9XT0AuEUv7nhXeaLtEW88iIrw",
    authDomain: "reserva-de-sala-43e0f.firebaseapp.com",
    projectId: "reserva-de-sala-43e0f",
    storageBucket: "reserva-de-sala-43e0f.firebasestorage.app",
    messagingSenderId: "152105072415",
    appId: "1:152105072415:web:d469ce97c08a178d4b622a",
    measurementId: "G-V4H9VBJFNY"
  };

  // 3. CONFIGURACIÓ
  const EL_MEU_CODI_SECRET = "1234"; // Canvia-ho si vols
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  let currentRoom = 'gran';
  let currentData = {};
  let unsub = null;

  const dateInput = document.getElementById('booking-date');
  if(dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  const hours = Array.from({length: 13}, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`);
  const startS = document.getElementById('start-time');
  const endS = document.getElementById('end-time');

  if(startS && endS) {
    hours.forEach(h => {
      startS.innerHTML += `<option value="${h}">${h}</option>`;
      endS.innerHTML += `<option value="${h}">${h}</option>`;
    });
  }

  window.changeRoom = (room) => {
    currentRoom = room;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tab = document.querySelector(`.tab-${room}`);
    if(tab) tab.classList.add('active');
    document.getElementById('room-title').innerText = `Sala ${room.toUpperCase()}`;
    listen();
  };

  window.changeDate = () => listen();

  function listen() {
    if (unsub) unsub();
    const docId = `${currentRoom}_${dateInput.value}`;
    unsub = onSnapshot(doc(db, "sales", docId), (docSnap) => {
      currentData = docSnap.exists() ? docSnap.data() : {};
      render();
    });
  }

  function render() {
    const container = document.getElementById('schedule');
    if(!container) return;
    container.innerHTML = '';
    hours.forEach(h => {
      const info = currentData[h] || { reserved: false };
      const div = document.createElement('div');
      div.className = `slot ${info.reserved ? 'busy' : ''}`;
      div.innerHTML = `
        <span class="time">${h}</span>
        <div class="busy-info">
          ${info.reserved ? 
            `<b>${info.name}</b> <span class="activity-tag">${info.activity}</span>
             <button class="admin-del" onclick="adminDelete('${h}')">Anul·lar</button>` 
            : '<span class="free">Lliure</span>'}
        </div>
      `;
      container.appendChild(div);
    });
  }

  window.makeBooking = async () => {
    const name = document.getElementById('user-name').value;
    const act = document.getElementById('activity').value;
    const start = startS.value;
    const end = endS.value;
    if (!name || !act) return alert("Falten dades!");
    const range = hours.filter(h => h >= start && h < end);
    if (range.some(h => currentData[h]?.reserved)) return alert("Horari ocupat!");
    const newData = { ...currentData };
    range.forEach(h => { newData[h] = { reserved: true, name, activity: act }; });
    await setDoc(doc(db, "sales", `${currentRoom}_${dateInput.value}`), newData);
    alert("Reservat!");
  };

  window.adminDelete = async (hour) => {
    if (prompt("Codi d'admin:") === EL_MEU_CODI_SECRET) {
      const newData = { ...currentData };
      delete newData[hour];
      await setDoc(doc(db, "sales", `${currentRoom}_${dateInput.value}`), newData);
      alert("Borrat!");
    }
  };

  changeRoom('gran');
})();
