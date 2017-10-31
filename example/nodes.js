import { nodes } from 'prosemirror-schema-basic'
import { tableNodes } from 'prosemirror-tables'

export default {
  ...nodes,
  ...tableNodes({
    tableGroup: 'block',
    cellContent: 'block+'
  })
}
