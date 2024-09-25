import { addNewPageIfNeeded, getMaxElementWidth } from '../pdfUtils'
import { calculateLineYPosition, calculateLineXPosition, adjustLineCursorPosition } from '../elementUtils'

import type {
  BaseLineOptions
  // BaseListOptions
} from '../../types/pdfUtils.types'
import BlockContext from '../../types/blockContext'
import type { jsPDF } from 'jspdf'

function addLine(doc: jsPDF, blockContext: BlockContext, options: BaseLineOptions = {}): void {
  const { x: initialX = 0, y: initialY = 0, maxWidth, topOffset, bottomOffset, marginTop } = options

  if (blockContext.numberOfElements > 0) {
    blockContext.updateCursorYPosition(blockContext.cursorYPosition - blockContext.paddingVertical)
  }

  const x = calculateLineXPosition(doc, blockContext, initialX, options)
  const y = calculateLineYPosition(initialY, blockContext, {
    topOffset,
    bottomOffset,
    marginTop
  })
  // Calculate the x-coordinate for the line element, adding back the horizontal padding to match the text width.
  const x2 = x + getMaxElementWidth(doc, blockContext, maxWidth) + blockContext.paddingHorizontal * 2

  doc.line(x, y, x2, y)

  adjustLineCursorPosition(blockContext, options)

  addNewPageIfNeeded(doc, blockContext, 1)

  blockContext.addElement()
}

export default addLine
