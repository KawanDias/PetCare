function entrar() {
  const user = getCurrentUser();
  if (user) {
    window.location.href = 'adocao.html';
  } else {
    openAuthModal('login');
  }
}

function saibaMais() {

  const section = document.querySelector(".features");

  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

  }

}

/* ANIMAÇÕES */

const observer = new IntersectionObserver((entries) => {

  entries.forEach((entry) => {

    if (entry.isIntersecting) {

      entry.target.classList.add("show");

    }

  });

});

const hiddenElements = document.querySelectorAll(
  ".feature-card, .adoption-card, .contact-form, .page-title, .page-description"
);

hiddenElements.forEach((element) => {

  element.classList.add("hidden");

  observer.observe(element);

});

/* EFEITO DE PARALLAX */

window.addEventListener("mousemove", (e) => {

  const blur = document.querySelector(".blur");

  const x = (window.innerWidth - e.pageX * 0.5) / 90;
  const y = (window.innerHeight - e.pageY * 0.5) / 90;

  blur.style.transform = `translate(${x}px, ${y}px)`;

});

/* BOTÕES DE ADOÇÃO */

const adoptionButtons = document.querySelectorAll(".adoption-card button");

adoptionButtons.forEach((button) => {

  button.addEventListener("click", () => {

    button.innerText = "Solicitado ✓";

    button.style.background = "#ffffff";
    button.style.color = "#050505";

  });

});

/* FORMULÁRIO */

// Removido - agora está em contato.js com envio real de email
// const form = document.querySelector(".contact-form");
// Veja contato.js para a implementação com EmailJS ou Formspree

/* MODAL DE AUTENTICAÇÃO */

// Inicializar usuarios se não existir
function initAuth() {
  if (!localStorage.getItem('petcareUsers')) {
    localStorage.setItem('petcareUsers', JSON.stringify({ users: [] }));
  }
}

initAuth();

// ABRIR MODAL
function openAuthModal(type = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  modal.classList.add('active');
  if (type === 'register') {
    toggleAuthForms();
  }
}

// FECHAR MODAL
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  modal.classList.remove('active');
  // Resetar para login view
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (loginForm && registerForm) {
    if (registerForm && !registerForm.classList.contains('hidden-form')) {
      toggleAuthForms();
    }
  }
}

// FECHAR MODAL AO CLICAR FORA
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAuthModal();
      }
    });
  }

  renderRecentPetsCarousel();
});

// FUNÇÕES DO CARROSSEL
function normalizePetIds() {
  const pets = JSON.parse(localStorage.getItem('petsCrud') || '[]');
  let changed = false;

  const normalized = pets.map((pet) => {
    const id = pet.id || pet.dataCriacao || `${pet.nome}-${pet.data}-${Date.now()}`;
    const dataCriacao = pet.dataCriacao || pet.data || new Date().toISOString();

    if (!pet.id || !pet.dataCriacao) {
      changed = true;
    }

    return {
      ...pet,
      id,
      dataCriacao
    };
  });

  if (changed) {
    localStorage.setItem('petsCrud', JSON.stringify(normalized));
  }

  return normalized;
}

function getRecentAvailablePets(pets) {
  return [...pets]
    .filter((pet) => !pet.adotadoPor && !pet.adotadoPorId)
    .sort((a, b) => new Date(b.dataCriacao || b.data).getTime() - new Date(a.dataCriacao || a.data).getTime())
    .slice(0, 5);
}

function renderRecentPetsCarousel() {
  const carousel = document.getElementById('recentCarousel');
  if (!carousel) return;

  const pets = normalizePetIds();
  if (!pets.length) {
    carousel.innerHTML = '<div class="carousel-empty">Nenhum pet cadastrado ainda. Adicione um pet na página de adoção.</div>';
    return;
  }

  const recentPets = getRecentAvailablePets(pets);

  if (!recentPets.length) {
    carousel.innerHTML = '<div class="carousel-empty">Nenhum pet disponível no momento. Adote um pet para liberar espaço no carrossel.</div>';
    return;
  }

  carousel.innerHTML = recentPets.map((pet) => {
    const photo = pet.fotos && pet.fotos.length ? `<img src="${pet.fotos[0]}" alt="${pet.nome}">` : `<div class="carousel-placeholder">${pet.emoji}</div>`;
    return `
      <div class="carousel-card" onclick="goToPetDetails('${pet.id || pet.dataCriacao || pet.data}')">
        ${photo}
        <div>
          <h3>${pet.nome}</h3>
          <p>${pet.especie} · ${pet.idade} anos</p>
          <p class="carousel-meta">${formatDate(pet.data)}</p>
        </div>
      </div>
    `;
  }).join('');
}

function scrollCarousel(direction) {
  const track = document.getElementById('recentCarousel');
  if (!track) return;
  const cardWidth = track.querySelector('.carousel-card')?.offsetWidth || 260;
  track.scrollBy({ left: direction * (cardWidth + 20), behavior: 'smooth' });
}

function goToPetDetails(petId) {
  localStorage.setItem('selectedPetId', petId);
  window.location.href = 'adocao.html';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const dateOnly = dateString.split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// TOGGLE ENTRE FORMULÁRIOS
function toggleAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const toggleText = document.getElementById('toggleText');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');

  if (!loginForm || !registerForm) return;

  loginForm.classList.toggle('hidden-form');
  registerForm.classList.toggle('hidden-form');

  if (loginForm.classList.contains('hidden-form')) {
    // Mostrando registro
    modalTitle.textContent = 'Criar Conta';
    modalSubtitle.textContent = 'Crie uma conta para começar';
    toggleText.innerHTML = 'Já tem conta? <a onclick="toggleAuthForms()">Faça login</a>';
  } else {
    // Mostrando login
    modalTitle.textContent = 'Entrar';
    modalSubtitle.textContent = 'Acesse sua conta para continuar';
    toggleText.innerHTML = 'Não tem conta? <a onclick="toggleAuthForms()">Cadastre-se</a>';
  }
}

// REGISTRAR NOVO USUÁRIO
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim().toLowerCase();
      const password = document.getElementById('registerPassword').value;
      const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

      const errorMsg = document.getElementById('errorMessage');
      const successMsg = document.getElementById('successMessage');

      // Validações
      if (password.length < 6) {
        showAuthError('A senha deve ter no mínimo 6 caracteres', errorMsg);
        return;
      }

      if (password !== passwordConfirm) {
        showAuthError('As senhas não conferem', errorMsg);
        return;
      }

      if (name.length < 3) {
        showAuthError('O nome deve ter no mínimo 3 caracteres', errorMsg);
        return;
      }

      // Verificar se email já existe
      const users = JSON.parse(localStorage.getItem('petcareUsers')).users;
      if (users.some(u => u.email === email)) {
        showAuthError('Este email já está cadastrado', errorMsg);
        return;
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: btoa(password),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('petcareUsers', JSON.stringify({ users }));

      hideAuthError(errorMsg);
      showAuthSuccess('Conta criada com sucesso! Faça login agora.', successMsg);

      registerForm.reset();

      setTimeout(() => {
        toggleAuthForms();
        hideAuthError(errorMsg);
        hideAuthSuccess(successMsg);
      }, 2000);
    });
  }
});

// FAZER LOGIN
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      const errorMsg = document.getElementById('errorMessage');
      const successMsg = document.getElementById('successMessage');

      // Buscar usuário
      const users = JSON.parse(localStorage.getItem('petcareUsers')).users;
      const user = users.find(u => u.email === email);

      if (!user || btoa(password) !== user.password) {
        showAuthError('Email ou senha incorretos', errorMsg);
        return;
      }

      // Login bem-sucedido
      hideAuthError(errorMsg);
      showAuthSuccess('Login realizado! Redirecionando...', successMsg);

      // Salvar sessão
      const token = btoa(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        loginTime: Date.now()
      }));

      localStorage.setItem('petcareToken', token);
      sessionStorage.setItem('petcareUser', JSON.stringify(user));

      setTimeout(() => {
        closeAuthModal();
        updateNavAuth();
        loginForm.reset();
        location.reload();
      }, 1500);
    });
  }
});

// MOSTRAR ERRO
function showAuthError(message, element) {
  element.textContent = '❌ ' + message;
  element.classList.add('show');
}

function hideAuthError(element) {
  element.classList.remove('show');
}

// MOSTRAR SUCESSO
function showAuthSuccess(message, element) {
  element.textContent = '✅ ' + message;
  element.classList.add('show');
}

function hideAuthSuccess(element) {
  element.classList.remove('show');
}

// VERIFICAR SE ESTÁ LOGADO
function isLoggedIn() {
  return !!localStorage.getItem('petcareToken');
}

// OBTER USUÁRIO LOGADO
function getCurrentUser() {
  const token = localStorage.getItem('petcareToken');
  if (!token) return null;

  try {
    return JSON.parse(atob(token));
  } catch (e) {
    return null;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const dateOnly = dateString.split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getAdoptedPetsForCurrentUser() {
  const user = getCurrentUser();
  if (!user) return [];

  const pets = JSON.parse(localStorage.getItem('petsCrud')) || [];
  return pets.filter(pet => {
    if (pet.adotadoPorId) {
      return pet.adotadoPorId === user.id;
    }
    return pet.adotadoPor === user.name;
  });
}

// FAZER LOGOUT
function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('petcareToken');
    sessionStorage.removeItem('petcareUser');
    updateNavAuth();
    location.reload();
  }
}

// ATUALIZAR NAV AUTH
function updateNavAuth() {
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;

  const user = getCurrentUser();

  if (user) {
    navAuth.innerHTML = `
      <span class="user-info">👤 ${user.name}</span>
      <a class="nav-link" href="adocoes.html">Adotados</a>
      <button class="nav-link" onclick="logout()">Sair</button>
    `;
  } else {
    navAuth.innerHTML = `
      <button class="nav-link" onclick="openAuthModal('login')">🔐 Login</button>
      <button class="nav-link" onclick="openAuthModal('register')">✍️ Cadastro</button>
    `;
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', updateNavAuth);