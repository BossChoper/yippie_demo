let fullMenu = []; // Store full menu for filtering

function initMap()
{
    // Hardcoded restaurant data
    const restaurant = {
        name: "Negril - Silver Spring",
        address: "965 Thayer Ave, Silver Spring, MD",
        lat: 38.9931243,
        lng: -77.0259658
    };

    // Create map centered on the restaurant
    const map = new google.maps.Map(document.getElementById("map"),{
        zoom: 15,
        center: { lat: restaurant.lat, lng: restaurant.lng}
    });

    // Add a marker for the restaurant
    new google.maps.Marker({
        position: {lat : restaurant.lat, lng: restaurant.lng },
        map: map,
        title: restaurant.name
    });

    // Update restaurant info on the page
    document.getElementById("restaurant-name").textContent = restaurant.name;
    document.getElementById("restaurant-address").textContent = restaurant.address;
  
 // Fetch and store the full menu
 fetch("menu.json")
 .then(response => {
     if (!response.ok) throw new Error("Network response was not ok");
     return response.json();
 })
 .then(menu => {
     fullMenu = menu.map(item => ({
         ...item,
         tags: item.name === "Jerk Chicken Dinner" ? ["Keto", "High Protein"] : [], // Hardcoded tags for demo
         nutrition: item.name === "Jerk Chicken Dinner" ? { protein: "35g" } : {} // Hardcoded nutrition
     }));
     displayMenu(fullMenu); // Initial display

     // Add search functionality
     document.getElementById("search-button").addEventListener("click", () => {
         const query = document.getElementById("search-input").value.trim().toLowerCase();
         filterMenu(query);
     });

     // Optional: Search on Enter key
     document.getElementById("search-input").addEventListener("keypress", (e) => {
         if (e.key === "Enter") filterMenu(document.getElementById("search-input").value.trim().toLowerCase());
     });
 })
 .catch(error => {
     console.error("Error fetching menu:", error);
     document.getElementById("menu-list").innerHTML = "<li>Failed to load menu</li>";
 });
}

function displayMenu(menuItems) {
const menuList = document.getElementById("menu-list");
menuList.innerHTML = "";

menuItems.forEach((item, index) => {
 const li = document.createElement("li");
 const hasImage = index === 0; // Only first item has an image for now

 li.innerHTML = hasImage
     ? `
         <div class="menu-item-container">
             <img src="jerk_chicken.jpg" alt="${item.name}" class="menu-image">
             <div class="menu-text">
                 <strong>${item.name}</strong>: ${item.description || "No description available"}
                 ${item.tags.length ? `<div class="tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}</div>` : ""}
             </div>
         </div>
     `
     : `<strong>${item.name}</strong>: ${item.description || "No description available"}
        ${item.tags.length ? `<div class="tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}</div>` : ""}`;

 if (index === 0) {
     const ingredientsButton = document.createElement("button");
     ingredientsButton.textContent = "Show Ingredients";
     ingredientsButton.style.marginTop = "5px";
     ingredientsButton.style.marginRight = "10px";

     const nutritionButton = document.createElement("button");
     nutritionButton.textContent = "Show Nutrition";
     nutritionButton.style.marginTop = "5px";

     const ingredientsDiv = document.createElement("div");
     ingredientsDiv.id = "ingredients-list";
     ingredientsDiv.style.display = "none";
     ingredientsDiv.innerHTML = "<p>Loading ingredients...</p>";

     const nutritionDiv = document.createElement("div");
     nutritionDiv.id = "nutrition-list";
     nutritionDiv.style.display = "none";
     nutritionDiv.innerHTML = "<p>Loading nutrition...</p>";

     li.appendChild(ingredientsButton);
     li.appendChild(nutritionButton);
     li.appendChild(ingredientsDiv);
     li.appendChild(nutritionDiv);

     ingredientsButton.addEventListener("click", () => {
         if (ingredientsDiv.style.display === "none") {
             if (ingredientsDiv.innerHTML === "<p>Loading ingredients...</p>") {
                 fetch("jerk_chicken_ingredients.json")
                     .then(response => {
                         if (!response.ok) throw new Error("Failed to load ingredients");
                         return response.json();
                     })
                     .then(data => {
                         ingredientsDiv.innerHTML = "<strong>Assumed Ingredients:</strong><ul>" +
                             data.ingredients.map(ing => `<li>${ing}</li>`).join("") +
                             "</ul>";
                     })
                     .catch(error => {
                         console.error("Error fetching ingredients:", error);
                         ingredientsDiv.innerHTML = "<p>Failed to load ingredients</p>";
                     });
             }
             ingredientsDiv.style.display = "block";
             ingredientsButton.textContent = "Hide Ingredients";
         } else {
             ingredientsDiv.style.display = "none";
             ingredientsButton.textContent = "Show Ingredients";
         }
     });

     nutritionButton.addEventListener("click", () => {
         if (nutritionDiv.style.display === "none") {
             if (nutritionDiv.innerHTML === "<p>Loading nutrition...</p>") {
                 fetch("jerk_chicken_ingredients.json")
                     .then(response => {
                         if (!response.ok) throw new Error("Failed to load ingredients");
                         return response.json();
                     })
                     .then(data => {
                         const nutritionData = {
                             calories: 650,
                             fat: "25g",
                             saturatedFat: "10g",
                             protein: "35g",
                             carbs: "70g",
                             sugar: "5g",
                             sodium: "1200mg"
                         };
                         nutritionDiv.innerHTML = `
                             <strong>Nutrition Facts (Assumed):</strong>
                             <table>
                                 <tr><td>Calories</td><td>${nutritionData.calories}</td></tr>
                                 <tr><td>Total Fat</td><td>${nutritionData.fat}</td></tr>
                                 <tr><td> - Saturated Fat</td><td>${nutritionData.saturatedFat}</td></tr>
                                 <tr><td>Protein</td><td>${nutritionData.protein}</td></tr>
                                 <tr><td>Total Carbohydrates</td><td>${nutritionData.carbs}</td></tr>
                                 <tr><td> - Sugars</td><td>${nutritionData.sugar}</td></tr>
                                 <tr><td>Sodium</td><td>${nutritionData.sodium}</td></tr>
                             </table>
                         `;
                     })
                     .catch(error => {
                         console.error("Error fetching ingredients for nutrition:", error);
                         nutritionDiv.innerHTML = "<p>Failed to load nutrition</p>";
                     });
             }
             nutritionDiv.style.display = "block";
             nutritionButton.textContent = "Hide Nutrition";
         } else {
             nutritionDiv.style.display = "none";
             nutritionButton.textContent = "Show Nutrition";
         }
     });
 }

 menuList.appendChild(li);
});
}

function filterMenu(query) {
const filteredItems = fullMenu.filter(item => {
 // Name search (e.g., "chicken")
 if (item.name.toLowerCase().includes(query)) return true;

 // Tag search (e.g., "high protein")
 if (item.tags.some(tag => tag.toLowerCase().includes(query))) return true;

 // Ingredient search (e.g., "pepper")
 if (item.name === "Jerk Chicken Dinner") { // Only check ingredients for Jerk Chicken for now
     return fetch("jerk_chicken_ingredients.json")
         .then(response => response.json())
         .then(data => data.ingredients.some(ing => ing.toLowerCase().includes(query)))
         .catch(() => false);
 }

 // Nutrition search (e.g., ">30g protein")
 if (query.includes("protein")) {
     const match = query.match(/([<>])\s*(\d+)g?\s*protein/i);
     if (match && item.nutrition.protein) {
         const operator = match[1];
         const value = parseFloat(match[2]);
         const protein = parseFloat(item.nutrition.protein);
         return (operator === ">" && protein > value) || (operator === "<" && protein < value);
     }
 }

 return false;
});

// Handle async ingredient search
Promise.all(filteredItems.map(item => 
 item.name === "Jerk Chicken Dinner" 
     ? fetch("jerk_chicken_ingredients.json")
         .then(response => response.json())
         .then(data => ({ ...item, ingredients: data.ingredients }))
     : Promise.resolve(item)
)).then(results => {
 displayMenu(results.filter(item => 
     item.ingredients 
         ? item.ingredients.some(ing => ing.toLowerCase().includes(query)) || 
           item.name.toLowerCase().includes(query) || 
           item.tags.some(tag => tag.toLowerCase().includes(query)) ||
           (query.includes("protein") && item.nutrition.protein && evaluateNutrition(query, item.nutrition.protein))
         : true
 ));
});
}

function evaluateNutrition(query, protein) {
const match = query.match(/([<>])\s*(\d+)g?\s*protein/i);
if (match) {
 const operator = match[1];
 const value = parseFloat(match[2]);
 const proteinValue = parseFloat(protein);
 return (operator === ">" && proteinValue > value) || (operator === "<" && proteinValue < value);
}
return false;
}