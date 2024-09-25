import type { PageContextBase } from '../types/pdfUtils.types'
import type { jsPDF } from 'jspdf'

class PageContext implements PageContextBase {
  numberOfPages: number
  padding?: number | undefined
  paddingVertical?: number | undefined
  paddingHorizontal?: number | undefined

  constructor({
    numberOfPages = 1,
    padding = 0,
    paddingVertical = 0,
    paddingHorizontal = 0
  }: Partial<PageContextBase> = {}) {
    this.numberOfPages = numberOfPages
    this.padding = padding
    this.paddingVertical = paddingVertical
    this.paddingHorizontal = paddingHorizontal
  }

  addPage(doc: jsPDF): void {
    doc.addPage()
    this.numberOfPages++
  }
}

export default PageContext
