async function readLocalXLSX(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // Read first sheet (volunteer data)
            const sheet1Name = workbook.SheetNames[0]; 
            const sheet1 = workbook.Sheets[sheet1Name];
            const jsonData1 = XLSX.utils.sheet_to_json(sheet1, { header: 1 });

            // Read second sheet (category info)
            const sheet2Name = workbook.SheetNames[1];
            const sheet2 = workbook.Sheets[sheet2Name];
            const jsonData2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 });

            resolve({ volunteerData: jsonData1, categoryInfo: jsonData2 });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}


function normalizePercentages(countMap) {
    const total = Object.values(countMap).reduce((sum, val) => sum + val, 0);
    const entries = Object.entries(countMap).map(([key, value]) => {
        const raw = (value / total) * 100;
        return {
            key,
            value,
            raw,
            floored: Math.floor(raw),
            decimal: raw % 1
        };
    });

    const flooredTotal = entries.reduce((sum, item) => sum + item.floored, 0);
    const remainder = 100 - flooredTotal;

    entries.sort((a, b) => b.decimal - a.decimal);

    for (let i = 0; i < remainder; i++) {
        entries[i].floored += 1;
    }

    return Object.fromEntries(entries.map(item => [item.key, item.floored]));
}


async function fetchAndProcessData(file) {
    try {
        const { volunteerData, categoryInfo } = await readLocalXLSX(file);
        const rows = volunteerData.slice(1);

        const categoryData = {};
        categoryInfo.slice(1).forEach(row => {
            const [categorie, imageFile, quote1, quote2] = row;
            if (categorie) {
                categoryData[categorie] = {
                    quote1: quote1,
                    quote2: quote2,
                    image: imageFile
                };
            }
        });

        const filteredData = [];
        const categoryCounts = {};
        const categoryLocationCounts = {};
        const urenTotaal = rows[rows.length - 1][2];

        rows.forEach((cells) => {
            if (cells.length >= 7) {
                const aantalUren = cells[2];
                const maatschappelijkeOrganisatie = cells[3];
                const locatie = cells[5];
                const categorie = cells[6];
                const quote1 = categoryData[categorie]?.quote1 || "Vrijwilligerswerk is belangrijk!";
                const quote2 = categoryData[categorie]?.quote2 || "Vrijwilligerswerk is belangrijk!";
                const imageFile = categoryData[categorie]?.image || "default";

                if (aantalUren && categorie && locatie) {
                    const aantal = parseInt(aantalUren, 10) || 0;

                    categoryCounts[categorie] = (categoryCounts[categorie] || 0) + aantal;

                    if (!categoryLocationCounts[categorie]) {
                        categoryLocationCounts[categorie] = { locations: {} };
                    }

                    if (!categoryLocationCounts[categorie].locations[locatie]) {
                        categoryLocationCounts[categorie].locations[locatie] = 0;
                    }
                    categoryLocationCounts[categorie].locations[locatie] += aantal;

                    filteredData.push({
                        maatschappelijkeOrganisatie,
                        aantalUren: aantal,
                        categorie,
                        quote1,
                        quote2,
                        imageFile
                    });
                }
            }
        });

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

        const animateCount2 = (element, start, end, duration, delay, suffix = '') => {
            setTimeout(() => {
                const stepSize = end >= 1000 ? 100 : 1;
                const steps = Math.ceil((end - start) / stepSize);
                const interval = duration / steps;

                let current = start;
                const step = () => {
                    current += stepSize;
                    if (current > end) current = end;
                    element.textContent = current + suffix;
                    if (current < end) {
                        setTimeout(step, interval);
                    }
                };
                step();
            }, delay * 1000);
        };

        const fadeInWithDelay = (element, delay) => {
            element.style.opacity = 0;
            element.style.animation = `fadeIn 0.5s ease-in ${delay}s forwards`;
        };

        // === ✅ Use smart normalization for categories ===
        const normalizedCategoryPercentages = normalizePercentages(categoryCounts);

        const randomNumber = Math.floor(Math.random() * filteredData.length);
        const randomCategorie = filteredData[randomNumber].categorie;

        const percentage = document.getElementById('percentage');
        fadeInWithDelay(percentage, 0.33);
        animateCount(percentage, 0, normalizedCategoryPercentages[randomCategorie], 1000, 0.5, '%');


        const statement = document.getElementById('statement');
        statement.innerHTML = 'doet vrijwilligerswerk ' + randomCategorie;
        fadeInWithDelay(statement, 0.66);

        const amount = document.getElementById('amount');
        fadeInWithDelay(amount, 1);
        animateCount2(amount, 0, categoryCounts[randomCategorie], 1000, 1, ' uur');

        const quoteElem = document.getElementById('quote');
        quoteElem.innerHTML = '"' + filteredData[randomNumber].quote1 + '"';
        fadeInWithDelay(quoteElem, 1.33);

        const quoteElem2 = document.getElementById('quote2');
        quoteElem2.innerHTML = '"' + filteredData[randomNumber].quote2 + '"';
        fadeInWithDelay(quoteElem2, 1.33);

        const imgNew = document.getElementById('img');
        imgNew.src = 'view_image.php?file=' + filteredData[randomNumber].imageFile + '.jpg';
        fadeInWithDelay(imgNew, 0.1);

        const poster = document.getElementById('posterWrap');
        poster.className = randomCategorie;

        const categories = document.getElementById('categories');
        const locations = document.getElementById('locations');


        categories.innerHTML = `
            ${Object.entries(normalizedCategoryPercentages)
                .sort((a, b) => b[1] - a[1])
                .map(([category, percentage]) => {
                    const fontSize = Math.max(0.8, percentage / 15);
                    const size = Math.max(24, percentage * 1.6);
                    return `
                        <div class="category" 
                            style="opacity: 0; 
                                animation: fadeIn 0.5s ease-in forwards; 
                                width: ${size}%;
                                font-size: ${fontSize}vh;">
                            ${category} <br/> 
                            <span class="count" data-count="${percentage}">0</span>
                        </div>
                    `;
                }).join('')}
        `;

        // === ✅ Use smart normalization for LOCATIONS ===
        const locCounts = categoryLocationCounts[randomCategorie].locations;
        const normalizedLocationPercentages = normalizePercentages(locCounts);

        locations.innerHTML = `
            ${Object.entries(normalizedLocationPercentages)
                .map(([location, percentage]) => {
                    const fontSize = Math.max(0.8, percentage / 30);
                    const size = Math.max(20, percentage * 0.9);
                    return `
                        <div class="location" 
                            style="opacity: 0; 
                                animation: fadeIn 0.5s ease-in forwards; 
                                width: ${size}%;
                                font-size: ${fontSize}vh;">
                            ${location} <br/> 
                            <span class="count2" data-count="${percentage}"></span>
                        </div>
                    `;
                }).join('')}
        `;

        // === Animate counters ===
        document.querySelectorAll('.count2').forEach((span, index) => {
            const target = parseFloat(span.getAttribute('data-count'));
            animateCount(span, 0, target, 1000, 1.33 + index * 0.5, '%');
        });

        document.querySelectorAll('.location').forEach((div, index) => {
            const delay = 1.33 + index * 0.5;
            div.style.animationDelay = `${delay}s`;
        });

        document.querySelectorAll('.count').forEach((span, index) => {
            const target = parseFloat(span.getAttribute('data-count'));
            animateCount(span, 0, target, 1000, 1.33 + index * 0.5, '%');
        });

        document.querySelectorAll('.category').forEach((div, index) => {
            const delay = 1.33 + index * 0.5;
            div.style.animationDelay = `${delay}s`;
        });

    } catch (error) {
        console.error('Error reading XLSX file:', error);
    }
}



// Handle file input
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        fetchAndProcessData(file);
    }
});

function refresh(){
    const file = document.getElementById('fileInput').files[0];
    if (file) {
        fetchAndProcessData(file);
    }
}

let interval; // Declare the interval variable outside the function
  let isActive = false; // Flag to check if the interval is active
  const button = document.querySelector('.animate'); // Get the button element

  function toggleAnimation() {
    if (isActive) {
      clearInterval(interval); // Stop the interval
      button.classList.remove('active'); // Remove the active class
      isActive = false; // Set the flag to false
    } else {
      const file = document.getElementById('fileInput').files[0];
      if (file) {
        interval = setInterval(function() {
          fetchAndProcessData(file);
        }, 10000);
        button.classList.add('active'); // Add the active class
        isActive = true; // Set the flag to true
      }
    }
  }

  function locationSwitch(){
    document.getElementById('poster').classList.toggle('loc');
  }