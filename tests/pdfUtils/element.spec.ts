import { describe, it, beforeEach, expect } from 'vitest'
import { getMaxElementWidth } from '../../src/utils/pdfUtils'
import BlockContext from '../../src/types/blockContext'
import PageContext from '../../src/types/pageContext'
import jsPDF from 'jspdf'

describe('getMaxElementWidth', () => {
  let doc: jsPDF

  beforeEach(() => {
    doc = new jsPDF({
      filters: ['ASCIIHexEncode'],
      orientation: 'portrait',
      format: 'A4',
      unit: 'px'
    })
  })

  it('returns maxWidth when provided', () => {
    const blockContext = new BlockContext({ maxWidth: 200 })
    const maxWidth = getMaxElementWidth(doc, blockContext, 100)
    expect(maxWidth).toBe(100)
  })

  it('returns blockContext maxWidth when maxWidth is not provided', () => {
    const blockContext = new BlockContext({ maxWidth: 200 })
    const maxWidth = getMaxElementWidth(doc, blockContext)
    expect(maxWidth).toBe(200)
  })

  it('returns docMaxWidth when neither maxWidth nor blockContext maxWidth are provided', () => {
    const blockContext = new BlockContext()
    const maxWidth = getMaxElementWidth(doc, blockContext)
    expect(maxWidth).toBe(doc.internal.pageSize.getWidth())
  })

  it('subtracts blockContext horizontal padding from maxWidth', () => {
    const blockContext = new BlockContext({ paddingHorizontal: 10, maxWidth: 200 })
    const maxWidth = getMaxElementWidth(doc, blockContext)
    expect(maxWidth).toBe(180)
  })

  it('subtracts pageContext horizontal padding from maxWidth', () => {
    const pageContext = new PageContext({ paddingHorizontal: 10 })
    const blockContext = new BlockContext({ pageContext })
    const maxWidth = getMaxElementWidth(doc, blockContext)
    expect(maxWidth).toBe(doc.internal.pageSize.getWidth() - 20)
  })
})
