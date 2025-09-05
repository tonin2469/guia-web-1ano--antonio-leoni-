// script.js — funcionalidades: galeria, formulário com validação e localStorage

document.addEventListener('DOMContentLoaded', () => {
  // --- Gallery (only initialize on pages with slides) ---
  const slides = Array.from(document.querySelectorAll('.slide'));
  if (slides.length) {
    let current = 0;
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    function show(index){
      slides.forEach(s => s.classList.remove('active'));
      const slide = slides[index];
      if(slide){
        slide.classList.add('active');
        const img = slide.querySelector('img');
        if(img) img.focus?.();
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { current = (current - 1 + slides.length) % slides.length; show(current); });
    if (nextBtn) nextBtn.addEventListener('click', () => { current = (current + 1) % slides.length; show(current); });
    show(current);
  }

  // --- Form and messages (only when present) ---
  const form = document.getElementById('contactForm');
  const messagesList = document.getElementById('messagesList');
  const clearBtn = document.getElementById('clearStorage');

  function getMessages(){
    try{ return JSON.parse(localStorage.getItem('messages') || '[]'); }
    catch(e){ return []; }
  }

  function saveMessage(m){
    const arr = getMessages(); arr.push(m); localStorage.setItem('messages', JSON.stringify(arr));
  }

  function renderMessages(){
    if(!messagesList) return;
    const arr = getMessages();
    messagesList.innerHTML = '';
    if(arr.length === 0){ messagesList.innerHTML = '<li>Nenhuma mensagem registrada.</li>'; return; }
    arr.slice().reverse().forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${escapeHtml(m.name)}</strong> <small>(${escapeHtml(m.email)})</small><div>${escapeHtml(m.message)}</div>`;
      messagesList.appendChild(li);
    });
  }

  if (clearBtn) clearBtn.addEventListener('click', () => { localStorage.removeItem('messages'); renderMessages(); });

  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      // validações simples
      let valid = true;
      [['name', name, v => v.length>=2, 'Nome precisa ter ao menos 2 caracteres.'],
       ['email', email, v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'E‑mail inválido.'],
       ['message', message, v => v.length>0, 'Mensagem não pode ficar vazia.']]
      .forEach(([field, val, fn, err]) => {
        const input = form[field];
        const errEl = input?.parentElement?.querySelector('.error');
        if(!fn(val)) { if(errEl) errEl.textContent = err; valid = false; }
        else { if(errEl) errEl.textContent = ''; }
      });

      if(!valid) return;

      const m = { name, email, message, created: new Date().toISOString() };
      saveMessage(m);
      renderMessages();
      form.reset();
      form.name.focus();
    });
  }

  renderMessages();

  // --- Tabs: enable accessible tabs and support linking via hash ---
  const tabWrappers = Array.from(document.querySelectorAll('[data-tabs]'));
  tabWrappers.forEach(wrapper => {
    const tabs = Array.from(wrapper.querySelectorAll('.tab'));
    const panels = Array.from(wrapper.querySelectorAll('.tab-panel'));

    function activateTab(tab){
      const id = tab.dataset.tab;
      tabs.forEach(t => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
      panels.forEach(p => p.classList.toggle('active', p.id === id));
      // update hash so pages can link to a specific tab (optional)
      try{ history.replaceState(null, '', `#${id}`); } catch(e){}
    }

    tabs.forEach(t => t.addEventListener('click', () => activateTab(t)));

    // choose initial tab: hash -> aria-selected true -> first
    const hash = location.hash.replace('#','');
    const byHash = tabs.find(t => t.dataset.tab === hash);
    if(byHash) activateTab(byHash);
    else {
      const preselected = tabs.find(t => t.getAttribute('aria-selected') === 'true');
      if(preselected) activateTab(preselected);
      else if(tabs[0]) activateTab(tabs[0]);
    }
  });
});

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}
