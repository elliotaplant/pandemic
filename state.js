const uniq = (arr) => Array.from(new Set(arr));
const last = (arr) => arr[arr.length - 1];
const setLast = (arr, val) => {
  arr[arr.length - 1] = val;
};

const numProbabilities = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let deckTiers = JSON.parse(localStorage.getItem('deckTiers')) || [Object.keys(window.cities)];
let infectionDiscardPile = JSON.parse(localStorage.getItem('infectionDiscardPile')) || [];
let resiliantPopulations = JSON.parse(localStorage.getItem('resiliantPopulations')) || [];
let probabilityTiers = [];
let history = JSON.parse(localStorage.getItem('history')) || [{ deckTiers, infectionDiscardPile }];
let historyIndex = JSON.parse(localStorage.getItem('historyIndex')) || 0;

function epidemic(event) {
  event.preventDefault();
  const bottomCard = event.target.dataset.city;
  infectionDiscardPile.push(bottomCard);
  infectionDiscardPile = uniq(infectionDiscardPile);
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

function resiliant(event) {
  const city = event.target.dataset.city;
  infectionDiscardPile = infectionDiscardPile.filter(c => c !== city);
  resiliantPopulations.push(city);
}

function uiUpdater(fn) {
  return (...args) => {
    fn(...args);
    updateUI();
  };
}

function historyUpdator(fn) {
  return (...args) => {
    fn(...args);
    updateHistory();
  };
}

function sortByColor(cityList) {
  return cityList.sort((a, b) => {
    const aColor = window.cities[a];
    const bColor = window.cities[b];
    return aColor < bColor ? 1 : (aColor > bColor) ? -1 : (a > b ? 1 : (a < b ? -1 : 0));
  });
}

function updateProbabilities() {
  probabilityTiers = deckTiers.slice().reverse().map(tier => tier.length).reduce(({ out, cardsAbove }, tierSize) => {
    out.push(numProbabilities.map(cardsDrawn => {
      let majungus = 1;
      for (let i = 1; i <= cardsDrawn - cardsAbove; i++) {
        majungus *= (tierSize - i) / Math.max(tierSize - (i - 1), 1);
      }
      return 1 - majungus;
    }));
    cardsAbove = cardsAbove + tierSize;
    return { out, cardsAbove };
  }, { out: [], cardsAbove: 0 }).out;
}

function updateUI() {
  updateProbabilities();
  window.tiers.innerHTML = deckTiers.slice().reverse().map((tier, i) => {
    const tierList = sortByColor(tier)
      .map(city => {
        let clickStyle = '';
        let clickAction = '';
        let oncontextmenu = '';
        if (i === 0) {
          clickStyle = 'cursor: pointer; text-decoration: underline;';
          clickAction = `data-city="${city}" onclick="drawInfectionCard(event)"`;
        }
        if (i === deckTiers.length - 1) {
          clickStyle = 'cursor: pointer; text-decoration: underline;';
          oncontextmenu = `data-city="${city}" oncontextmenu="epidemic(event)"`;
        }
        return `
          <li
            class="tier-city"
            style="${clickStyle} color: ${window.cities[city]}"
            ${clickAction}
            ${oncontextmenu}
          >
            ${city}
          </li>
        `;
      })
      .join('\n');
    const probs = probabilityTiers[i].map(prob => Math.round(prob * 100) + '%');
    return `<div>
      <div>${probs.map(p => `<span class="prob">${p}</span>`).join(' ')}</div>
      <ul class="tier city-list">${tierList}</ul>
    </div>`;
  }).join('\n');

  window.discardPile.innerHTML = sortByColor(infectionDiscardPile)
    .map(city => `<li class="tier-city" style="color: ${window.cities[city]}"><span>${city}</span></li>`)
    .join('\n');

  window.resiliantPopulations.innerHTML = sortByColor(resiliantPopulations)
    .map(city => `<li class="tier-city" style="color: ${window.cities[city]}">${city}</li>`)
    .join('\n');

  if (resiliantPopulations.length) {
    window.resiliantPopulationsHeader.style.display = 'block';
  } else {
    window.resiliantPopulationsHeader.style.display = 'none';
  }

  if (window.city.value) {
    window.matchingCitiesList.innerHTML = Object.keys(window.cities)
      .filter(city => city.toLowerCase().startsWith(window.city.value.toLowerCase()) &&
        !resiliantPopulations.includes(city))
      .map(city => {
        let buttons = '';
        if (deckTiers[deckTiers.length - 1].includes(city)) {
          buttons += `<button type="button" data-city="${city}" onclick=drawInfectionCard(event)>Infect</button>`;
        }
        if (deckTiers[0].includes(city)) {
          buttons += `<button type="button" data-city="${city}" onclick=epidemic(event)>Epidemic</button>`;
        }
        if (infectionDiscardPile.includes(city) && !resiliantPopulations.includes(city)) {
          buttons = `<button type="button" data-city="${city}" onclick=resiliant(event)>Resiliant Population</button>`;
        }
        return `<li style="color: ${window.cities[city]}"> ${city} ${buttons} </li>`;
      })
      .join('\n');
  } else {
    window.matchingCitiesList.innerHTML = '';
  }

  if (historyIndex === history.length - 1) {
    window.redoBtn.disabled = true;
  } else {
    window.redoBtn.disabled = null;
  }

  if (history.length < 2 || historyIndex === 0) {
    window.undoBtn.disabled = true;
  } else {
    window.undoBtn.disabled = null;
  }
  storeState();
}

function storeState() {
  localStorage.setItem('deckTiers', JSON.stringify(deckTiers));
  localStorage.setItem('infectionDiscardPile', JSON.stringify(infectionDiscardPile));
  localStorage.setItem('history', JSON.stringify(history));
  localStorage.setItem('historyIndex', JSON.stringify(historyIndex));
}

function updateHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.stringify({ deckTiers, infectionDiscardPile, resiliantPopulations }));
  historyIndex = history.length - 1;
  if (history.length && historyIndex !== 0) {
    window.undoBtn.disabled = null;
  }
}

function undo() {
  historyIndex = Math.max(historyIndex - 1, -1);
  const currentState = JSON.parse(history[historyIndex]);
  deckTiers = currentState.deckTiers;
  infectionDiscardPile = currentState.infectionDiscardPile;
  resiliantPopulations = currentState.resiliantPopulations;
  updateUI();
}

function redo() {
  historyIndex = Math.min(history.length - 1, historyIndex + 1);
  const currentState = JSON.parse(history[historyIndex]);
  deckTiers = currentState.deckTiers;
  infectionDiscardPile = currentState.infectionDiscardPile;
  resiliantPopulations = currentState.resiliantPopulations;
  updateUI();
}

window.reset = () => {
  deckTiers = [Object.keys(window.cities)];
  infectionDiscardPile = [];
  history = [JSON.stringify({ deckTiers, infectionDiscardPile, resiliantPopulations })];
  historyIndex = 0;
  updateUI();
};

window.epidemic = uiUpdater(historyUpdator(epidemic));
window.drawInfectionCard = uiUpdater(historyUpdator(drawInfectionCard));
window.resiliant = uiUpdater(historyUpdator(resiliant));
window.city.onkeyup = uiUpdater(() => {});
window.undo = undo;
window.redo = redo;
updateUI();
