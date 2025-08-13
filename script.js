import { auth, db } from './firebase.js';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ---- State ----
const state = {
  name: 'Alex',
  wake: '06:30',
  sleep: '22:30',
  goal: 'loss',
  equip: 'none',
  diet: 'any',
  energy: 6,
  soreness: 2,
  avail: 30,
  waterLogged: 0,
  schedule: []
};

// --- Utilities ---
const $ = id => document.getElementById(id);
function timeToMinutes(t) { const [h,m] = t.split(':').map(Number); return h*60+m; }
function minutesToTime(mins) { const h = Math.floor(mins/60)%24; const m = mins%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
function formatDisplay(t) { const [hh,mm] = t.split(':'); const h = +hh; const period = h>=12? 'PM':'AM'; const dispH = ((h+11)%12)+1; return `${dispH}:${mm} ${period}`; }

// --- Modal Handler (replaces alerts, confirms, and prompts) ---
const modal = {
  container: $('modal-container'),
  content: $('modal-content'),
  show(htmlContent) {
    this.content.innerHTML = htmlContent;
    this.container.classList.add('active');
  },
  hide() {
    this.container.classList.remove('active');
  },
  alert(message, onOk) {
    this.show(`
      <div class="text-lg font-bold">${escapeHtml(message)}</div>
      <div class="flex justify-end mt-4">
        <button id="modal-ok" class="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-full font-semibold">OK</button>
      </div>
    `);
    if($('modal-ok')) $('modal-ok').onclick = () => { this.hide(); if (onOk) onOk(); };
  },
  confirm(message, onOk, onCancel) {
    this.show(`
      <div class="text-lg font-bold">${escapeHtml(message)}</div>
      <div class="flex justify-end mt-4 space-x-3">
        <button id="modal-cancel" class="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-full font-semibold">Cancel</button>
        <button id="modal-ok" class="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-full font-semibold">OK</button>
      </div>
    `);
    if($('modal-ok')) $('modal-ok').onclick = () => { this.hide(); if (onOk) onOk(); };
    if($('modal-cancel')) $('modal-cancel').onclick = () => { this.hide(); if (onCancel) onCancel(); };
  },
  prompt(message, defaultValue, onOk) {
    this.show(`
      <div class="text-lg font-bold">${escapeHtml(message)}</div>
      <input id="modal-input" type="text" class="w-full mt-4 p-3 rounded-lg bg-gray-900 border border-gray-700" value="${escapeHtml(defaultValue)}"/>
      <div class="flex justify-end mt-4 space-x-3">
        <button id="modal-cancel" class="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-full font-semibold">Cancel</button>
        <button id="modal-ok" class="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-full font-semibold">Save</button>
      </div>
    `);
    if($('modal-ok')) $('modal-ok').onclick = () => {
      const value = $('modal-input').value;
      this.hide();
      if (onOk) onOk(value);
    };
    if($('modal-cancel')) $('modal-cancel').onclick = () => { this.hide(); onOk(null); };
  }
};

const loading = {
    overlay: $('loading-overlay'),
    text: $('loading-text'),
    show(message = 'Generating your personalized schedule...') {
        if(this.text) this.text.innerText = message;
        if(this.overlay) this.overlay.classList.add('active');
    },
    hide() {
        if(this.overlay) this.overlay.classList.remove('active');
    }
};

// --- Auth ---
function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .catch((error) => {
            console.error("Authentication failed", error);
            modal.alert("Login failed: " + error.message);
        });
}

function logoutUser() {
    signOut(auth).catch((error) => {
        console.error("Sign out failed", error);
        modal.alert("Logout failed: " + error.message);
    });
}

// --- Firestore ---
async function saveScheduleToFirestore(schedule) {
    const user = auth.currentUser;
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const scheduleRef = doc(db, 'profiles', user.uid, 'schedules', today);

    try {
        await setDoc(scheduleRef, { items: schedule });
    } catch (e) {
        console.error("Failed to save schedule", e);
        modal.alert("Could not save your schedule to the cloud.");
    }
}

// --- Lifecycle ---
async function loadUserProfile(user) {
    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        Object.assign(state, profileData);
        loadUIFromState();

        const today = new Date().toISOString().slice(0, 10);
        const scheduleRef = doc(db, 'profiles', user.uid, 'schedules', today);
        const scheduleSnap = await getDoc(scheduleRef);

        if (scheduleSnap.exists()) {
            state.schedule = scheduleSnap.data().items;
            renderTimeline(state.schedule);
        } else {
            generateFullDay();
        }
        show('screen-main');
    } else {
        state.name = user.displayName;
        if($('input-name')) $('input-name').value = user.displayName;
        show('screen-onboarding');
    }
    if($('btn-logout')) $('btn-logout').classList.remove('hidden');
}

async function saveProfileAndContinue() {
    const user = auth.currentUser;
    if (!user) {
        modal.alert("You must be logged in to save a profile.");
        return;
    }

    try {
        loading.show('Saving your profile...');
        const profileData = {
            name: $('input-name').value || 'You',
            wake: $('input-wake').value || '06:30',
            sleep: $('input-sleep').value || '22:30',
            goal: $('input-goal').value,
            equip: $('input-equip').value,
            diet: $('input-diet').value,
        };

        const profileRef = doc(db, 'profiles', user.uid);
        await setDoc(profileRef, profileData);

        Object.assign(state, profileData);
        loadUIFromState();
        generateFullDay();
        show('screen-main');
    } catch (e) {
        modal.alert('Failed to save profile: ' + e.message);
        console.error(e);
    } finally {
        loading.hide();
    }
}

function init() {
    onAuthStateChanged(auth, user => {
        if (user) {
            loadUserProfile(user);
        } else {
            show('screen-splash');
            if($('btn-logout')) $('btn-logout').classList.add('hidden');
        }
    });

    if($('btn-login')) $('btn-login').addEventListener('click', loginWithGoogle);
    if($('btn-logout')) $('btn-logout').addEventListener('click', logoutUser);
    if($('onboard-save')) $('onboard-save').addEventListener('click', saveProfileAndContinue);
    if($('onboard-cancel')) $('onboard-cancel').addEventListener('click', () => show('screen-splash'));
    if($('btn-add-water')) $('btn-add-water').addEventListener('click', () => { state.waterLogged += 250; modal.alert('Logged 250ml water (total ' + state.waterLogged + 'ml)'); });
    if($('btn-meditate')) $('btn-meditate').addEventListener('click', startBreathing);
    if($('btn-reset')) $('btn-reset').addEventListener('click', () => {
        const user = auth.currentUser;
        if (!user) return;
        modal.confirm('This will delete your profile and all data. Are you sure?', async () => {
            try {
                loading.show('Deleting everything...');
                const schedulesRef = collection(db, 'profiles', user.uid, 'schedules');
                const schedulesSnap = await getDocs(schedulesRef);
                const deletePromises = schedulesSnap.docs.map(d => deleteDoc(d.ref));

                const profileRef = doc(db, 'profiles', user.uid);
                deletePromises.push(deleteDoc(profileRef));

                await Promise.all(deletePromises);
                logoutUser();
            } catch (e) {
                modal.alert('Failed to delete data: ' + e.message);
            } finally {
                loading.hide();
            }
        });
    });
    if($('btn-export-json')) $('btn-export-json').addEventListener('click', exportJSON);
    if($('btn-export-csv')) $('btn-export-csv').addEventListener('click', exportCSV);
    if($('btn-ai-generate')) $('btn-ai-generate').addEventListener('click', generateWithAI);

    const energyEl = $('energy');
    const sorenessEl = $('soreness');
    const availEl = $('avail');
    if (energyEl) energyEl.addEventListener('input', e => { state.energy = +e.target.value; $('energy-label').innerText = state.energy; generateFullDay(); });
    if (sorenessEl) sorenessEl.addEventListener('input', e => { state.soreness = +e.target.value; $('soreness-label').innerText = state.soreness; generateFullDay(); });
    if (availEl) availEl.addEventListener('input', e => { state.avail = +e.target.value; $('avail-label').innerText = state.avail; generateFullDay(); });

    try { if (window.lucide && lucide.createIcons) lucide.createIcons(); } catch(e) { console.warn('lucide failed', e); }
    try { const tp = document.querySelector('svg textPath'); if (tp && window.CircleType) new CircleType(tp).radius(60); } catch(e) { /* non-fatal */ }
}

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = $(screenId);
  if (el) el.classList.remove('hidden');
}

function loadUIFromState() {
  if ($('greet-name')) $('greet-name').innerText = state.name;
  if ($('avatar')) $('avatar').innerText = state.name.charAt(0).toUpperCase();
  const today = new Date(); if ($('today-date')) $('today-date').innerText = today.toDateString();
  if ($('wake-range')) $('wake-range').innerText = `Wake: ${formatDisplay(state.wake)} · Sleep: ${formatDisplay(state.sleep)}`;
  if ($('energy')) $('energy').value = state.energy; if ($('energy-label')) $('energy-label').innerText = state.energy;
  if ($('soreness')) $('soreness').value = state.soreness; if ($('soreness-label')) $('soreness-label').innerText = state.soreness;
  if ($('avail')) $('avail').value = state.avail; if ($('avail-label')) $('avail-label').innerText = state.avail;
}

function generateFullDay() {
  try {
    const start = timeToMinutes(state.wake);
    const end = timeToMinutes(state.sleep);
    const timeline = [];

    timeline.push({time: state.wake, title: 'Wake & Hydrate', details: 'Drink ~300ml water, sunlight exposure, teeth, 1-2 min breathing.'});

    if (state.goal === 'loss' || state.goal === 'stamina') {
      timeline.push({time: minutesToTime(start + 20), title: 'Morning Cardio / Mobility', details: state.avail >= 30 ? `~${Math.min(45, state.avail)} mins of brisk walk/run or cardio intervals.` : '15-25 min HIIT or brisk walk.'});
    } else if (state.goal === 'gain') {
      timeline.push({time: minutesToTime(start + 20), title: 'Strength Focus', details: state.equip !== 'none' ? `Resistance session: ${Math.min(45, state.avail)} mins - compound lifts or dumbbell circuit.` : 'Bodyweight strength session: push-ups, squats, rows.'});
    } else {
      timeline.push({time: minutesToTime(start + 20), title: 'Mindful Movement', details: 'Yoga / mobility: 20-30 mins to wake up the body and calm the mind.'});
    }

    timeline.push({time: minutesToTime(start + 60), title: 'Breakfast', details: mealSuggestion('breakfast')});
    timeline.push({time: minutesToTime(start + 150), title: 'Hydration + Micro-break', details: 'Stretch, 1-2 min breathing, small water intake.'});
    timeline.push({time: minutesToTime(start + 300), title: 'Lunch', details: mealSuggestion('lunch')});

    if (state.energy >= 7) {
      timeline.push({time: minutesToTime(start + 420), title: 'Power Session (optional)', details: 'Short focused workout or a brisk 20-30 min walk.'});
    } else if (state.energy <= 4) {
      timeline.push({time: minutesToTime(start + 420), title: 'Recovery Block', details: 'Gentle mobility, foam rolling, nap or light walk.'});
    } else {
      timeline.push({time: minutesToTime(start + 420), title: 'Focus Block', details: 'Productive work + 5-10 min standing breaks each hour.'});
    }

    timeline.push({time: minutesToTime(start + 540), title: 'Snack', details: mealSuggestion('snack')});

    if (state.avail >= 30) {
      timeline.push({time: minutesToTime(end - 180), title: 'Evening Workout / Walk', details: state.goal === 'gain' ? 'Strength or hypertrophy focus (45min)' : 'Cardio or mixed circuit (30-45min)'});
    } else {
      timeline.push({time: minutesToTime(end - 180), title: 'Short Movement', details: '20 min mobility / walk.'});
    }

    timeline.push({time: minutesToTime(end - 120), title: 'Dinner', details: mealSuggestion('dinner')});
    timeline.push({time: minutesToTime(end - 60), title: 'Wind-down Routine', details: 'Reduce screens, light stretch, journaling or reading, herbal tea.'});
    timeline.push({time: state.sleep, title: 'Sleep', details: 'Aim for consistent bedtime - lights out.'});

    state.schedule = timeline;
    renderTimeline(timeline);
    saveScheduleToFirestore(timeline);
  } catch (e) { console.error('generateFullDay error', e); }
}

async function generateWithAI() {
    loading.show('Generating your personalized schedule with AI...');
    try {
        const prompt = `Generate a detailed, full-day wellness schedule in a conversational and encouraging tone. The schedule should be personalized based on the following user data:
        - Name: ${state.name}
        - Wake time: ${state.wake}
        - Sleep time: ${state.sleep}
        - Primary Goal: ${state.goal}
        - Equipment: ${state.equip}
        - Diet: ${state.diet}
        - Current Energy level (1-10): ${state.energy}
        - Current Soreness level (1-10): ${state.soreness}
        - Available time for main activity (minutes): ${state.avail}

        Provide the response as a JSON array of objects. Each object should have three properties: 'time' (string, format 'HH:MM'), 'title' (string), and 'details' (string). The schedule should cover the period from wake-up to sleep. Include a variety of activities like workouts, meals, hydration, and mindful breaks. Make the suggestions specific and actionable.
        For example:
        [
          {"time":"06:30", "title":"Morning Routine", "details":"Drink 300ml water. Do 5 minutes of mindful stretching."},
          {"time":"07:00", "title":"Breakfast", "details":"A balanced breakfast with oats and fruit."},
          ...
        ]`;

        // LLM API call
        const chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "time": { "type": "STRING" },
                            "title": { "type": "STRING" },
                            "details": { "type": "STRING" }
                        },
                        "propertyOrdering": ["time", "title", "details"]
                    }
                }
            }
        };
        const apiKey = ""
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        const jsonString = result.candidates[0].content.parts[0].text;
        const newSchedule = JSON.parse(jsonString);

        state.schedule = newSchedule;
        renderTimeline(newSchedule);
        saveScheduleToFirestore(newSchedule);
    } catch (e) {
        console.error('AI generation failed:', e);
        modal.alert('AI generation failed. Please try again or use the default schedule.');
    } finally {
        loading.hide();
    }
}

function mealSuggestion(part) {
  const d = state.diet; const g = state.goal;
  if (part === 'breakfast') {
    if (d === 'veg') return 'Oats with milk/yogurt, seeds, and fruit.';
    if (d === 'vegan') return 'Tofu scramble or overnight oats with plant milk.';
    return 'Greek yogurt/eggs, whole grain toast, fruit.';
  }
  if (part === 'lunch') {
    if (g === 'gain') return d==='vegan' ? 'Lentil bowl with quinoa and mixed veg.' : 'Grilled chicken/paneer, rice, salad.';
    return d==='vegan' ? 'Chickpea salad and brown rice.' : 'Mixed grain bowl with veggies and lean protein.';
  }
  if (part === 'snack') return d==='vegan' ? 'Fruit & nuts' : 'Yogurt and fruit or nut butter on toast.';
  if (part === 'dinner') return 'Balanced plate: protein + veg + complex carbs (smaller portion than lunch).';
  return '';
}

function renderTimeline(items) {
  const container = $('timeline'); if (!container) return;
  container.innerHTML = '';
  items.forEach((it, idx) => {
    const node = document.createElement('div');
    node.className = 'relative pl-4';
    node.innerHTML = `
      <div class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-400"></div>
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-[92px] text-sm muted">${formatDisplay(it.time)}</div>
        <div class="flex-1 bg-gray-900 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold">${escapeHtml(it.title)}</div>
              <div class="muted text-sm mt-1">${escapeHtml(it.details)}</div>
            </div>
            <div class="ml-4 flex flex-col gap-2">
              <button data-idx="${idx}" class="btn-done bg-teal-500 px-3 py-1 rounded-lg text-sm font-medium hover:bg-teal-600 transition">Done</button>
              <button data-idx="${idx}" class="btn-edit bg-gray-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-700 transition">Edit</button>
            </div>
          </div>
        </div>
      </div>`;
    container.appendChild(node);
  });

  document.querySelectorAll('.btn-done').forEach(b => b.addEventListener('click', e => {
    const i = +e.currentTarget.dataset.idx;
    markDone(i);
  }));
  document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', e => {
    const i = +e.currentTarget.dataset.idx;
    editEntry(i);
  }));
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/[&<>"']/g, function (s) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]; });
}

function markDone(i) {
    if (!state.schedule[i]) return;
    modal.alert('Marked "' + state.schedule[i].title + '" as done.');
}
function editEntry(i) {
    if (!state.schedule[i]) return;
    modal.prompt('Edit title', state.schedule[i].title, (newTitle) => {
        if (newTitle !== null) {
            state.schedule[i].title = newTitle;
            renderTimeline(state.schedule);
        }
    });
}

function exportJSON() {
  try {
    const blob = new Blob([JSON.stringify(state.schedule, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'aurafit-schedule.json'; a.click(); URL.revokeObjectURL(url);
    modal.alert('Schedule exported successfully as JSON!');
  } catch (e) { modal.alert('Export failed: ' + e.message); }
}
function exportCSV() {
  try {
    const rows = [['time','title','details']].concat(state.schedule.map(s => [s.time, s.title, s.details]));
    const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'aurafit-schedule.csv'; a.click(); URL.revokeObjectURL(url);
    modal.alert('Schedule exported successfully as CSV!');
  } catch (e) { modal.alert('CSV export failed: ' + e.message); }
}

function startBreathing() {
  modal.confirm('Start a guided 3-round breathing (4s inhale, 6s exhale)?', () => {
    let rounds = 3;
    let step = 0;
    let timer = 0;
    const totalDuration = 4000;
    let modalInterval;

    const modalHtml = (message) => `
      <div class="text-3xl font-bold text-center">${message}</div>
      <div class="text-sm muted text-center mt-2" id="timer-text"></div>
    `;

    const breathe = () => {
        if (rounds === 0) {
            clearInterval(modalInterval);
            modal.alert('Done — hope you feel calmer!');
            return;
        }

        step = (step + 1) % 2;
        const message = step === 1 ? 'Inhale' : 'Exhale';
        const duration = step === 1 ? 4000 : 6000;
        timer = duration;

        modal.show(modalHtml(message));

        if (modalInterval) clearInterval(modalInterval);
        modalInterval = setInterval(() => {
            timer -= 1000;
            const timerText = $('timer-text');
            if (timerText) timerText.innerText = `Rounds left: ${rounds} · Time: ${timer / 1000}s`;
            if (timer <= 0) {
                clearInterval(modalInterval);
                if (step === 0) rounds--;
                setTimeout(breathe, 500); // Small pause
            }
        }, 1000);
    };
    breathe();
  });
}

window.addEventListener('error', function (e) { console.error('Unhandled error', e.error || e.message); });
window.addEventListener('load', init);
