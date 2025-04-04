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

    // Loop through menu items and create list elements
    menu.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item.name}</strong>: ${item.description || "No description available"}`;
        menuList.appendChild(li);
    });
})
.catch(error => {
    console.error("Error fetching menu:", error);
    document.getElementById("menu-list").innerHTML = "<li>Failed to load menu</li>";
});
}