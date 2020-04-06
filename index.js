window.city.onkeyup = () => {
  if (window.city.value) {
    window.matchingCitiesList.innerHTML = Object.keys(window.cities)
      .filter(city => city.toLowerCase().startsWith(window.city.value.toLowerCase()))
      .map(city => `<li style="color: ${window.cities[city]}">
        ${city}
        <button type="button" data-city=${city} onclick=drawInfectionCard(event)>Infect</button>
        <button type="button" data-city=${city} onclick=epidemic(event)>Epidemic</button>
      </li>`)
      .join('\n');
  } else {
    window.matchingCitiesList.innerHTML = '';
  }
};
