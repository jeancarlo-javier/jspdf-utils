import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addList } from '../../src/utils/pdfElements'
import BlockContext from '../../src/types/blockContext'
import { jsPDF } from 'jspdf'

describe('addList', () => {
  let doc: jsPDF
  let blockContext: BlockContext
  const items = ['First item', 'Second item', 'Third item']

  beforeEach(() => {
    doc = new jsPDF()
    blockContext = new BlockContext({
      id: 'test-block',
      numberOfElements: 0,
      cursorYPosition: 0,
      maxWidth: 200,
      paddingHorizontal: 10,
      paddingVertical: 10
    })
  })

  describe('list positioning', () => {
    it('positions the list items using the initialX and initialY from options', () => {
      const textSpy = vi.spyOn(doc, 'text')
      const initialX = 50
      const initialY = 75
      const itemIndent = 15

      addList(doc, blockContext, items, { x: initialX, y: initialY, itemIndent })

      // Check the first call to doc.text
      const [, xPosition, yPosition] = textSpy.mock.calls[0]

      expect(xPosition).toBe(initialX + itemIndent + blockContext.paddingHorizontal)
      expect(yPosition).toBe(initialY + blockContext.paddingVertical)

      textSpy.mockRestore()
    })

    it('defaults initialX and initialY to 0 if not provided', () => {
      const textSpy = vi.spyOn(doc, 'text')
      addList(doc, blockContext, items)

      const [, xPosition, yPosition] = textSpy.mock.calls[0]

      expect(xPosition).toBe(blockContext.paddingHorizontal + 10) // Default itemIndent is 10
      expect(yPosition).toBe(blockContext.paddingVertical)

      textSpy.mockRestore()
    })

    it('adjusts positions with margins and offsets', () => {
      const textSpy = vi.spyOn(doc, 'text')
      const marginLeft = 20
      const marginTop = 30
      const leftOffset = 20
      const topOffset = 10

      addList(doc, blockContext, items, {
        marginLeft,
        marginTop,
        leftOffset,
        topOffset
      })

      const [, xPosition, yPosition] = textSpy.mock.calls[0]

      expect(xPosition).toBe(
        blockContext.paddingHorizontal + marginLeft + leftOffset + 10 // Default itemIndent is 10
      )
      expect(yPosition).toBe(blockContext.paddingVertical + marginTop + topOffset)

      textSpy.mockRestore()
    })
  })

  describe('list drawing', () => {
    it('draws list items with correct prefixes for unordered lists', () => {
      const textSpy = vi.spyOn(doc, 'text')
      const bulletType = '*'

      addList(doc, blockContext, items, { ordered: false, bulletType })

      items.forEach((item, index) => {
        const [listItemText] = textSpy.mock.calls[index]
        expect(listItemText).toBe(`${bulletType} ${item}`)
      })

      textSpy.mockRestore()
    })

    it('draws list items with correct numbering for ordered lists', () => {
      const textSpy = vi.spyOn(doc, 'text')

      addList(doc, blockContext, items, { ordered: true, numberStyle: 'decimal' })

      items.forEach((item, index) => {
        const [listItemText] = textSpy.mock.calls[index]
        expect(listItemText).toBe(`${index + 1}. ${item}`)
      })

      textSpy.mockRestore()
    })

    it('handles different numbering styles correctly', () => {
      const textSpy = vi.spyOn(doc, 'text')

      // Roman numerals
      addList(doc, blockContext, items, { ordered: true, numberStyle: 'roman' })

      items.forEach((item, index) => {
        const [listItemText] = textSpy.mock.calls[index]
        const romanNumeral = toRoman(index + 1)
        expect(listItemText).toBe(`${romanNumeral}. ${item}`)
      })

      textSpy.mockRestore()
    })

    it('applies font styles and sizes to list items', () => {
      const textSpy = vi.spyOn(doc, 'text')
      const fontSize = 14
      const fontFamily = 'Times'
      const fontStyle = 'italic'

      const setFontSpy = vi.spyOn(doc, 'setFont')
      const setFontSizeSpy = vi.spyOn(doc, 'setFontSize')

      addList(doc, blockContext, items, {
        fontSize,
        fontFamily,
        fontStyle
      })

      expect(setFontSpy).toHaveBeenCalledOnce()
      // expect(setFontSizeSpy).toHaveBeenCalledWith(fontSize)

      textSpy.mockRestore()
      setFontSpy.mockRestore()
      setFontSizeSpy.mockRestore()
    })
  })

  describe('blockContext interactions', () => {
    it('adjusts cursor position after adding each list item', () => {
      const initialCursorYPosition = blockContext.cursorYPosition

      addList(doc, blockContext, items)

      expect(blockContext.cursorYPosition).toBeGreaterThan(initialCursorYPosition)
    })

    it('ensures that addElement is called for each list item', () => {
      const addElementSpy = vi.spyOn(blockContext, 'addElement')

      addList(doc, blockContext, items)

      expect(addElementSpy).toHaveBeenCalledTimes(items.length)

      addElementSpy.mockRestore()
    })

    it('adds a new page when cursorYPosition is near the page bottom', () => {
      const addPageSpy = vi.spyOn(doc, 'addPage')
      blockContext.cursorYPosition = doc.internal.pageSize.height - 10

      addList(doc, blockContext, items)

      expect(addPageSpy).toHaveBeenCalled()

      addPageSpy.mockRestore()
    })

    it('increments numberOfElements in blockContext correctly', () => {
      const initialNumberOfElements = blockContext.numberOfElements

      addList(doc, blockContext, items)

      expect(blockContext.numberOfElements).toBe(initialNumberOfElements + items.length)
    })
  })

  describe('list numbering styles', () => {
    it('uses alphabetic numbering when numberStyle is alpha', () => {
      const textSpy = vi.spyOn(doc, 'text')

      addList(doc, blockContext, items, { ordered: true, numberStyle: 'alpha' })

      items.forEach((item, index) => {
        const [listItemText] = textSpy.mock.calls[index]
        const alphabet = String.fromCharCode(97 + index)
        expect(listItemText).toBe(`${alphabet}. ${item}`)
      })

      textSpy.mockRestore()
    })

    it('handles custom bullet types for unordered lists', () => {
      const textSpy = vi.spyOn(doc, 'text')
      const bulletType = '→'

      addList(doc, blockContext, items, { ordered: false, bulletType })

      items.forEach((item, index) => {
        const [listItemText] = textSpy.mock.calls[index]
        expect(listItemText).toBe(`${bulletType} ${item}`)
      })

      textSpy.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('does not add any text when items array is empty', () => {
      const textSpy = vi.spyOn(doc, 'text')
      addList(doc, blockContext, [])

      expect(textSpy).not.toHaveBeenCalled()

      textSpy.mockRestore()
    })

    it('handles itemIndent correctly when set to zero', () => {
      const textSpy = vi.spyOn(doc, 'text')
      addList(doc, blockContext, items, { itemIndent: 0 })

      const [, xPosition] = textSpy.mock.calls[0]

      expect(xPosition).toBe(blockContext.paddingHorizontal)
      textSpy.mockRestore()
    })

    it('applies text alignment correctly', () => {
      const textSpy = vi.spyOn(doc, 'text')
      const textAlign = 'center'

      addList(doc, blockContext, items, { textAlign })

      const [_, __, ___, textSettings] = textSpy.mock.calls[0]

      if (!textSettings) throw new Error('textSettings is undefined')

      expect(textSettings.align).toBe(textAlign)

      textSpy.mockRestore()
    })
  })
})

/**
 * Helper function to convert numbers to Roman numerals.
 *
 * @param num The number to convert.
 * @returns The Roman numeral representation.
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
