import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "const timelineScrollRef = React.useRef<HTMLDivElement>(null);" in line:
        continue # skip the new one, since we added it in our block
    if "export default MidiStudio;" in line:
        # keep only one
        continue
    new_lines.append(line)

new_lines.append("export default MidiStudio;\n")

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.writelines(new_lines)
