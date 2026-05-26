// GERENCIADOR DO HEADER COM USUÁRIO LOGADO

function updateHeader() {
    const user = getCurrentUser();
    const nav = document.querySelector('nav');

    if (!nav) return;

    if (user) {
        // Adicionar menu de usuário ao final da navegação
        nav.innerHTML += `
      <div class="user-menu">
        <span class="user-name">👤 ${user.name}</span>
        <button onclick="logout()" class="logout-btn">Sair</button>
      </div>
    `;
    } else {
        // Se não está logado, redirecionar para login
        // (exceto em páginas públicas)
        const currentPage = window.location.pathname;
        if (!currentPage.includes('index.html') && !currentPage.includes('servicos.html') &&
            !currentPage.endsWith('/') && !currentPage.includes('auth.html')) {
            // requireLogin();
        }
    }
}

// Executar quando DOM carregar
document.addEventListener('DOMContentLoaded', updateHeader);

// STYLES PARA USER MENU (será adicionado ao style.css)
// .user-menu {
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   padding: 8px 16px;
//   background: rgba(255, 211, 77, 0.1);
//   border-radius: 8px;
// }
//
// .user-name {
//   color: #ffd34d;
//   font-weight: 600;
//   font-size: 14px;
// }
//
// .logout-btn {
//   background: transparent;
//   border: 1px solid rgba(255, 100, 100, 0.3);
//   color: #ff6464;
//   padding: 6px 12px;
//   border-radius: 6px;
//   cursor: pointer;
//   font-size: 12px;
//   font-weight: 600;
//   transition: 0.3s;
// }
//
// .logout-btn:hover {
//   background: rgba(255, 100, 100, 0.1);
//   border-color: #ff6464;
// }
