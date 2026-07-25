// tools/make-mxl-fixture.mjs — builds a real, spec-compliant .mxl (compressed
// MusicXML) fixture from the existing plain .musicxml test file, for testing
// the .mxl upload path end-to-end.
import AdmZip from 'adm-zip';
import { readFileSync, writeFileSync } from 'fs';

const xml = readFileSync(new URL('../test-data/ave-maria-soprano.musicxml', import.meta.url));
const zip = new AdmZip();

const container = `<?xml version="1.0" encoding="UTF-8"?>
<container>
  <rootfiles>
    <rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/>
  </rootfiles>
</container>`;

zip.addFile('META-INF/container.xml', Buffer.from(container, 'utf8'));
zip.addFile('score.musicxml', xml);
zip.writeZip(new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
console.log('wrote test-data/ave-maria-soprano.mxl');
