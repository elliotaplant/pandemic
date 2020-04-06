window.city.onkeyup = () => {
  if (window.city.value) {
    window.matchingCitiesList.innerHTML = Object.keys(window.cities)
      .filter(city => city.toLowerCase().startsWith(window.city.value.toLowerCase()) && !resiliantPopulations.includes(city))
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
};
