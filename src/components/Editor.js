import React from 'react'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import 'prosemirror-view/style/prosemirror.css'
import MenuBar from './MenuBar'

class Editor extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      state: EditorState.create(props.options)
    }
  }

  createEditorView = node => {
    const { state } = this.state

    this.view = new EditorView(node, {
      state,
      dispatchTransaction: this.dispatchTransaction
    })
  }

  componentWillReceiveProps (props) {
    // TODO: what should happen here?
  }

  dispatchTransaction = transaction => {
    const state = this.view.state.apply(transaction)
    this.view.updateState(state)
    this.setState({ state })
    this.props.onChange(state.doc.content)
  }

  render () {
    const { menu } = this.props
    const { state } = this.state

    return (
      <div>
        {menu && (
          <MenuBar
            menu={menu}
            state={state}
            dispatch={this.dispatchTransaction}
          />
        )}
        <div ref={this.createEditorView} />
      </div>
    )
  }
}

export default Editor
