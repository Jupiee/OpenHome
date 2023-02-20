import { GameOfOrigin } from '../consts/GameOfOrigin';
import { Gen2Items } from '../consts/Items';
import { MONS_LIST } from '../consts/Mons';
import { getMetLocation } from '../renderer/MetLocation/MetLocation';
import {
  bytesToUint16BigEndian,
  bytesToUint24BigEndian,
  getFlag,
  setFlag,
  uint16ToBytesBigEndian,
  uint24ToBytesBigEndian,
} from '../util/ByteLogic';
import { getLevelGen12 } from '../util/StatCalc';
import {
  G1_TERMINATOR,
  GBStringDict,
  gen12StringToUTF,
} from '../util/Strings/StringConverter';
import { pkm, statsPreSplit } from './pkm';
import { dvsFromIVs, generateDVs } from './util';

const GEN2_MOVE_MAX = 251;

export class PK2 extends pkm {
  public get format() {
    return 'pk2';
  }
  public get dexNum() {
    return this.bytes[0x00];
  }

  public set dexNum(value: number) {
    this.bytes[0x00] = value;
  }
  public get heldItemIndex() {
    return this.bytes[0x01];
  }

  public set heldItemIndex(value: number) {
    this.bytes[0x01] = value;
  }

  public get heldItem() {
    return Gen2Items[this.heldItemIndex];
  }

  public set heldItem(value: string) {
    const itemIndex = Gen2Items.indexOf(value);
    if (itemIndex > -1) {
      this.heldItemIndex = itemIndex;
    }
  }

  public get trainerID() {
    return bytesToUint16BigEndian(this.bytes, 0x06);
  }

  public set trainerID(value: number) {
    this.bytes.set(uint16ToBytesBigEndian(value), 0x06);
  }

  public get displayID() {
    return this.trainerID;
  }

  public get gender() {
    let maleRatio =
      MONS_LIST[this.dexNum].formes[0].genderRatio.M > 0 ||
      MONS_LIST[this.dexNum].formes[0].genderRatio.F > 0
        ? MONS_LIST[this.dexNum].formes[0].genderRatio.M
        : -1;
    return maleRatio === -1 ? 2 : this.dvs.atk < maleRatio * 15 ? 1 : 0;
  }

  public get formNum() {
    if (this.dexNum === 201) {
      let ivCombinationVal = ((this.dvs.atk >> 1) & 0b11) << 6;
      ivCombinationVal += ((this.dvs.def >> 1) & 0b11) << 4;
      ivCombinationVal += ((this.dvs.spe >> 1) & 0b11) << 2;
      ivCombinationVal += (this.dvs.spc >> 1) & 0b11;
      ivCombinationVal /= 10;
      return Math.floor(ivCombinationVal);
    } else {
      return 0;
    }
  }

  public get exp() {
    return bytesToUint24BigEndian(this.bytes, 0x08);
  }

  public set exp(value: number) {
    this.bytes.set(uint24ToBytesBigEndian(value), 0x08);
  }

  public get level() {
    return this.bytes[0x1f];
  }

  public set level(value: number) {
    this.bytes[0x1f] = value;
  }

  public get moves() {
    return [
      this.bytes[0x02],
      this.bytes[0x03],
      this.bytes[0x04],
      this.bytes[0x05],
    ];
  }

  public set moves(value: [number, number, number, number]) {
    for (let i = 0; i < 4; i++) {
      this.bytes[0x02 + i] = value[i];
    }
  }

  public get evsG12() {
    return {
      hp: bytesToUint16BigEndian(this.bytes, 0x0b),
      atk: bytesToUint16BigEndian(this.bytes, 0x0d),
      def: bytesToUint16BigEndian(this.bytes, 0x0f),
      spe: bytesToUint16BigEndian(this.bytes, 0x11),
      spc: bytesToUint16BigEndian(this.bytes, 0x13),
    };
  }

  public set evsG12(value: statsPreSplit) {
    this.bytes.set(uint16ToBytesBigEndian(value.hp), 0x0b);
    this.bytes.set(uint16ToBytesBigEndian(value.atk), 0x0d);
    this.bytes.set(uint16ToBytesBigEndian(value.def), 0x0f);
    this.bytes.set(uint16ToBytesBigEndian(value.spe), 0x11);
    this.bytes.set(uint16ToBytesBigEndian(value.spc), 0x13);
  }

  public get dvs() {
    let dvBytes = bytesToUint16BigEndian(this.bytes, 0x15);
    return {
      spc: dvBytes & 0x0f,
      spe: (dvBytes >> 4) & 0x0f,
      def: (dvBytes >> 8) & 0x0f,
      atk: (dvBytes >> 12) & 0x0f,
      hp:
        (((dvBytes >> 12) & 1) << 3) |
        (((dvBytes >> 8) & 1) << 2) |
        (((dvBytes >> 4) & 1) << 1) |
        (dvBytes & 1),
    };
  }

  public set dvs(value: statsPreSplit) {
    let dvBytes = value.atk & 0x0f;
    dvBytes = (dvBytes << 4) | (value.def & 0x0f);
    dvBytes = (dvBytes << 4) | (value.spe & 0x0f);
    dvBytes = (dvBytes << 4) | (value.spc & 0x0f);
    this.bytes.set(uint16ToBytesBigEndian(dvBytes), 0x15);
  }

  public get movePP() {
    return [
      this.bytes[0x17],
      this.bytes[0x18],
      this.bytes[0x19],
      this.bytes[0x1a],
    ];
  }

  public set movePP(value: [number, number, number, number]) {
    for (let i = 0; i < 4; i++) {
      this.bytes[0x17 + i] = value[i];
    }
  }

  public get trainerFriendship() {
    return this.isEgg ? 0 : this.bytes[0x1b];
  }

  public set trainerFriendship(value: number) {
    if (!this.isEgg) {
      this.bytes[0x1b] = value;
    }
  }

  public get pokerusByte() {
    return this.bytes[0x1c];
  }

  public set pokerusByte(value: number) {
    this.bytes[0x1c] = value;
  }

  public get metLocationIndex() {
    return this.bytes[0x1e] & 0x7f;
  }

  public set metLocationIndex(value: number | undefined) {
    if (value) {
      this.bytes[0x1e] = (this.bytes[0x1e] & 0x10) | (value & 0x7f);
    } else {
      this.bytes[0x1e] = this.bytes[0x1e] & 0x10;
    }
  }

  public get metLocation() {
    if (this.metLocationIndex) {
      return (
        getMetLocation(this.gameOfOrigin, this.metLocationIndex) ??
        this.metLocationIndex.toString()
      );
    }
  }

  public get metLevel() {
    return (this.bytes[0x1d] & 0x3f) > 0 ? this.bytes[0x1d] & 0x3f : undefined;
  }

  public set metLevel(value: number | undefined) {
    if (value) {
      this.bytes[0x1d] = (this.bytes[0x1d] & 0xc0) | (value & 0x3f);
    } else {
      this.bytes[0x1d] = this.bytes[0x1d] & 0xc0;
    }
  }

  public get trainerGender() {
    return getFlag(this.bytes, 0x1d, 7) ? 1 : 0;
  }

  public set trainerGender(value: number) {
    setFlag(this.bytes, 0x1d, 7, !!value);
  }

  public get isEgg() {
    return getFlag(this.bytes, 0x48, 30);
  }

  public set isEgg(value: boolean) {
    setFlag(this.bytes, 0x48, 30, value);
    // handle egg name byte
    this.bytes[0x13] = 0x2 | (value ? 0x4 : 0);
  }

  public get isShiny() {
    return (
      this.dvs.spe === 10 &&
      this.dvs.def === 10 &&
      this.dvs.spc === 10 &&
      [2, 3, 6, 7, 10, 11, 14, 15].includes(this.dvs.atk)
    );
  }

  constructor(...args: any[]) {
    if (args[0] instanceof Uint8Array) {
      super(args[0]);
      const bytes = args[0];
      this.trainerName = gen12StringToUTF(this.bytes, 0x30, 11);
      this.nickname = gen12StringToUTF(this.bytes, 0x3b, 11);
      this.gameOfOrigin =
        this.metLocationIndex === 0 ? GameOfOrigin.Gold : GameOfOrigin.Crystal;
    } else if (args[0] instanceof pkm) {
      super(new Uint8Array(32));
      const other = args[0];
      this.dexNum = other.dexNum;
      this.heldItem = other.heldItem;
      // treated as a tracking number for non-GB origin mons
      if (!other.isGameBoy && other.personalityValue) {
        this.trainerID = other.personalityValue % 0xffff;
      } else {
        this.trainerID = other.trainerID;
      }
      this.exp = other.exp;
      this.level = this.dexNum > 0 ? getLevelGen12(this.dexNum, this.exp) : 0;
      this.pokerusByte = other.pokerusByte;
      const validMoves = other.moves.filter((move) => move <= GEN2_MOVE_MAX);
      this.moves = [
        validMoves[0] ?? 0,
        validMoves[1] ?? 0,
        validMoves[2] ?? 0,
        validMoves[3] ?? 0,
      ];
      this.movePP = other.movePP;
      if (other.ivs) {
        this.dvs = dvsFromIVs(other.ivs, other.isShiny);
      } else if (other.dvs) {
        this.dvs = other.dvs;
      } else {
        this.dvs = generateDVs(other.isShiny);
      }
      this.nickname = other.nickname;
      console.log(this.nickname);
      this.isEgg = other.isEgg;
      this.trainerName = other.trainerName;
      this.trainerFriendship = other.trainerFriendship;
      this.metLevel = other.metLevel;
      console.log(other);
      this.trainerGender = other.trainerGender;
    }
  }
}
