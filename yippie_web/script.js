let fullMenu = []; // Store full menu for filtering
let restaurantLikes = 0;
let restaurantDislikes = 0;
let menuItemLikes = 0;
let menuItemDislikes = 0;
let uploadedImage = null; // Store uploaded image URL

const gamePrompts = [
    {
        text: "Sally is at a Jamaican restaurant and wants to get a chicken meal. Find a menu item with 'chicken' in the name.",
        check: (item) => item.name.toLowerCase().includes("chicken")
    },
    {
        text: "Mike is looking fo a spicy dish at a Jamaican restaurant. Find a menu item that might be spicy.",
        check: (item) => item.description.toLowerCase().includes("spices") || item.name.toLowerCase().includes("jerk")

    },
    {
        text: "Emma wants a vegetarian option at a Jamaican restaurant. Find a menu item marked as vegetarian.",
        check: (item) => item.description.toLowerCase().includes("vegetarian")
    }
];

const restaurants = [
    {
        id: "1",
        name: "Negril - Silver Spring",
        address: "965 Thayer Ave, Silver Spring, MD",
        lat: 38.9931243,
        lng: -77.0259658,
        menuFile: "menu.json"
    },
    {
        id: "2",
        name: "Taco Bell",
        address: "789 Spice RD, Austin, TX",
        lat: 30.2672,
        lng: -97.7431,
        menuFile: "taco_menu.json"
    },
    {
        id: "3",
        name: "Pizza Hut",
        address: "321 Dough Ave, New York, NY",
        lat: 40.7128,
        lng: -74.0060,
        menuFile: "pizza_menu.json"
    }
];

function initMap() {
    const currentPage = window.location.pathname.includes("restaurant.html") ? "restaurant" :
    window.location.pathname.includes("game.html") ? "game" : "map";
    
    if (currentPage === "map") {
        // Map screen logic
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: { lat: 37.0902, lng: -95.7129 } // Center of the US
        });

        const restaurantList = document.getElementById("restaurant-list");
        restaurants.forEach(restaurant => {
            // Add marker
            const marker = new google.maps.Marker({
                position: { lat: restaurant.lat, lng: restaurant.lng },
                map: map,
                title: restaurant.name
            });

            // Add list item
            const li = document.createElement("li");
            li.textContent = `${restaurant.name} - ${restaurant.address}`;
            li.addEventListener("click", () => {
                window.location.href = `restaurant.html?id=${restaurant.id}`;
            });
            restaurantList.appendChild(li);

            // Click marker to navigate
            marker.addListener("click", () => {
                window.location.href = `restaurant.html?id=${restaurant.id}`;
            });
        });
    } else if (currentPage === "restaurant") {
        // Restaurant screen logic
        const urlParams = new URLSearchParams(window.location.search);
        const restaurantId = urlParams.get("id");
        const restaurant = restaurants.find(r => r.id === restaurantId) || restaurants[0]; // Fallback to Jamaican Delight

        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: { lat: restaurant.lat, lng: restaurant.lng }
        });

        new google.maps.Marker({
            position: { lat: restaurant.lat, lng: restaurant.lng },
            map: map,
            title: restaurant.name
        });

        document.getElementById("restaurant-name").textContent = restaurant.name;
        document.getElementById("restaurant-address").textContent = restaurant.address;

        const restaurantLikeBtn = document.getElementById("restaurant-like");
        const restaurantDislikeBtn = document.getElementById("restaurant-dislike");
        const restaurantLikeCount = document.getElementById("restaurant-like-count");

        restaurantLikeBtn.addEventListener("click", () => {
            restaurantLikes++;
            restaurantLikeCount.textContent = restaurantLikes - restaurantDislikes;
        });

        restaurantDislikeBtn.addEventListener("click", () => {
            restaurantDislikes++;
            restaurantLikeCount.textContent = restaurantLikes - restaurantDislikes;
        });

        const imageTypeSelect = document.getElementById("image-type");
        const otherDescription = document.getElementById("other-description");
        const imageUpload = document.getElementById("image-upload");
        const uploadButton = document.getElementById("upload-button");
        const imagePreview = document.getElementById("image-preview");

        imageTypeSelect.addEventListener("change", () => {
            otherDescription.style.display = imageTypeSelect.value === "other" ? "inline-block" : "none";
        });

        uploadButton.addEventListener("click", () => {
            const file = imageUpload.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedImage = e.target.result;
                    const type = imageTypeSelect.value;
                    const description = type === "other" ? otherDescription.value : type;

                    imagePreview.innerHTML = `<p>Uploaded ${description}:</p><img src="${uploadedImage}" alt="${description}">`;

                    if (type === "food" && fullMenu.length) {
                        fullMenu[0].image = uploadedImage;
                        displayMenu(fullMenu);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                alert("Please select an image to upload.");
            }
        });

        fetch(restaurant.menuFile)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(menu => {
                fullMenu = menu.map(item => ({
                    ...item,
                    tags: item.name === "Jerk Chicken Dinner" ? ["Keto", "High Protein"] : [],
                    nutrition: item.name === "Jerk Chicken Dinner" ? { protein: "35g" } : {},
                    image: item.name === "Jerk Chicken Dinner" ? "jerk_chicken.jpg" : null
                }));
                displayMenu(fullMenu);

                document.getElementById("search-button").addEventListener("click", () => {
                    const query = document.getElementById("search-input").value.trim().toLowerCase();
                    filterMenu(query);
                });

                document.getElementById("search-input").addEventListener("keypress", (e) => {
                    if (e.key === "Enter") filterMenu(document.getElementById("search-input").value.trim().toLowerCase());
                });
            })
            .catch(error => {
                console.error("Error fetching menu:", error);
                document.getElementById("menu-list").innerHTML = "<li>Failed to load menu</li>";
            });
    } else if (currentPage === "game"){
// Game Screen
const prompt = gamePrompts[Math.floor(Math.random() * gamePrompts.length)];
document.getElementById("game-prompt").textContent = prompt.text;

fetch("menu.json")
    .then(response => {
        if(!response.ok) throw new Error("Network response was not ok");
        return response.json();
    })
    .then(menu => {
        fullMenu = menu;
        displayGameMenu(fullMenu, prompt);

        document.getElementById("search-button").addEventListener("click", () => {
            const query = document.getElementById("search-input").value.trim().toLowerCase();
            filterGameMenu(query, prompt);
    });
        document.getElementById("search-input").addEventListener("keypress", (e) => {
            if(e.key === "Enter") filterGameMenu(document.getElementById("search-input").value.trim().toLowerCase(), prompt);

        });
    })
    .catch(error => {
        console.error("Error fetching menu:", error);
        document.getElementById("menu-list").innerHTML = "<li>Failed to load menu</li";

    });    }
    }

function displayMenu(menuItems) {
    const menuList = document.getElementById("menu-list");
    menuList.innerHTML = "";

    menuItems.forEach((item, index) => {
        const li = document.createElement("li");
        const hasImage = index === 0;

        li.innerHTML = hasImage
            ? `
                <div class="menu-item-container">
                    <img src="${item.image || 'jerk_chicken.jpg'}" alt="${item.name}" class="menu-image">
                    <div class="menu-text">
                        <strong>${item.name}</strong>: ${item.description || "No description available"}
                        ${item.tags.length ? `<div class="tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}</div>` : ""}
                        <div class="rating">
                            <button class="like-btn">Like</button>
                            <span class="like-count">${menuItemLikes - menuItemDislikes}</span>
                            <button class="dislike-btn">Dislike</button>
                        </div>
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

            const likeBtn = li.querySelector(".like-btn");
            const dislikeBtn = li.querySelector(".dislike-btn");
            const likeCount = li.querySelector(".like-count");

            likeBtn.addEventListener("click", () => {
                menuItemLikes++;
                likeCount.textContent = menuItemLikes - menuItemDislikes;
            });

            dislikeBtn.addEventListener("click", () => {
                menuItemDislikes++;
                likeCount.textContent = menuItemLikes - menuItemDislikes;
            });

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

function displayGameMenu(menuItems, prompt){
    const menuList = document.getElementById("menu-list");
    menuList.innerHTML = "";

    menuItems.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><strong>${item.name}</strong>: ${item.description || "No description available"}</span>
            <button class ="select-btn">Select</button>
            `;
        const selectBtn = li.querySelector(".select-btn");
        selectBtn.addEventListener("click", () => {
            const feedback = document.getElementById("game-feedback");
            if(prompt.check(item)){
                feedback.textContent = "Correct! Great choice!";
                feedback.className = "success";
            }
            else{
                feedback.textContent = "Oops, that doesn't match the request. Try again!";
                feedback.className = "error";
            }
            feedback.style.display = "block";
        });
        menuList.appendChild(li);
    })
}

function filterMenu(query) {
    const filteredItems = fullMenu.filter(item => {
        if (item.name.toLowerCase().includes(query)) return true;
        if (item.tags.some(tag => tag.toLowerCase().includes(query))) return true;
        if (item.name === "Jerk Chicken Dinner") {
            return fetch("jerk_chicken_ingredients.json")
                .then(response => response.json())
                .then(data => data.ingredients.some(ing => ing.toLowerCase().includes(query)))
                .catch(() => false);
        }
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
function initGame(){
   // Game Screen
   const prompt = gamePrompts[Math.floor(Math.random() * gamePrompts.length)];
   document.getElementById("game-prompt").textContent = prompt.text;

   fetch("menu.json")
       .then(response => {
           if(!response.ok) throw new Error("Network response was not ok");
           return response.json();
       })
       .then(menu => {
           fullMenu = menu;
           displayGameMenu(fullMenu, prompt);

           document.getElementById("search-button").addEventListener("click", () => {
               const query = document.getElementById("search-input").value.trim().toLowerCase();
               filterGameMenu(query, prompt);
       });
           document.getElementById("search-input").addEventListener("keypress", (e) => {
               if(e.key === "Enter") filterGameMenu(document.getElementById("search-input").value.trim().toLowerCase(), prompt);

           });
       })
       .catch(error => {
           console.error("Error fetching menu:", error);
           document.getElementById("menu-list").innerHTML = "<li>Failed to load menu</li";

       });
}

function filterGameMenu(query, prompt) {
    const filteredItems = fullMenu.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
    displayGameMenu(filteredItems, prompt);
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