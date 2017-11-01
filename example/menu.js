import React from 'react'
import { joinUp, lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands'
import { redo, undo } from 'prosemirror-history'
import { wrapInList } from 'prosemirror-schema-list'
import { addColumnAfter, addColumnBefore } from 'prosemirror-tables'

const markActive = type => state => {
  const { from, $from, to, empty } = state.selection

  return empty
    ? type.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(from, to, type)
}

const blockActive = (type, attrs = {}) => state => {
  const { $from, to, node } = state.selection

  if (node) {
    return node.hasMarkup(type, attrs)
  }

  return to <= $from.end() && $from.parent.hasMarkup(type, attrs)
}

const canInsert = type => state => {
  const { $from } = state.selection

  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d)

    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true
    }
  }

  return false
}

const promptForURL = () => {
  let url = window.prompt('Enter the URL', 'https://')

  if (url && !/^https?:\/\//i.test(url)) {
    url = 'http://' + url
  }

  return url
}

export default schema => ({
  marks: {
    em: {
      title: 'Toggle emphasis',
      content: <i>I</i>,
      active: markActive(schema.marks.em),
      run: toggleMark(schema.marks.em)
    },
    strong: {
      title: 'Toggle strong',
      content: <b>B</b>,
      active: markActive(schema.marks.strong),
      run: toggleMark(schema.marks.strong)
    },
    code: {
      title: 'Toggle code',
      content: <code>&lt;&gt;</code>,
      active: markActive(schema.marks.code),
      run: toggleMark(schema.marks.code)
    },
    subscript: {
      title: 'Toggle subscript',
      content: <span>x<sub>2</sub></span>,
      active: markActive(schema.marks.subscript),
      run: toggleMark(schema.marks.subscript)
    },
    superscript: {
      title: 'Toggle superscript',
      content: <span>x<sup>2</sup></span>,
      active: markActive(schema.marks.superscript),
      run: toggleMark(schema.marks.superscript)
    },
    link: {
      title: 'Add or remove link',
      content: 'link',
      active: markActive(schema.marks.link),
      enable: state => !state.selection.empty,
      run (state, dispatch) {
        if (markActive(schema.marks.link)(state)) {
          toggleMark(schema.marks.link)(state, dispatch)
          return true
        }

        const href = promptForURL()
        if (!href) return false

        toggleMark(schema.marks.link, { href })(state, dispatch)
        // view.focus()
      }
    }
  },
  blocks: {
    plain: {
      title: 'Change to paragraph',
      content: 'Plain',
      active: blockActive(schema.nodes.paragraph),
      enable: setBlockType(schema.nodes.paragraph),
      run: setBlockType(schema.nodes.paragraph)
    },
    code: {
      title: 'Change to code block',
      content: 'Code',
      active: blockActive(schema.nodes.code),
      enable: setBlockType(schema.nodes.code),
      run: setBlockType(schema.nodes.code)
    },
    h1: {
      title: 'Change to heading level 1',
      content: 'H1',
      active: blockActive(schema.nodes.heading, { level: 1 }),
      enable: setBlockType(schema.nodes.heading, { level: 1 }),
      run: setBlockType(schema.nodes.heading, { level: 1 })
    },
    h2: {
      title: 'Change to heading level 2',
      content: 'H2',
      active: blockActive(schema.nodes.heading, { level: 2 }),
      enable: setBlockType(schema.nodes.heading, { level: 2 }),
      run: setBlockType(schema.nodes.heading, { level: 2 })
    },
    blockquote: {
      title: 'Wrap in block quote',
      content: 'Quote',
      active: blockActive(schema.nodes.blockquote), // TODO: active -> select
      enable: wrapIn(schema.nodes.blockquote),
      run: wrapIn(schema.nodes.blockquote)
    },
    unorderedList: {
      title: 'Wrap in bullet list',
      content: 'Bullet list',
      active: blockActive(schema.nodes.bullet_list), // TODO: active -> select
      enable: wrapInList(schema.nodes.bullet_list),
      run: wrapInList(schema.nodes.bullet_list)
    },
    orderedList: {
      title: 'Wrap in ordered list',
      content: 'Ordered list',
      active: blockActive(schema.nodes.ordered_list), // TODO: active -> select
      enable: wrapInList(schema.nodes.ordered_list),
      run: wrapInList(schema.nodes.ordered_list)
    },
    joinUp: {
      title: 'Join with above block',
      content: 'Join',
      active: joinUp, // TODO: active -> select
      run: joinUp
    },
    lift: {
      title: 'Lift out of enclosing block',
      content: 'Lift',
      active: lift, // TODO: active -> select
      run: lift
    }
  },
  insert: {
    image: {
      title: 'Insert image',
      content: 'Image',
      enable: canInsert(schema.nodes.image),
      run: (state, dispatch) => {
        const src = promptForURL()
        if (!src) return false

        const img = schema.nodes.image.createAndFill({ src })
        dispatch(state.tr.replaceSelectionWith(img))
      }
    },
    hr: {
      title: 'Insert horizontal rule',
      content: 'HR',
      enable: canInsert(schema.nodes.horizontal_rule),
      run: (state, dispatch) => {
        const hr = schema.nodes.horizontal_rule.create()
        dispatch(state.tr.replaceSelectionWith(hr))
      }
    },
    table: {
      title: 'Insert table',
      content: 'Table',
      enable: canInsert(schema.nodes.table),
      run: (state, dispatch) => {
        // const { from } = state.selection
        let rowCount = window.prompt('How many rows?', 2)
        let colCount = window.prompt('How many columns?', 2)

        const cells = []
        while (colCount--) {
          cells.push(schema.nodes.table_cell.createAndFill())
        }

        const rows = []
        while (rowCount--) {
          rows.push(schema.nodes.table_row.createAndFill(null, cells))
        }

        const table = schema.nodes.table.createAndFill(null, rows)
        dispatch(state.tr.replaceSelectionWith(table))

        // const tr = state.tr.replaceSelectionWith(table)
        // tr.setSelection(Selection.near(tr.doc.resolve(from)))
        // dispatch(tr.scrollIntoView())
        // view.focus()
      }
    }
  },
  history: {
    undo: {
      title: 'Undo last change',
      content: 'Undo',
      enable: undo,
      run: undo
    },
    redo: {
      title: 'Redo last undone change',
      content: 'Redo',
      enable: redo,
      run: redo
    }
  },
  table: {
    addColumnBefore: {
      title: 'Insert column before',
      content: 'After',
      active: addColumnBefore, // TOOD: active -> select
      run: addColumnBefore
    },
    addColumnAfter: {
      title: 'Insert column before',
      content: 'Before',
      active: addColumnAfter, // TOOD: active -> select
      run: addColumnAfter
    }
  }
})
