import { transformSync } from '@babel/core'
import babelPluginWebDepend from '../babelPlugin'
import never from 'never'

const transform = (code: string): string =>
  transformSync(code, { plugins: [[babelPluginWebDepend]] })?.code ?? never('No code')

test('import as namespace', () => {
  expect(transform("import * as React from 'react'")).toMatchSnapshot()
})

test('import default', () => {
  expect(transform("import React from 'react'")).toMatchSnapshot()
})

describe('import named', () => {
  describe('single import', () => {
    test('no rename', () => {
      expect(transform("import { useState } from 'react'")).toMatchSnapshot()
    })

    test('rename', () => {
      expect(transform("import { useState as useStateReact } from 'react'")).toMatchSnapshot()
    })
  })

  describe('multiple imports', () => {
    test('no renames', () => {
      expect(transform("import { useState, useEffect } from 'react'")).toMatchSnapshot()
    })

    test('renames', () => {
      expect(transform(
        "import { useState as useStateReact, useEffect as useEffectReact } from 'react'"))
        .toMatchSnapshot()
    })

    test('mixed', () => {
      expect(transform("import { useState, useEffect as useEffectReact } from 'react'"))
        .toMatchSnapshot()
    })
  })
})

test('import default and named', () => {
  expect(transform("import React, { useState } from 'react'")).toMatchSnapshot()
})

test('multiple imports', () => {
  expect(transform(`
    import * as React from 'react'
    import cn from 'classnames'
  `)).toMatchSnapshot()
})

test('dynamic import', () => {
  expect(transform("import('boolean-to-signed')")).toMatchSnapshot()
})
