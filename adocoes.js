let adoptedPets = [];

const speciesEmojiMap = {
  Cachorro: '🐶',
  Gato: '🐱',
  Coelho: '🐰',
  Pássaro: '🐦',
  Roedor: '🐹'
};

const emojiSpeciesMap = Object.fromEntries(Object.entries(speciesEmojiMap).map(([species, emoji]) => [emoji, species]));

function normalizePetSpecies(pet) {
  const especie = pet.especie || '';
  if (speciesEmojiMap[especie]) {
    return especie;
  }
  if (emojiSpeciesMap[especie]) {
    return emojiSpeciesMap[especie];
  }
  return especie;
}

function getAdoptedPetsForUser(user) {
  const allPets = JSON.parse(localStorage.getItem('petsCrud')) || [];
  return allPets
    .filter(pet => {
      if (!pet) return false;
      if (pet.adotadoPorId) {
        return pet.adotadoPorId === user.id;
      }
      return pet.adotadoPor === user.name;
    })
    .map((pet) => {
      const especie = normalizePetSpecies(pet);
      return {
        ...pet,
        especie,
        emoji: speciesEmojiMap[especie] || pet.emoji || ''
      };
    });
}

function renderAdoptedPets() {
  const grid = document.getElementById('adoptedPetsGrid');
  if (!grid) return;

  grid.innerHTML = adoptedPets.map((pet, index) => {
    const photo = pet.fotos && pet.fotos.length ? `<div class="pet-photo-card"><img src="${pet.fotos[0]}" alt="${pet.nome}"></div>` : `<div class="pet-image">${pet.emoji}</div>`;
    return `
      <div class="adoption-card" onclick="showPetDetails(${index})">
        ${photo}
        <h3>${pet.nome}</h3>
        <div class="pet-info">
          <p><strong>Espécie:</strong> ${pet.especie}</p>
          <p><strong>Idade:</strong> ${pet.idade} anos</p>
          <p><strong>Vacinação:</strong> ${pet.vacinacao}</p>
          <p><strong>Data da vacina:</strong> ${formatDate(pet.data)}</p>
        </div>
      </div>
    `;
  }).join('');
}

function showPetDetails(index) {
  const pet = adoptedPets[index];
  if (!pet) return;

  document.getElementById('detailName').textContent = pet.nome;
  document.getElementById('detailDescription').textContent = pet.descricao || 'Sem descrição adicional.';
  document.getElementById('detailSpecies').textContent = pet.especie;
  document.getElementById('detailAge').textContent = pet.idade;
  document.getElementById('detailVaccine').textContent = pet.vacinacao;
  document.getElementById('detailVaccineDate').textContent = formatDate(pet.data);
  document.getElementById('detailAdoptedBy').textContent = pet.adotadoPor || 'Sem informação';
  document.getElementById('detailCreatedBy').textContent = pet.criador || 'Desconhecido';
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

function initMyAdoptionsPage() {
  const user = getCurrentUser();
  const message = document.getElementById('adoptionsMessage');
  const grid = document.getElementById('adoptedPetsGrid');

  if (!user) {
    if (message) {
      message.innerHTML = 'Faça login para ver seus pets adotados. <button class="primary" onclick="openAuthModal(\'login\')">Entrar</button>';
    }
    if (grid) {
      grid.innerHTML = '<div class="empty-state">Você precisa estar logado para visualizar esta página.</div>';
    }
    return;
  }

  adoptedPets = getAdoptedPetsForUser(user);

  if (message) {
    message.textContent = adoptedPets.length > 0
      ? `Você adotou ${adoptedPets.length} pet(s). Clique em um para ver mais detalhes.`
      : 'Você ainda não adotou nenhum pet.';
  }

  if (adoptedPets.length === 0) {
    if (grid) {
      grid.innerHTML = '<div class="empty-state">Nenhum pet adotado ainda.</div>';
    }
    return;
  }

  renderAdoptedPets();
}

document.addEventListener('DOMContentLoaded', initMyAdoptionsPage);
