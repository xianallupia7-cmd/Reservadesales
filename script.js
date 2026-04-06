import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeiD6TWv9XT0AuEUv7nhXeaLtEW88iIrw",
  authDomain: "reserva-de-sala-43e0f.firebaseapp.com",
  projectId: "reserva-de-sala-43e0f",
  storageBucket: "reserva-de-sala-43e0f.firebasestorage.app",
  messagingSenderId: "152105072415",
  appId: "1:152105072415:web:d469ce97c08a178d4b622a",
  measurementId: "G-V4H9VBJFNY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentRoom = 'gran';
let currentData = {};
let unsub = null;

const hours = Array.from({length: 13}, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`);
const dateInput = document.getElementById('booking-date');
const startS = document.getElementById('start-time');
const endS = document.getElementById('end-time');

dateInput.value = new Date().toISOString().split('T')[0];
hours.forEach(h => {
  startS.innerHTML += `<option value="${h}">${h}</option>`;
  endS.innerHTML += `<option value="${h}">${h}</option>`;
});

window.changeRoom = (room) => {
  currentRoom = room;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab-${room}`).classList.add('active');
  document.getElementById('room-title').innerText = `Sala ${room.toUpperCase()}`;
  listen();
};

window.changeDate = () => listen();

function listen() {
  if (unsub) unsub();
  unsub = onSnapshot(doc(db, "sales", `${currentRoom}_${dateInput.value}`), (docSnap) => {
    currentData = docSnap.exists() ? docSnap.data() : {};
    render();
  });
}

function render() {
  const container = document.getElementById('schedule');
  container.innerHTML = '';
  hours.forEach(h => {
    const info = currentData[h] || { reserved: false };
    container.innerHTML += `
      <div class="slot ${info.reserved ? 'busy' : ''}">
        <span class="time">${h}</span>
        <div class="busy-info">
          ${info.reserved ? `<b>${info.name}</b> <span class="activity-tag">${info.activity}</span>` : '<span class="free">Lliure</span>'}
        </div>
      </div>`;
  });
}

window.makeBooking = async () => {
  const name = document.getElementById('user-name').value;
  const act = document.getElementById('activity').value;
  if (!name || !act) return alert("Falten dades!");
  const range = hours.filter(h => h >= startS.value && h < endS.value);
  if (range.some(h => currentData[h]?.reserved)) return alert("Horari ocupat!");
  const newData = { ...currentData };
  range.forEach(h => { newData[h] = { reserved: true, name, activity: act }; });
  await setDoc(doc(db, "sales", `${currentRoom}_${dateInput.value}`), newData);
  alert("Reservat!");
};
