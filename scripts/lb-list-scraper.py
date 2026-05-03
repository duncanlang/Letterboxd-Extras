# A script that scrapes letterboxd lists for the intention of creating the json lists inside the extension /data folder
#
# This script requires beautifulsoup4:
#   pip install requests beautifulsoup4

import requests
from bs4 import BeautifulSoup
import time
import json
import re
import os

def cleanup_bfi_title(title):
    title = title.replace(",", "")
    title = title.replace("Dr.", "Drive")
    title = title.replace("Bldv.", "Boulevard")
    title = title.replace("Neighbour", "Neighbor")
    title = title.replace("Colour", "Color")
    title = title.replace(" USA", " U.S.A.")
    title = title.replace("é", "e")
    title = title.replace(":", "")
    title = title.replace("’", "'")
    title = title.replace("…", "...")
    title = title.replace("  ", " ")
    
    return title.strip().upper()


# Scrape the BFI sight and sound page for the actual ranks
def get_bfi_official_ranks():
    print(f"Calling BFI...")

    output_filename = 'bfi_temp.json'
    if os.path.isfile(output_filename):
        with open(output_filename, 'r') as f:
            rank_map = json.load(f)
            print(f"Loaded existing BFI file.")
            return rank_map

    url = "https://www.bfi.org.uk/sight-and-sound/greatest-films-all-time"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0'}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"BFI Response code: {response.status_code}")
        return None

    soup = BeautifulSoup(response.text, 'html.parser')
    rank_map = {}
    
    # Get all of the movies
    items = soup.select('.PreviewCard__Article-sc-7y1ad6-0.hyIbeV')
    
    for item in items:
        try:
            rank = item.select_one('.ResultsPage__Rank-sc-of10co-1.jBGRuM.PreviewCard__label').text.strip().replace("=","")
            title = item.select_one('h1').text.strip()
            title = cleanup_bfi_title(title)

            if title == "Fear Eats the Soul":
                title = "Ali: Fear Eats the Soul"
            
            # Key format: "CITIZEN KANE"
            rank_map[title.upper()] = int(rank)
        except:
            continue
    
    with open(output_filename, 'w') as f:
        json.dump(rank_map, f)
        
    print(f"Collected BFI.")
            
    return rank_map

# Scrape a letterboxd list
def scrape_letterboxd_list(name, list_url):
    if name == 'bfi':
        official_rank_map = get_bfi_official_ranks()
    else:
        official_rank_map = None

    results = {}
    current_page = 1
    list_index = 1
    
    while True:
        url = f"{list_url}page/{current_page}/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0'}
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Response code: {response.status_code}")
            break # End of list
        
        print(f"Scraping page {current_page}...")
            
        soup = BeautifulSoup(response.text, 'html.parser')
        posters = soup.select('ul.poster-list li.posteritem.numbered-list-item div.react-component')
        
        if not posters:
            break
            
        for p in posters:
            # Get the Letterboxd Slug
            slug = p.get('data-item-slug')

            rank = 0
            
            if official_rank_map: 
                # Get Title and Year for cross-referencing BFI
                full_name = p.get('data-item-name') # e.g. "Citizen Kane (1941)"
                full_name = re.search(r"^(.+) \(\d{4}\)$", full_name).group(1) # e.g. "Citizen Kane"
                full_name = cleanup_bfi_title(full_name)
                
                # Determine Rank
                if full_name in official_rank_map:
                    rank = official_rank_map[full_name]
                else:
                    rank = 0
                    print(f"Did NOT cross-reference from BFI: {full_name}")

            else:
                rank = list_index # For any other rankings other than BFI
            
            results[slug] = {
                "rank": rank,
                "index": list_index
            }
            list_index += 1
            
        current_page += 1
        time.sleep(20) # Be nice to Letterboxd servers
        
    print(f"Finished scraping. Outputting...")

    with open(name + '_ranking.json', 'w') as f:
        json.dump(results, f)        

    print(f"Done.")

# --- HOW TO RUN ---
#scrape_letterboxd_list('bfi', 'https://letterboxd.com/bfi/list/sight-and-sounds-greatest-films-of-all-time/')
scrape_letterboxd_list('tspdt', 'https://letterboxd.com/thisisdrew/list/they-shoot-pictures-dont-they-1000-greatest-7/')