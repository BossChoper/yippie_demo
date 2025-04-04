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
  
 // Fetch and display menu from menu.json
 fetch("menu.json")
 .then(response => {
     if (!response.ok) {
         throw new Error("Network response was not ok");
     }
     return response.json();
 })
 .then(menu => {
     const menuList = document.getElementById("menu-list");
     menuList.innerHTML = ""; // Clear any placeholder content

     // Loop through menu items
     menu.forEach((item, index) => {
         const li = document.createElement("li");

         // Add image and tags for the first item only (index === 0)
         if (index === 0) {
             const tags = ["Keto", "High Protein"]; // Hardcoded tags for Jerk Chicken Dinner
             li.innerHTML = `
                 <div class="menu-item-container">
                     <img src="jerk_chicken.jpg" alt="${item.name}" class="menu-image">
                     <div class="menu-text">
                         <strong>${item.name}</strong>: ${item.description || "No description available"}
                         <div class="tags">
                             ${tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}
                         </div>
                     </div>
                 </div>
             `;
         } else {
             li.innerHTML = `<strong>${item.name}</strong>: ${item.description || "No description available"}`;
         }

         // Add buttons and containers for the first item only (index === 0)
         if (index === 0) {
             // Ingredients button
             const ingredientsButton = document.createElement("button");
             ingredientsButton.textContent = "Show Ingredients";
             ingredientsButton.style.marginTop = "5px";
             ingredientsButton.style.marginRight = "10px";

             // Nutrition button
             const nutritionButton = document.createElement("button");
             nutritionButton.textContent = "Show Nutrition";
             nutritionButton.style.marginTop = "5px";

             // Ingredients container
             const ingredientsDiv = document.createElement("div");
             ingredientsDiv.id = "ingredients-list";
             ingredientsDiv.style.display = "none";
             ingredientsDiv.innerHTML = "<p>Loading ingredients...</p>";

             // Nutrition container
             const nutritionDiv = document.createElement("div");
             nutritionDiv.id = "nutrition-list";
             nutritionDiv.style.display = "none";
             nutritionDiv.innerHTML = "<p>Loading nutrition...</p>";

             // Append buttons and containers
             li.appendChild(ingredientsButton);
             li.appendChild(nutritionButton);
             li.appendChild(ingredientsDiv);
             li.appendChild(nutritionDiv);

             // Ingredients button click event
             ingredientsButton.addEventListener("click", () => {
                 if (ingredientsDiv.style.display === "none") {
                     if (ingredientsDiv.innerHTML === "<p>Loading ingredients...</p>") {
                         fetch("jerk_chicken_ingredients.json")
                             .then(response => {
                                 if (!response.ok) {
                                     throw new Error("Failed to load ingredients");
                                 }
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

             // Nutrition button click event
             nutritionButton.addEventListener("click", () => {
                 if (nutritionDiv.style.display === "none") {
                     if (nutritionDiv.innerHTML === "<p>Loading nutrition...</p>") {
                         fetch("jerk_chicken_ingredients.json")
                             .then(response => {
                                 if (!response.ok) {
                                     throw new Error("Failed to load ingredients");
                                 }
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
 })
 .catch(error => {
     console.error("Error fetching menu:", error);
     document.getElementById("menu-list").innerHTML = "<li>Failed to load menu</li>";
 });
}