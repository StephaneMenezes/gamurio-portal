/* ── ACOMPANHANTE TOGGLE ── */
function selectAcompMed(radio) {
  document.getElementById('acomp-sol').classList.remove('sel-sol');
  document.getElementById('acomp-lua').classList.remove('sel-lua');
  if (radio.value === 'Sol') {
    document.getElementById('acomp-sol').classList.add('sel-sol');
  } else {
    document.getElementById('acomp-lua').classList.add('sel-lua');
  }
}
let acompAtivo = false;

function toggleAcomp() {
  acompAtivo = !acompAtivo;
  const toggle = document.getElementById('acompToggle');
  const wrap   = document.getElementById('acompWrap');
  const ico    = document.getElementById('acompIco');
  const input  = document.getElementById('acompanhante');

  toggle.classList.toggle('ativo', acompAtivo);
  wrap.classList.toggle('hidden', !acompAtivo);
  ico.textContent = acompAtivo ? '✅' : '⭕';

  if (acompAtivo) {
    input.setAttribute('required', '');
  } else {
    input.removeAttribute('required');
    input.value = '';
  }
}

/* ── CALENDÁRIO INFORMATIVO LATERAL ── */
const CAL_MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Feriados: chave = "YYYY-MM-DD", valor = { nome, tipo: 'f'|'ce' }
const FERIADOS = {
  // ── 2026 ──
  '2026-01-01': { nome: 'Confraternização Universal', tipo: 'f' },
  '2026-02-16': { nome: 'Carnaval', tipo: 'f' },
  '2026-02-17': { nome: 'Carnaval', tipo: 'f' },
  '2026-02-18': { nome: 'Quarta de Cinzas (meio dia)', tipo: 'f' },
  '2026-03-19': { nome: 'São José — Padroeiro do Ceará', tipo: 'f' },
  '2026-04-03': { nome: 'Sexta-feira Santa', tipo: 'f' },
  '2026-04-05': { nome: 'Páscoa', tipo: 'f' },
  '2026-04-21': { nome: 'Tiradentes', tipo: 'f' },
  '2026-05-01': { nome: 'Dia do Trabalho', tipo: 'f' },
  '2026-06-04': { nome: 'Corpus Christi', tipo: 'f' },
  '2026-06-24': { nome: 'São João — Feriado Estadual CE', tipo: 'f' },
  '2026-07-09': { nome: 'Data Magna do Ceará', tipo: 'f' },
  '2026-09-07': { nome: 'Independência do Brasil', tipo: 'f' },
  '2026-10-12': { nome: 'Nossa Sra. Aparecida', tipo: 'f' },
  '2026-11-02': { nome: 'Finados', tipo: 'f' },
  '2026-11-15': { nome: 'Proclamação da República', tipo: 'f' },
  '2026-11-20': { nome: 'Consciência Negra', tipo: 'f' },
  '2026-12-08': { nome: 'Nossa Sra. da Conceição — CE', tipo: 'f' },
  '2026-12-25': { nome: 'Natal', tipo: 'f' },
  // ── 2027 ──
  '2027-01-01': { nome: 'Confraternização Universal', tipo: 'f' },
  '2027-02-08': { nome: 'Carnaval', tipo: 'f' },
  '2027-02-09': { nome: 'Carnaval', tipo: 'f' },
  '2027-03-19': { nome: 'São José — Padroeiro do Ceará', tipo: 'f' },
  '2027-03-26': { nome: 'Sexta-feira Santa', tipo: 'f' },
  '2027-03-28': { nome: 'Páscoa', tipo: 'f' },
  '2027-04-21': { nome: 'Tiradentes', tipo: 'f' },
  '2027-05-01': { nome: 'Dia do Trabalho', tipo: 'f' },
  '2027-05-27': { nome: 'Corpus Christi', tipo: 'f' },
  '2027-06-24': { nome: 'São João — Feriado Estadual CE', tipo: 'f' },
  '2027-07-09': { nome: 'Data Magna do Ceará', tipo: 'f' },
  '2027-09-07': { nome: 'Independência do Brasil', tipo: 'f' },
  '2027-10-12': { nome: 'Nossa Sra. Aparecida', tipo: 'f' },
  '2027-11-02': { nome: 'Finados', tipo: 'f' },
  '2027-11-15': { nome: 'Proclamação da República', tipo: 'f' },
  '2027-11-20': { nome: 'Consciência Negra', tipo: 'f' },
  '2027-12-08': { nome: 'Nossa Sra. da Conceição — CE', tipo: 'f' },
  '2027-12-25': { nome: 'Natal', tipo: 'f' },
  // ── 2028 ──
  '2028-01-01': { nome: 'Confraternização Universal', tipo: 'f' },
  '2028-02-28': { nome: 'Carnaval', tipo: 'f' },
  '2028-02-29': { nome: 'Carnaval', tipo: 'f' },
  '2028-03-19': { nome: 'São José — Padroeiro do Ceará', tipo: 'f' },
  '2028-04-14': { nome: 'Sexta-feira Santa', tipo: 'f' },
  '2028-04-16': { nome: 'Páscoa', tipo: 'f' },
  '2028-04-21': { nome: 'Tiradentes', tipo: 'f' },
  '2028-05-01': { nome: 'Dia do Trabalho', tipo: 'f' },
  '2028-06-15': { nome: 'Corpus Christi', tipo: 'f' },
  '2028-06-24': { nome: 'São João — Feriado Estadual CE', tipo: 'f' },
  '2028-07-09': { nome: 'Data Magna do Ceará', tipo: 'f' },
  '2028-09-07': { nome: 'Independência do Brasil', tipo: 'f' },
  '2028-10-12': { nome: 'Nossa Sra. Aparecida', tipo: 'f' },
  '2028-11-02': { nome: 'Finados', tipo: 'f' },
  '2028-11-15': { nome: 'Proclamação da República', tipo: 'f' },
  '2028-11-20': { nome: 'Consciência Negra', tipo: 'f' },
  '2028-12-08': { nome: 'Nossa Sra. da Conceição — CE', tipo: 'f' },
  '2028-12-25': { nome: 'Natal', tipo: 'f' },
  // ── 2029 ──
  '2029-01-01': { nome: 'Confraternização Universal', tipo: 'f' },
  '2029-03-05': { nome: 'Carnaval', tipo: 'f' },
  '2029-03-06': { nome: 'Carnaval', tipo: 'f' },
  '2029-03-19': { nome: 'São José — Padroeiro do Ceará', tipo: 'f' },
  '2029-03-30': { nome: 'Sexta-feira Santa', tipo: 'f' },
  '2029-04-01': { nome: 'Páscoa', tipo: 'f' },
  '2029-04-21': { nome: 'Tiradentes', tipo: 'f' },
  '2029-05-01': { nome: 'Dia do Trabalho', tipo: 'f' },
  '2029-05-31': { nome: 'Corpus Christi', tipo: 'f' },
  '2029-06-24': { nome: 'São João — Feriado Estadual CE', tipo: 'f' },
  '2029-07-09': { nome: 'Data Magna do Ceará', tipo: 'f' },
  '2029-09-07': { nome: 'Independência do Brasil', tipo: 'f' },
  '2029-10-12': { nome: 'Nossa Sra. Aparecida', tipo: 'f' },
  '2029-11-02': { nome: 'Finados', tipo: 'f' },
  '2029-11-15': { nome: 'Proclamação da República', tipo: 'f' },
  '2029-11-20': { nome: 'Consciência Negra', tipo: 'f' },
  '2029-12-08': { nome: 'Nossa Sra. da Conceição — CE', tipo: 'f' },
  '2029-12-25': { nome: 'Natal', tipo: 'f' },
  // ── 2030 ──
  '2030-01-01': { nome: 'Confraternização Universal', tipo: 'f' },
  '2030-03-04': { nome: 'Carnaval', tipo: 'f' },
  '2030-03-05': { nome: 'Carnaval', tipo: 'f' },
  '2030-03-19': { nome: 'São José — Padroeiro do Ceará', tipo: 'f' },
  '2030-04-19': { nome: 'Sexta-feira Santa', tipo: 'f' },
  '2030-04-21': { nome: 'Tiradentes + Páscoa', tipo: 'f' },
  '2030-05-01': { nome: 'Dia do Trabalho', tipo: 'f' },
  '2030-06-20': { nome: 'Corpus Christi', tipo: 'f' },
  '2030-06-24': { nome: 'São João — Feriado Estadual CE', tipo: 'f' },
  '2030-07-09': { nome: 'Data Magna do Ceará', tipo: 'f' },
  '2030-09-07': { nome: 'Independência do Brasil', tipo: 'f' },
  '2030-10-12': { nome: 'Nossa Sra. Aparecida', tipo: 'f' },
  '2030-11-02': { nome: 'Finados', tipo: 'f' },
  '2030-11-15': { nome: 'Proclamação da República', tipo: 'f' },
  '2030-11-20': { nome: 'Consciência Negra', tipo: 'f' },
  '2030-12-08': { nome: 'Nossa Sra. da Conceição — CE', tipo: 'f' },
  '2030-12-25': { nome: 'Natal', tipo: 'f' },
};

const CAL_MIN = { year: 2026, month: 4 };   // maio/2026
const CAL_MAX = { year: 2030, month: 11 };  // dezembro/2030

let calAtual = { year: new Date().getFullYear(), month: new Date().getMonth() };
// Garantir que começa dentro do intervalo permitido
if (calAtual.year < CAL_MIN.year || (calAtual.year === CAL_MIN.year && calAtual.month < CAL_MIN.month)) {
  calAtual = { ...CAL_MIN };
}
if (calAtual.year > CAL_MAX.year || (calAtual.year === CAL_MAX.year && calAtual.month > CAL_MAX.month)) {
  calAtual = { ...CAL_MAX };
}

function calRender() {
  const { year, month } = calAtual;

  document.getElementById('calMesAno').textContent =
    `${CAL_MESES[month]} ${year}`;

  document.getElementById('calPrev').disabled =
    year === CAL_MIN.year && month === CAL_MIN.month;
  document.getElementById('calNext').disabled =
    year === CAL_MAX.year && month === CAL_MAX.month;

  const firstDay  = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const hoje      = new Date();
  const container = document.getElementById('calDays');
  container.innerHTML = '';

  // Células vazias
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-d vazio';
    container.appendChild(el);
  }

  // Dias
  for (let d = 1; d <= totalDays; d++) {
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const el  = document.createElement('div');
    el.className = 'cal-d';
    el.textContent = d;

    const feriado = FERIADOS[iso];
    if (feriado) {
      el.classList.add('feriado');
      el.title = feriado.nome;
    }


    if (feriado) el.dataset.feriado = feriado.nome;
    container.appendChild(el);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calDays')) {
    calRender();

    // Renderizar lista de feriados do mês
  function renderFeriadosList() {
    const { year, month } = calAtual;
    const label = document.getElementById('calFeriadoLabel');
    if (!label) return;

    // Filtrar feriados do mês atual
    const prefix = `${year}-${String(month + 1).padStart(2,'0')}-`;
    const doMes = Object.entries(FERIADOS)
      .filter(([iso]) => iso.startsWith(prefix))
      .sort(([a], [b]) => a.localeCompare(b));

    if (doMes.length === 0) {
      label.innerHTML = '<span style="color:var(--muted);font-style:italic">Nenhum feriado neste mês</span>';
      return;
    }

    label.innerHTML = doMes.map(([iso, f]) => {
      const dia = parseInt(iso.split('-')[2]);
      return `<div class="cal-feriado-row"><span class="cal-feriado-dia">${dia}</span><span class="cal-feriado-nome">${f.nome}</span></div>`;
    }).join('');
  }

  renderFeriadosList();

  document.getElementById('calPrev').addEventListener('click', () => {
      let { year, month } = calAtual;
      month--;
      if (month < 0) { month = 11; year--; }
      calAtual = { year, month };
      calRender();
      renderFeriadosList();
    });
    document.getElementById('calNext').addEventListener('click', () => {
      let { year, month } = calAtual;
      month++;
      if (month > 11) { month = 0; year++; }
      calAtual = { year, month };
      calRender();
      renderFeriadosList();
    });
  }
});

/* ═══════════════════════════════════════════════════
   escala.js  —  Formulário de Inscrição de Escala
   Gamúrio do Amanhecer · Fortaleza, CE
═══════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────
//  CONFIGURAÇÃO
//  Substitua pela URL do seu Google Apps Script
//  após publicar (veja SHEETS-SETUP.md)
// ─────────────────────────────────────────────────
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzTmroPARDpOXMScktk560b2VG_QD5sLw-ir3x3l6CiKRd1HYr2_1W-u7q1B0za4hnw/exec';

// ── Consagração ──
const CONSAGRACAO_MAP = {
  'primeira': { tipo: 'Escalada completa',          outra: '',                          label: '1ª + 2ª + 3ª Escalada' },
  'segunda':  { tipo: 'Outra escala',                outra: 'Segunda e terceira escalada', label: '2ª + 3ª Escalada' },
  'terceira': { tipo: 'Outra escala',                outra: 'Terceira escalada',           label: '3ª Escalada' },
};

function handleConsagracao(radio) {
  // Destacar opção selecionada
  document.querySelectorAll('.escala-option').forEach(o => o.classList.remove('selected'));
  radio.closest('.escala-option').classList.add('selected');

  const cfg = CONSAGRACAO_MAP[radio.value];
  if (!cfg) return;

  // Preencher campos hidden
  document.getElementById('tipo_escala_valor').value = cfg.tipo;
  document.getElementById('outra_escala').value       = cfg.outra;

  // Mostrar badge de confirmação
  const badges = document.getElementById('consagracaoBadges');
  badges.classList.remove('hidden');
  badges.innerHTML = `<span class="cons-badge">✅ Será enviado como: <strong>${cfg.label}</strong></span>`;
}

// ── Máscara de telefone ──
document.getElementById('contato').addEventListener('input', function (e) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
  e.target.value = v;
});

// ── Helpers de toast ──
function showToast(id, message) {
  const el = document.getElementById(id);
  if (message) el.textContent = message;
  el.classList.add('show');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideToasts() {
  document.getElementById('toastSuccess').classList.remove('show');
  document.getElementById('toastError').classList.remove('show');
}

// ── Validação dos campos obrigatórios ──
function validateForm(form) {
  const required = form.querySelectorAll('[required]');
  let valid = true;

  required.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = 'var(--red)';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });

  // Verificar se algum tipo de escala foi selecionado
  const tipoEscala = form.querySelector('input[name="tipo_escala"]:checked');
  if (!tipoEscala) {
    document.getElementById('escalaOptions').style.outline = '2px solid var(--red)';
    document.getElementById('escalaOptions').style.borderRadius = '8px';
    valid = false;
  } else {
    document.getElementById('escalaOptions').style.outline = '';
  document.getElementById('consagracaoBadges').classList.add('hidden');
  document.getElementById('tipo_escala_valor').value = '';
  }

  return valid;
}

// ── Validar nome completo do acompanhante ──
function validarNomeAcomp() {
  if (!acompAtivo) return true;
  const input   = document.getElementById('acompanhante');
  const hint    = document.getElementById('acompNomeHint');
  const partes  = input.value.trim().split(' ').filter(p => p.length > 0);
  if (partes.length < 2) {
    input.style.borderColor = 'var(--red)';
    if (hint) { hint.style.display = 'block'; hint.style.setProperty('display','block','important'); }
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  input.style.borderColor = '';
  if (hint) hint.style.display = 'none';
  return true;
}

// ── Envio do formulário ──
document.getElementById('escalaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const btn  = document.getElementById('btnSubmit');

  hideToasts();

  // Validação
  const formValido  = validateForm(form);
  const nomeValido  = validarNomeAcomp();

  if (!formValido || !nomeValido) {
    showToast('toastError', '⚠️ Preencha todos os campos obrigatórios antes de enviar.');
    btn.classList.remove('loading');
    btn.disabled = false;
    return;
  }

  // Estado de loading
  btn.classList.add('loading');
  btn.disabled = true;

  // Montar payload — ordem exata das colunas da planilha:
  // Timestamp | Nome | Contato | Data da Escala | Mediunidade | Classificação | Tipo de Escala | Outra Escala
  const payload = {
    timestamp:     new Date().toLocaleString('pt-BR'),
    nome:          document.getElementById('nome').value.trim(),
    contato:       document.getElementById('contato').value.trim(),
    data_escala:   document.getElementById('data').value,
    mediunidade:   document.getElementById('mediunidade').value,
    classificacao: document.getElementById('classificacao').value.trim(),
    tipo_escala:   document.getElementById('tipo_escala_valor').value || '',
    outra_escala:  document.getElementById('outra_escala').value.trim(),
    acompanhante:  document.getElementById('acompanhante').value.trim(),
    acomp_class:   document.getElementById('acomp_classificacao').value.trim(),
    acomp_med:     form.querySelector('input[name="acomp_med"]:checked')?.value || ''
  };

  // Usar iframe oculto para evitar CORS com Apps Script
  const iframeName = 'hidden_iframe_' + Date.now();
  const iframe = document.createElement('iframe');
  iframe.name = iframeName;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const tempForm = document.createElement('form');
  tempForm.method = 'POST';
  tempForm.action = SHEETS_URL;
  tempForm.target = iframeName;
  tempForm.style.display = 'none';

  Object.keys(payload).forEach(key => {
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = key;
    input.value = payload[key];
    tempForm.appendChild(input);
  });

  document.body.appendChild(tempForm);
  tempForm.submit();

  // Aguarda 2s e considera sucesso (no-cors não retorna resposta)
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    showToast('toastSuccess');
    resetForm(form);
    document.body.removeChild(tempForm);
    document.body.removeChild(iframe);
  }, 2000);
});

// ── Reset completo do formulário ──
function resetForm(form) {
  form.reset();
  document.querySelectorAll('.escala-option').forEach(o => o.classList.remove('selected'));
  document.getElementById('outraEscalaWrap').classList.remove('visible');
  document.getElementById('acompWrap').classList.add('hidden');
  document.getElementById('acompToggle').classList.remove('ativo');
  document.getElementById('acompIco').textContent = '⭕';
  document.getElementById('acomp-sol').classList.remove('sel-sol');
  document.getElementById('acomp-lua').classList.remove('sel-lua');
  acompAtivo = false;
  document.getElementById('acomp_classificacao').value = '';
  document.getElementById('escalaOptions').style.outline = '';
  document.getElementById('consagracaoBadges').classList.add('hidden');
  document.getElementById('tipo_escala_valor').value = '';
}