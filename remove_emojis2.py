import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# Emojis are usually in the higher unicode planes
# Let's target some common ranges
emoji_pattern = re.compile(
    u"(\ud83d[\ude00-\ude4f])|"  # emoticons
    u"(\ud83c[\udf00-\uffff])|"  # symbols & pictographs (1 of 2)
    u"(\ud83d[\u0000-\uddff])|"  # symbols & pictographs (2 of 2)
    u"(\ud83d[\ude80-\udeff])|"  # transport & map symbols
    u"(\ud83c[\udde0-\uddff])"  # flags (iOS)
    "+", flags=re.UNICODE)

new_content = emoji_pattern.sub(r'', content)

# Let's also just look manually by dumping anything above \u2000 that isn't a common accent or quote
def print_suspicious():
    for i, c in enumerate(content):
        if ord(c) > 0x2000 and ord(c) not in [0x201C, 0x201D, 0x2018, 0x2019, 0x25CF]: # Exclude quotes and ●
            print(f"Suspicious char at index {i}: {c} (code {ord(c)})")

print_suspicious()

if content != new_content:
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(new_content)
    print("Emojis removed")
else:
    print("No emojis found")
