const STORAGE_KEY = 'sylvanian-collection';
const MAX_COLLECTION = 8;
const CHARACTERS_PER_PACK = 7;

function getCollection() {
  try {
    const savedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (!Array.isArray(savedItems)) return [];

    return savedItems
      .map(Number)
      .filter((characterId) => Number.isInteger(characterId))
      .filter((characterId) => characterId >= 1 && characterId <= 56);
  } catch {
    return [];
  }
}

function setCollection(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function updateCount() {
  const count = getCollection().length;

  document.querySelectorAll('.collection-count').forEach((element) => {
    element.textContent = `(${count}/${MAX_COLLECTION})`;
  });
}

function getPackNumber() {
  const packNumber = Number(new URLSearchParams(location.search).get('pack'));

  if (!Number.isInteger(packNumber) || packNumber < 1 || packNumber > 8) {
    return 1;
  }

  return packNumber;
}

function getRandomCharacterId(packNumber) {
  const firstCharacterId = (packNumber - 1) * CHARACTERS_PER_PACK + 1;
  const randomOffset = Math.floor(Math.random() * CHARACTERS_PER_PACK);

  return firstCharacterId + randomOffset;
}

function setupPack() {
  const packNumber = getPackNumber();
  const packId = String(packNumber).padStart(2, '0');
  const characterId = getRandomCharacterId(packNumber);
  const pack = document.getElementById('pack-image');
  const character = document.getElementById('character-image');
  const openingArea = document.getElementById('opening-area');
  const revealPanel = document.getElementById('reveal-panel');
  const collectButton = document.getElementById('collect-button');

  let startY = 0;
  let isOpened = false;

  pack.src = `image/b${packId}.png`;
  character.src = `crimg/kr${characterId}.png`;
  character.alt = `발견한 캐릭터 kr${characterId}`;

  function openPack() {
    if (isOpened) return;

    isOpened = true;
    openingArea.classList.add('opened');
    revealPanel.hidden = false;
  }

  pack.addEventListener('pointerdown', (event) => {
    startY = event.clientY;
    pack.setPointerCapture(event.pointerId);
  });

  pack.addEventListener('pointerup', (event) => {
    if (startY - event.clientY > 65) {
      openPack();
    }
  });

  pack.addEventListener('click', openPack);

  collectButton.addEventListener('click', () => {
    const collection = getCollection();

    if (collection.includes(characterId)) {
      collectButton.textContent = '이미 장식장에 있어요!';
      collectButton.disabled = true;
      return;
    }

    if (collection.length >= MAX_COLLECTION) {
      collectButton.textContent = '장식장이 가득 찼어요...';
      collectButton.disabled = true;
      return;
    }

    collection.push(characterId);
    setCollection(collection);
    updateCount();

    collectButton.textContent = '장식장에 넣었어요!';
    collectButton.disabled = true;
  });
}

function setupCollection() {
  const collection = getCollection();
  const slots = document.getElementById('cabinet-slots');
  const status = document.getElementById('cabinet-status');
  const resetButton = document.getElementById('reset-collection');

  if (status) {
    status.textContent = `${collection.length} / ${MAX_COLLECTION}`;
  }

  for (let index = 0; index < MAX_COLLECTION; index += 1) {
    const slot = document.createElement('div');
    slot.className = 'cabinet-slot';

    if (collection[index]) {
      const image = document.createElement('img');
      image.src = `crimg/kr${collection[index]}.png`;
      image.alt = `수집한 캐릭터 kr${collection[index]}`;
      slot.append(image);
    }

    slots.append(slot);
  }

  resetButton.addEventListener('click', () => {
    if (!confirm('장식장 비우기')) return;

    setCollection([]);
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCount();

  if (document.body.dataset.page === 'pack') {
    setupPack();
  }

  if (document.body.dataset.page === 'collection') {
    setupCollection();
  }
});
