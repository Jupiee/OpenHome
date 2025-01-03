import { GameOfOrigin } from 'pokemon-resources'
import { USUM_TRANSFER_RESTRICTIONS } from 'src/consts/TransferRestrictions'
import { isRestricted } from '../TransferRestrictions'
import { G7SAV } from './G7SAV'
import { PathData } from './path'

const PC_OFFSET = 0x05200
const METADATA_OFFSET = 0x6cc00 - 0x200
const PC_CHECKSUM_OFFSET = METADATA_OFFSET + 0x14 + 14 * 8 + 6
const BOX_NAMES_OFFSET: number = 0x04c00
const SAVE_SIZE_BYTES = 0x6cc00

export class USUMSAV extends G7SAV {
  boxNamesOffset: number = BOX_NAMES_OFFSET
  static saveTypeID = 'USUMSAV'

  constructor(path: PathData, bytes: Uint8Array) {
    super(path, bytes, PC_OFFSET, PC_CHECKSUM_OFFSET, BOX_NAMES_OFFSET)
  }

  supportsMon(dexNumber: number, formeNumber: number): boolean {
    return !isRestricted(USUM_TRANSFER_RESTRICTIONS, dexNumber, formeNumber)
  }

  static fileIsSave(bytes: Uint8Array): boolean {
    return bytes.length === SAVE_SIZE_BYTES
  }

  static saveTypeName = 'Pokémon Ultra Sun/Ultra Moon'

  static includesOrigin(origin: GameOfOrigin) {
    return origin === GameOfOrigin.UltraSun || origin === GameOfOrigin.UltraMoon
  }
}
