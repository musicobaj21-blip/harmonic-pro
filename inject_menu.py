with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()
    
with open('track_context_menu.tsx', 'r') as f:
    menu_jsx = f.read()

# Find the last </div> in the content
last_div_idx = content.rfind("</div>")
if last_div_idx != -1:
    new_content = content[:last_div_idx] + menu_jsx + content[last_div_idx:]
    with open('src/components/MidiStudio.tsx', 'w') as f:
        f.write(new_content)
    print("Injected context menu")
else:
    print("Could not find the last div")
