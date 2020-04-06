const uniq = (arr) => Array.from(new Set(arr));
const last = (arr) => arr[arr.length - 1];
const setLast = (arr, val) => {
  arr[arr.length - 1] = val;
};

const numProbabilities = [1,2,3,4,5,6,7,8,9];

let deckTiers = JSON.parse(localStorage.getItem('deckTiers')) || [Object.keys(window.cities)];
let infectionDiscardPile = JSON.parse(localStorage.getItem('infectionDiscardPile')) || [];
const resiliantPopulations = JSON.parse(localStorage.getItem('resiliantPopulations')) || [];
let probabilityTiers = [];

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
  console.log('city', city);
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
    updateProbabilities();
    updateUI();
  };
}

function sortByColor(cityList) {
  return cityList.sort((a, b) => window.cities[a] < window.cities[b] ? 1 : -1);
}

function updateProbabilities() {
  probabilityTiers = deckTiers.slice().reverse().map(tier => tier.length).reduce(({ out, cardsAbove } , tierSize) => {
    out.push(numProbabilities.map(cardsDrawn => {
      let majungus = 1;
      for (let i = 1; i <= cardsDrawn - cardsAbove; i++) {
        majungus *= (tierSize - i)/Math.max(tierSize - (i - 1), 1);
      }
      return 1 - majungus;
    }));
    cardsAbove = cardsAbove + tierSize;
    return { out, cardsAbove };
  }, { out: [], cardsAbove: 0 }).out;
}

function updateUI() {
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
        return `<li class="tier-city" style="${clickStyle} color: ${window.cities[city]}" ${clickAction} ${oncontextmenu}>${city}</li>`;
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

  localStorage.setItem('deckTiers', JSON.stringify(deckTiers));
  localStorage.setItem('infectionDiscardPile', JSON.stringify(infectionDiscardPile));
}



window.reset = () => {
  deckTiers = [Object.keys(window.cities)];
  infectionDiscardPile = [];
  updateProbabilities();
  updateUI();
};

window.epidemic = uiUpdater(epidemic);
window.drawInfectionCard = uiUpdater(drawInfectionCard);
window.resiliant = uiUpdater(resiliant);
window.city.onkeyup = uiUpdater(() => {});
updateProbabilities();
updateUI();
