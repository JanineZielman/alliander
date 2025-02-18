async function readLocalXLSX(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0]; // Read the first sheet
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert to an array of rows
            resolve(jsonData);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function fetchAndProcessData(file) {
    try {
        const data = await readLocalXLSX(file);

        // Extract the rows, assuming first row is the header
        const rows = data.slice(1); // Skip header

        const filteredData = [];
        const categoryCounts = {};
        const vrijwilligersTotaal = rows[rows.length - 1][1]
        const urenTotaal = rows[rows.length - 1][2]

        console.log(categoryCounts)

        console.log(urenTotaal)

        rows.forEach((cells) => {
            if (cells.length >= 7) { // Ensure enough columns exist
                const aantalVrijwilliger = cells[1];
                const aantalUren = cells[2];
                const maatschappelijkeOrganisatie = cells[3];
                const plaats = cells[4];
                const categorie = cells[5];
                const activiteit = cells[6];
                const quote = 'Het gevoel iets te betekenen voor een ander is fijn'


                if (aantalUren && categorie) { // Filter rows with both B and D
                    const aantal = parseInt(aantalUren, 10) || 0;
                    // const aantalV = parseInt(aantalVrijwilliger, 10) || 0;

                    // Update counts for each category
                    categoryCounts[categorie] = ((categoryCounts[categorie] || 0) + aantal);

                    // Add data to filtered list
                    filteredData.push({
                        maatschappelijkeOrganisatie,
                        aantalUren: aantal,
                        // aantalVrijwilliger: aantalV,
                        categorie,
                        quote,
                    });
                }
            }
        });

        // Animate number increment function
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
                const stepSize = end >= 1000 ? 100 : 1; // Step by 100 for large numbers
                const steps = Math.ceil((end - start) / stepSize); // Total steps
                const interval = duration / steps; // Time per step
        
                let current = start;
                const step = () => {
                    current += stepSize;
                    if (current > end) current = end; // Ensure we land on the exact number
                    element.textContent = current + suffix;
                    if (current < end) {
                        setTimeout(step, interval);
                    }
                };
                step(); // Start animation
            }, delay * 1000);
        };
        
        

        // Fade-in effect
        const fadeInWithDelay = (element, delay) => {
            element.style.opacity = 0;
            element.style.animation = `fadeIn 0.5s ease-in ${delay}s forwards`;
        };

        const randomNumber = Math.floor(Math.random() * filteredData.length);
        console.log(filteredData[randomNumber])

        // Update UI with animations
        const percentage = document.getElementById('percentage');
        fadeInWithDelay(percentage, 0.33);
        animateCount(percentage, 0, categoryCounts[filteredData[randomNumber].categorie] / urenTotaal * 100, 1000, 0.5, '%');

        const statement = document.getElementById('statement');
        statement.innerHTML = 'doen vrijwilligerswerk in de <br/>' + filteredData[randomNumber].categorie;
        fadeInWithDelay(statement, 0.66);

        const amount = document.getElementById('amount');
        fadeInWithDelay(amount, 1);
        animateCount2(amount, 0, categoryCounts[filteredData[randomNumber].categorie], 1000, 1, ' uur');

        const quoteElem = document.getElementById('quote');
        quoteElem.innerHTML = '"' + filteredData[randomNumber].quote + '"';
        fadeInWithDelay(quoteElem, 1.33);

        const imgNew = document.getElementById('img');
        imgNew.src = '/' + filteredData[randomNumber].categorie + '.jpg';
        fadeInWithDelay(imgNew, 0.1);


        const categories = document.getElementById('categories');

        // Sort categories from highest to lowest percentage and get the top 5
        const sortedCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1]) // Sort by count (highest first)
            .slice(0, 4); // Take only the top 5 categories

        categories.innerHTML = `
            ${sortedCategories.map(([category, count]) => {
                const percentage = (count / urenTotaal) * 100; // Calculate percentage
                const fontSize = Math.max(1, percentage / 15); // Scale font-size, min 8px
                const size = Math.max(30, percentage * 1.6); // Scale font-size, min 8px
                
                return `
                    <div class="category" 
                        style="opacity: 0; 
                            animation: fadeIn 0.5s ease-in forwards; 
                            width: ${size}%;
                            font-size: ${fontSize}vh;">
                        ${category} <br/> 
                        <span class="count" data-count="${percentage.toFixed(1)}">0</span>
                    </div>
                `;
            }).join('')}
        `;
        
        // Animate category counts with staggered delays
        document.querySelectorAll('.count').forEach((span, index) => {
            const target = parseFloat(span.getAttribute('data-count'));
            animateCount(span, 0, target, 1000, 1.33 + index * 0.5, '%');
        });
        
        
        // Animate category counts with staggered delays
        document.querySelectorAll('.count').forEach((span, index) => {
            const target = parseFloat(span.getAttribute('data-count'));
            animateCount(span, 0, target, 1000, 1.33 + index * 0.5, '%');
        });

        // Apply staggered fade-in for each category
        document.querySelectorAll('.category').forEach((div, index) => {
            const delay = 1.33 + index * 0.5;
            div.style.animationDelay = `${delay}s`;
        });

        // Animate category counts with staggered delays
        document.querySelectorAll('.count').forEach((span, index) => {
            const target = parseInt(span.getAttribute('data-count'), 10);
            animateCount(span, 0, target, 1000, 1.33 + index * 0.5, '%');
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