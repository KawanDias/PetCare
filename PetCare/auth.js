// SISTEMA DE AUTENTICAÇÃO

// Estrutura de usuários no localStorage:
// {
//   users: [
//     { id, name, email, password (hash), createdAt }
//   ]
// }

// Inicializar usuarios se não existir
function initAuth() {
    if (!localStorage.getItem('petcareUsers')) {
        localStorage.setItem('petcareUsers', JSON.stringify({ users: [] }));
    }
}

initAuth();

// REGISTRAR NOVO USUÁRIO
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');

    // Validações
    if (password.length < 6) {
        showError('A senha deve ter no mínimo 6 caracteres', errorMsg);
        return;
    }

    if (password !== passwordConfirm) {
        showError('As senhas não conferem', errorMsg);
        return;
    }

    if (name.length < 3) {
        showError('O nome deve ter no mínimo 3 caracteres', errorMsg);
        return;
    }

    // Verificar se email já existe
    const users = JSON.parse(localStorage.getItem('petcareUsers')).users;
    if (users.some(u => u.email === email)) {
        showError('Este email já está cadastrado', errorMsg);
        return;
    }

    // Criar novo usuário
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: btoa(password), // Simulando hash (em produção, usar bcrypt no backend)
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('petcareUsers', JSON.stringify({ users }));

    hideError(errorMsg);
    showSuccess('Conta criada com sucesso! Faça login para continuar.', successMsg);

    // Limpar formulário
    document.getElementById('registerForm').reset();

    // Voltar para login após 2 segundos
    setTimeout(() => {
        toggleForms();
        hideError(errorMsg);
        hideSuccess(successMsg);
    }, 2000);
});

// FAZER LOGIN
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');

    // Buscar usuário
    const users = JSON.parse(localStorage.getItem('petcareUsers')).users;
    const user = users.find(u => u.email === email);

    if (!user || btoa(password) !== user.password) {
        showError('Email ou senha incorretos', errorMsg);
        return;
    }

    // Login bem-sucedido
    hideError(errorMsg);
    showSuccess('Login realizado! Redirecionando...', successMsg);

    // Salvar sessão
    const token = btoa(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        loginTime: Date.now()
    }));

    localStorage.setItem('petcareToken', token);
    sessionStorage.setItem('petcareUser', JSON.stringify(user));

    // Redirecionar para home
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// TOGGLE ENTRE FORMULÁRIOS
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleText = document.getElementById('toggleText');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    loginForm.classList.toggle('hidden-form');
    registerForm.classList.toggle('hidden-form');

    if (loginForm.classList.contains('hidden-form')) {
        // Mostrando registro
        authTitle.textContent = 'Criar Conta';
        authSubtitle.textContent = 'Crie uma conta para começar';
        toggleText.innerHTML = 'Já tem conta? <a onclick="toggleForms()">Faça login</a>';
    } else {
        // Mostrando login
        authTitle.textContent = 'Entrar';
        authSubtitle.textContent = 'Acesse sua conta para continuar';
        toggleText.innerHTML = 'Não tem conta? <a onclick="toggleForms()">Cadastre-se</a>';
    }
}

// MOSTRAR ERRO
function showError(message, element) {
    element.textContent = '❌ ' + message;
    element.classList.add('show');
}

function hideError(element) {
    element.classList.remove('show');
}

// MOSTRAR SUCESSO
function showSuccess(message, element) {
    element.textContent = '✅ ' + message;
    element.classList.add('show');
}

function hideSuccess(element) {
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

// FAZER LOGOUT
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('petcareToken');
        sessionStorage.removeItem('petcareUser');
        window.location.href = 'auth.html';
    }
}

// REDIRECIONAR SE NÃO ESTÁ LOGADO
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'auth.html';
    }
}

// EXEMPLO DE USO PARA LIMPAR DADOS (admin)
// localStorage.removeItem('petcareUsers');
// localStorage.removeItem('petcareToken');
