import { describe, expect, test } from 'vitest'
import BlockContext from '../src/types/blockContext'
import PageContext from '../src/types/pageContext'

describe('BlockContext', () => {
  describe('verticalPadding', () => {
    test('cursorYPosition is 0 when pageContext is not defined', () => {
      const blockContext = new BlockContext()

      expect(blockContext.cursorYPosition).toBe(0)
    })

    test('adds the paddingVertical to the cursorYPosition', () => {
      const blockContext = new BlockContext({
        pageContext: new PageContext({ paddingVertical: 10 })
      })

      expect(blockContext.cursorYPosition).toBe(10)
    })
  })
})
