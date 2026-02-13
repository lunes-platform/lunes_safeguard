import { motion } from 'framer-motion'

export const useMotion = (enabled: boolean) => {
  if (!enabled) {
    return {
      div: 'div',
      span: 'span',
      p: 'p',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      button: 'button',
      a: 'a',
      img: 'img',
      ul: 'ul',
      ol: 'ol',
      li: 'li',
      nav: 'nav',
      header: 'header',
      footer: 'footer',
      section: 'section',
      article: 'article',
      aside: 'aside',
      main: 'main',
      form: 'form',
      input: 'input',
      textarea: 'textarea',
      select: 'select',
      option: 'option',
      label: 'label',
      table: 'table',
      thead: 'thead',
      tbody: 'tbody',
      tr: 'tr',
      td: 'td',
      th: 'th',
    }
  }

  return motion
}
