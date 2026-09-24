// Menu mobilne
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  header.classList.toggle('menu-open', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  header.classList.remove('menu-open');
}));

// Szklany nagłówek po przewinięciu
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 20);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Animacje pojawiania się
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('in');
    io.unobserve(el);
    setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''; }, 1200);
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.section h2, .section__lead, .plan, .problem, .steps li, .pricelist, .problem-form > *, .faq details, .about > *, .contact > *')
    .forEach(el => {
      el.classList.add('reveal');
      const sib = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
      io.observe(el);
    });
}

// Walidacja formularzy
function validate(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(el => {
    const bad = el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
    (el.type === 'checkbox' ? el.closest('label') : el).classList.toggle('invalid', bad);
    if (bad) ok = false;
  });
  if (!ok) form.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return ok;
}

// Podgląd zdjęć
document.querySelectorAll('input[type=file][data-previews]').forEach(input => {
  const box = document.getElementById(input.dataset.previews);
  const label = input.closest('.upload');
  let files = [];
  const render = () => {
    box.innerHTML = '';
    files.forEach((f, i) => {
      const fig = document.createElement('figure');
      if (f.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.alt = f.name;
        fig.append(img);
      } else {
        fig.innerHTML = '<figcaption>PDF<br>' + f.name.replace(/</g, '&lt;') + '</figcaption>';
      }
      const del = document.createElement('button');
      del.type = 'button'; del.textContent = '×'; del.setAttribute('aria-label', 'Usuń');
      del.onclick = () => { files.splice(i, 1); render(); };
      fig.append(del);
      box.append(fig);
    });
  };
  const add = list => { files = files.concat([...list]); render(); };
  input.addEventListener('change', () => { add(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(e => label.addEventListener(e, ev => { ev.preventDefault(); label.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(e => label.addEventListener(e, ev => { ev.preventDefault(); label.classList.remove('drag'); }));
  label.addEventListener('drop', ev => add(ev.dataTransfer.files));
  input.reset = () => { files = []; render(); };
  input.count = () => files.length;
});

// Zamówienie
const modal = document.getElementById('orderModal');
if (modal) {
  const steps = modal.querySelectorAll('.step');
  const progress = modal.querySelectorAll('.progress li');
  const orderInput = modal.querySelector('input[type=file]');
  function goStep(n) {
    steps.forEach(s => s.hidden = +s.dataset.step !== n);
    progress.forEach((li, i) => {
      li.classList.toggle('is-active', i === n - 1);
      li.classList.toggle('is-done', i < n - 1 || n === 4);
    });
    modal.querySelector('.modal__dialog').scrollTop = 0;
  }
  function openOrder(plan, price) {
    modal.querySelectorAll('[data-plan]').forEach(el => el.textContent = plan);
    modal.querySelectorAll('[data-price]').forEach(el => el.textContent = price);
    document.getElementById('orderForm').reset();
    modal.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    orderInput.reset();
    goStep(1);
    modal.hidden = false;
    document.body.classList.add('no-scroll');
  }
  function closeOrder() {
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
  }
  document.querySelectorAll('[data-order]').forEach(btn =>
    btn.addEventListener('click', () => openOrder(btn.dataset.order, btn.dataset.price)));
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeOrder));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeOrder(); });

  document.getElementById('orderForm').addEventListener('submit', e => {
    e.preventDefault();
    if (validate(e.target)) goStep(2);
  });
  modal.querySelectorAll('.pay__opt').forEach(b => b.addEventListener('click', () => {
    modal.querySelectorAll('.pay__opt').forEach(x => x.classList.toggle('is-active', x === b));
  }));
  document.getElementById('payBtn').addEventListener('click', () => goStep(3));
  document.getElementById('sendFiles').addEventListener('click', () => {
    if (!orderInput.count()) {
      orderInput.closest('.upload').querySelector('.upload__box').style.borderColor = '#d9534f';
      return;
    }
    orderInput.closest('.upload').querySelector('.upload__box').style.borderColor = '';
    goStep(4);
  });
}

// Podstrona "Mam problem"
const wizard = document.getElementById('wizard');
if (wizard) {
  wizard.querySelectorAll('.mat').forEach(mat => {
    const input = mat.querySelector('input');
    const count = mat.querySelector('.mat__count');
    let files = [];
    const update = () => {
      mat.classList.toggle('has-files', files.length > 0);
      count.textContent = files.length ? files.length + (files.length === 1 ? ' plik' : files.length < 5 ? ' pliki' : ' plików') : 'dodaj pliki';
    };
    input.addEventListener('change', () => { files = files.concat([...input.files]); input.value = ''; update(); });
    ['dragenter', 'dragover'].forEach(e => mat.addEventListener(e, ev => { ev.preventDefault(); mat.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(e => mat.addEventListener(e, ev => { ev.preventDefault(); mat.classList.remove('drag'); }));
    mat.addEventListener('drop', ev => { files = files.concat([...ev.dataTransfer.files]); update(); });
  });

  const checks = {
    k1: () => wizard.querySelector('[name=k1]:checked'),
    k3: () => wizard.querySelector('[name=k3]:checked'),
    k5: () => wizard.querySelector('[name=k5]:checked'),
    opis: () => wizard.opis.value.trim(),
    kontakt: () => wizard.imie.value.trim() && wizard.kontakt.value.trim() && wizard.zgoda.checked,
  };
  const steps = wizard.querySelectorAll('.wstep[data-need]');
  const validateStep = st => { const ok = !!checks[st.dataset.need](); st.classList.toggle('has-error', !ok); return ok; };
  wizard.addEventListener('input', e => {
    const st = e.target.closest('.wstep.has-error');
    if (st) validateStep(st);
  });
  wizard.addEventListener('submit', e => {
    e.preventDefault();
    const bad = [...steps].filter(st => !validateStep(st));
    if (bad.length) { bad[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    wizard.hidden = true;
    const thanks = document.getElementById('thanks');
    thanks.hidden = false;
    thanks.focus();
    scrollTo({ top: thanks.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' });
  });
}
