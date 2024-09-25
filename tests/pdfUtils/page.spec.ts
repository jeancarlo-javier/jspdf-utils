import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getDocHeight,
  checkIfElementFitsPage,
  addPage,
  getPageTopPadding
} from '../../src/utils/pdfUtils'
import PageContext from '../../src/types/pageContext'
import BlockContext from '../../src/types/blockContext'
import type { PageContextBase } from '../../src/types/pdfUtils.types'
import { jsPDF } from 'jspdf'

describe('Page Break Detection', () => {
  let doc: jsPDF

  beforeEach(() => {
    doc = new jsPDF({
      filters: ['ASCIIHexEncode'],
      orientation: 'portrait',
      format: 'A4',
      unit: 'px'
    })
  })

  describe('detectPageBreak', () => {
    it('returns true when the current cursor Y position exceeds the maximum page height', () => {
      const blockContext = new BlockContext({ cursorYPosition: getDocHeight(doc) + 10 })
      const pageBreak = checkIfElementFitsPage(doc, blockContext, 1)
      expect(pageBreak).toBe(true)
    })

    it('returns false when the current cursor Y position is below the maximum page height', () => {
      const blockContext = new BlockContext({ cursorYPosition: getDocHeight(doc) - 10 })
      const pageBreak = checkIfElementFitsPage(doc, blockContext, 1)
      expect(pageBreak).toBe(false)
    })

    it('returns false when the element height allows it to fit within the current page', () => {
      const blockContext = new BlockContext({
        pageContext: new PageContext(),
        cursorYPosition: 10
      })
      const elementHeight = 10
      const shouldBreak = checkIfElementFitsPage(doc, blockContext, elementHeight)
      expect(shouldBreak).toBe(false)
    })

    it('returns true when the element height causes it to exceed the current page height', () => {
      const blockContext = new BlockContext({
        pageContext: new PageContext(),
        cursorYPosition: getDocHeight(doc)
      })
      const elementHeight = 10
      const shouldBreak = checkIfElementFitsPage(doc, blockContext, elementHeight)
      expect(shouldBreak).toBe(true)
    })
  })

  describe('addPage', () => {
    it('adds a new page to the document', () => {
      const pageContext: PageContextBase = { numberOfPages: 0, addPage: vi.fn() }
      const blockContext = new BlockContext({ pageContext })
      addPage(doc, blockContext)
      expect(pageContext.addPage).toHaveBeenCalledOnce()
    })

    it('resets the blockContext cursorYPosition to 0 after adding a new page', () => {
      const pageContext: PageContextBase = { numberOfPages: 0, addPage: vi.fn() }
      const blockContext = new BlockContext({ cursorYPosition: 100, pageContext })
      addPage(doc, blockContext)
      expect(blockContext.cursorYPosition).toBe(0)
    })
  })

  describe('getPageTopPadding', () => {
    it('returns the page padding vertical value', () => {
      const pageContext = new PageContext({ paddingVertical: 10 })
      const blockContext = new BlockContext({ pageContext })
      const padding = getPageTopPadding(blockContext)
      expect(padding).toBe(10)
    })

    it('returns the page padding value', () => {
      const pageContext = new PageContext({ padding: 10 })
      const blockContext = new BlockContext({ pageContext })
      const padding = getPageTopPadding(blockContext)
      expect(padding).toBe(10)
    })

    it('Returns paddingVertical when both padding and paddingVertical are defined.', () => {
      const pageContext = new PageContext({ padding: 10, paddingVertical: 20 })
      const blockContext = new BlockContext({ pageContext })
      const padding = getPageTopPadding(blockContext)
      expect(padding).toBe(20)
    })

    it('returns 0 if no page padding is defined', () => {
      const pageContext = new PageContext()
      const blockContext = new BlockContext({ pageContext })
      const padding = getPageTopPadding(blockContext)
      expect(padding).toBe(0)
    })
  })
})
