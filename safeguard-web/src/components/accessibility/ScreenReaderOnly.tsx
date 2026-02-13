import React from 'react'

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: keyof React.JSX.IntrinsicElements
}

const ScreenReaderOnly = ({ children, as: Component = 'span' }: ScreenReaderOnlyProps) => {
  return React.createElement(Component, { className: 'sr-only' }, children)
}

export { ScreenReaderOnly }
