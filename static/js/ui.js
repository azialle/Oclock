export class UIManager {
  static createCountryLabel(country) {
    const container = document.createElement("div");
    container.className = "country-hover-label";
    container.innerHTML = `
      <div class="label-wrapper">
        <div class="label-content">
          <div class="label-time">--:--:--</div>
          <div class="label-date">---</div>
          <div class="label-name">${country.name}</div>
        </div>
      </div>`;

    const timeEl = container.querySelector(".label-time");
    const dateEl = container.querySelector(".label-date");

    const update = () => {
      try {
        const now = new Date();
        const tz = country.tz || "UTC";
        timeEl.textContent = now.toLocaleTimeString("en-GB", { timeZone: tz, hour12: false });
        dateEl.textContent = now
          .toLocaleDateString("en-GB", { timeZone: tz, day: "2-digit", month: "short", year: "numeric" })
          .toUpperCase();
      } catch {
        timeEl.textContent = "N/A";
      }
    };

    update();
    const timer = setInterval(update, 1000);
    container.addEventListener("remove", () => clearInterval(timer));
    
    return container;
  }

  static initSearch(countries, onSelect) {
    const input = document.getElementById("countrySearch");
    const results = document.getElementById("searchResults");

    input.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      results.innerHTML = "";
      
      if (term.length < 1) return (results.style.display = "none");

      const matches = countries
        .filter((f) => f.properties.ADMIN.toLowerCase().includes(term))
        .slice(0, 10);

      results.style.display = matches.length > 0 ? "block" : "none";
      matches.forEach((match) => {
        const div = document.createElement("div");
        div.className = "search-result-item";
        div.textContent = match.properties.ADMIN;
        div.onclick = () => {
          onSelect(match);
          input.value = "";
          results.style.display = "none";
        };
        results.appendChild(div);
      });
    });
  }
}