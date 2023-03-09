import { app } from 'electron';
import fs from 'fs';
import OHPKM from '../types/PKM/OHPKM';
import { getMonFileIdentifier } from '../types/PKM/util';
import { bytesToPKM } from '../util/FileImport';

export default function writePKMToFile(bytes: Uint8Array) {
  const mon = bytesToPKM(bytes, 'OHPKM') as OHPKM;
  const appDataPath = app.getPath('appData');
  const fileName = getMonFileIdentifier(mon);
  fs.writeFileSync(
    `${appDataPath}/OpenHome/storage/mons/${fileName}.ohpkm`,
    mon.bytes
  );
}

export function deleteOHPKMFile(fileName: string) {
  const appDataPath = app.getPath('appData');
  fs.unlinkSync(`${appDataPath}/OpenHome/storage/mons/${fileName}.ohpkm`);
}
