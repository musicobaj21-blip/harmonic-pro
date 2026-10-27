const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

const INTERVAL_NAMES: Record<number, string> = {
  0: "T",
  1: "b9",
  2: "9",
  3: "3m",
  4: "3M",
  5: "11",
  6: "#11",
  7: "5J",
  8: "b13",
  9: "13",
  10: "7m",
  11: "7M"
};

export function detectChordFromMidi(midiNotes: number[]): { name: string, intervals: string[] } | null {
  if (!midiNotes || midiNotes.length === 0) return null;

  // sort to find the lowest note (bass)
  const sortedNotes = [...midiNotes].sort((a, b) => a - b);
  const bassMidi = sortedNotes[0];
  
  // unique pitch classes
  const pitchClasses = Array.from(new Set(sortedNotes.map(n => n % 12)));
  if (pitchClasses.length < 2) return null; // not a chord

  // for now, assume the bass note is the root for simplicity
  const rootPc = bassMidi % 12;
  const rootName = NOTE_NAMES[rootPc];

  const rawIntervals = pitchClasses.map(pc => (pc - rootPc + 12) % 12);
  const has5J = rawIntervals.includes(7);

  const getOrder = (i: number) => {
    if (i === 0) return 0; // T
    if (i === 3) return 1; // 3m
    if (i === 4) return 2; // 3M
    if (i === 6 && !has5J) return 3; // b5
    if (i === 7) return 4; // 5J
    if (i === 8 && !has5J) return 5; // #5
    if (i === 10) return 6; // 7m
    if (i === 11) return 7; // 7M
    if (i === 1) return 8; // b9
    if (i === 2) return 9; // 9
    if (i === 5) return 10; // 11
    if (i === 6 && has5J) return 11; // #11
    if (i === 8 && has5J) return 12; // b13
    if (i === 9) return 13; // 13
    return 20;
  };

  const intervalsFromRoot = rawIntervals.sort((a, b) => getOrder(a) - getOrder(b));

  // Identify chord quality based on intervals
  const hasb9 = intervalsFromRoot.includes(1);
  const has9 = intervalsFromRoot.includes(2);
  const has3m = intervalsFromRoot.includes(3);
  const has3M = intervalsFromRoot.includes(4);
  const has11 = intervalsFromRoot.includes(5);
  const hasSharp11 = intervalsFromRoot.includes(6); // or b5
  const hasSharp5 = intervalsFromRoot.includes(8); // or b13
  const has13 = intervalsFromRoot.includes(9); // or bb7
  const has7m = intervalsFromRoot.includes(10);
  const has7M = intervalsFromRoot.includes(11);

  // Helper flags
  const has5d = hasSharp11 && !has5J; 
  const has5A = hasSharp5 && !has5J;
  const has7d = has13 && has3m && has5d; // full diminished

  let quality = "";
  let extension = "";

  // Base Triad
  if (has3M && has5A) quality = "aug";
  else if (has3m && has5d) quality = has7m ? "m7b5" : (has7d ? "dim7" : "dim");
  else if (has3m) quality = "m";
  else if (has3M) quality = "";
  else quality = "sus"; 

  // Extensions
  if (has7M) {
    if (has13) extension = "maj13";
    else if (has11) extension = "maj11";
    else if (has9) extension = "maj9";
    else extension = "maj7";
  } else if (has7m && quality !== "m7b5") {
    if (quality === "m") {
      if (has13) extension = "13";
      else if (has11) extension = "11";
      else if (has9) extension = "9";
      else extension = "7";
    } else if (quality === "") {
      if (has13) extension = "13";
      else if (has11) extension = "11";
      else if (has9) extension = "9";
      else extension = "7";
    }
  } else if (!has7M && !has7m && !has7d) {
    if (quality === "m") {
      if (has9) extension = "(add9)";
    } else if (quality === "") {
      if (has9) extension = "(add9)";
    }
  }

  // Combine quality and extension neatly
  if (quality === "m" && ["7", "9", "11", "13"].includes(extension)) {
    quality = "m" + extension;
    extension = "";
  }
  if (quality === "" && ["7", "9", "11", "13", "maj7", "maj9", "maj11", "maj13", "(add9)"].includes(extension)) {
    quality = extension;
    extension = "";
  }
  if (quality === "m" && extension === "(add9)") {
    quality = "m(add9)";
    extension = "";
  }

  // Handle alterations if it's a dominant 7th or maj7
  let altSuffix = "";
  if (quality.includes("7") || quality.includes("9") || quality.includes("11") || quality.includes("13") || quality.includes("maj")) {
    if (hasSharp11) altSuffix += "#11";
    if (hasb9) altSuffix += "b9";
    // if hasSharp5 and it wasn't captured as aug
    if (hasSharp5 && !quality.includes("aug")) altSuffix += "b13"; 
  }

  if (altSuffix.length > 0 && quality !== "dim7" && quality !== "m7b5") {
    if (altSuffix.length > 3) {
      altSuffix = "(" + altSuffix.match(/.{1,3}/g)?.join(",") + ")";
    } else {
      altSuffix = "(" + altSuffix + ")";
    }
  }

  const chordName = `${rootName}${quality}${extension}${altSuffix}`;
  const intervalStrings = intervalsFromRoot.map(i => {
    if (i === 6 && !has5J) return "b5";
    if (i === 8 && !has5J) return "#5";
    return INTERVAL_NAMES[i];
  });

  return {
    name: chordName.replace("()", ""),
    intervals: intervalStrings
  };
}
