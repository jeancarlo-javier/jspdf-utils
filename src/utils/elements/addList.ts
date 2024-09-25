import {
  resetDocConfig,
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
 * @param {BaseListOptions} [options={}] - The options for the list formatting.
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

  // Set the document font based on the options provided.
  setDocumentFont(doc, fontFamily, fontStyle, fontWeight, fontSize)

  // Adjust the cursor position if elements exist.
  if (blockContext.numberOfElements > 0) {
    adjustTextCursorPosition(blockContext)
  }

  // Apply margins and offsets for positioning.
  const adjustedX = initialX
  const adjustedY = initialY

  // Calculate the maximum width for the list elements, factoring in margins and padding.
  const elementMaxWidth =
    getMaxElementWidth(doc, blockContext, maxWidth || 0) - (marginLeft + marginRight + leftOffset + rightOffset)

  // Calculate the initial Y position.
  let yPosition = calcYPosition(adjustedY, blockContext, options)

  // Iterate through the list items and render each one.
  items.forEach((item, index) => {
    // Determine the prefix for ordered lists (decimal, roman, alpha) or bullet for unordered lists.
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

    // Concatenate the prefix and the list item text.
    const listItemText = prefix + item

    // Calculate the height of the text block.
    const textHeight = getTextHeight(doc, listItemText, elementMaxWidth || 0, {
      fontSize,
      lineHeight
    })

    // Add a new page if the current item exceeds the remaining page height.
    addNewPageIfNeeded(doc, blockContext, textHeight)

    // Calculate the X position for the list item.
    let xPosition = calcXPosition(doc, blockContext, adjustedX + itemIndent, options, listItemText)

    // Center the text horizontally if the option is set.
    if (textCenter) {
      xPosition = centerTextHorizontal(doc, listItemText, options)
    }

    // Get additional text settings such as alignment.
    const textSettings = getTextSettings(elementMaxWidth, textAlign, lineHeight)

    // Add the text to the document at the calculated position.
    doc.text(listItemText, xPosition, yPosition, textSettings)

    // Update the Y position for the next item based on the text height and line height.
    yPosition += textHeight * lineHeight

    // Update the block context to reflect the new cursor position.
    blockContext.updateCursorYPosition(yPosition)

    // Increment the element count in the block context.
    blockContext.addElement()
  })

  // Apply bottom margin and offsets after rendering the list.
  blockContext.updateCursorYPosition(blockContext.cursorYPosition + marginBottom + bottomOffset)

  // Reset the document configuration to the default settings.
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
