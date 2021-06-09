#!/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const argv = require('yargs/yargs')(require('yargs/helpers').hideBin(process.argv)).argv;


Array.prototype.unique = function(op = x => x) {
  return this.filter((obj, i) => this.findIndex(entry => op(obj) === op(entry)) === i)
}

function assert(condifiton, error = 'assertion failed') {
  if (!condifiton) {
    throw new Error(error)
  }
}

function readFile(file) {
  return fs.readFileSync(file, { encoding: 'utf8' })
}

function writeFile(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, data, { encoding: 'utf-8' })
}

/*********************************************************************************************************************
 *                                                 Schema generation                                                 *
 *********************************************************************************************************************/
class Schema extends Array {
  static load(file) {
    return JSON.parse(readFile(file)).map(e => new SchemaEntry(e));
  }

  toString() {
    return this.join('');
  }

  sanitize() {
    return Schema.from(
      this
        .map(({ name }) => name)
        .unique()
        .map(entry => SchemaEntry.merge(...this.filter(({ name }) => name === entry)))
    );
  }
}

class SchemaEntry {
  constructor({ name, fields = [], parent = null }) {
    this.name   = name;
    this.fields = fields;
    this.parent = parent;
  }

  toString() {
    return [
      this.parent
        ? `type ${this.name} implements ${this.parent} @entity {\n`
        : `type ${this.name} @entity {\n`,
      `  id: ID!\n`,
      ...this.fields.map(field =>
          field.derived
          ? `  ${field.name}: [${field.type}]! @derivedFrom(field: "${field.derived}")\n`
          : `  ${field.name}: ${field.type}\n`
      ),
      `}\n`,
    ].join('');
  }

  static fieldConflict(f1, f2) {
    return f1.name === f2.name && (f1.type !== f2.type || f1.derived !== f2.derived);
  }

  static merge(entry, ...others) {
    if (others.length == 0) { return entry; }

    const acc = SchemaEntry.merge(...others);
    assert(
      entry.name === acc.name,
      `Error merging schema entries: name do not match (${entry.name} / ${acc.name})`,
    );
    assert(
      entry.implements === acc.implements,
      `Error merging schema entries: inheritance do not match for ${entry.name}`,
    );
    assert(
      entry.fields.every(f1 => acc.fields.every(f2 => !SchemaEntry.fieldConflict(f1, f2))),
      `Error merging schema entries: incompatible fields found for ${entry.name}`,
    );

    return new SchemaEntry({
      name:       entry.name,
      implements: entry.implements,
      fields:     [].concat(entry.fields, acc.fields).unique(({ name }) => name),
    });
  }
}

/*********************************************************************************************************************
 *                                                Subgraph generation                                                *
 *********************************************************************************************************************/
class Subgraph {
  constructor(schema, config) {
    this.schema = schema;
    this.config = config;
  }

  toString() {
    assert(this.config.receipt.datasources.every(({ address }) => address), 'Error writting subgraph: datasource is missing address');
    const header    = readFile(path.resolve(__dirname, '../src/header.yaml'));
    const templates = Object.fromEntries(
      this.config.modules().map(module => {
        try {
          return [ module, readFile(path.resolve(__dirname, `../src/datasources/${module}.yaml`)) ]
        } catch {
          return undefined
        }
      })
    );
    return [].concat(
      header
        .replace(/\{(\w+)\}/g, (_, varname) => ({ schema: this.schema })[varname]),
      this.config.receipt.datasources
        .flatMap(datasource => [].concat(datasource.module).map(module => Object.assign(datasource, { module })))
        .map((datasource, i, array) => Object.assign(
          {
            id:         array.findIndex(({ module }) => module === datasource.module) === i ? datasource.module : `${datasource.module}-${i}`,
            startBlock: this.config.receipt.startBlock || 0,
            chain:      this.config.receipt.chain      || 'mainnet',
          },
          datasource,
        ))
        .map(datasource => templates[datasource.module].replace(/\{(\w+)\}/g, (_, varname) => datasource[varname]))
    ).join('');
  }
}

/*********************************************************************************************************************
 *                                                      Config                                                       *
 *********************************************************************************************************************/
class Config {
  constructor(file) {
    this.receipt = JSON.parse(readFile(file));
  }

  modules() {
    return this.receipt.datasources.flatMap(({ module }) => module).unique();
  }

  schema() {
    return Schema.from(this.modules().flatMap(module => Schema.load(path.resolve(__dirname, `../src/datasources/${module}.gql.json`)))).sanitize();
  }

  subgraph(schema = `${path.basename(this.receipt.output)}.schema.graphql`) {
    return new Subgraph(schema, this)
  }
}

(async () => {
  const config = new Config(argv.path);

  if (argv.exportSchema) {
    const file = path.resolve(__dirname, `${config.receipt.output}.schema.graphql`);
    writeFile(file, [
      config.schema().toString(),
      readFile(path.resolve(__dirname, '../node_modules/@amxx/graphprotocol-utils/generated/schema.graphql')),
    ].join(''));
    console.log(`- Schema exported to ${file}`)
  }

  if (argv.exportSubgraph) {
    const file = path.resolve(__dirname, `${config.receipt.output}.subgraph.yaml`);
    writeFile(file, config.subgraph().toString());
    console.log(`- Manifest exported to ${file}`)
  }

})().catch(console.error)
