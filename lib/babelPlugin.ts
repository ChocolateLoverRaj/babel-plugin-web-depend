import { PluginItem, PluginObj } from '@babel/core'
import {
  Identifier,
  importDeclaration,
  importDefaultSpecifier,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
  objectPattern,
  objectProperty,
  ImportNamespaceSpecifier,
  isImportNamespaceSpecifier,
  isImportDefaultSpecifier,
  identifier,
  isImportSpecifier,
  awaitExpression,
  callExpression,
  isImport,
  import as _import,
  isStringLiteral,
  memberExpression,
  arrowFunctionExpression
} from '@babel/types'
import packageNameRegex from 'package-name-regex'
import never from 'never'

const importDependPath = 'https://todo-web-depend-path'
const babelPluginWebDepend: PluginItem = (_, options, dir) => {
  const pluginObj: PluginObj = {
    visitor: {
      Program: path => {
        let importDepend: Identifier | undefined
        path.traverse({
          ImportDeclaration: path => {
            if (!packageNameRegex.test(path.node.source.value)) return
            if (importDepend === undefined) {
              importDepend = path.scope.generateUidIdentifier('importDepend')
              path.insertBefore(importDeclaration([importDefaultSpecifier(importDepend)], stringLiteral(importDependPath)))
            }
            const importNamespaceSpecifier = path.node.specifiers.find(node => isImportNamespaceSpecifier(node)) as ImportNamespaceSpecifier
            path.replaceWith(variableDeclaration('const', [variableDeclarator(
              importNamespaceSpecifier !== undefined
                ? importNamespaceSpecifier.local
                : objectPattern(path.node.specifiers.map(node => isImportDefaultSpecifier(node)
                  ? objectProperty(identifier('default'), node.local)
                  : isImportSpecifier(node)
                    ? objectProperty(node.imported, node.local)
                    : never('Unknown specifier type')
                )), awaitExpression(callExpression(importDepend, [path.node.source])))]))
          },
          CallExpression: path => {
            const { node: { arguments: [source] } } = path
            if (
              !isImport(path.node.callee) ||
              !isStringLiteral(source) ||
              !packageNameRegex.test(source.value)) return

            path.replaceWith(callExpression(
              memberExpression(
                callExpression(_import(), [
                  stringLiteral(importDependPath)]),
                identifier('then')),
              [
                arrowFunctionExpression(
                  [
                    objectPattern([objectProperty(identifier('default'), identifier('importDepend'))])
                  ],
                  awaitExpression(callExpression(identifier('importDepend'), path.node.arguments)),
                  true)
              ]))
          }
        })
      }
    }
  }

  return pluginObj
}

export default babelPluginWebDepend
