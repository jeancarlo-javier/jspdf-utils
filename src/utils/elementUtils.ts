import { calcXPosition, calcYPosition, calcCursorYPosition } from './pdfUtils'

import type { jsPDF } from 'jspdf'
import BlockContext from '../types/blockContext'
import type { BaseLineOptions } from '../types/pdfUtils.types'
import type { TextOptionsLight } from 'jspdf'

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

// Text Utilities
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

export function adjustTextCursorPosition(blockContext: BlockContext): void {
  blockContext.updateCursorYPosition(blockContext.cursorYPosition - blockContext.paddingVertical)
}

// Line Utilities
export function calculateLineXPosition(
  doc: jsPDF,
  blockContext: BlockContext,
  initialX: number,
  options: BaseLineOptions
): number {
  return calcXPosition(doc, blockContext, initialX, options)
}

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

export function adjustLineCursorPosition(blockContext: BlockContext, options: BaseLineOptions): void {
  blockContext.updateCursorYPosition(calcCursorYPosition(blockContext, options, options.y) + 1)
}
