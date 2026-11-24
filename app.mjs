import { readFileSync } from 'node:fs'

function analyze({tuning, shape, target, max_capo: maxCapo}) {
  const pitch = n => Number.isInteger(n) && n >= 0 && n < 12;
  if (!Array.isArray(tuning) || !tuning.length || !tuning.every(pitch) ||
      !Array.isArray(shape) || tuning.length !== shape.length ||
      !shape.every(n => n === null || (Number.isInteger(n) && n >= 0 && n <= 36)) ||
      shape.every(n => n === null) || !Array.isArray(target) || !target.length ||
      !target.every(pitch) || !Number.isInteger(maxCapo) || maxCapo < 0 || maxCapo > 24)
    throw Error('Check tuning, frets, target pitches and capo range (0–24)');
  const played = shape.flatMap((fret, string) => fret === null ? [] : [(tuning[string] + fret) % 12]);
  const openShape = [...new Set(played)].sort((a, b) => a - b);
  const desired = new Set(target);
  const capos = [];
  for (let capo = 0; capo <= maxCapo; capo++) {
    if (openShape.length === desired.size && openShape.every(p => desired.has((p + capo) % 12)))
      capos.push(capo);
  }
  return {open_shape: openShape, capos};
}

try {
  if (process.argv.length !== 3) throw new Error('Usage: node app.mjs input.json')
  console.log(JSON.stringify(analyze(JSON.parse(readFileSync(process.argv[2], 'utf8')))))
} catch (error) {
  console.error(error.message)
  process.exitCode = 2
}
