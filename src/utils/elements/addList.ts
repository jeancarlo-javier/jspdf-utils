import {
  resetDocConfig,
  // calcCursorYPosition,
  getTextHeight,
  centerTextHorizontal,
  calcXPosition,
  calcYPosition,
  addNewPageIfNeeded,
  getMaxElementWidth
} from '../pdfUtils'
import { setDocumentFont, adjustTextCursorPosition, getTextSettings } from '../elementUtils'

import type { BaseListOptions } from '../../types/pdfUtils.types'
import BlockContext from '../../types/blockContext'
import type { jsPDF } from 'jspdf'

/**
 * Adds a list (ordered or unordered) to the PDF document.
 *
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The context of the current block in the PDF document.
 * @param {string[]} items - The array of list items to add.
 * @param {BaseListOptions} options - The options for the list formatting.
 */
function addList(doc: jsPDF, blockContext: BlockContext, items: string[], options: BaseListOptions = {}): void {
  const {
    fontSize = 16,
    fontFamily = 'Helvetica',
    fontStyle = 'normal',
    fontWeight = 400,
    lineHeight = 1.15,
    maxWidth = 0,
    textAlign = 'left',
    textCenter = false,
    ordered = false,
    bulletType = '•',
    numberStyle = 'decimal',
    itemIndent = 10,
    x: initialX = 0,
    y: initialY = 0,
    marginBottom = 0,
    marginLeft = 0,
    marginRight = 0,
    leftOffset = 0,
    rightOffset = 0,
    bottomOffset = 0
  } = options

  if (items.length === 0) {
    return
  }

  setDocumentFont(doc, fontFamily, fontStyle, fontWeight, fontSize)

  if (blockContext.numberOfElements > 0) {
    adjustTextCursorPosition(blockContext)
  }

  // Apply margins and offsets
  const adjustedX = initialX
  const adjustedY = initialY

  const elementMaxWidth =
    getMaxElementWidth(doc, blockContext, maxWidth || 0) - (marginLeft + marginRight + leftOffset + rightOffset)

  let yPosition = calcYPosition(adjustedY, blockContext, options)

  items.forEach((item, index) => {
    // Determine prefix
    let prefix = ''
    if (ordered) {
      if (numberStyle === 'decimal') {
        prefix = `${index + 1}. `
      } else if (numberStyle === 'roman') {
        prefix = `${toRoman(index + 1)}. `
      } else if (numberStyle === 'alpha') {
        prefix = `${String.fromCharCode(97 + index)}. `
      }
    } else {
      prefix = `${bulletType} `
    }

    const listItemText = prefix + item

    // Calculate text height
    const textHeight = getTextHeight(doc, listItemText, elementMaxWidth || 0, {
      fontSize,
      lineHeight
    })

    // Apply page break if needed
    addNewPageIfNeeded(doc, blockContext, textHeight)

    // Calculate positions
    let xPosition = calcXPosition(doc, blockContext, adjustedX + itemIndent, options, listItemText)

    // Center text horizontally if needed
    if (textCenter) {
      xPosition = centerTextHorizontal(doc, listItemText, options)
    }

    // Get text settings
    const textSettings = getTextSettings(elementMaxWidth, textAlign, lineHeight)

    // Add text to the document
    doc.text(listItemText, xPosition, yPosition, textSettings)

    // Update cursorYPosition
    yPosition += textHeight * lineHeight

    // Update the block context cursor position
    blockContext.updateCursorYPosition(yPosition)

    // Increase the number of elements
    blockContext.addElement()
  })

  // Apply bottom margin and offset
  blockContext.updateCursorYPosition(blockContext.cursorYPosition + marginBottom + bottomOffset)

  resetDocConfig(doc)
}

/**
 * Converts a number to Roman numerals.
 *
 * @param {number} num - The number to convert.
 * @returns {string} The Roman numeral representation.
 */
function toRoman(num: number): string {
  const romanNumerals: { [key: number]: string } = {
    1000: 'M',
    900: 'CM',
    500: 'D',
    400: 'CD',
    100: 'C',
    90: 'XC',
    50: 'L',
    40: 'XL',
    10: 'X',
    9: 'IX',
    5: 'V',
    4: 'IV',
    1: 'I'
  }
  let roman = ''
  for (const i of Object.keys(romanNumerals)
    .map(Number)
    .sort((a, b) => b - a)) {
    while (num >= i) {
      roman += romanNumerals[i]
      num -= i
    }
  }
  return roman
}

export default addList
