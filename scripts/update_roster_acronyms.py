import os
import json
import re
import unicodedata

def normalize(text):
    if not text: return ""
    # Remove accents and uppercase
    res = "".join(c for c in unicodedata.normalize('NFD', text.upper()) if unicodedata.category(c) != 'Mn')
    return res

def stem(word):
    # Basic stemming: remove trailing S
    res = normalize(word)
    if res.endswith('S'):
        return res[:-1]
    return res

def get_initials(name, roster_name=""):
    if not name:
        return ""
    
    clean_name = re.sub(r'\(.*?\)', '', name).strip()
    if clean_name.startswith("Guerrière "):
        clean_name = clean_name.replace("Guerrière ", "").strip()

    stop_words = ["DES", "LES", "DU", "DE", "LE", "LA", "ET", "D'", "D’", "L'", "L’", "D", "L"]
    
    # Normalize roster words for comparison (remove Final S)
    r_words = re.split(r'[\s\-’\']+', roster_name)
    roster_stems = [stem(w) for w in r_words if len(w) > 2 and normalize(w) not in stop_words]
    
    words = re.split(r'[\s\-’\']+', clean_name)
    
    filtered = []
    for word in words:
        up = normalize(word)
        if not up or up in stop_words:
            continue
        
        s = stem(word)
        # Check if it matches any roster stem
        is_roster_word = False
        for rs in roster_stems:
            if rs.startswith(s) or s.startswith(rs):
                is_roster_word = True
                break
        
        if is_roster_word:
            continue
            
        filtered.append(word)

    if not filtered:
        return normalize(clean_name[:2])
    
    if len(filtered) == 1:
        res = filtered[0][:2] if len(filtered[0]) >= 2 else filtered[0]
        return normalize(res)
    
    res = "".join(word[0] for word in filtered if word)
    return normalize(res)

roster_dir = r"d:\devperso\antigravity\bbfrance\public\data\roster"

for filename in os.listdir(roster_dir):
    if filename.endswith(".json"):
        filepath = os.path.join(roster_dir, filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            roster_name = data.get('name', '')
            print(f"Processing {filename} ({roster_name})...")

            if 'roster' in data:
                for player in data['roster']:
                    if 'name' in player:
                        player['acronym'] = get_initials(player['name'], roster_name)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Done!")
