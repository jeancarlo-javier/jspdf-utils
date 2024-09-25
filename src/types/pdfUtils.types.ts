import type { jsPDF } from 'jspdf'

export interface BlockContextBase {
  id: string
  x?: number
  y?: number
  numberOfElements: number
  cursorYPosition: number
  maxWidth?: number
  paddingHorizontal: number
  paddingVertical: number
  pageContext?: PageContextBase
  resetCursorYPosition(): void
}

// Offsets
export interface XOffsetOptions {
  leftOffset?: number
  rightOffset?: number
}

export interface YOffsetOptions {
  topOffset?: number
  bottomOffset?: number
}

interface Offsets extends XOffsetOptions, YOffsetOptions {}

interface MarginOptions extends Offsets {
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
}

// Base Element Options
export interface BaseElementOptions extends Offsets, MarginOptions {
  x?: number
  y?: number
  maxWidth?: number
  // Offsets - Moves the element position up, down, left or right
}

// Custom Text Options
export interface BaseTextOptions extends BaseElementOptions {
  fontSize?: number
  fontWeight?: number | string
  fontStyle?: 'normal' | 'italic' | 'oblique'
  fontFamily?: string
  textCenter?: boolean
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number
  center?: boolean
}

export interface BaseLineOptions extends BaseElementOptions {
  center?: boolean
}

export interface BaseListOptions extends BaseTextOptions {
  ordered?: boolean
  bulletType?: string
  numberStyle?: 'decimal' | 'roman' | 'alpha'
  itemIndent?: number
}

export interface PageContextBase {
  numberOfPages: number
  padding?: number
  paddingVertical?: number
  paddingHorizontal?: number
  addPage(doc: jsPDF): void
}
