import { describe, it, expect, beforeEach } from 'vitest'
import { jsPDF } from 'jspdf'
import {
  calcCursorYPosition,
  calcXPosition,
  calcYPosition,
  getTextWidth
} from '../../src/utils/pdfUtils'
import { BaseTextOptions, BaseElementOptions } from '../../src/types/pdfUtils.types'
import PageContext from '../../src/types/pageContext'
import BlockContext from '../../src/types/blockContext'

describe('Position Calculations', () => {
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

  describe('calcCursorYPosition', () => {
    it('calculates cursor Y position correctly', () => {
      const blockContext1 = new BlockContext()
      const options1: BaseElementOptions = {}
      const cursorYPosition1 = calcCursorYPosition(blockContext1, options1)
      expect(cursorYPosition1).toBe(0)

      const blockContext2 = new BlockContext({
        numberOfElements: 0,
        cursorYPosition: 10,
        paddingVertical: 10
      })
      const options2: BaseElementOptions = { marginTop: 5, marginBottom: 5 }
      const cursorYPosition2 = calcCursorYPosition(blockContext2, options2, 0)
      expect(cursorYPosition2).toBe(40)

      const blockContext3 = new BlockContext({
        numberOfElements: 2,
        cursorYPosition: 0,
        paddingVertical: 10
      })
      const options3: BaseElementOptions = {}
      const cursorYPosition3 = calcCursorYPosition(blockContext3, options3)
      expect(cursorYPosition3).toBe(10)
    })

    it('calculates cursor Y position with pageContext', () => {
      const pageContext = new PageContext({ paddingVertical: 10 })
      const blockContext = new BlockContext({ pageContext })
      const options: BaseElementOptions = {}
      const cursorYPosition = calcCursorYPosition(blockContext, options, 0)
      expect(cursorYPosition).toBe(10)
    })
  })

  describe('calcXPosition', () => {
    it('calculates x position with blockContext.x', () => {
      const blockContext = new BlockContext({ x: 100 })
      const x = calcXPosition(doc, blockContext, 0, {})
      expect(x).toBe(100)
    })

    it('calculates x position with paddingHorizontal', () => {
      const blockContext = new BlockContext({ paddingHorizontal: 20 })
      const x = calcXPosition(doc, blockContext, 0, {})
      expect(x).toBe(20)
    })

    it('calculates x position with leftOffset', () => {
      const blockContext = new BlockContext({})
      const options: BaseTextOptions = { leftOffset: 10 }
      const x = calcXPosition(doc, blockContext, 0, options)
      expect(x).toBe(10)
    })

    it('calculates x position with rightOffset', () => {
      const blockContext = new BlockContext({})
      const options: BaseTextOptions = { rightOffset: 10 }
      const x = calcXPosition(doc, blockContext, 0, options)
      expect(x).toBe(-10)
    })

    describe('text alignment', () => {
      it('calculates x position with text aligned center', () => {
        const blockContext = new BlockContext({})
        const options: BaseTextOptions = { textAlign: 'center' }
        const textWidth = getTextWidth(doc, testText, options)
        const x = calcXPosition(doc, blockContext, 0, options, testText)
        expect(Math.floor(x)).toBe(Math.floor(textWidth / 2))
      })

      it('calculates x position with text aligned right', () => {
        const blockContext = new BlockContext({})
        const options: BaseTextOptions = { textAlign: 'right' }
        const textWidth = getTextWidth(doc, testText, options)
        const x = calcXPosition(doc, blockContext, 0, options, testText)
        expect(Math.floor(x)).toBe(Math.floor(textWidth))
      })

      it('calculates x position with text aligned left (default)', () => {
        const blockContext = new BlockContext({})
        const options: BaseTextOptions = { textAlign: 'left' }
        const x = calcXPosition(doc, blockContext, 0, options, testText)
        expect(x).toBe(0)
      })
    })

    describe('pageContext', () => {
      it('calculates x position with page horizontal padding', () => {
        const pageContext = new PageContext({ paddingHorizontal: 10 })
        const blockContext = new BlockContext({ pageContext })

        const x = calcXPosition(doc, blockContext, 0, {}, testText)
        expect(x).toBe(10)
      })
    })
  })

  describe('calcYPosition', () => {
    it('calculates y position with blockContext.y', () => {
      const blockContext = new BlockContext({ y: 100 })
      const y = calcYPosition(0, blockContext, {})
      expect(y).toBe(100)
    })

    it('calculates y position with paddingVertical', () => {
      const blockContext = new BlockContext({ paddingVertical: 20 })
      const y = calcYPosition(0, blockContext, {})
      expect(y).toBe(20)
    })

    it('calculates y position with topOffset', () => {
      const blockContext = new BlockContext({})
      const options: BaseTextOptions = { topOffset: 10 }
      const y = calcYPosition(0, blockContext, options)
      expect(y).toBe(10)
    })

    it('calculates y position with bottomOffset', () => {
      const blockContext = new BlockContext({})
      const options: BaseTextOptions = { bottomOffset: 10 }
      const y = calcYPosition(0, blockContext, options)
      expect(y).toBe(-10)
    })

    it('calculates y position with marginTop', () => {
      const blockContext = new BlockContext({})
      const options: BaseTextOptions = { marginTop: 10 }
      const y = calcYPosition(0, blockContext, options)
      expect(y).toBe(10)
    })

    it('calculates y position with specified lineHeight', () => {
      const blockContext = new BlockContext({})
      const options: BaseTextOptions = { lineHeight: 1.15 }
      const y = calcYPosition(10, blockContext, options)
      expect(Number(y.toFixed(2))).toBe(12.4)

      const y2 = calcYPosition(10, blockContext, { ...options, bottomOffset: 10 })
      expect(Number(y2.toFixed(2))).toBe(2.4)

      const y3 = calcYPosition(10, blockContext, { ...options, topOffset: 10 })
      expect(Number(y3.toFixed(2))).toBe(22.4)
    })

    it('calculates y position with default lineHeight', () => {
      const blockContext = new BlockContext({})
      const options: BaseTextOptions = {
        topOffset: 10,
        bottomOffset: 10,
        marginTop: 30
      }
      const y = calcYPosition(0, blockContext, options)
      expect(y).toBe(30)
    })

    describe('pageContext', () => {
      it('calculates y position with page padding', () => {
        const pageContext = new PageContext({ padding: 10 })
        const blockContext = new BlockContext({ pageContext })

        const y = calcYPosition(0, blockContext, {})
        expect(y).toBe(10)
      })

      it('calculates x position with page vertical padding', () => {
        const pageContext = new PageContext({ paddingVertical: 10 })
        const blockContext = new BlockContext({ pageContext })
        const y = calcYPosition(0, blockContext, {})
        expect(y).toBe(10)
      })
    })
  })
})
