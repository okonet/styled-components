// @flow
import parse from '../vendor/postcss-safe-parser/parse'
import { StyleSheet } from '../vendor/glamor/sheet'
import postcssNested from '../vendor/postcss-nested'

import type { RuleSet } from '../types'
import flatten from '../utils/flatten'

const styleSheet = new StyleSheet({ speedy: false, maxLength: 40 })

export default class ComponentStyle {
  rules: RuleSet
  selector: ?string

  constructor(rules: RuleSet, selector: ?string) {
    this.rules = rules
    this.selector = selector
  }

  generateAndInject() {
    if (!styleSheet.injected) styleSheet.inject()
    let flatCSS = flatten(this.rules).join('')
    if (this.selector) {
      flatCSS = `${this.selector} {${flatCSS}\n}`
    }
    const root = parse(flatCSS)
    postcssNested(root)
    styleSheet.insert(root.toResult().css)
  }
}
