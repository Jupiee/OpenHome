import { app } from 'electron';
import fs from 'fs';
import { bytesToPKM } from '../util/FileImport';
import OHPKM from '../pkm/OHPKM';
import { getMonFileIdentifier } from '../pkm/util';

export default function writePKMToFile(bytes: Uint8Array, format: string) {
  const originalMon = bytesToPKM(bytes, format);
  console.log(originalMon);
  const mon = new OHPKM(originalMon);
  console.log(mon.nickname);
  console.log(mon.bytes);
  const appDataPath = app.getPath('appData');
  const fileName = getMonFileIdentifier(mon)
  fs.writeFileSync(
    `${appDataPath}/open-home/storage/mons/${fileName}.ohpkm`,
    mon.bytes
  );
}
