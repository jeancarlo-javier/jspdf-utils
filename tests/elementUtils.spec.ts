import jsPDF from 'jspdf'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import {
  setDocumentFont,
  adjustTextCursorPosition,
  getTextSettings,
  calculateLineXPosition,
  calculateLineYPosition
} from '../src/utils/elementUtils'
import { calcXPosition, calcYPosition } from '../src/utils/pdfUtils'
import { BaseTextOptions } from '../src/types/pdfUtils.types'
import BlockContext from '../src/types/blockContext'
import { getDocHeight } from '../src/utils/pdfUtils'
import PageContext from '../src/types/pageContext'

describe('elementUtils', () => {
  describe('Global Utilities', () => {
    it('sets the document font', () => {
      const doc = {
        setFont: vi.fn(),
        setFontSize: vi.fn()
      } as unknown as jsPDF

      setDocumentFont(doc, 'Helvetica', 'normal', 400, 16)

      expect(doc.setFont).toHaveBeenCalledWith('Helvetica', 'normal', 400)
      expect(doc.setFontSize).toHaveBeenCalledWith(16)
    })

    // it('add the element to the next page if its height exceeds the page padding.', () => {
    //   const pageContext = new PageContext({ paddingVertical: 10 })
    //   const blockContext = new BlockContext({
    //     pageContext,
    //     cursorYPosition: getDocHeight(doc) - 10
    //   })
    // })
  })

  describe('Text Utilities', () => {
    it('adjusts the text cursor position', () => {
      const blockContext = new BlockContext({
        cursorYPosition: 20,
        paddingVertical: 10
      })

      adjustTextCursorPosition(blockContext)

      expect(blockContext.cursorYPosition).toBe(10)
    })

    it('returns the text settings', () => {
      const textSettings = getTextSettings(100, 'center', 1.5)

      expect(textSettings).toEqual({
        baseline: 'top',
        maxWidth: 100,
        align: 'center',
        renderingMode: 'fill',
        lineHeightFactor: 1.5
      })
    })
  })

  describe('Line Utilities', () => {
    let doc: jsPDF
    beforeEach(() => {
      doc = new jsPDF({
        filters: ['ASCIIHexEncode'],
        orientation: 'portrait',
        format: 'A4',
        unit: 'px'
      })
    })

    it('calculates the line x position', () => {
      const blockContext = new BlockContext({
        cursorYPosition: 20,
        paddingVertical: 10
      })

      const expectedX = calcXPosition(doc, blockContext, 100, {})

      const x = calculateLineXPosition(doc, blockContext, 100, {
        maxWidth: 100
      })

      expect(x).toBe(expectedX)
    })

    it('calculates the line y position', () => {
      const blockContext = new BlockContext({
        cursorYPosition: 20,
        paddingVertical: 10
      })

      const textOptions: BaseTextOptions = {
        topOffset: 10,
        bottomOffset: 20,
        marginTop: 30,
        marginBottom: 40
      }

      const expectedY = calcYPosition(100, blockContext, textOptions)

      const y = calculateLineYPosition(100, blockContext, textOptions)

      expect(y).toBe(expectedY)
    })
  })
})
