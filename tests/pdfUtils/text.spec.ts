import { describe, it, expect, beforeEach, vi } from 'vitest'
// import { MontserratRegular } from '../../fonts/montserrat-fonts'
import {
  getDocWidth,
  getTextHeight,
  centerTextHorizontal,
  getTextWidth
} from '../../src/utils/pdfUtils'
import { jsPDF } from 'jspdf'
import type { BaseTextOptions } from '../../src/types/pdfUtils.types'

describe('Text Utilities', () => {
  let doc: jsPDF

  const testText = 'Lorem ipsum dolor sit consectetur.'

  beforeEach(() => {
    doc = new jsPDF({
      filters: ['ASCIIHexEncode'],
      orientation: 'portrait',
      format: 'A4',
      unit: 'px'
    })
  })

  // it('getTextHeight returns the text height with Montserrat and default fonts', () => {
  //   doc.addFileToVFS('Montserrat-Regular.ttf', MontserratRegular)
  //   doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal', 400)
  //   const options: BaseTextOptions = { fontSize: 35 }

  //   doc.setFont('Montserrat')
  //   doc.setFontSize(options.fontSize!)

  //   const textHeight1 = getTextHeight(doc, testText, getDocWidth(doc), options)
  //   expect(Math.floor(textHeight1)).toBe(60)

  //   doc.setFont('Helvetica')
  //   const textHeight2 = getTextHeight(doc, testText, getDocWidth(doc), options)
  //   expect(Math.floor(textHeight2)).toBe(30)
  // })

  it('centerTextHorizontal centers the text horizontally', () => {
    const position = centerTextHorizontal(doc, testText, { fontSize: 35 })
    expect(Math.floor(position)).toBe(23)
  })

  it('getTextWidth calculates text width correctly', () => {
    const options: BaseTextOptions = {}
    doc.getStringUnitWidth = vi.fn().mockReturnValue(50)

    const textWidth = getTextWidth(doc, testText, options)
    expect(textWidth).toBe((50 * 16) / doc.internal.scaleFactor)
  })

  it('getTextWidth calculates text width with specified font size', () => {
    const fontSize = 25
    const options: BaseTextOptions = { fontSize }
    doc.getStringUnitWidth = vi.fn().mockReturnValue(50)

    const textWidth = getTextWidth(doc, testText, options)
    expect(textWidth).toBe((50 * fontSize) / doc.internal.scaleFactor)
  })

  it('getTextWidth returns maxWidth if text width exceeds maxWidth', () => {
    const text = 'Lorem ipsum'
    const options: BaseTextOptions = { maxWidth: 100, fontSize: 20 }
    doc.getStringUnitWidth = vi.fn().mockReturnValue(200)

    const textWidth = getTextWidth(doc, text, options)
    expect(textWidth).toBe(100)
  })

  it('getTextWidth returns text width if text width is within maxWidth', () => {
    const text = 'Lorem ipsum'
    const options: BaseTextOptions = { maxWidth: 300, fontSize: 20 }
    doc.getStringUnitWidth = vi.fn().mockReturnValue(10)

    const textWidth = getTextWidth(doc, text, options)
    expect(textWidth).toBe((10 * 20) / doc.internal.scaleFactor)
  })
})
