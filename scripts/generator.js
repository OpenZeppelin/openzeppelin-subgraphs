#!/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');
const argv = require('yargs/yargs')(require('yargs/helpers').hideBin(process.argv)).argv;



function loadFile(path) {
  return fs.readFileSync(path, { encoding: 'utf8' })
}

function unique(array = [], op = undefined) {
  return op
    ? array.filter((obj, i, array) => array.findIndex(entry => op(obj) === op(entry)) === i)
    : array.filter((key, i, array) => array.indexOf(key) === i)
}

function specialize(template = '', vars = {}) {
  return template.replace(/\{(\w+)\}/g, (_, varname) => vars[varname])
}

function merge(block, ...rem) {
  if (rem.length == 0) {
    return block
  } else {
    const acc = merge(...rem)

    if (acc.name!== block.name) {
      throw new Error(`Error merging definitions for ${acc.name}`)
    }

    if (acc.implements !== block.implements) {
      throw new Error(`Error merging definitions for ${acc.name}`)
    }

    if (block.fields.some(({ name, type, derived }) =>
        acc.fields.find(field =>
          field.name === name && (field.type !== type || field.derived !== derived)
        )
      )
    ) {
      throw new Error(`Error merging definitions for ${acc.name}`)
    }

    return {
      name:       acc.name,
      implements: acc.implements,
      fields:     unique([].concat(acc.fields, block.fields), ({ name }) => name),
    }
  }
}

function makeSubgraph(receipt) {
  const header    = loadFile(path.resolve(__dirname, '../src/header.yaml'))
  const templates = Object.fromEntries(
    unique(receipt.datasources.map(({ module }) => module)).map(module => {
      try {
        return [ module, loadFile(path.resolve(__dirname, `../src/datasources/${module}.yaml`)) ]
      } catch {
        return undefined
      }
    })
  )

  const subgraph = [
    // header
    specialize(header, { schema: `${path.basename(receipt.output)}.schema.graphql` }),
    // datasources
    ...receipt.datasources.map((datasource, i, array) => specialize(
      templates[datasource.module],
      Object.assign(
        {
          id: array.findIndex(({ module }) => module === datasource.module) === i ? datasource.module : `${datasource.module}-${i}`,
          startBlock: receipt.startBlock || 0,
          chain: receipt.chain
        },
        datasource,
      )
    )),
  ].join('')

  const file = path.resolve(__dirname, `${receipt.output}.subgraph.yaml`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, subgraph, { encoding: 'utf-8' })
}

function makeSchema(receipt) {
  const header = loadFile(path.resolve(__dirname, '../node_modules/@amxx/graphprotocol-utils/generated/schema.graphql'))
  const blocks = [].concat(...unique(receipt.datasources, ({ module }) => module)
      .map(({ module }) => JSON.parse(loadFile(path.resolve(__dirname, `../src/datasources/${module}.gql.json`))))
  )

  const types = unique(blocks, ({ name }) => name)
    .map(({ name }) => merge(...blocks.filter(block => block.name === name)))
    .map(block => [
      block.implements
        ? `type ${block.name} implements ${block.implements} @entity {\n`
        : `type ${block.name} @entity {\n`,
      `  id: ID!\n`,
      ...block.fields.map(field =>
          field.derived
          ? `  ${field.name}: [${field.type}]! @derivedFrom(field: "${field.derived}")\n`
          : `  ${field.name}: ${field.type}\n`
      ),
      `}\n`,
    ].join(''))

  const schema = [
    header,
    ...types
  ].join('')


  const file = path.resolve(__dirname, `${receipt.output}.schema.graphql`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, schema, { encoding: 'utf-8' })
}


(async () => {
  const receipt = JSON.parse(loadFile(argv.path))
  makeSchema(receipt)
  makeSubgraph(receipt)
})().catch(console.error)
