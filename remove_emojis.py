import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# simple check for common emojis
import emoji

new_content = emoji.replace_emoji(content, replace='')

if content != new_content:
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(new_content)
    print("Emojis removed")
else:
    print("No emojis found")
