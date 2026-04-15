/* ═══════════════════════════════════════════════════
   portal.js  —  Portal Interno
   Gamúrio do Amanhecer · Fortaleza, CE
═══════════════════════════════════════════════════ */

// ── CONSTANTS ────────────────────────────────────
const RL = { admin: 'Administrador', coord: 'Coordenador', cmd: 'Comandante', medium: 'Médium' };
const RC = { admin: 'r-admin', coord: 'r-coord', cmd: 'r-cmd', medium: 'r-medium' };
const RK = { admin: '#C9A84C', coord: '#4ECFDB', cmd: '#E08C2A', medium: '#9B7FCC' };

const VIEWS = {
  dash:             'Início',
  perfil:           'Meu Perfil',
  escala:           'Minha Escala & Grupo',
  'escala-cmd':     'Escala de Comando',
  grupo:            'Meu Grupo',
  'todas-escalas':  'Todas as Escalas',
  todos:            'Todos os Membros',
  avisos:           'Avisos & Comunicados',
};

const NAV_ITEMS = [
  { id: 'dash',           ico: '✦',  lbl: 'Início',             roles: ['admin','coord','cmd','medium'] },
  { id: 'perfil',         ico: '👤', lbl: 'Meu Perfil',         roles: ['admin','coord','cmd','medium'] },
  { id: 'escala',         ico: '🗓️', lbl: 'Minha Escala',       roles: ['admin','coord','cmd','medium'] },
  { id: 'escala-cmd',     ico: '⭐', lbl: 'Escala de Comando',  roles: ['admin','coord','cmd','medium'] },
  { id: 'grupo',          ico: '👥', lbl: 'Meu Grupo',          roles: ['admin','coord'] },
  { id: 'todas-escalas',  ico: '📋', lbl: 'Todas as Escalas',   roles: ['admin','cmd'] },
  { id: 'todos',          ico: '🔑', lbl: 'Todos os Membros',   roles: ['admin'] },
  { id: 'avisos',         ico: '📢', lbl: 'Avisos',             roles: ['admin','coord','cmd','medium'] },
];

// ── HELPERS ──────────────────────────────────────
function toast(msg, ms = 3200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

function tf(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function ini(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── AUTH SCREEN CONTROLLERS ───────────────────────
window.showLoginScreen = function () {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display  = 'flex';
  document.getElementById('portal').style.display       = 'none';
  const btn = document.getElementById('lbtn');
  btn.disabled = false;
  btn.innerHTML = '✦ &nbsp; Entrar no Portal';
};

window.showPortal = function () {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display  = 'none';
  document.getElementById('portal').style.display       = 'block';
  initPortal();
};

window.showErr = function (msg) {
  const err = document.getElementById('lerr');
  err.textContent = msg;
  err.style.display = 'block';
};

// ── LOGIN / LOGOUT ────────────────────────────────
async function doLogin() {
  const email = document.getElementById('lemail').value.trim();
  const pass  = document.getElementById('lpass').value;
  const btn   = document.getElementById('lbtn');
  const err   = document.getElementById('lerr');

  err.style.display = 'none';
  btn.disabled = true;
  btn.textContent  = 'Entrando...';

  try {
    const fb = window._fb;
    await fb.signInWithEmailAndPassword(fb.auth, email, pass);
    // onAuthStateChanged in the HTML module handles the rest
  } catch (e) {
    err.textContent = 'E-mail ou senha incorretos.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '✦ &nbsp; Entrar no Portal';
  }
}

async function doLogout() {
  await window._fb.signOut(window._fb.auth);
}

// ── PORTAL INIT ───────────────────────────────────
function initPortal() {
  const u = window.currentUser;

  // Sidebar user info
  const av = document.getElementById('savt');
  av.textContent       = ini(u.nome);
  av.style.background  = RK[u.role] + '20';
  av.style.color       = RK[u.role];

  document.getElementById('sname').textContent = u.nome || u.email;
  document.getElementById('srole').textContent = RL[u.role] || u.role;
  document.getElementById('spill').innerHTML   =
    `<span class="rpill ${RC[u.role]}">${RL[u.role] || u.role}</span>`;

  document.getElementById('vdate').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  buildNav();
  showView('dash');
  loadDash();
}

// ── SIDEBAR NAV ───────────────────────────────────
function buildNav() {
  const role = window.currentUser.role;
  document.getElementById('snav').innerHTML =
    '<div class="nsect">Menu</div>' +
    NAV_ITEMS.filter(i => i.roles.includes(role)).map(i =>
      `<div class="ni" id="ni-${i.id}" onclick="showView('${i.id}')">
         <span class="ico">${i.ico}</span>${i.lbl}
       </div>`
    ).join('') +
    '<div class="nsect" style="margin-top:1rem;">Acesso</div>' +
    `<a href="index.html" class="ni" style="text-decoration:none;">
       <span class="ico">🌐</span>Site Público
     </a>`;
}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  document.getElementById('view-' + id)?.classList.add('active');
  document.getElementById('ni-' + id)?.classList.add('active');
  document.getElementById('vtitle').textContent = VIEWS[id] || id;
  document.getElementById('sidebar').classList.remove('open');

  const loaders = {
    perfil:           loadPerfil,
    escala:           loadEscala,
    'escala-cmd':     loadEscalaCmd,
    grupo:            loadGrupo,
    'todas-escalas':  loadTodasEscalas,
    todos:            loadTodos,
    avisos:           loadAvisos,
  };
  if (loaders[id]) loaders[id]();
}

// ── MOBILE SIDEBAR ────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── DASHBOARD ────────────────────────────────────
async function loadDash() {
  const { db, collection, getDocs, query, where } = window._fb;
  const u = window.currentUser;
  let cnt = 0;

  try {
    if (u.role === 'admin') {
      cnt = (await getDocs(collection(db, 'usuarios'))).size;
    } else if (u.role === 'coord') {
      cnt = (await getDocs(query(collection(db,'usuarios'), where('grupo','==',u.grupo||''), where('role','==','medium')))).size;
    }
  } catch (_) {}

  document.getElementById('dcards').innerHTML = `
    <div class="scard gold">
      <div class="snum" style="font-size:1.1rem">${u.nome?.split(' ')[0] || 'Olá'}</div>
      <div class="slbl">Bem-vindo</div>
    </div>
    <div class="scard cyan">
      <div class="snum" style="font-size:1rem">${RL[u.role] || u.role}</div>
      <div class="slbl">Seu Perfil</div>
    </div>
    ${u.grupo ? `<div class="scard amb"><div class="snum" style="font-size:1rem">${u.grupo}</div><div class="slbl">Grupo / Falange</div></div>` : ''}
    ${cnt     ? `<div class="scard vio"><div class="snum">${cnt}</div><div class="slbl">Membros no Grupo</div></div>` : ''}
  `;

  document.getElementById('drecent').innerHTML = `
    <div class="sec-lbl" style="margin-bottom:.8rem;">Acesso Rápido</div>
    <div style="display:flex;flex-wrap:wrap;gap:.8rem;">
      <button class="btn-p" onclick="showView('escala')">🗓️ Minha Escala</button>
      <button class="btn-p" onclick="showView('escala-cmd')">⭐ Escala de Comando</button>
      <button class="btn-g" onclick="showView('avisos')">📢 Avisos</button>
    </div>`;
}

// ── MEU PERFIL ────────────────────────────────────
function loadPerfil() {
  const u = window.currentUser;
  document.getElementById('perfilContent').innerHTML = `
    <div class="mcard">
      <div class="mcard-hdr">
        <div class="mavt" style="background:${RK[u.role]}20;color:${RK[u.role]};border-color:${RK[u.role]}60;">${ini(u.nome)}</div>
        <div>
          <div class="mname">${u.nome || '—'}</div>
          <div class="mrole">${RL[u.role] || u.role} · ${u.grupo || 'Sem grupo'}</div>
          <span class="rpill ${RC[u.role]}">${RL[u.role] || u.role}</span>
        </div>
      </div>
      <div class="mcard-body">
        <div class="igrid">
          <div><div class="ilbl">Nome Completo</div> <div class="ival">${u.nome          || '—'}</div></div>
          <div><div class="ilbl">E-mail</div>         <div class="ival">${u.email         || '—'}</div></div>
          <div><div class="ilbl">Mediunidade</div>    <div class="ival">${u.mediunidade   || '—'}</div></div>
          <div><div class="ilbl">Emissão</div>        <div class="ival">${u.emissao       || '—'}</div></div>
          <div><div class="ilbl">Classificação</div>  <div class="ival">${u.classificacao || '—'}</div></div>
          <div><div class="ilbl">Grupo / Falange</div><div class="ival">${u.grupo         || '—'}</div></div>
        </div>
      </div>
    </div>`;
}

// ── MINHA ESCALA ─────────────────────────────────
async function loadEscala() {
  const { db, collection, getDocs, query, where } = window._fb;
  const u  = window.currentUser;
  const el = document.getElementById('escalaContent');
  el.innerHTML = '<p style="color:var(--p-muted);font-style:italic;">Carregando...</p>';

  let grupoHTML = `<div class="empty"><span>📭</span>Nenhuma escala do grupo disponível.</div>`;
  try {
    const snap = await getDocs(query(collection(db,'escalas'), where('grupo','==',u.grupo||''), where('tipo','==','grupo')));
    if (!snap.empty) {
      const e = snap.docs[0].data();
      grupoHTML = `<div class="escprev">
        <div class="escprev-hdr"><span>Escala — ${u.grupo}</span><span style="color:var(--p-gold)">${fmtDate(e.updatedAt)}</span></div>
        <img src="${e.imageUrl}" alt="Escala do grupo"/>
      </div>`;
    }
  } catch (_) {}

  el.innerHTML = `
    <div class="sec-lbl" style="margin-bottom:.6rem;">Escala do Grupo — ${u.grupo || 'Sem grupo'}</div>
    ${grupoHTML}
    <div style="margin-top:2.5rem;">
      <div class="sec-lbl" style="margin-bottom:.8rem;">Escala de Comando</div>
      <div id="escCmdInline"></div>
    </div>`;

  renderCmdEscalas('escCmdInline');
}

// ── ESCALA DE COMANDO ────────────────────────────
async function loadEscalaCmd() {
  const u     = window.currentUser;
  const btnEl = document.getElementById('btnUploadCmd');

  if (['cmd','admin'].includes(u.role)) {
    btnEl.innerHTML = `<button class="btn-p" onclick="document.getElementById('cmdFile').click()">⬆ Upload Escala de Comando</button>`;
  }
  renderCmdEscalas('escCmdContent');
}

async function renderCmdEscalas(targetId) {
  const { db, collection, getDocs, query, where } = window._fb;
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = '<p style="color:var(--p-muted);font-style:italic;font-size:.9rem;">Carregando...</p>';
  try {
    const snap = await getDocs(query(collection(db,'escalas'), where('tipo','==','comando')));
    if (snap.empty) { el.innerHTML = `<div class="empty"><span>⭐</span>Nenhuma escala de comando publicada ainda.</div>`; return; }
    el.innerHTML = `<div class="cmd-grid">${snap.docs.map(d => {
      const e = d.data();
      return `<div class="cmd-card">
        <div class="cmd-hdr">⭐ ${e.titulo || 'Escala de Comando'}</div>
        <div class="cmd-body">
          <img src="${e.imageUrl}" alt="Escala de Comando"/>
          <div class="cmd-meta">Publicado: ${fmtDate(e.updatedAt)} · por ${e.autor || '—'}</div>
        </div>
      </div>`;
    }).join('')}</div>`;
  } catch (_) {
    el.innerHTML = `<div class="empty"><span>⚠️</span>Erro ao carregar.</div>`;
  }
}

async function uploadEscalaCmd(input) {
  const file = input.files[0]; if (!file) return;
  const { storage, db, ref, uploadBytes, getDownloadURL, collection, addDoc, serverTimestamp } = window._fb;
  toast('Enviando escala de comando...');
  try {
    const r   = ref(storage, `escalas/comando/${Date.now()}_${file.name}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    await addDoc(collection(db, 'escalas'), {
      tipo: 'comando', titulo: 'Escala de Comando',
      imageUrl: url, autor: window.currentUser.nome, updatedAt: serverTimestamp()
    });
    toast('✦ Escala de Comando publicada!');
    loadEscalaCmd();
  } catch (_) { toast('Erro ao enviar. Tente novamente.'); }
}

// ── MEU GRUPO ────────────────────────────────────
async function loadGrupo() {
  const { db, collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp } = window._fb;
  const u  = window.currentUser;
  const el = document.getElementById('grupoContent');
  el.innerHTML = '<p style="color:var(--p-muted);font-style:italic;">Carregando...</p>';
  try {
    const mSnap = await getDocs(query(collection(db,'usuarios'), where('grupo','==',u.grupo||''), where('role','==','medium')));
    const ms    = mSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const eSnap = await getDocs(query(collection(db,'escalas'), where('grupo','==',u.grupo||''), where('tipo','==','grupo'))).catch(() => ({ empty: true, docs: [] }));

    let escHTML = `<div class="empty"><span>📤</span>Nenhuma escala enviada ainda.</div>`;
    if (!eSnap.empty) {
      const e = eSnap.docs[0].data();
      escHTML = `<div class="escprev">
        <div class="escprev-hdr"><span>Escala — ${u.grupo}</span><span style="color:var(--p-gold)">${fmtDate(e.updatedAt)}</span></div>
        <img src="${e.imageUrl}" alt="Escala"/>
      </div>`;
    }

    el.innerHTML = `
      <div class="fpanel" style="background:rgba(22,15,24,.7);">
        <h3>📤 Escala do Grupo — ${u.grupo || 'Sem grupo'}</h3>
        ${escHTML}
        <label class="upzone" style="margin-top:1rem;" onclick="document.getElementById('grpFile').click()">
          <input type="file" id="grpFile" accept="image/*" onchange="uploadEscalaGrp(this)"/>
          <span class="upico">📷</span>
          <div class="uptxt">Clique para enviar nova escala<br><strong>JPG · PNG · WEBP</strong> · máx. 5 MB</div>
        </label>
      </div>
      <div class="sec-lbl" style="margin-bottom:1rem;">Médiuns do Grupo (${ms.length})</div>
      ${ms.length === 0
        ? `<div class="empty"><span>👥</span>Nenhum médium neste grupo ainda.</div>`
        : `<div class="twrap"><table class="dtbl">
             <thead><tr><th>Nome</th><th>Mediunidade</th><th>Emissão</th><th>Classificação</th></tr></thead>
             <tbody>${ms.map(m => `<tr>
               <td><span class="avtsm" style="background:${RK.medium}20;color:${RK.medium};">${ini(m.nome)}</span>${m.nome||'—'}</td>
               <td style="color:var(--p-muted)">${m.mediunidade||'—'}</td>
               <td style="color:var(--p-muted)">${m.emissao||'—'}</td>
               <td style="color:var(--p-muted)">${m.classificacao||'—'}</td>
             </tr>`).join('')}</tbody>
           </table></div>`}`;
  } catch (e) {
    el.innerHTML = `<div class="empty"><span>⚠️</span>Erro ao carregar grupo.</div>`;
    console.error(e);
  }
}

async function uploadEscalaGrp(input) {
  const file = input.files[0]; if (!file) return;
  const { storage, db, ref, uploadBytes, getDownloadURL, collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } = window._fb;
  const u = window.currentUser;
  toast('Enviando escala do grupo...');
  try {
    const r   = ref(storage, `escalas/grupos/${u.grupo||'sem-grupo'}/${Date.now()}_${file.name}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    const q   = query(collection(db,'escalas'), where('grupo','==',u.grupo||''), where('tipo','==','grupo'));
    const sn  = await getDocs(q);
    if (!sn.empty) {
      await updateDoc(doc(db,'escalas',sn.docs[0].id), { imageUrl: url, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db,'escalas'), { tipo:'grupo', grupo:u.grupo, imageUrl:url, autor:u.nome, updatedAt:serverTimestamp() });
    }
    toast('✦ Escala do grupo atualizada!');
    loadGrupo();
  } catch (_) { toast('Erro ao enviar.'); }
}

async function addMembro() {
  const nome  = document.getElementById('nm_nome').value.trim();
  const email = document.getElementById('nm_email').value.trim();
  if (!nome || !email) { toast('Nome e e-mail são obrigatórios.'); return; }
  toast('Salvando...');
  try {
    const { db, collection, addDoc, serverTimestamp } = window._fb;
    const u = window.currentUser;
    await addDoc(collection(db,'usuarios_pendentes'), {
      nome, email,
      mediunidade:   document.getElementById('nm_med').value,
      emissao:       document.getElementById('nm_em').value,
      classificacao: document.getElementById('nm_cl').value,
      grupo: u.grupo, role: 'medium',
      criadoPor: u.uid, criadoEm: serverTimestamp()
    });
    toast('✦ Dados salvos! Crie o login no Firebase Console → Authentication.');
    tf('fAddMembro');
    loadGrupo();
  } catch (_) { toast('Erro ao salvar.'); }
}

// ── TODAS AS ESCALAS ─────────────────────────────
async function loadTodasEscalas() {
  const { db, collection, getDocs, query, where } = window._fb;
  const el = document.getElementById('todasEscContent');
  el.innerHTML = '<p style="color:var(--p-muted);font-style:italic;">Carregando...</p>';
  try {
    const snap = await getDocs(query(collection(db,'escalas'), where('tipo','==','grupo')));
    if (snap.empty) { el.innerHTML = `<div class="empty"><span>📋</span>Nenhuma escala de grupo publicada ainda.</div>`; return; }
    el.innerHTML = snap.docs.map(d => {
      const e = d.data();
      return `<div class="grp-card">
        <div class="grp-hdr">👥 ${e.grupo||'Grupo'} <span style="font-size:.65rem;opacity:.7;margin-left:.5rem;">${fmtDate(e.updatedAt)}</span></div>
        <div class="grp-body"><img src="${e.imageUrl}" alt="Escala ${e.grupo}"/></div>
      </div>`;
    }).join('');
  } catch (_) { el.innerHTML = `<div class="empty"><span>⚠️</span>Erro ao carregar.</div>`; }
}

// ── TODOS OS MEMBROS (admin) ──────────────────────
async function loadTodos() {
  const { db, collection, getDocs } = window._fb;
  const el = document.getElementById('todosContent');
  el.innerHTML = '<p style="color:var(--p-muted);font-style:italic;">Carregando...</p>';
  try {
    const all = (await getDocs(collection(db,'usuarios'))).docs.map(d => ({ id:d.id, ...d.data() }));
    if (!all.length) { el.innerHTML = `<div class="empty"><span>👥</span>Nenhum usuário cadastrado.</div>`; return; }
    el.innerHTML = `<div class="twrap"><table class="dtbl">
      <thead><tr><th>Nome</th><th>Perfil</th><th>Grupo</th><th>Mediunidade</th><th>Emissão</th><th>Classificação</th></tr></thead>
      <tbody>${all.map(m => `<tr>
        <td><span class="avtsm" style="background:${RK[m.role]||'#888'}20;color:${RK[m.role]||'#888'};">${ini(m.nome)}</span>${m.nome||m.email||'—'}</td>
        <td><span class="rpill ${RC[m.role]||''}">${RL[m.role]||m.role||'—'}</span></td>
        <td style="color:var(--p-muted)">${m.grupo         ||'—'}</td>
        <td style="color:var(--p-muted)">${m.mediunidade   ||'—'}</td>
        <td style="color:var(--p-muted)">${m.emissao       ||'—'}</td>
        <td style="color:var(--p-muted)">${m.classificacao ||'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch (_) { el.innerHTML = `<div class="empty"><span>⚠️</span>Erro ao carregar.</div>`; }
}

async function addGlobal() {
  const nome  = document.getElementById('ag_nome').value.trim();
  const email = document.getElementById('ag_email').value.trim();
  if (!nome || !email) { toast('Nome e e-mail são obrigatórios.'); return; }
  toast('Salvando...');
  try {
    const { db, collection, addDoc, serverTimestamp } = window._fb;
    await addDoc(collection(db,'usuarios_pendentes'), {
      nome, email,
      role:          document.getElementById('ag_role').value,
      grupo:         document.getElementById('ag_grupo').value,
      mediunidade:   document.getElementById('ag_med').value,
      emissao:       document.getElementById('ag_em').value,
      classificacao: document.getElementById('ag_cl').value,
      criadoEm: serverTimestamp()
    });
    toast('✦ Dados salvos! Crie o login no Firebase Console → Authentication.');
    tf('fAddGlobal');
    loadTodos();
  } catch (_) { toast('Erro ao salvar.'); }
}

// ── AVISOS ───────────────────────────────────────
async function loadAvisos() {
  const { db, collection, getDocs } = window._fb;
  const u     = window.currentUser;
  const btnEl = document.getElementById('btnNewAviso');

  if (['admin','coord','cmd'].includes(u.role)) {
    btnEl.innerHTML = `<button class="btn-p" onclick="tf('fNewAviso')">+ Novo Aviso</button>`;
  }

  const el = document.getElementById('avisoList');
  el.innerHTML = '<p style="color:var(--p-muted);font-style:italic;">Carregando...</p>';

  try {
    const avs = (await getDocs(collection(db,'avisos')))
      .docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(a => {
        if (a.dest === 'todos')     return true;
        if (a.dest === 'coord_cmd') return ['admin','coord','cmd'].includes(u.role);
        if (a.dest === 'admin')     return u.role === 'admin';
        return false;
      })
      .sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));

    if (!avs.length) { el.innerHTML = `<div class="empty"><span>📭</span>Nenhum aviso no momento.</div>`; return; }

    const icons = { urgente:'🚨', importante:'⚠️', info:'💬' };
    const tc    = { urgente:'t-urg', importante:'t-imp', info:'t-inf' };
    const tl    = { urgente:'Urgente', importante:'Importante', info:'Informativo' };

    el.innerHTML = avs.map(a => `
      <div class="avc ${a.tipo}">
        <div class="av-ico">${icons[a.tipo] || '💬'}</div>
        <div style="flex:1;min-width:0;">
          <div class="av-meta">
            <span class="avtag ${tc[a.tipo]||'t-inf'}">${tl[a.tipo]||'Info'}</span>
            <span class="av-date">${fmtDate(a.criadoEm)}</span>
            <span class="av-auth">por ${a.autor||'—'}</span>
          </div>
          <div class="av-ttl">${a.titulo}</div>
          <div class="av-body">${a.body}</div>
        </div>
      </div>`).join('');
  } catch (_) { el.innerHTML = `<div class="empty"><span>⚠️</span>Erro ao carregar avisos.</div>`; }
}

async function publishAviso() {
  const titulo = document.getElementById('av_ttl').value.trim();
  const body   = document.getElementById('av_body').value.trim();
  if (!titulo || !body) { toast('Preencha título e mensagem.'); return; }
  const { db, collection, addDoc, serverTimestamp } = window._fb;
  try {
    await addDoc(collection(db,'avisos'), {
      titulo, body,
      tipo:  document.getElementById('av_tipo').value,
      dest:  document.getElementById('av_dest').value,
      autor: window.currentUser.nome,
      criadoEm: serverTimestamp()
    });
    toast('✦ Aviso publicado!');
    tf('fNewAviso');
    document.getElementById('av_ttl').value = '';
    document.getElementById('av_body').value = '';
    loadAvisos();
  } catch (_) { toast('Erro ao publicar.'); }
}