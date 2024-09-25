import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addText } from '../../src/utils/pdfElements'
import { getTextSettings } from '../../src/utils/elementUtils'
import { getMaxElementWidth } from '../../src/utils/pdfUtils'
import BlockContext from '../../src/types/blockContext'
import { jsPDF } from 'jspdf'

describe('addText', () => {
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

  it('adds a text element to the document', () => {
    const textSpy = vi.spyOn(doc, 'text')
    addText(doc, blockContext, 'test', {
      textAlign: 'center',
      maxWidth: 100
    })

    expect(textSpy).toHaveBeenCalledOnce()
  })
})
