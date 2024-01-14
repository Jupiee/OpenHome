import { Card } from '@mui/material'
import { useMemo } from 'react'
import { getCharacteristic, getMoveMaxPP } from '../../types/PKMTypes/util'
import { hasGen2OnData } from '../../types/interfaces/gen2'
import { hasGen3OnData, hasOrreData } from '../../types/interfaces/gen3'
import { hasGen4OnData } from '../../types/interfaces/gen4'
import { Styles } from '../../types/types'
import Markings from '../components/Markings'
import { getGameLogo, getOriginMark } from '../images/game'
import { getPublicImageURL } from '../images/images'
import { getBallIconPath } from '../images/items'
import MoveCard from './MoveCard'
import { PKM } from '../../types/PKMTypes/PKM'
import { GameOfOriginData, NatureToString } from 'pokemon-resources'
import { RibbonTitles } from 'src/consts'
import { getLocationString } from 'pokemon-resources'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: 'calc(100% - 20px)',
    padding: 10,
  },
  detailsContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    height: 'fit-content',
  },
  language: { padding: '5px 10px 5px 10px', marginLeft: 10 },
  gameContainer: {
    position: 'relative',
    width: 100,
    height: 60,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  gameImage: {
    width: 100,
    height: 60,
    objectFit: 'contain',
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0.6,
  },
  originMark: {
    width: 50,
    height: 50,
    objectFit: 'contain',
    zIndex: 2,
    opacity: 0.8,
  },
  centerFlex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  description: {
    textAlign: 'left',
  },
} as Styles

const metTimesOfDay = ['in the morning', 'during the daytime', 'in the evening']

const MetDataMovesDisplay = (props: { mon: PKM }) => {
  const { mon } = props

  const eggMessage = useMemo(() => {
    if (!hasGen4OnData(mon) || !mon.eggLocationIndex || !mon.eggDate) {
      return undefined
    }
    return `Egg received on ${mon.eggDate.month}/${mon.eggDate.day}/${
      mon.eggDate.year
    } ${getLocationString(mon.gameOfOrigin, mon.eggLocationIndex, mon.format, true)}.`
  }, [mon])

  const metMessage = useMemo(() => {
    if (!hasGen2OnData(mon) || !mon.metLocationIndex) {
      return 'Met location unknown.'
    }
    let message = 'Met'
    if ('metTimeOfDay' in mon && mon.metTimeOfDay) {
      message += ` ${metTimesOfDay[mon.metTimeOfDay - 1]}`
    }
    if (hasGen4OnData(mon)) {
      message += ` on ${mon.metDate.month}/${mon.metDate.day}/${mon.metDate.year}`
    }
    message += ` ${getLocationString(mon.gameOfOrigin, mon.metLocationIndex, mon.format)}`
    if (mon.isFatefulEncounter) {
      message += ', where it met its trainer in a fateful encounter'
    }
    message += '.'
    if (mon.metLevel) {
      message += ` At the time, it was level ${mon.metLevel}.`
    }
    return message
  }, [mon])

  const natureMessage = useMemo(() => {
    if (!hasGen3OnData(mon)) {
      return undefined
    }
    let currentNature = mon.nature
    if ('statNature' in mon) {
      currentNature = mon.statNature
    }
    let message = 'Has a'
    const vowelStart = ['A', 'E', 'I', 'O', 'U'].includes(
      (NatureToString(currentNature) ?? 'Undefined')[0]
    )
    if (vowelStart) {
      message += 'n'
    }
    message += ` ${NatureToString(currentNature)} nature.`
    if ('statNature' in mon && mon.nature !== mon.statNature) {
      message += ` (originally ${NatureToString(mon.statNature)})`
    }
    return message
  }, [mon])

  return (
    <div style={styles.container}>
      <div style={styles.detailsContainer}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {'ball' in mon && mon.ball ? (
              <img
                draggable={false}
                alt="poke ball type"
                style={{ width: 24, height: 24 }}
                src={getPublicImageURL(getBallIconPath(mon.ball))}
              />
            ) : (
              <div />
            )}
            <p style={{ fontWeight: 'bold' }}>
              {mon.nickname}
              {'affixedRibbon' in mon && mon.affixedRibbon
                ? ` ${RibbonTitles[mon.affixedRibbon]}`
                : ''}
            </p>
            <Card sx={styles.language}>{mon.language}</Card>
          </div>
          {eggMessage ? <p style={styles.description}>{eggMessage}</p> : <div />}
          <p style={styles.description}>{metMessage}</p>
          {/* check for undefined because 0 nature is Hardy */}
          {hasGen3OnData(mon) ? (
            <div>
              <p style={styles.description}>{natureMessage}</p>
              <p>{getCharacteristic(mon)}</p>
            </div>
          ) : (
            <div />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
          }}
        >
          <div style={styles.gameContainer}>
            <img
              draggable={false}
              alt={`${GameOfOriginData[mon.gameOfOrigin]?.name} logo`}
              src={getPublicImageURL(
                getGameLogo(
                  mon.gameOfOrigin,
                  mon.dexNum,
                  ('ribbons' in mon && mon.ribbons.includes('National')) ||
                    (hasOrreData(mon) && mon.isShadow)
                ) ?? ''
              )}
              style={styles.gameImage}
            />
            {(GameOfOriginData[mon.gameOfOrigin]?.mark || mon.gameOfOrigin === -1) && (
              <img
                draggable={false}
                alt="origin mark"
                src={getPublicImageURL(
                  getOriginMark(
                    mon.gameOfOrigin === -1 ? 'GB' : GameOfOriginData[mon.gameOfOrigin]?.mark ?? ''
                  )
                )}
                style={styles.originMark}
              />
            )}
          </div>
          {hasGen3OnData(mon) ? <Markings markings={mon.markings} /> : <div />}
        </div>
      </div>
      <div style={styles.centerFlex}>
        <MoveCard
          move={mon.moves[0]}
          movePP={mon.moves[0] ? mon.movePP[0] : undefined}
          maxPP={getMoveMaxPP(mon.moves[0], mon.format, mon.movePPUps[0])}
        />
        <MoveCard
          move={mon.moves[1]}
          movePP={mon.moves[1] ? mon.movePP[1] : undefined}
          maxPP={getMoveMaxPP(mon.moves[1], mon.format, mon.movePPUps[1])}
        />
      </div>
      <div style={styles.centerFlex}>
        <MoveCard
          move={mon.moves[2]}
          movePP={mon.moves[2] ? mon.movePP[2] : undefined}
          maxPP={getMoveMaxPP(mon.moves[2], mon.format, mon.movePPUps[2])}
        />
        <MoveCard
          move={mon.moves[3]}
          movePP={mon.moves[3] ? mon.movePP[3] : undefined}
          maxPP={getMoveMaxPP(mon.moves[3], mon.format, mon.movePPUps[3])}
        />
      </div>
    </div>
  )
}
export default MetDataMovesDisplay
