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

import type { BaseTextOptions } from '../../types/pdfUtils.types'
import BlockContext from '../../types/blockContext'
import type { jsPDF } from 'jspdf'

/**
 * Adds a block of text to the PDF document, adjusting positions and applying formatting options.
 *
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The context of the current block in the PDF document.
 * @param {string} text - The text content to add to the document.
 * @param {BaseTextOptions} [options={}] - The options for text formatting (e.g., font size, alignment).
 */
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

  // Set the font of the document according to the provided options.
  setDocumentFont(doc, fontFamily, fontStyle, fontWeight, fontSize)

  // Adjust cursor position if there are already elements in the block.
  if (blockContext.numberOfElements > 0) {
    adjustTextCursorPosition(blockContext)
  }

  // Calculate the maximum width for the text block.
  const elementMaxWidth = getMaxElementWidth(doc, blockContext, maxWidth || 0)

  // Calculate the height of the text block.
  const textHeight = getTextHeight(doc, text, elementMaxWidth || 0, options)

  // Add a new page if the text block exceeds the current page height.
  addNewPageIfNeeded(doc, blockContext, textHeight)

  // Center the text horizontally if the option is set.
  if (textCenter) initialX = centerTextHorizontal(doc, text, options)

  // Calculate the final X and Y positions for the text block.
  initialX = calcXPosition(doc, blockContext, initialX, options, text)
  initialY = calcYPosition(initialY, blockContext, options)

  // Get text settings such as alignment and line height.
  const textSettings = getTextSettings(elementMaxWidth, textAlign, lineHeight)

  // Add the text to the document at the calculated position.
  doc.text(text, initialX, initialY, textSettings)

  // Calculate and update the new cursor Y position after adding the text.
  const cursorYPosition = calcCursorYPosition(blockContext, options, textHeight)
  blockContext.updateCursorYPosition(cursorYPosition)

  // Register the addition of the text block as a new element in the block context.
  blockContext.addElement()

  // Reset the document configuration to the default settings.
  resetDocConfig(doc)
}

export default addText
