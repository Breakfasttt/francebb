import re

def parse_roster_line(line):
    stats_match = re.search(r'(\d+)\s+(\d+)\s+([\d-]+\+?)\s+([\d–-]+\+?)\s+([\d-]+\+?)', line)
    if stats_match:
        before = line[:stats_match.start()].strip()
        stats = stats_match.groups()
        after = line[stats_match.end():].strip()
        
        qte_match = re.match(r'^(\d+[–-]\d+)', before)
        qte = qte_match.group(1) if qte_match else ""
        
        cost_match = re.search(r'(\d+k)$', before)
        cost = cost_match.group(1) if cost_match else ""
        
        poste = before
        if qte: poste = poste[len(qte):].strip()
        if cost: poste = poste[:poste.rfind(cost)].strip()
            
        parts_after = re.split(r'\s{2,}', after)
        if len(parts_after) >= 2:
            s_cat = parts_after[-1]
            p_cat = parts_after[-2]
            comp = " ".join(parts_after[:-2])
        else:
            comp = after
            p_cat = ""
            s_cat = ""
            
        return [qte, poste, cost, *stats, comp, p_cat, s_cat]
    return None

def parse_star_player_line(line):
    stats_match = re.search(r'(\d+k)\s+(\d+)\s+(\d+)\s+([\d-]+\+?)\s+([\d–-]+\+?)\s+([\d-]+\+?)', line)
    if stats_match:
        before = line[:stats_match.start()].strip()
        cost, *stats = stats_match.groups()
        after = line[stats_match.end():].strip()
        return [before, cost, *stats, after]
    return None

def fix_all(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(r'Blood Bowl – Livre de Règles Bonifiées Saison 3.*?Page \d+\n?', '', content, flags=re.IGNORECASE)
    sections = re.split(r'\n\s{3,}([A-ZÀ-Ÿ\s!]{5,})\n', content)
    
    formatted_output = []
    
    for i in range(len(sections)):
        section = sections[i]
        if i % 2 == 1: # TITLE
            formatted_output.append(f"\n## {section.strip()}\n")
            continue
        
        if "QTE" in section and "POSTE" in section:
            lines = section.splitlines()
            roster_started = False
            headers = ["QTE", "POSTE", "COÛT", "M", "F", "AG", "CP", "AR", "COMPÉTENCES", "P", "S"]
            
            j = 0
            while j < len(lines):
                line = lines[j]
                if "QTE" in line and "POSTE" in line:
                    formatted_output.append("") 
                    formatted_output.append("| " + " | ".join(headers) + " |")
                    formatted_output.append("| " + " | ".join(["---"] * len(headers)) + " |")
                    roster_started = True
                    j += 1
                    continue
                
                if roster_started:
                    if "Relances :" in line or "Règles spéciales :" in line or (not line.strip()):
                        if line.strip(): formatted_output.append(line.strip())
                        if not line.strip(): roster_started = False
                    else:
                        parsed = parse_roster_line(line)
                        if parsed:
                            while j + 1 < len(lines) and not parse_roster_line(lines[j+1]) and lines[j+1].strip() and "Relances" not in lines[j+1]:
                                parsed[8] += " " + lines[j+1].strip()
                                j += 1
                            formatted_output.append("| " + " | ".join(parsed) + " |")
                else:
                    if line.strip(): formatted_output.append(line.strip())
                j += 1
        elif "Nom" in section and "Compétences" in section and "Coût" in section:
            lines = section.splitlines()
            buffer_stars = []
            other_text = []
            for line in lines:
                if "Nom" in line and "Coût" in line: continue
                parsed = parse_star_player_line(line)
                if parsed:
                    buffer_stars.append("| " + " | ".join(parsed) + " |")
                else:
                    if line.strip(): other_text.append(line.strip())
            
            formatted_output.append("\n| NOM | COÛT | M | F | AG | CP | AR | NOTE |")
            formatted_output.append("| " + " | ".join(["---"] * 8) + " |")
            formatted_output.extend(buffer_stars)
            formatted_output.append("")
            formatted_output.extend(other_text)
        else:
            for l in section.splitlines():
                if l.strip(): formatted_output.append(l.strip())

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(formatted_output))

if __name__ == "__main__":
    fix_all("public/data/docs/lrb_s3.txt", "public/data/docs/lrb_s3.md")
