import expect from 'expect'
import css from '../css'
import concat from '../concat'
import rule from '../rule'
import nested from '../nested'
import media from '../media'
import keyframes from '../keyframes'

describe('css', () => {
  describe('simple inputs', () => {
    it('should be ok with nonce inputs', () => {
      expect(css``.rules).toEqual([])
      expect(css`this aint css`.rules).toEqual([])
      expect(css`🔥🔥😎`.rules).toEqual([])
    })

    it('should handle a single simple rule', () => {
      const expected = concat(
        rule('background', 'red')
      )
      expect(css`background:red;`).toEqual(expected)
      expect(css`background: red;`).toEqual(expected)
    })

    it('should handle dashed rules', () => {
      const expected = concat(
        rule('flexGrow', '1')
      )
      expect(css`flex-grow: 1;`).toEqual(expected)
      expect(css`flexGrow: 1;`).toEqual(expected)
    })

    it('should handle multiple lines', () => {
      const expected = concat(
        rule('flexGrow', '1'),
        rule('flexShrink', '0')
      )
      expect(css`flex-grow: 1;\nflex-shrink: 0;`).toEqual(expected)
    })

    it('should pass through duplicates', () => {
      const expected = concat(
        rule('flexGrow', '1'),
        rule('flexShrink', '0'),
        rule('flexGrow', '0')
      )
      expect(css`flex-grow: 1;\nflex-shrink: 0;\nflex-grow: 0;`).toEqual(expected)
    })
  })

  describe('nesting', () => {
    it('should handle nested tag selectors', () => {
      expect(css`
        background: red;
        img {
          background: white;
        }
        `).toEqual(concat(
          rule('background', 'red'),
          nested('img',
          rule('background', 'white')
        )
      ))
    })

    it('should handle more complex nested tag selectors', () => {
      expect(css`
        margin: 0 auto;
        > img + img, .push-left {
          margin-left: 1rem;
        }
        `).toEqual(concat(
          rule('margin', '0 auto'),
          nested('> img + img, .push-left',
          rule('marginLeft', '1rem')
        )
      ))
    })

    it('should pass through pseduo selectors', () => {
      expect(css`
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
        `).toEqual(concat(
          rule('textDecoration', 'none'),
          nested('&:hover',
          rule('textDecoration', 'underline')
        )
      ))
    })

    it('should pass through multiple selectors', () => {
      expect(css`
        text-decoration: none;
        &:hover, &:active, :root.ios & {
          text-decoration: underline;
        }
        `).toEqual(concat(
          rule('textDecoration', 'none'),
          nested('&:hover, &:active, :root.ios &',
          rule('textDecoration', 'underline')
        )
      ))
    })

    it('should properly handle multiple nesting', () => {
      expect(css`
        position: relative;
        img {
          position: absolute;
          &.-in-flow {
            position: static;
          }
        }
        > span {
          font-weight: bold;
          html.ios & {
            font-weight: normal;
          }
        }
      `).toEqual(
        concat(
          rule('position', 'relative'),
          nested('img',
            rule('position', 'absolute'),
            nested('&.-in-flow',
              rule('position', 'static')
            )
          ),
          nested('> span',
            rule('fontWeight', 'bold'),
            nested('html.ios &',
              rule('fontWeight', 'normal')
            )
          )
        )
      )
    })
    it('should all nesting syntaxes', () => {
      expect(css`
        animation: fade-in 1s both;
        + * {
          animation: fade-in 1s 1s both;
        }
        ~ * {
          animation: fade-in 1s 2s both;
        }
      `).toEqual(
        concat(
          rule('animation', 'fade-in 1s both'),
          nested('+ *',
            rule('animation', 'fade-in 1s 1s both')
          ),
          nested('~ *',
            rule('animation', 'fade-in 1s 2s both')
          )
        )
      )
    })
  })

  describe('in JS', () => {
    it('should be ok with nonce inputs', () => {
      expect(css`${{}}`.rules).toEqual([])
      expect(css`${undefined}`.rules).toEqual([])
      expect(css`${null}`.rules).toEqual([])
    })

    it('should handle a simple rule', () => {
      expect(css`${{
        backgroundColor: 'blue',
      }}`).toEqual(concat(
        rule('backgroundColor', 'blue')
      ))
    })

    it('should handle dashed rules', () => {
      expect(css`${{
        'background-color': 'blue',
      }}`).toEqual(concat(
        rule('backgroundColor', 'blue')
      ))
    })

    it('should handle multiple rules', () => {
      expect(css`${{
        backgroundColor: 'blue',
        border: 'none',
      }}`).toEqual(concat(
        rule('backgroundColor', 'blue'),
        rule('border', 'none')
      ))
    })

    it('should not pass through duplicates', () => {
      expect(css`${{
        backgroundColor: 'blue',
        border: 'none',
        backgroundColor: 'red', // eslint-disable-line no-dupe-keys
      }}`).toEqual(concat(
        rule('backgroundColor', 'red'),
        rule('border', 'none')
      ))
    })
  })

  describe('@media', () => {
    it('should handle a simple media query', () => {
      expect(css`
        background: red;
        @media (max-width: 500px) {
          background: blue;
        }
        `).toEqual(concat(
          rule('background', 'red'),
          media('(max-width: 500px)',
          rule('background', 'blue')
        )
      ))
    })

    it('should handle a complex media query', () => {
      expect(css`
        background: red;
        @media screen and (max-width: 500px) and (min-width: 1000px) {
          background: blue;
        }
        `).toEqual(concat(
          rule('background', 'red'),
          media('screen and (max-width: 500px) and (min-width: 1000px)',
          rule('background', 'blue')
        )
      ))
    })
  })

  describe('keyframes', () => {
    it('should handle simple keyframes', () => {
      expect(css`
        @keyframes some-name {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        animation: some-name 150ms;
      `).toEqual(concat(
        keyframes('some-name',
          nested('0%',
            rule('opacity', '0'),
          ),
          nested('100%',
            rule('opacity', '1'),
          )
        )
      ))
    })
  })
})
