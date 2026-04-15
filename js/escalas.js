/* ═══════════════════════════════════════════════════
   escalas.js — Exibição de inscritos na escala
   Gamúrio do Amanhecer · Fortaleza, CE
═══════════════════════════════════════════════════ */

const SHEET_ID  = '1SvQneghPmhE8iqikjPcmR7cj68tvr3VS6mTfQad9KgU';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&t=${Date.now()}`;

let allData = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  loadToday();
});

async function fetchData() {
  try {
    const res  = await fetch(SHEET_URL);
    const text = await res.text();
    allData    = parseCSV(text);
    console.log('✅ Registros:', allData.length);
    console.log('Último registro:', allData[allData.length - 1]);
    // Debug CSV bruto — últimas 2 linhas
    const linhas = text.trim().split('\n');
    console.log('CSV linha 2:', linhas[linhas.length - 1].substring(0, 200));
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

// Colunas: Timestamp | Nome | Contato | Data | Mediunidade | Classificação | Tipo | Outra | Acompanhante | Acomp.Med
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  return lines.slice(1).map(line => {
    const c = splitCSV(line);
    return {
      timestamp:    clean(c[0]),
      nome:         clean(c[1]),
      contato:      clean(c[2]),
      data_escala:  clean(c[3]),
      mediunidade:  clean(c[4]),
      classificacao:clean(c[5]),
      tipo_escala:  clean(c[6]),
      outra_escala: clean(c[7]) || '',
      acompanhante: clean(c[8]) || '',
      acomp_med:    clean(c[9]) || ''
    };
  }).filter(r => r.nome && r.data_escala);
}

function splitCSV(line) {
  const res = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { res.push(cur); cur = ''; }
    else { cur += ch; }
  }
  res.push(cur);
  return res;
}

function clean(s = '') { return s.replace(/^"|"$/g, '').trim(); }

function loadToday() {
  const hoje = new Date();
  const iso  = hoje.toISOString().split('T')[0];
  document.getElementById('datePicker').value = iso;
  renderScale(iso);
}

function loadScale() {
  const val = document.getElementById('datePicker').value;
  if (val) renderScale(val);
}

function renderScale(isoDate) {
  const registros = allData.filter(r => r.data_escala === isoDate);

  const [yyyy, mm, dd] = isoDate.split('-');
  const dateObj   = new Date(isoDate + 'T12:00:00');
  const diaSemana = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  const titulo    = `Estrela Candente — ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dd}/${mm}/${yyyy}`;

  document.getElementById('dataTitulo').textContent = titulo;

  if (registros.length === 0) {
    document.getElementById('observacao').textContent = 'Nenhum médium inscrito para esta data.';
    document.getElementById('escaladosSection').classList.add('hidden');
    document.getElementById('noData').classList.remove('hidden');
    return;
  }

  document.getElementById('noData').classList.add('hidden');
  document.getElementById('escaladosSection').classList.remove('hidden');

  // ── MONTAR PARES ──
  // Cada registro pode trazer um acompanhante — formam um par juntos
  const pares = [];
  const jaUsados = new Set(); // nomes já alocados como acompanhante

  registros.forEach(r => {
    if (jaUsados.has(r.nome)) return; // já foi alocado como acompanhante de outro

    const isSol = r.mediunidade === 'Doutrinador(a)';

    // Verifica se tem acompanhante declarado
    const temAcomp = r.acompanhante && r.acomp_med;

    if (temAcomp) {
      // O acompanhante é da mediunidade oposta
      const acompEntry = {
        nome: r.acompanhante,
        classificacao: '',
        tipo_escala: 'Escalada completa',
        outra_escala: '',
        isAcomp: true
      };

      if (isSol) {
        // Inscrito é Sol, acompanhante é Lua
        pares.push({ sol: r, lua: acompEntry });
      } else {
        // Inscrito é Lua, acompanhante é Sol
        pares.push({ sol: acompEntry, lua: r });
      }
      jaUsados.add(r.acompanhante);
    } else {
      // Sem acompanhante — entra na lista solta
      if (isSol) {
        pares.push({ sol: r, lua: null });
      } else {
        pares.push({ sol: null, lua: r });
      }
    }
  });

  // Tentar combinar Sol sem par com Lua sem par
  const solSemPar  = pares.filter(p => p.sol && !p.lua);
  const luaSemPar  = pares.filter(p => p.lua && !p.sol);
  const paresFinais = pares.filter(p => p.sol && p.lua);

  const maxSoltos = Math.max(solSemPar.length, luaSemPar.length);
  for (let i = 0; i < maxSoltos; i++) {
    paresFinais.push({
      sol: solSemPar[i]?.sol || null,
      lua: luaSemPar[i]?.lua || null
    });
  }

  // Stats
  // Contar acompanhantes na mediunidade deles
  const totalSol = paresFinais.filter(p => p.sol).length;
  const totalLua = paresFinais.filter(p => p.lua).length;

  document.getElementById('observacao').textContent =
    `${registros.length} inscrito(s) · ${totalSol} Sol · ${totalLua} Lua`;
  document.getElementById('totalSol').textContent = totalSol;
  document.getElementById('totalLua').textContent = totalLua;

  // ── RENDERIZAR TABELA ──
  const getDisp = (p) => {
    if (!p) return '';
    if (p.isAcomp) return 'Acompanhante';
    if (p.tipo_escala === 'Escalada completa') return 'Completa';
    return `⚠️ ${p.outra_escala || 'Parcial'}`;
  };

  document.getElementById('paresContainer').innerHTML = paresFinais.map((par, i) => {
    const { sol, lua } = par;
    return `
      <tr>
        <td class="par-num">${i + 1}</td>
        <td class="par-sol">
          ${sol ? `<span class="par-nome${sol.isAcomp ? ' acomp' : ''}">${sol.nome}</span>${sol.classificacao ? `<span class="par-class">${sol.classificacao}</span>` : ''}` : ''}
        </td>
        <td class="par-disp">
          ${sol ? `<div class="disp-line${sol.isAcomp ? ' acomp-disp' : ''}">${getDisp(sol)}</div>` : ''}
        </td>
        <td class="par-lua">
          ${lua ? `<span class="par-nome${lua.isAcomp ? ' acomp' : ''}">${lua.nome}</span>${lua.classificacao ? `<span class="par-class">${lua.classificacao}</span>` : ''}` : ''}
        </td>
        <td class="par-disp">
          ${lua ? `<div class="disp-line${lua.isAcomp ? ' acomp-disp' : ''}">${getDisp(lua)}</div>` : ''}
        </td>
      </tr>`;
  }).join('');
}