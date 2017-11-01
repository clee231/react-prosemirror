import React from 'react'
import map from 'lodash/map'
import classnames from 'classnames'
import classes from './MenuBar.css'

const MenuBar = ({ menu, state, dispatch }) => {
  const handle = cmd => e => {
    e.preventDefault()
    cmd(state, dispatch)
  }

  const Button = ({ item, children }) => {
    const disabled = item.enable && !item.enable(state)
    if (item.active && disabled) return null

    const active = item.active && item.active(state)
    // if (item.active && !active) return null

    return (
      <button
        className={classnames({
          [classes.button]: true,
          [classes.active]: active
        })}
        title={item.title}
        disabled={disabled}
        onMouseDown={handle(item.run)}
      >{children}</button>
    )
  }

  return (
    <div>
      {map(menu.marks, (item, key) => (
        <Button item={item} key={key}>
          {item.content}
        </Button>
      ))}

      {map(menu.blocks, (item, key) => (
        <Button item={item} key={key}>
          {item.content}
        </Button>
      ))}

      {map(menu.insert, (item, key) => (
        <Button item={item} key={key}>
          {item.content}
        </Button>
      ))}

      {map(menu.history, (item, key) => (
        <Button item={item} key={key}>
          {item.content}
        </Button>
      ))}

      {map(menu.table, (item, key) => (
        <Button item={item} key={key}>
          {item.content}
        </Button>
      ))}
    </div>
  )
}

export default MenuBar
