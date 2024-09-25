import { calcXPosition, calcYPosition, calcCursorYPosition } from './pdfUtils'
import type { jsPDF } from 'jspdf'
import BlockContext from '../types/blockContext'
import type { BaseLineOptions } from '../types/pdfUtils.types'
import type { TextOptionsLight } from 'jspdf'

/**
 * Sets the document font, style, weight, and size.
 *
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {string} fontFamily - The font family to use.
 * @param {string} fontStyle - The font style (e.g., normal, italic).
 * @param {string | number} fontWeight - The font weight (e.g., normal, bold).
 * @param {number} fontSize - The font size.
 */
export function setDocumentFont(
  doc: jsPDF,
  fontFamily: string,
  fontStyle: string,
  fontWeight: string | number,
  fontSize: number
): void {
  doc.setFont(fontFamily, fontStyle, fontWeight)
  doc.setFontSize(fontSize)
}

/**
 * Returns the text settings object for rendering text in the document.
 *
 * @param {number} maxWidth - The maximum width for the text block.
 * @param {TextOptionsLight['align']} textAlign - The alignment of the text (e.g., left, center, right).
 * @param {number} lineHeight - The line height factor for the text.
 * @returns {TextOptionsLight} - The settings used to render the text.
 */
export function getTextSettings(
  maxWidth: number,
  textAlign: TextOptionsLight['align'],
  lineHeight: number
): TextOptionsLight {
  return {
    baseline: 'top',
    maxWidth,
    align: textAlign,
    renderingMode: 'fill',
    lineHeightFactor: lineHeight
  }
}

/**
 * Adjusts the text cursor position in the block context by subtracting the padding.
 *
 * @param {BlockContext} blockContext - The context of the current block in the PDF document.
 */
export function adjustTextCursorPosition(blockContext: BlockContext): void {
  blockContext.updateCursorYPosition(blockContext.cursorYPosition - blockContext.paddingVertical)
}

/**
 * Calculates the X position for a line based on the block context and initial X position.
 *
 * @param {jsPDF} doc - The jsPDF document instance.
 * @param {BlockContext} blockContext - The context of the current block in the PDF document.
 * @param {number} initialX - The initial X position.
 * @param {BaseLineOptions} options - Options for the line such as margins and offsets.
 * @returns {number} - The calculated X position for the line.
 */
export function calculateLineXPosition(
  doc: jsPDF,
  blockContext: BlockContext,
  initialX: number,
  options: BaseLineOptions
): number {
  return calcXPosition(doc, blockContext, initialX, options)
}

/**
 * Calculates the Y position for a line based on the block context and initial Y position, including offsets.
 *
 * @param {number} initialY - The initial Y position.
 * @param {BlockContext} blockContext - The context of the current block in the PDF document.
 * @param {object} offsets - Object containing topOffset, bottomOffset, marginTop, and marginBottom.
 * @param {number} [offsets.topOffset] - The top offset for the line.
 * @param {number} [offsets.bottomOffset] - The bottom offset for the line.
 * @param {number} [offsets.marginTop] - The top margin for the line.
 * @param {number} [offsets.marginBottom] - The bottom margin for the line.
 * @returns {number} - The calculated Y position for the line.
 */
export function calculateLineYPosition(
  initialY: number,
  blockContext: BlockContext,
  offsets: {
    topOffset?: number
    bottomOffset?: number
    marginTop?: number
    marginBottom?: number
  }
): number {
  return calcYPosition(initialY, blockContext, offsets)
}

/**
 * Adjusts the line cursor position in the block context based on the Y position and line options.
 *
 * @param {BlockContext} blockContext - The context of the current block in the PDF document.
 * @param {BaseLineOptions} options - Options for the line, including the Y position and other settings.
 */
export function adjustLineCursorPosition(blockContext: BlockContext, options: BaseLineOptions): void {
  blockContext.updateCursorYPosition(calcCursorYPosition(blockContext, options, options.y) + 1)
}
