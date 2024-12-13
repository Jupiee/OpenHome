import { useDraggable } from '@dnd-kit/core'
import { Button, Card, Grid, Modal, ModalDialog, Stack } from '@mui/joy'
import lodash from 'lodash'
import { GameOfOriginData } from 'pokemon-resources'
import { useCallback, useContext, useMemo, useState } from 'react'
import { MdClose } from 'react-icons/md'
import { MenuIcon } from 'src/components/Icons'
import AttributeRow from 'src/pokemon/AttributeRow'
import { MouseContext } from 'src/state/mouse'
import { MonLocation, MonWithLocation, OpenSavesContext } from 'src/state/openSaves'
import { PKMInterface } from 'src/types/interfaces'
import { InfoGrid } from '../../components/InfoGrid'
import ArrowButton from './ArrowButton'
import BoxCell from './BoxCell'

interface OpenSaveDisplayProps {
  saveIndex: number
  setSelectedMon: (_: PKMInterface | undefined) => void
}

const OpenSaveDisplay = (props: OpenSaveDisplayProps) => {
  const [, openSavesDispatch, openSaves] = useContext(OpenSavesContext)
  const [mouseState, mouseDispatch] = useContext(MouseContext)
  const [detailsModal, setDetailsModal] = useState(false)
  const { saveIndex, setSelectedMon } = props
  const save = openSaves[saveIndex]
  const { active } = useDraggable({ id: '' })

  const dispatchStartDrag = useCallback(
    (boxPos: number) => {
      const mon = save.getCurrentBox().pokemon[boxPos]

      if (mon) {
        mouseDispatch({
          type: 'set_drag_source',
          payload: { save, box: save.currentPCBox, boxPos, mon },
        })
      }
    },
    [mouseDispatch, save]
  )

  const dispatchCompleteDrag = useCallback(
    (boxPosition: number) => {
      mouseState.dragSource &&
        openSavesDispatch({
          type: 'move_mon',
          payload: {
            dest: { save, box: save.currentPCBox, boxPos: boxPosition },
            source: mouseState.dragSource,
          },
        })
      mouseDispatch({
        type: 'set_drag_source',
        payload: undefined,
      })
    },
    [mouseDispatch, mouseState.dragSource, openSavesDispatch, save]
  )

  const dispatchImportMons = (mons: PKMInterface[], location: MonLocation) =>
    openSavesDispatch({ type: 'import_mons', payload: { mons, dest: location } })

  const isDisabled = useMemo(() => {
    const dragData = active?.data.current as MonWithLocation | undefined

    if (!dragData || Object.entries(dragData).length === 0) return false

    return !save.supportsMon(dragData.mon.dexNum, dragData.mon.formeNum)
  }, [save, active])

  return save && save.currentPCBox !== undefined ? (
    <Stack style={{ width: '100%' }}>
      <Card style={{ padding: '8px 0px 0px' }}>
        <div className="save-header">
          <Button
            className="save-close-button"
            onClick={() =>
              openSavesDispatch({
                type: 'remove_save',
                payload: save,
              })
            }
            disabled={!!save.updatedBoxSlots.length}
            color="danger"
            size="sm"
          >
            <MdClose />
          </Button>{' '}
          <div
            style={{
              flex: 1,
            }}
          >
            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{save.getGameName()}</div>
            <div style={{ textAlign: 'center' }}>
              {save?.name} ({save?.displayID})
            </div>
          </div>
          <Button
            className="save-menu-button"
            onClick={() => setDetailsModal(true)}
            variant="plain"
            color="neutral"
            size="sm"
          >
            <MenuIcon />
          </Button>
        </div>
      </Card>
      <Card
        className="box-card"
        style={{
          backgroundColor: isDisabled ? '#666' : undefined,
        }}
      >
        <div>
          <Grid container className="box-navigation">
            <Grid xs={4} display="grid" alignItems="center" justifyContent="end">
              <ArrowButton
                onClick={() =>
                  openSavesDispatch({
                    type: 'set_save_box',
                    payload: {
                      boxNum: save.currentPCBox > 0 ? save.currentPCBox - 1 : save.boxes.length - 1,
                      save,
                    },
                  })
                }
                dragID={`arrow_left_${save.tid}_${save.sid}_${save.currentPCBox}`}
                direction="left"
              />
            </Grid>
            <Grid xs={4} className="box-name">
              {save.boxes[save.currentPCBox]?.name}
            </Grid>
            <Grid xs={4} display="grid" alignItems="center" justifyContent="start">
              <ArrowButton
                onClick={() =>
                  openSavesDispatch({
                    type: 'set_save_box',
                    payload: {
                      boxNum: (save.currentPCBox + 1) % save.boxes.length,
                      save,
                    },
                  })
                }
                dragID={`arrow_right_${save.tid}_${save.sid}_${save.currentPCBox}`}
                direction="right"
              />
            </Grid>
          </Grid>
          {lodash.range(save.boxRows).map((row: number) => (
            <Grid container key={`pc_row_${row}`}>
              {lodash.range(save.boxColumns).map((rowIndex: number) => {
                const mon = save.boxes[save.currentPCBox].pokemon[row * save.boxColumns + rowIndex]

                return (
                  <Grid
                    key={`pc_row_${row}_slot_${rowIndex}`}
                    xs={12 / save.boxColumns}
                    style={{ padding: '2px 2px 0px 2px' }}
                  >
                    <BoxCell
                      onClick={() => {
                        setSelectedMon(mon)
                      }}
                      onDragEvent={() => {
                        dispatchStartDrag(row * save.boxColumns + rowIndex)
                      }}
                      dragID={`${save.tid}_${save.sid}_${save.currentPCBox}_${
                        row * save.boxColumns + rowIndex
                      }`}
                      dragData={{
                        box: save.currentPCBox,
                        boxPos: row * save.boxColumns + rowIndex,
                        save,
                      }}
                      disabled={isDisabled}
                      mon={mon}
                      zIndex={5 - row}
                      onDrop={(importedMons) => {
                        if (importedMons) {
                          dispatchImportMons(importedMons, {
                            save,
                            box: save.currentPCBox,
                            boxPos: row * save.boxColumns + rowIndex,
                          })
                        } else {
                          dispatchCompleteDrag(row * save.boxColumns + rowIndex)
                        }
                      }}
                    />
                  </Grid>
                )
              })}
            </Grid>
          ))}
        </div>
      </Card>
      <Modal open={detailsModal} onClose={() => setDetailsModal(false)}>
        <ModalDialog
          sx={{
            minWidth: 800,
            width: '80%',
            maxHeight: 'fit-content',
            height: '95%',
            overflow: 'hidden',
            gap: 0,
          }}
        >
          <AttributeRow label="Game">Pokémon {GameOfOriginData[save.origin]?.name}</AttributeRow>
          <AttributeRow label="Trainer Name">{save.name}</AttributeRow>
          <AttributeRow label="Trainer ID">{save.displayID}</AttributeRow>
          {save.sid && (
            <AttributeRow label="Secret ID">
              <code>0x{save.sid.toString(16)}</code>
            </AttributeRow>
          )}
          <AttributeRow label="File">
            <div style={{ overflowWrap: 'break-word', width: '100%' }}>{save.filePath.raw}</div>
          </AttributeRow>
          {save.fileCreated && (
            <AttributeRow label="File">
              <div style={{ overflowWrap: 'break-word', width: '100%' }}>
                {save.fileCreated.toDateString()}
              </div>
            </AttributeRow>
          )}
          {save.calculateChecksum && (
            <AttributeRow label="Checksum">
              <code>0x{save.calculateChecksum().toString(16)}</code>
            </AttributeRow>
          )}
          {save.getExtraData && <InfoGrid data={save.getExtraData()} />}
        </ModalDialog>
      </Modal>
    </Stack>
  ) : (
    <div />
  )
}

export default OpenSaveDisplay