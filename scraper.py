import requests
from bs4 import BeautifulSoup

def scrape_menu(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers = headers)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        menu_items = []

        # Find all menu item containers
        items = soup.find_all('div', class_='menu-item')

        for item in items:
            # Extract name from menu-title
            name = item.find('div', class_='menu-title')
            name = name.get_text(strip=True) if name else "N/A"

            # Extract description from menu-descr
            desc = item.find('div', class_='menu-descr')
            desc = desc.get_text(strip=True) if desc else "No description available"

            menu_items.append({
                'name': name,
                'description': desc
            })
        
        return menu_items if menu_items else None

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
    except Exception as e:
        print(f"Error occured: {e}")
        return None

if __name__ == "__main__":
    menu_url = "https://www.restaurantji.com/md/silver-spring/negril-the-jamaican-eatery-/menu/"
    menu = scrape_menu(menu_url)

    if menu:
        print("Negril menu items:\n")
        for idx, item in enumerate(menu, 1):
            print(f"{idx}.{item['name']}")
            print(f"    {item['description']}\n")
    else:
        print("Failed to retrieve menu items.")

import json
with open("menu.json", "w") as f:
    json.dump(menu, f, indent=2)

print("Menu saved to menu.json")