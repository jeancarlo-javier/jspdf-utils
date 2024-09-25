import {
  resetDocConfig,
  calcCursorYPosition,
  getTextHeight,
  centerTextHorizontal,
  calcXPosition,
  calcYPosition,
  addNewPageIfNeeded,
  getMaxElementWidth
} from '../pdfUtils'
import { setDocumentFont, adjustTextCursorPosition, getTextSettings } from '../elementUtils'

import type {
  BaseTextOptions
  // BaseListOptions
} from '../../types/pdfUtils.types'
import BlockContext from '../../types/blockContext'
import type { jsPDF } from 'jspdf'

function addText(doc: jsPDF, blockContext: BlockContext, text: string, options: BaseTextOptions = {}): void {
  const {
    fontSize = 16,
    fontFamily = 'Helvetica',
    fontStyle = 'normal',
    fontWeight = 400,
    lineHeight = 1.15,
    maxWidth = 0,
    textAlign,
    textCenter
  } = options

  let { x: initialX = 0, y: initialY = 0 } = options

  setDocumentFont(doc, fontFamily, fontStyle, fontWeight, fontSize)

  if (blockContext.numberOfElements > 0) {
    adjustTextCursorPosition(blockContext)
  }

  const elementMaxWidth = getMaxElementWidth(doc, blockContext, maxWidth || 0)

  const textHeight = getTextHeight(doc, text, elementMaxWidth || 0, options)

  // Apply page break before adding text if needed
  addNewPageIfNeeded(doc, blockContext, textHeight)

  if (textCenter) initialX = centerTextHorizontal(doc, text, options)

  initialX = calcXPosition(doc, blockContext, initialX, options, text)
  initialY = calcYPosition(initialY, blockContext, options)

  const textSettings = getTextSettings(elementMaxWidth, textAlign, lineHeight)

  doc.text(text, initialX, initialY, textSettings)

  const cursorYPosition = calcCursorYPosition(blockContext, options, textHeight)

  blockContext.updateCursorYPosition(cursorYPosition)

  blockContext.addElement()

  resetDocConfig(doc)
}

export default addText
