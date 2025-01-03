import { NationalDex, PokemonData } from 'pokemon-species-data'

import { BLOOD_MOON, SWEETS } from 'src/consts/Formes'
import { PKMInterface } from 'src/types/interfaces'
import { toGen3RRPokemonIndex } from 'src/types/SAVTypes/radicalred/conversion/Gen3RRPokemonIndex'
import { RRSprites } from 'src/types/SAVTypes/radicalred/conversion/RadicalRedSprites'
import { toGen3CRFUPokemonIndex } from '../types/SAVTypes/cfru/conversion/util'
import { NationalDexToUnboundMap } from '../types/SAVTypes/unbound/conversion/UnboundSpeciesMap'
import { UBSprites } from '../types/SAVTypes/unbound/conversion/UnboundSprites'

const alolaDex = [
  10, 11, 12, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 35, 36, 37, 38, 39, 40, 41, 42, 46, 47, 50,
  51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 72, 73, 74, 75, 76, 79,
  80, 81, 82, 86, 87, 88, 89, 90, 91, 92, 93, 94, 96, 97, 102, 103, 104, 105, 108, 113, 115, 118,
  119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137,
  138, 139, 140, 141, 142, 143, 147, 148, 149, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172,
  173, 174, 177, 178, 179, 180, 181, 185, 186, 190, 196, 197, 198, 199, 200, 204, 205, 206, 209,
  210, 212, 214, 215, 222, 223, 224, 225, 226, 227, 228, 229, 233, 235, 238, 239, 240, 241, 242,
  246, 247, 248, 278, 279, 283, 284, 296, 297, 299, 302, 303, 309, 310, 318, 319, 320, 321, 324,
  327, 328, 329, 330, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353,
  354, 357, 359, 361, 362, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 408, 409, 410,
  411, 422, 423, 424, 425, 426, 427, 428, 429, 430, 438, 439, 440, 443, 444, 445, 446, 447, 448,
  456, 457, 458, 461, 462, 463, 466, 467, 470, 471, 474, 476, 478, 506, 507, 508, 524, 525, 526,
  546, 547, 548, 549, 550, 551, 552, 553, 559, 560, 564, 565, 566, 567, 568, 569, 570, 571, 572,
  573, 582, 583, 584, 587, 592, 593, 594, 605, 606, 619, 620, 621, 622, 623, 624, 625, 627, 628,
  629, 630, 636, 637, 661, 662, 663, 667, 668, 669, 670, 671, 674, 675, 676, 686, 687, 690, 691,
  692, 693, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 714, 715, 718,
  722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740,
  741, 742, 743, 744, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754, 755, 756, 757, 758, 759,
  760, 761, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 778,
  779, 780, 781, 782, 783, 784, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797,
  798, 799, 800, 801, 802, 803, 804, 805, 806, 807,
]

export const fileToSpriteFolder: Record<string, string> = {
  PK1: 'gen1',
  PK2: 'gen2',
  PK3: 'gen3',
  COLOPKM: 'gen3gc',
  XDPKM: 'gen3gc',
  PK3RR: 'rr',
  PK3UB: 'rr',
  PK4: 'gen4',
  PK5: 'home',
  PK6: 'gen6',
  PK7: 'gen7',
  PB7: 'home',
  PK8: 'home',
  PA8: 'home',
  PB8: 'home',
  PK9: 'gen9',
  OHPKM: 'home',
}

export const getPokemonSpritePath = (mon: PKMInterface, format?: string) => {
  const monFormat = format ?? mon.format
  let spriteName = PokemonData[mon.dexNum]?.formes[mon.formeNum]?.sprite ?? ''

  if (mon.dexNum === NationalDex.Alcremie) {
    spriteName = `${
      PokemonData[mon.dexNum]?.formes[mon.formeNum]?.formeName?.toLowerCase() ??
      'alcremie-vanilla-cream'
    }-${SWEETS[mon.formArgument ?? 0].toLocaleLowerCase()}`
  }
  let spriteFolder = fileToSpriteFolder[monFormat]

  if (spriteFolder === 'gen7' && !alolaDex.includes(mon.dexNum)) {
    spriteFolder = 'gen6'
  } else if (monFormat === 'PK3RR') {
    if (mon.dexNum === NationalDex.Ursaluna && mon.formeNum === BLOOD_MOON) {
      return 'sprites/home/ursaluna-bloodmoon.png'
    }
    if (mon.dexNum === NationalDex.Terapagos) {
      return 'sprites/home/terapagos-terastal.png'
    }
    let gen3RRname = RRSprites[toGen3RRPokemonIndex(mon.dexNum, mon.formeNum)]

    if (gen3RRname.length === 0) return gen3RRname
    gen3RRname = gen3RRname[0].toUpperCase() + gen3RRname.slice(1).toLowerCase()
    return `sprites/${spriteFolder}/${gen3RRname}`
  } else if (monFormat === 'PK3UB') {
    if (mon.dexNum === NationalDex.Ursaluna && mon.formeNum === BLOOD_MOON) {
      return 'sprites/home/ursaluna-bloodmoon.png'
    }
    let gen3UBname =
      UBSprites[toGen3CRFUPokemonIndex(mon.dexNum, mon.formeNum, NationalDexToUnboundMap)]

    if (gen3UBname.length === 0) return gen3UBname
    gen3UBname = gen3UBname[0].toUpperCase() + gen3UBname.slice(1).toLowerCase()
    return `sprites/${spriteFolder}/${gen3UBname}`
  }
  return `sprites/${spriteFolder}${
    mon.isShiny() && spriteFolder !== 'gen1' && spriteFolder !== 'gen9' ? '/shiny/' : '/'
  }${spriteName}.${spriteFolder === 'gen5' || spriteFolder === 'gen3gc' ? 'gif' : 'png'}`
}
