import type { jsPDF } from 'jspdf'
import type { BaseTextOptions, BaseElementOptions } from '../types/pdfUtils.types'
import BlockContext from '../types/blockContext'
import type { TextOptionsLight } from 'jspdf'

/**
 * Returns the width of the current document.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @returns {number} The width of the document in points.
 */
export function getDocWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth()
}

/**
 * Returns the height of the current document.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @returns {number} The height of the document in points.
 */
export function getDocHeight(doc: jsPDF): number {
  return doc.internal.pageSize.getHeight()
}

/**
 * Resets the document configuration (e.g., font and font size).
 * @param {jsPDF} doc - The jsPDF document instance.
 */
export function resetDocConfig(doc: jsPDF): void {
  // doc.setFontSize(16)
  // doc.setFont('Helvetica')
}

/**
 * Gets the top padding of the current page.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @returns {number} The top padding of the page.
 */
export function getPageTopPadding(blockContext: BlockContext): number {
  return blockContext.pageContext.paddingVertical || blockContext.pageContext.padding || 0
}

/**
 * Adds a new page to the document and resets the cursor Y position.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The block context with page settings.
 */
export function addPage(doc: jsPDF, blockContext: BlockContext): void {
  blockContext.pageContext.addPage(doc)
  blockContext.resetCursorYPosition()
}

/**
 * Adds a new page to the document if the element height exceeds the page height.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @param {number} elementHeight - The height of the element to add.
 */
export function addNewPageIfNeeded(doc: jsPDF, blockContext: BlockContext, elementHeight: number): void {
  if (checkIfElementFitsPage(doc, blockContext, elementHeight)) {
    addPage(doc, blockContext)
  }
}

/**
 * Calculates the Y position of the cursor based on the block context and additional height.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @param {BaseElementOptions} [options] - Element options like margin and padding.
 * @param {number} [additionalHeight=0] - Additional height to add to the Y position.
 * @returns {number} The calculated Y position of the cursor.
 */
export function calcCursorYPosition(
  blockContext: BlockContext,
  options?: BaseElementOptions,
  additionalHeight: number = 0
): number {
  let cursorYPosition = blockContext.cursorYPosition

  if (blockContext.numberOfElements === 0) {
    cursorYPosition += blockContext.paddingVertical
  }

  if (options) {
    cursorYPosition += options.marginTop || 0
    cursorYPosition += options.marginBottom || 0
  }

  cursorYPosition += additionalHeight
  cursorYPosition += blockContext.paddingVertical

  return cursorYPosition
}

/**
 * Calculates the Y position of the text cursor based on the block context and text height.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @param {BaseTextOptions} options - Text options like font size and line height.
 * @param {number} maxWidth - Maximum width of the text.
 * @param {string} text - The text content to measure.
 * @returns {number} The calculated Y position of the text cursor.
 */
export function calcCursorYPositionText(
  doc: jsPDF,
  blockContext: BlockContext,
  options: BaseTextOptions,
  maxWidth: number,
  text: string
): number {
  return calcCursorYPosition(blockContext, options, getTextHeight(doc, text, maxWidth, options))
}

/**
 * Calculates the X position for an element or text.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @param {number} x - The base X position.
 * @param {BaseElementOptions | BaseTextOptions} options - Element or text options like margin and alignment.
 * @param {string} [text] - The text content to measure if applicable.
 * @returns {number} The calculated X position.
 */
export function calcXPosition(
  doc: jsPDF,
  blockContext: BlockContext,
  x: number,
  options: BaseElementOptions | BaseTextOptions,
  text?: string
): number {
  const { leftOffset, rightOffset, marginLeft } = options

  let textAlign: TextOptionsLight['align'] = 'left'
  if ('textAlign' in options) {
    textAlign = options.textAlign || 'left'
  }

  // Page Spacing
  if (blockContext.pageContext.paddingHorizontal) {
    x += blockContext.pageContext.paddingHorizontal
  }

  if (blockContext.x) x += blockContext.x
  if (blockContext.paddingHorizontal) x += blockContext.paddingHorizontal
  if (leftOffset) x += leftOffset
  if (rightOffset) x -= rightOffset
  if (marginLeft) x += marginLeft

  if (text) {
    const textWidth = getTextWidth(doc, text, options)
    if (textAlign === 'center') {
      x += textWidth / 2
    } else if (textAlign === 'right') {
      x += textWidth
    }
  }

  return x
}

/**
 * Calculates the Y position for an element.
 * @param {number} y - The base Y position.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @param {BaseElementOptions | BaseTextOptions} options - Element or text options like margin and alignment.
 * @returns {number} The calculated Y position.
 */
export function calcYPosition(
  y: number,
  blockContext: BlockContext,
  options: BaseElementOptions | BaseTextOptions
): number {
  const { topOffset, bottomOffset, marginTop } = options

  if (blockContext.y) y += blockContext.y
  if (blockContext.paddingVertical && blockContext.numberOfElements === 0) {
    y += blockContext.paddingVertical
  }

  if (topOffset) y += topOffset
  if (bottomOffset) y -= bottomOffset
  if (marginTop) y += marginTop

  y += blockContext.cursorYPosition || 0

  if ('lineHeight' in options) {
    const fontSize: number = options.fontSize || 16
    const lineHeight: number = options.lineHeight || 1.15
    y = y + (lineHeight - 1) * fontSize
  }

  return y
}

/**
 * Checks if an element fits on the current page or requires a new page.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @param {number} elementHeight - The height of the element to check.
 * @returns {boolean} `true` if the element exceeds the page height, otherwise `false`.
 */
export function checkIfElementFitsPage(doc: jsPDF, blockContext: BlockContext, elementHeight: number): boolean {
  const { pageContext } = blockContext
  const paddingBottom = pageContext.paddingVertical || pageContext.padding || 0

  return blockContext.cursorYPosition + elementHeight > getDocHeight(doc) - paddingBottom
}

/**
 * Gets the maximum width for an element based on document width and block context.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The block context with page settings.
 * @param {number} [maxWidth] - The maximum width for the element.
 * @returns {number} The calculated maximum width for the element.
 */
export function getMaxElementWidth(doc: jsPDF, blockContext: BlockContext, maxWidth?: number): number {
  const docMaxWidth = getDocWidth(doc)

  let elementMaxWidth = maxWidth || blockContext.maxWidth || docMaxWidth

  if (blockContext.paddingHorizontal) {
    elementMaxWidth -= blockContext.paddingHorizontal * 2
  }

  if (blockContext.pageContext.paddingHorizontal) {
    elementMaxWidth -= blockContext.pageContext.paddingHorizontal * 2
  }

  return elementMaxWidth
}

/**
 * Gets the width of a text string based on its font size and options.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {string} text - The text content to measure.
 * @param {BaseTextOptions} options - Text options like font size and max width.
 * @returns {number} The calculated width of the text.
 */
export function getTextWidth(doc: jsPDF, text: string, options: BaseTextOptions): number {
  const maxWidth = options.maxWidth
  const fontSize = options.fontSize || 16
  const textWidth = (doc.getStringUnitWidth(text) * fontSize) / doc.internal.scaleFactor

  return maxWidth && textWidth > maxWidth ? maxWidth : textWidth
}

/**
 * Gets the height of a text string based on its font size, line height, and maximum width.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {string} text - The text content to measure.
 * @param {number} maxWidth - The maximum width for the text block.
 * @param {BaseTextOptions} options - Text options like font size and line height.
 * @returns {number} The calculated height of the text.
 */
export function getTextHeight(doc: jsPDF, text: string, maxWidth: number, options: BaseTextOptions): number {
  const fontSize = options.fontSize || 16
  const lineHeight = ((options.lineHeight || doc.getLineHeightFactor()) * fontSize) / doc.internal.scaleFactor
  const lines = doc.splitTextToSize(text, maxWidth)
  return lines.length * lineHeight
}

/**
 * Centers text horizontally in the document based on the text width.
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {string} text - The text content to center.
 * @param {BaseTextOptions} options - Text options like font size and max width.
 * @returns {number} The X position at which the text should be placed to be centered.
 */
export function centerTextHorizontal(doc: jsPDF, text: string, options: BaseTextOptions): number {
  const docWidth = getDocWidth(doc)
  const textWidth = getTextWidth(doc, text, options)
  return (docWidth - textWidth) / 2
}

export default {
  getDocWidth,
  getDocHeight,
  resetDocConfig,
  getPageTopPadding,
  addPage,
  addNewPageIfNeeded,
  calcCursorYPosition,
  calcCursorYPositionText,
  calcXPosition,
  calcYPosition,
  checkIfElementFitsPage,
  getMaxElementWidth,
  getTextWidth,
  getTextHeight,
  centerTextHorizontal
}
