import { pk3 } from "../pkm/pk3";
import { SaveType } from "../types/types";
import { gen3StringToUTF } from "../util/Strings/StringConverter";
import {
  bytesToUint16LittleEndian,
  bytesToUint32LittleEndian
} from "../util/utils";
import { Box, SAV } from "./SAV";

export class G3SAV implements SAV {
  static TRAINER_OFFSET = 0x0ff4 * 0;
  static TEAM_ITEMS_OFFSET = 0x0ff4 * 1;
  static PC_OFFSET = 0x0ff4 * 5;
  securityKey: number = 0;
  money: number = -1;
  name: string = "";
  tid: number = 0;
  sid: number = 0;
  sectors: G3Sector[];
  pcDataContiguous: Uint8Array;
  currentPCBox: number;
  boxNames: string[];
  boxes: Array<Box> = Array(14);
  saveType: SaveType;
  constructor(bytes: Uint8Array) {
    this.securityKey = bytesToUint32LittleEndian(bytes, 0xf20);
    this.money = bytesToUint32LittleEndian(bytes, 0x290) ^ this.securityKey;
    this.sectors = [];
    for (let i = 0; i < 14; i++) {
      this.sectors.push(new G3Sector(bytes, i));
      this.sectors.sort(
        (sector1, sector2) => sector1.sectionID - sector2.sectionID
      );
    }
    this.name = gen3StringToUTF(this.sectors[0].data, 0, 10);
    // concatenate pc data from all sectors
    this.pcDataContiguous = new Uint8Array(33744);
    this.sectors.slice(5).forEach((sector, i) => {
      if (i + 5 === 13) {
        this.pcDataContiguous.set(sector.data.slice(0, 2000), i * 3968);
      } else {
        this.pcDataContiguous.set(sector.data, i * 3968);
      }
    });
    this.currentPCBox = this.pcDataContiguous[0];
    this.boxNames = [];
    for (let i = 0; i < 14; i++) {
      this.boxes[i] = new G3Box(
        gen3StringToUTF(this.pcDataContiguous, 0x8344 + i * 9, 10)
      );
    }
    for (let i = 0; i < 420; i++) {
      try {
        let mon = new pk3(
          this.pcDataContiguous.slice(4 + i * 80, 4 + (i + 1) * 80),
          true
        );
        if (mon.gameOfOrigin !== 0 && mon.dexNum !== 0) {
          let box = this.boxes[Math.floor(i / 30)];
          box.pokemon[i % 30] = mon;
        }
      } catch (e) {
        console.log(e);
      }
    }
    switch (bytesToUint32LittleEndian(this.sectors[0].data, 0xac)) {
      case 0:
        this.saveType = SaveType.RS;
        this.money = bytesToUint32LittleEndian(this.sectors[1].data, 0x490);
        break;
      case 1:
        this.saveType = SaveType.FRLG;
        this.securityKey = bytesToUint32LittleEndian(
          this.sectors[0].data,
          0xaf8
        );
        this.money =
          bytesToUint32LittleEndian(this.sectors[1].data, 0x290) ^
          this.securityKey;
        break;
      default:
        this.saveType = SaveType.E;
        this.securityKey = bytesToUint32LittleEndian(
          this.sectors[0].data,
          0xac
        );
        this.money =
          bytesToUint32LittleEndian(this.sectors[1].data, 0x490) ^
          this.securityKey;
        break;
    }
    this.name = gen3StringToUTF(this.sectors[0].data, 0x00, 7);
    this.sid = bytesToUint16LittleEndian(this.sectors[0].data, 0x0a);
    this.tid = bytesToUint16LittleEndian(this.sectors[0].data, 0x0e);
  }
}

export class G3Box implements Box {
  name: string;
  pokemon: Array<pk3> = new Array(30);
  constructor(n: string) {
    this.name = n;
  }
}

export class G3Sector {
  data: Uint8Array;
  sectionID: number;
  checksum: number;
  signature: number;
  saveIndex: number;
  constructor(bytes: Uint8Array, index: number) {
    this.data = bytes.slice(index * 0x1000, index * 0x1000 + 3968);
    this.sectionID = bytesToUint16LittleEndian(bytes, index * 0x1000 + 0xff4);
    this.checksum = bytesToUint16LittleEndian(bytes, index * 0x1000 + 0xff6);
    this.signature = bytesToUint32LittleEndian(bytes, index * 0x1000 + 0xff8);
    this.saveIndex = bytesToUint32LittleEndian(bytes, index * 0x1000 + 0xffc);
  }
  calculateChecksum = () => {
    let checksum = 0;
    let byteLength =
      this.sectionID === 0 ? 3884 : this.sectionID === 13 ? 2000 : 3968;
    for (let i = 0; i < byteLength; i += 4) {
      checksum += bytesToUint32LittleEndian(this.data, i);
      checksum = checksum & 0xffffffff;
    }
    return ((checksum & 0xffff) + ((checksum >> 16) & 0xffff)) & 0xffff;
  };
}
