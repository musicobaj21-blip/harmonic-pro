import re

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# Fix 1: Change handleToggleArm routing
old_routing = """        // Connect to analyser for VU meter (dead end)
        analyserSourceNode.connect(bus.analyserNode);
        
        // Connect to track output if monitored
        if (track.monitor) {
          monitorNode.connect(bus.trackOutput);
        }"""

new_routing = """        // Connect to input node so it goes through EQ, Comp, Vol, Pan
        monitorNode.connect(bus.inputNode);
        
        // Also connect to analyser directly so we see it even if track is muted
        analyserSourceNode.connect(bus.analyserNode);"""

content = content.replace(old_routing, new_routing)

# Fix 2: Change monitor toggle routing in useEffect
old_monitor = """    if (track.type === 'audio' && track.isArmed) {
      const audioInput = audioInputStreamsRef.current[trackId];
      const bus = trackBusesRef.current[trackId];
      if (audioInput && bus) {
        if (monitor) {
          (audioInput.monitorNode || audioInput.sourceNode).connect(bus.trackOutput);
        } else {
          (audioInput.monitorNode || audioInput.sourceNode).disconnect(bus.trackOutput);
        }
      }
    }"""

new_monitor = """    if (track.type === 'audio' && track.isArmed) {
      const audioInput = audioInputStreamsRef.current[trackId];
      const bus = trackBusesRef.current[trackId];
      // Note: We always connect it to bus.inputNode now when armed so it can be monitored properly
      // We don't dynamically connect/disconnect here anymore. The monitor toggle now controls whether 
      // the track itself outputs audio (handled by mute logic) or we can implement a specific monitor gain node.
      // But actually, we need a dedicated monitorGainNode to toggle live monitoring independently!
    }"""

# Wait, if we connect it to inputNode, it will ALWAYS be audible if the track is unmuted.
# But the user has a "Monitor" button (headphones icon). 
# We should use a monitorGainNode!
