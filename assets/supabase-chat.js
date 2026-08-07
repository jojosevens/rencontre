// Simple Supabase-backed chat integration. Falls back to localStorage if supabase not configured.
(function(){
  const byId = id => document.getElementById(id);
  let supabase = null;
  let currentRoom = null;

  function renderMessage(m){
    const messagesEl = byId('messages');
    const d = document.createElement('div'); d.className='message';
    const time = new Date(m.ts||Date.now()).toLocaleTimeString();
    d.innerHTML = `<strong>${escapeHtml(m.author||'Anonyme')}</strong> <span class="ts">${time}</span>: ${escapeHtml(m.text)}`;
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  async function loadRooms(){
    // rooms stored in localStorage if no supabase
    const roomListEl = byId('roomList');
    roomListEl.innerHTML='';
    let rooms = JSON.parse(localStorage.getItem('ttk_rooms')||'{}');
    Object.keys(rooms).forEach(r=>{ const li=document.createElement('li'); li.textContent=r; li.addEventListener('click', ()=>selectRoom(r)); roomListEl.appendChild(li); });
  }

  function selectRoom(name){ currentRoom = name; localStorage.setItem('ttk_current', name); const rt=byId('roomTitle'); if(rt) rt.textContent = name; loadMessages(); }

  async function loadMessages(){
    const messagesEl = byId('messages'); messagesEl.innerHTML='';
    if(supabase && currentRoom){
      // fetch from messages table where room = currentRoom
      const { data, error } = await supabase.from('messages').select('*').eq('room', currentRoom).order('ts', {ascending:true}).limit(100);
      if(error){ console.error(error); return; }
      data.forEach(renderMessage);
    }else{
      const rooms = JSON.parse(localStorage.getItem('ttk_rooms')||'{}');
      (rooms[currentRoom]||[]).forEach(renderMessage);
    }
  }

  async function sendMessage(author, text){
    const msg = { author, text, room: currentRoom, ts: Date.now() };
    if(supabase && currentRoom){
      const { error } = await supabase.from('messages').insert([msg]);
      if(error) console.error('insert error', error);
    }else{
      let rooms = JSON.parse(localStorage.getItem('ttk_rooms')||'{}');
      rooms[currentRoom] = rooms[currentRoom]||[]; rooms[currentRoom].push(msg); localStorage.setItem('ttk_rooms', JSON.stringify(rooms));
      renderMessage(msg);
    }
  }

  function bindUI(){
    const createBtn = byId('createRoom'); const newRoom = byId('newRoom');
    if(createBtn){ createBtn.addEventListener('click', ()=>{ const name=newRoom.value.trim(); if(!name) return alert('Nom du salon requis'); let rooms = JSON.parse(localStorage.getItem('ttk_rooms')||'{}'); if(!rooms[name]) rooms[name]=[]; localStorage.setItem('ttk_rooms', JSON.stringify(rooms)); newRoom.value=''; loadRooms(); selectRoom(name); }); }
    const form = document.getElementById('chatForm'); if(form){ form.addEventListener('submit', e=>{ e.preventDefault(); const author = (byId('author') && byId('author').value.trim())||'Anonyme'; const message = byId('message').value.trim(); if(!currentRoom){ alert('Sélectionnez ou créez un salon.'); return; } if(!message) return; sendMessage(author, message); byId('message').value=''; }); }
  }

  // Supabase realtime subscription
  function setupSupabaseRealtime(){
    if(!supabase) return;
    // listen to new messages
    const subscription = supabase.channel('public:messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const m = payload.new; if(m.room===currentRoom) renderMessage(m);
    }).subscribe();
  }

  document.addEventListener('supabase:ready', ()=>{
    supabase = window.supabaseClient;
    console.info('Chat: supabase ready');
    setupSupabaseRealtime();
  });

  document.addEventListener('DOMContentLoaded', ()=>{ bindUI(); loadRooms(); const cur = localStorage.getItem('ttk_current'); if(cur) selectRoom(cur); });
})();
