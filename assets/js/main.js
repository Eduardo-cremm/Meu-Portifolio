// Mobile menu toggle
function toggleMenu() {
  document.getElementById('navbar').classList.toggle('nav-menu-open');
}

// Scroll fade-in animations
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Certificate modal
const certModal = document.getElementById('cert-modal');
const certModalImg = document.getElementById('cert-modal-img');
const certModalSkeleton = document.getElementById('cert-modal-skeleton');

document.querySelectorAll('.cert-link').forEach(btn => {
  btn.addEventListener('click', () => {
    certModalImg.classList.remove('loaded');
    certModalSkeleton.classList.remove('hidden');
    certModalImg.src = btn.dataset.certImg;
    certModal.classList.add('open');
  });
});

certModalImg.addEventListener('load', () => {
  certModalImg.classList.add('loaded');
  certModalSkeleton.classList.add('hidden');
});

function closeCertModal() {
  certModal.classList.remove('open');
}

certModal.querySelectorAll('[data-cert-close]').forEach(el => el.addEventListener('click', closeCertModal));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCertModal(); });

// Nav shadow on scroll
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow =
    window.scrollY > 30 ? '0 4px 32px rgba(0,0,0,0.45)' : 'none';
});

// Contact form — Formspree async submission
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        form.reset();
        successMsg.style.display = 'block';
        btn.textContent = 'Enviar mensagem 🚀';
        btn.disabled = false;
        setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
      } else {
        btn.textContent = 'Erro — tente novamente';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Erro — tente novamente';
      btn.disabled = false;
    }
  });
}
