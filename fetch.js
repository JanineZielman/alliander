async function fetchAndProcessData() {
  const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTrkioaQGcgl5BMOx57-2cbOV_7Gy4ub7yPksemxw6srWryVpn8imutH6aXi38z-_tnML82Q5Vi-4s5/pubhtml');

  if (response.status === 200) {
      const html = await response.text();
      
      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Select all table rows
      const rows = doc.querySelectorAll('table tbody tr');
      
      // Prepare objects to store filtered data and counts
      const filteredData = [];
      const categoryCounts = {};

      // Skip the first row (header)
      rows.forEach((row, index) => {
          if (index === 0) return; // Skip the header row

          const cells = row.querySelectorAll('td');
          if (cells.length >= 9) { // Ensure enough columns
              const maatschappelijkeOrganisatie = cells[0]?.textContent?.trim();
              const aantalVrijwilliger = cells[1]?.textContent?.trim();
              const categorie = cells[3]?.textContent?.trim();
              const quote = cells[8]?.textContent?.trim();

              if (aantalVrijwilliger && categorie) { // Filter rows with both B and D
                  const aantal = parseInt(aantalVrijwilliger, 10) || 0;
                  
                  // Update counts for each category
                  categoryCounts[categorie] = (categoryCounts[categorie] || 0) + aantal;

                  // Add data to filtered list
                  filteredData.push({
                      maatschappelijkeOrganisatie,
                      aantalVrijwilliger: aantal,
                      categorie,
                      quote,
                      catCount: categoryCounts[categorie]
                  });
              }
          }
      });

      // Animate a number increment
      const animateCount = (element, start, end, duration, delay, suffix = '') => {
          setTimeout(() => {
              const step = (timestamp, startTime, start, end, duration) => {
                  const elapsed = timestamp - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const currentValue = Math.floor(progress * (end - start) + start);
                  element.textContent = currentValue + suffix;
                  if (progress < 1) {
                      requestAnimationFrame(ts => step(ts, startTime, start, end, duration));
                  }
              };
              requestAnimationFrame(ts => step(ts, ts, start, end, duration));
          }, delay * 1000);
      };

      // Add fade-in effect with delays
      const fadeInWithDelay = (element, delay) => {
          element.style.opacity = 0;
          element.style.animation = `fadeIn 0.5s ease-in ${delay}s forwards`;
      };

      const randomNumber = Math.floor(Math.random() * filteredData.length);

      // Update the UI with animations
      const percentage = document.getElementById('percentage');
      fadeInWithDelay(percentage, 0.33);
      animateCount(percentage, 0, filteredData[randomNumber].catCount, 1000, 0.5, '%');

      const statement = document.getElementById('statement');
      statement.innerHTML = 'doen vrijwilligerswerk in de <br/>' + filteredData[randomNumber].categorie;
      fadeInWithDelay(statement, 0.66);

      const amount = document.getElementById('amount');
      fadeInWithDelay(amount, 1);
      animateCount(amount, 0, filteredData[randomNumber].aantalVrijwilliger, 1000, 1, ' uur');

      const quote = document.getElementById('quote');
      quote.innerHTML = '"' + filteredData[randomNumber].quote + '"';
      fadeInWithDelay(quote, 1.33);

      const categories = document.getElementById('categories');
      categories.innerHTML = `
      ${Object.entries(categoryCounts).map(([category, count]) => `
          <div class="category" style="opacity: 0; animation: fadeIn 0.5s ease-in forwards;">
              ${category} <br/> <span class="count" data-count="${count}">0</span>
          </div>
      `).join('')}`;
      
      // Apply staggered fade-in for each category
      document.querySelectorAll('.category').forEach((div, index) => {
          const delay = 1.33 + index * 0.5; // Adjust the base delay and increment as needed
          div.style.animationDelay = `${delay}s`;
      });
      
      // Animate category counts with staggered delays
      document.querySelectorAll('.count').forEach((span, index) => {
          const target = parseInt(span.getAttribute('data-count'), 10);
          animateCount(span, 0, target, 1000, 1.33 + index * 0.5, '%');
      });
    

  } else {
      console.error('Failed to fetch spreadsheet');
  }
}

fetchAndProcessData();
