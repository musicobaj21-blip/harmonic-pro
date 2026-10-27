with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

bad_start = """                       >
                           {
                    if (track.type !== 'audio') {"""

idx = content.find(bad_start)
if idx != -1:
    end_str = """                  title={track.type !== 'audio' ? "Doble clic para abrir el Piano Roll" : ""}
                >
"""
    end_idx = content.find(end_str, idx)
    if end_idx != -1:
        end_idx += len(end_str)
        
        new_content = content[:idx] + "                       >\n" + content[end_idx:]
        with open('src/components/MidiStudio.tsx', 'w') as f:
            f.write(new_content)
        print("Fixed inner canvas extraction.")
    else:
        print("End str not found")
else:
    print("Bad start not found")

