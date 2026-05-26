// CRUD DE ADOÇÃO

let pets = JSON.parse(localStorage.getItem('petsCrud')) || [];
pets = pets.map((pet) => {
  if (!pet.id) {
    return {
      ...pet,
      id: pet.dataCriacao || `${pet.nome}-${pet.data}-${Date.now()}`
    };
  }
  return pet;
});
localStorage.setItem('petsCrud', JSON.stringify(pets));

let editingId = null;
let currentUser = null;
let currentUserId = null;

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    currentUser = user?.name || 'Visitante';
    currentUserId = user?.id || null;

    renderPets();
    setupFormListener();
    openSelectedPetDetails();

    const detailsModal = document.getElementById('petDetailsModal');
    detailsModal?.addEventListener('click', (event) => {
        if (event.target === detailsModal) closePetDetailsModal();
    });
});

function openSelectedPetDetails() {
    const selectedPetId = localStorage.getItem('selectedPetId');
    if (!selectedPetId) return;

    const petIndex = pets.findIndex((pet) => pet.id === selectedPetId);
    if (petIndex > -1) {
        showPetDetails(petIndex);
    }

    localStorage.removeItem('selectedPetId');
}

// RENDERIZAR PETS
function renderPets() {
    const grid = document.getElementById('petsGrid');

    if (pets.length === 0) {
        renderCarousel();
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">Nenhum pet cadastrado ainda. Adicione um novo pet!</p>';
        return;
    }

    grid.innerHTML = pets.map((pet, index) => {
        const isCreator = pet.criador === currentUser;
        const isAdopted = !!pet.adotadoPor;
        const adoptedLabel = isAdopted ? `<p><strong>Adotado por:</strong> ${pet.adotadoPor}</p>` : '';
        const photoPreview = pet.fotos && pet.fotos.length
            ? `<div class="pet-photo-card"><img src="${pet.fotos[0]}" alt="${pet.nome}"></div>`
            : `<div class="pet-image">${pet.emoji}</div>`;
        const adoptButton = isAdopted
            ? `<button class="secondary" disabled>✔️ Adotado</button>`
            : `<button class="primary" onclick="event.stopPropagation(); adoptPet(${index})">❤️ Adotar</button>`;

        return `
    <div class="adoption-card" onclick="showPetDetails(${index})">
      ${photoPreview}
      
      <h3>${pet.nome}</h3>
      
      <div class="pet-info">
        <p><strong>Espécie:</strong> ${pet.especie}</p>
        <p><strong>Idade:</strong> ${pet.idade} anos</p>
        <p><strong>Vacinação:</strong> <span class="vaccine-status ${pet.vacinacao.toLowerCase()}">${pet.vacinacao}</span></p>
        <p><strong>Data:</strong> ${formatDate(pet.data)}</p>
        ${pet.descricao ? `<p><strong>Descrição:</strong> ${pet.descricao}</p>` : ''}
        ${adoptedLabel}
      </div>
      
      <div class="card-actions">
        ${isCreator ? `
          <button class="secondary" onclick="event.stopPropagation(); editPet(${index})">✏️ Editar</button>
          <button class="danger" onclick="event.stopPropagation(); deletePet(${index})">🗑️ Deletar</button>
        ` : ''}
        ${adoptButton}
      </div>
    </div>
  `}).join('');
  renderCarousel();
}

function renderCarousel() {
    const carousel = document.getElementById('recentCarousel');
    if (!carousel) return;

    const recentPets = [...pets]
        .sort((a, b) => new Date(b.dataCriacao || b.data).getTime() - new Date(a.dataCriacao || a.data).getTime())
        .slice(0, 5);

    if (!recentPets.length) {
        carousel.innerHTML = '<div class="carousel-empty">Adicione um pet para ver os mais recentes.</div>';
        return;
    }

    carousel.innerHTML = recentPets.map((pet) => {
        const petIndex = pets.indexOf(pet);
        const photo = pet.fotos && pet.fotos.length ? pet.fotos[0] : '';

        return `
      <div class="carousel-card" onclick="showPetDetails(${petIndex})">
        ${photo ? `<img src="${photo}" alt="${pet.nome}">` : `<div class="carousel-placeholder">${pet.emoji}</div>`}
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

function formatDate(dateString) {
    if (!dateString) return '';
    const dateOnly = dateString.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ADICIONAR/EDITAR PET
function setupFormListener() {
    const form = document.getElementById('petForm');
    const cancelBtn = document.getElementById('cancelEdit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const photoFiles = document.getElementById('petPhotos').files;
        let photos = [];

        if (editingId !== null && photoFiles.length === 0) {
            photos = pets[editingId].fotos || [];
        } else {
            if (photoFiles.length === 0) {
                showAlert('Envie pelo menos uma foto do pet.', 'error');
                return;
            }
            if (photoFiles.length > 3) {
                showAlert('Envie no máximo 3 fotos.', 'error');
                return;
            }
            photos = await readFilesAsBase64(photoFiles);
        }

        const pet = {
            id: editingId !== null ? pets[editingId].id : Date.now().toString(),
            nome: document.getElementById('petName').value,
            especie: document.getElementById('petSpecies').value,
            idade: parseFloat(document.getElementById('petAge').value),
            vacinacao: document.getElementById('petVaccineStatus').value,
            data: document.getElementById('petVaccineDate').value,
            descricao: document.getElementById('petDescription').value,
            emoji: document.getElementById('petImage').value,
            criador: currentUser,
            dataCriacao: editingId !== null ? pets[editingId].dataCriacao : new Date().toISOString(),
            fotos: photos
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
    if (pet.adotadoPor) {
        showAlert('Este pet já foi adotado.', 'error');
        return;
    }

    pet.adotadoPor = currentUser;
    pet.adotadoPorId = currentUserId;
    pet.dataAdocao = new Date().toISOString();

    localStorage.setItem('petsCrud', JSON.stringify(pets));
    renderPets();
    showAlert(`Obrigado por adotar ${pet.nome}! ❤️`, 'success');
    if (typeof updateNavAuth === 'function') {
        updateNavAuth();
    }
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

function readFilesAsBase64(files) {
    const promises = Array.from(files).slice(0, 3).map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    }));
    return Promise.all(promises);
}

function showPetDetails(index) {
    const pet = pets[index];
    if (!pet) return;

    document.getElementById('detailName').textContent = pet.nome;
    document.getElementById('detailDescription').textContent = pet.descricao || 'Sem descrição adicional.';
    document.getElementById('detailSpecies').textContent = pet.especie;
    document.getElementById('detailAge').textContent = pet.idade;
    document.getElementById('detailVaccine').textContent = pet.vacinacao;
    document.getElementById('detailVaccineDate').textContent = formatDate(pet.data);
    document.getElementById('detailAdoptedBy').textContent = pet.adotadoPor || 'Nenhum';
    document.getElementById('detailCreatedBy').textContent = pet.criador || 'Visitante';
    document.getElementById('detailCreatedAt').textContent = formatDate(pet.dataCriacao ? pet.dataCriacao.split('T')[0] : pet.data);

    const photos = document.getElementById('detailPhotos');
    photos.innerHTML = (pet.fotos && pet.fotos.length)
        ? pet.fotos.map(src => `<img src="${src}" alt="${pet.nome}">`).join('')
        : '<div class="empty-state">Nenhuma foto disponível.</div>';

    document.getElementById('petDetailsModal').classList.add('active');
}

function closePetDetailsModal() {
    document.getElementById('petDetailsModal')?.classList.remove('active');
}


