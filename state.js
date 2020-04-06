const last = (arr) => arr[arr.length - 1];
const setLast = (arr, val) => {
  arr[arr.length - 1] = val;
};

const deckTiers = JSON.parse(localStorage.getItem('deckTiers')) || [Object.keys(window.cities)];
let infectionDiscardPile = JSON.parse(localStorage.getItem('infectionDiscardPile')) || [];

function epidemic(event) {
  const bottomCard = event.target.dataset.city;
  infectionDiscardPile.push(bottomCard);
  deckTiers[0] = deckTiers[0].filter(k => k !== bottomCard);
  deckTiers.push(infectionDiscardPile);
  infectionDiscardPile = [];
}

function drawInfectionCard(event) {
  const city = event.target.dataset.city;
  setLast(deckTiers, last(deckTiers).filter(c => c !== city));
  infectionDiscardPile.push(city);
  if (last(deckTiers).length === 0) {
    deckTiers.pop();
  }
}

function uiUpdater(fn) {
  return (...args) => {
    fn(...args);
    updateUI();
    localStorage.setItem('deckTiers', JSON.stringify(deckTiers));
    localStorage.setItem('infectionDiscardPile', JSON.stringify(infectionDiscardPile));
  };
}

function sortByColor(cityList) {
  return cityList.sort((a, b) => window.cities[a] < window.cities[b] ? 1 : -1);
}

function updateUI() {
  window.tiers.innerHTML = deckTiers.slice().reverse().map(tier => {
    const tierList = sortByColor(tier)
      .map(city => `<li class="tier-city" style="color: ${window.cities[city]}">${city}</li>`)
      .join('\n');
    return `<ul class="tier city-list">${tierList}</ul>`;
  }).join('\n');

  window.discardPile.innerHTML = sortByColor(infectionDiscardPile)
    .map(city => `<li class="tier-city" style="color: ${window.cities[city]}">${city}</li>`)
    .join('\n');
}

window.epidemic = uiUpdater(epidemic);
window.drawInfectionCard = uiUpdater(drawInfectionCard);
updateUI();
