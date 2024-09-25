import { addNewPageIfNeeded, getMaxElementWidth } from '../pdfUtils'
import { calculateLineYPosition, calculateLineXPosition, adjustLineCursorPosition } from '../elementUtils'

import type {
  BaseLineOptions
  // BaseListOptions
} from '../../types/pdfUtils.types'
import BlockContext from '../../types/blockContext'
import type { jsPDF } from 'jspdf'

/**
 * Adds a line element to the PDF document.
 *
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The context object that holds information about the current block and its position.
 * @param {BaseLineOptions} [options={}] - Configuration options for the line, including x, y, width, and margin values.
 */
function addLine(doc: jsPDF, blockContext: BlockContext, options: BaseLineOptions = {}): void {
  const { x: initialX = 0, y: initialY = 0, maxWidth, topOffset, bottomOffset, marginTop } = options

  // Update the cursor position if there are already elements in the block.
  if (blockContext.numberOfElements > 0) {
    blockContext.updateCursorYPosition(blockContext.cursorYPosition - blockContext.paddingVertical)
  }

  // Calculate the X and Y positions for the line based on the current block context and options.
  const x = calculateLineXPosition(doc, blockContext, initialX, options)
  const y = calculateLineYPosition(initialY, blockContext, {
    topOffset,
    bottomOffset,
    marginTop
  })

  // Calculate the second X-coordinate for the end of the line, taking into account the padding and max width.
  const x2 = x + getMaxElementWidth(doc, blockContext, maxWidth) + blockContext.paddingHorizontal * 2

  // Draw the line on the PDF from the starting x and y to the calculated x2 and the same y-coordinate.
  doc.line(x, y, x2, y)

  // Adjust the cursor position for the next element based on the line's dimensions and spacing options.
  adjustLineCursorPosition(blockContext, options)

  // Check if a new page needs to be added based on the current cursor position and the line height.
  addNewPageIfNeeded(doc, blockContext, 1)

  // Register the addition of a new element to the block context.
  blockContext.addElement()
}

export default addLine
