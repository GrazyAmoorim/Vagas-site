const CHAVE = 'mural-estagios';

const form = document.getElementById('form-vaga');
const lista = document.getElementById('lista');
const vazio = document.getElementById('vazio');
const contador = document.getElementById('contador');
const busca = document.getElementById('busca');

let vagas = carregar();

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
  } catch {
    return [];
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(vagas));
  } catch {}
}

function formatarData(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarBolsa(valor) {
  if (valor === '' || valor == null) return 'A combinar';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function celula(conteudo) {
  const td = document.createElement('td');
  if (conteudo instanceof Node) td.appendChild(conteudo);
  else td.textContent = conteudo;
  return td;
}

function criarContato(texto) {
  const valor = texto.trim();
  const link = document.createElement('a');
  if (/^https?:\/\//i.test(valor)) {
    link.href = valor;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Candidatar-se';
  } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    link.href = `mailto:${valor}`;
    link.textContent = valor;
  } else {
    return document.createTextNode(valor);
  }
  return link;
}

function criarLinha(vaga) {
  const tr = document.createElement('tr');

  const etiqueta = document.createElement('span');
  etiqueta.className = 'etiqueta';
  etiqueta.textContent = vaga.modalidade;

  const remover = document.createElement('button');
  remover.className = 'remover';
  remover.type = 'button';
  remover.title = 'Remover vaga';
  remover.textContent = '✕';
  remover.addEventListener('click', () => {
    vagas = vagas.filter(v => v.id !== vaga.id);
    salvar();
    renderizar();
  });

  tr.append(
    celula(vaga.empresa),
    celula(vaga.cargo),
    celula(etiqueta),
    celula(vaga.local),
    celula(formatarBolsa(vaga.bolsa)),
    celula(formatarData(vaga.prazo)),
    celula(criarContato(vaga.contato)),
    celula(remover)
  );

  return tr;
}

function renderizar() {
  const termo = busca.value.trim().toLowerCase();
  const filtradas = vagas.filter(v =>
    [v.empresa, v.cargo, v.local].some(campo => campo.toLowerCase().includes(termo))
  );

  lista.replaceChildren(...filtradas.map(criarLinha));
  contador.textContent = vagas.length;
  vazio.hidden = filtradas.length > 0;
  vazio.textContent = vagas.length === 0
    ? 'Nenhuma vaga por aqui ainda. Cadastre a primeira.'
    : 'Nenhuma vaga encontrada para essa busca.';
}

form.addEventListener('submit', evento => {
  evento.preventDefault();

  const dados = {
    id: Date.now(),
    empresa: form.empresa.value.trim(),
    cargo: form.cargo.value.trim(),
    modalidade: form.modalidade.value,
    local: form.local.value.trim(),
    bolsa: form.bolsa.value,
    prazo: form.prazo.value,
    contato: form.contato.value.trim()
  };

  vagas.unshift(dados);
  salvar();
  form.reset();
  busca.value = '';
  renderizar();
  document.getElementById('vagas').scrollIntoView({ behavior: 'smooth' });
});

busca.addEventListener('input', renderizar);

form.prazo.min = new Date().toISOString().split('T')[0];

renderizar();