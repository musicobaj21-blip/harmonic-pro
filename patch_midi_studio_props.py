import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# Replace VirtualKeyboard props
content = content.replace('onNotePlay={(note)', 'onNoteOn={(note)')
content = content.replace('onNoteStop={(note)', 'onNoteOff={(note)')

# Replace ExportModal props
export_modal_old = """        {showExportModal && (
          <ExportModal 
            onClose={() => setShowExportModal(false)}
            tracks={tracks}
            bpm={bpm}
            exportRange={{ start: 0, end: null, active: false }}
          />
        )}"""

export_modal_new = """        {showExportModal && (
          <ExportModal 
            onClose={() => setShowExportModal(false)}
            tracks={tracks}
            bpm={bpm}
            masterFx={null}
            exportRange={{ start: 0, end: null, active: false }}
          />
        )}"""

content = content.replace(export_modal_old, export_modal_new)

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content)

print("Patched props.")
