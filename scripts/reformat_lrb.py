import re

def clean_and_format(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Footer pattern
    footer_pattern = re.compile(r'Blood Bowl – Livre de Règles Bonifiées Saison 3.*http://empireoublie.free.fr –   Page \d+', re.IGNORECASE)
    
    output = []
    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\n')
        
        # Skip footers
        if footer_pattern.search(line):
            output.append(f"\n<!-- {line.strip()} -->\n")
            i += 1
            continue

        # 2-column detection (gutter detection)
        gap_match = re.search(r'(\s{12,})', line)
        if gap_match and 10 < gap_match.start() < 100:
            block_left = []
            block_right = []
            j = i
            gutter_pos = gap_match.start()
            
            while j < len(lines):
                cur = lines[j].rstrip('\n')
                if not cur.strip() or footer_pattern.search(cur):
                    break
                
                # Check for gap within +/- 8 chars of gutter_pos
                found_gutter = False
                for offset in range(-8, 9):
                    p = gutter_pos + offset
                    if p > 5 and len(cur) > p + 4 and cur[p:p+4].isspace():
                        block_left.append(cur[:p].rstrip())
                        block_right.append(cur[p:].lstrip())
                        found_gutter = True
                        break
                
                if not found_gutter:
                    if len(cur) <= gutter_pos + 4:
                        block_left.append(cur.strip())
                        block_right.append("")
                    else:
                        break
                j += 1
            
            if len(block_left) > 1:
                output.append("\n" + "\n".join([l for l in block_left if l]) + "\n")
                if any(block_right):
                    output.append("\n> [!NOTE] SIDEBAR\n> " + "\n> ".join([l for l in block_right if l]) + "\n")
                i = j
                continue

        output.append(line)
        i += 1

    # Second pass: Markdown headers and Tables
    final = []
    in_table = False
    table_headers = []
    
    k = 0
    while k < len(output):
        line = output[k].strip()
        
        # Headers
        if line.isupper() and len(line) > 5 and not line.startswith("QTE") and not line.startswith("ANNÉE"):
            final.append(f"\n## {line}\n")
        elif line.startswith("LE SAVIEZ-VOUS…"):
            final.append(f"\n> [!TIP] {line}")
            # Try to grab next lines as tip
            k += 1
            while k < len(output) and output[k].strip():
                final.append(f"> {output[k].strip()}")
                k += 1
            final.append("\n")
            continue
        elif line.startswith("NdR"):
            final.append(f"\n> [!IMPORTANT] {line}\n")
        elif "QTE" in line and "POSTE" in line:
            # Start of Roster Table
            in_table = True
            headers = ["QTE", "POSTE", "COÛT", "M", "F", "AG", "CP", "AR", "COMPÉTENCES", "P", "S"]
            final.append("\n| " + " | ".join(headers) + " |")
            final.append("|" + "---| " * len(headers) + "|")
        elif in_table and re.match(r'^\d+–\d+', line): # Roster entry
            # Merge following line if it's a continuation of POSTE/COMPETENCES
            parts = re.split(r'\s{2,}', line)
            # This is complex because columns aren't fixed width
            # We'll do a simple heuristic
            final.append("| " + " | ".join(parts) + " |")
        else:
            if not line: in_table = False
            final.append(output[k])
        k += 1

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(final))

if __name__ == "__main__":
    clean_and_format("public/data/docs/lrb_s3.txt", "public/data/docs/lrb_s3.md")
