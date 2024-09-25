import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addLine } from '../../src/utils/pdfElements'
import BlockContext from '../../src/types/blockContext'
import { jsPDF } from 'jspdf'

describe('addLine', () => {
  let doc: jsPDF
  let blockContext: BlockContext

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

  describe('line positioning', () => {
    it('positions the line using the initialX and initialY from options', () => {
      const lineSpy = vi.spyOn(doc, 'line')
      const initialX = 50
      const initialY = 75
      addLine(doc, blockContext, { x: initialX, y: initialY })

      const [lineX, lineY] = lineSpy.mock.calls[0]

      expect(lineX).toBe(initialX + blockContext.paddingHorizontal)
      expect(lineY).toBe(initialY + blockContext.paddingVertical)

      expect(lineSpy).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number)
      )

      lineSpy.mockRestore()
    })

    it('defaults initialX and initialY to 0 if not provided', () => {
      const blockContext = new BlockContext()

      const lineSpy = vi.spyOn(doc, 'line')
      addLine(doc, blockContext)

      const [lineX, lineY] = lineSpy.mock.calls[0]

      expect(lineX).toBe(0)
      expect(lineY).toBe(0)
      lineSpy.mockRestore()
    })

    it('adjusts the vertical position using topOffset and bottomOffset', () => {
      const blockContext = new BlockContext()

      const lineSpy = vi.spyOn(doc, 'line')
      const topOffset = 10
      const bottomOffset = 15
      const initialY = blockContext.cursorYPosition

      addLine(doc, blockContext, { topOffset, bottomOffset })

      const [, lineY] = lineSpy.mock.calls[0]

      expect(lineY).toBe(initialY + topOffset - bottomOffset)
      lineSpy.mockRestore()
    })

    it('applies marginTop and marginBottom to the line position', () => {
      const blockContext = new BlockContext()

      const lineSpy = vi.spyOn(doc, 'line')
      const marginTop = 20
      const marginBottom = 25
      const initialY = blockContext.cursorYPosition

      addLine(doc, blockContext, { marginTop, marginBottom })

      const [, lineY] = lineSpy.mock.calls[0]

      expect(lineY).toBe(initialY + marginTop)

      const lineHeight = 1
      expect(blockContext.cursorYPosition).toBe(initialY + marginTop + marginBottom + lineHeight)

      lineSpy.mockRestore()
    })

    it('adds paddingHorizontal to the x2 coordinate', () => {
      const lineSpy = vi.spyOn(doc, 'line')
      const x = 10
      const y = 50
      const paddingHorizontal = blockContext.paddingHorizontal
      addLine(doc, blockContext, { x, y })

      const [lineX, , lineX2] = lineSpy.mock.calls[0]

      expect(lineX2).toBeGreaterThan(lineX + paddingHorizontal * 2)
      lineSpy.mockRestore()
    })
  })

  describe('line drawing', () => {
    it('draws a line with correct coordinates when numberOfElements is 0', () => {
      const lineSpy = vi.spyOn(doc, 'line')
      addLine(doc, blockContext, { x: 10, y: 20 })

      expect(lineSpy).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number)
      )
      lineSpy.mockRestore()
    })

    it('handles optional parameters gracefully when no options are provided', () => {
      const lineSpy = vi.spyOn(doc, 'line')

      // Call without options
      addLine(doc, blockContext)

      expect(lineSpy).toHaveBeenCalled()
      lineSpy.mockRestore()
    })
  })

  describe('blockContext interactions', () => {
    it('adjusts cursor position after drawing the line', () => {
      blockContext.numberOfElements = 1
      const initialCursorYPosition = blockContext.cursorYPosition

      addLine(doc, blockContext)

      expect(initialCursorYPosition).toBeLessThan(blockContext.cursorYPosition)
    })

    it('ensures that addElement is called after drawing the line', () => {
      const addLineSpy = vi.spyOn(blockContext, 'addElement')
      addLine(doc, blockContext)

      expect(addLineSpy).toHaveBeenCalled()
      addLineSpy.mockRestore()
    })

    it('adds a new page when cursorYPosition is near the page bottom', () => {
      const addNewPageIfNeededSpy = vi.spyOn(doc, 'addPage')
      blockContext.cursorYPosition = doc.internal.pageSize.height - 10

      addLine(doc, blockContext)

      expect(addNewPageIfNeededSpy).toHaveBeenCalled()
      addNewPageIfNeededSpy.mockRestore()
    })

    it('increments numberOfElements in blockContext after adding a line', () => {
      const initialNumberOfElements = blockContext.numberOfElements

      addLine(doc, blockContext)

      expect(blockContext.numberOfElements).toBe(initialNumberOfElements + 1)
    })
  })

  describe('line width', () => {
    it('calculates line width correctly using maxWidth', () => {
      const blockContext = new BlockContext()

      const lineSpy = vi.spyOn(doc, 'line')
      const maxWidth = 150
      addLine(doc, blockContext, { maxWidth })

      const [, , lineX2] = lineSpy.mock.calls[0]

      expect(lineX2).toBeGreaterThan(0)
      expect(lineX2).toBeLessThanOrEqual(maxWidth + blockContext.paddingHorizontal * 2)

      lineSpy.mockRestore()
    })
  })
})
