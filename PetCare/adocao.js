// CRUD DE ADOÇÃO

let pets = JSON.parse(localStorage.getItem('petsCrud')) || [];
let editingId = null;
let currentUser = sessionStorage.getItem('currentUser');

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    // Pedir identificação do usuário
    if (!currentUser) {
        const user = prompt('Como você se chama? (para gerenciar seus pets)');
        if (user && user.trim()) {
            currentUser = user.trim();
            sessionStorage.setItem('currentUser', currentUser);
        } else {
            currentUser = 'Visitante';
            sessionStorage.setItem('currentUser', currentUser);
        }
    }

    renderPets();
    setupFormListener();
});

// RENDERIZAR PETS
function renderPets() {
    const grid = document.getElementById('petsGrid');

    if (pets.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">Nenhum pet cadastrado ainda. Adicione um novo pet!</p>';
        return;
    }

    grid.innerHTML = pets.map((pet, index) => {
        const isCreator = pet.criador === currentUser;
        return `
    <div class="adoption-card">
      <div class="pet-image">${pet.emoji}</div>
      
      <h3>${pet.nome}</h3>
      
      <div class="pet-info">
        <p><strong>Espécie:</strong> ${pet.especie}</p>
        <p><strong>Idade:</strong> ${pet.idade} anos</p>
        <p><strong>Vacinação:</strong> <span class="vaccine-status ${pet.vacinacao.toLowerCase()}">${pet.vacinacao}</span></p>
        <p><strong>Data:</strong> ${new Date(pet.data).toLocaleDateString('pt-BR')}</p>
        ${pet.descricao ? `<p><strong>Descrição:</strong> ${pet.descricao}</p>` : ''}
      </div>
      
      <div class="card-actions">
        ${isCreator ? `
          <button class="secondary" onclick="editPet(${index})">✏️ Editar</button>
          <button class="danger" onclick="deletePet(${index})">🗑️ Deletar</button>
        ` : ''}
        <button class="primary" onclick="adoptPet(${index})">❤️ Adotar</button>
      </div>
    </div>
  `}).join('');
}

// ADICIONAR/EDITAR PET
function setupFormListener() {
    const form = document.getElementById('petForm');
    const cancelBtn = document.getElementById('cancelEdit');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const pet = {
            nome: document.getElementById('petName').value,
            especie: document.getElementById('petSpecies').value,
            idade: parseFloat(document.getElementById('petAge').value),
            vacinacao: document.getElementById('petVaccineStatus').value,
            data: document.getElementById('petVaccineDate').value,
            descricao: document.getElementById('petDescription').value,
            emoji: document.getElementById('petImage').value,
            criador: currentUser,
            dataCriacao: new Date().toISOString()
        };

        if (editingId !== null) {
            // Editar pet existente (manter criador original)
            pet.criador = pets[editingId].criador;
            pet.dataCriacao = pets[editingId].dataCriacao;
            pets[editingId] = pet;
            editingId = null;
            cancelBtn.style.display = 'none';
            form.querySelector('button[type="submit"]').textContent = 'Adicionar Pet';
        } else {
            // Adicionar novo pet
            pets.push(pet);
        }

        localStorage.setItem('petsCrud', JSON.stringify(pets));
        form.reset();
        renderPets();
        showAlert('Pet salvo com sucesso!', 'success');
    });

    cancelBtn.addEventListener('click', () => {
        editingId = null;
        form.reset();
        cancelBtn.style.display = 'none';
        form.querySelector('button[type="submit"]').textContent = 'Adicionar Pet';
    });
}

// EDITAR PET
function editPet(index) {
    const pet = pets[index];

    // Verificar se é o criador
    if (pet.criador !== currentUser) {
        showAlert('Você só pode editar seus próprios pets!', 'error');
        return;
    }

    editingId = index;

    document.getElementById('petName').value = pet.nome;
    document.getElementById('petSpecies').value = pet.especie;
    document.getElementById('petAge').value = pet.idade;
    document.getElementById('petVaccineStatus').value = pet.vacinacao;
    document.getElementById('petVaccineDate').value = pet.data;
    document.getElementById('petDescription').value = pet.descricao || '';
    document.getElementById('petImage').value = pet.emoji;

    document.getElementById('cancelEdit').style.display = 'inline-block';
    document.getElementById('petForm').querySelector('button[type="submit"]').textContent = 'Atualizar Pet';

    // Scroll para o formulário
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

// DELETAR PET
function deletePet(index) {
    const pet = pets[index];

    // Verificar se é o criador
    if (pet.criador !== currentUser) {
        showAlert('Você só pode deletar seus próprios pets!', 'error');
        return;
    }

    if (confirm('Tem certeza que deseja deletar este pet?')) {
        pets.splice(index, 1);
        localStorage.setItem('petsCrud', JSON.stringify(pets));
        renderPets();
        showAlert('Pet deletado com sucesso!', 'success');
    }
}

// ADOTAR PET
function adoptPet(index) {
    const pet = pets[index];
    alert(`Obrigado por adotar ${pet.nome}! ❤️\n\nEm breve entraremos em contato para os próximos passos.`);
}

// MOSTRAR ALERTA
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('show');
    }, 10);

    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// MUDAR DE USUÁRIO
function changeUser() {
    const newUser = prompt('Novo nome de usuário:');
    if (newUser && newUser.trim()) {
        currentUser = newUser.trim();
        sessionStorage.setItem('currentUser', currentUser);
        renderPets();
        showAlert(`Bem-vindo, ${currentUser}!`, 'success');
    }
}
