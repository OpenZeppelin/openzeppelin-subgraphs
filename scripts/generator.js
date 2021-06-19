#!/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const argv = require('yargs').argv;
// const argv = require('yargs/yargs')(require('yargs/helpers').hideBin(process.argv)).argv;


Array.prototype.unique = function(op = x => x) {
  return this.filter((obj, i) => this.findIndex(entry => op(obj) === op(entry)) === i);
}

Object.prototype.isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
}

function assert(condifiton, error = 'assertion failed') {
  if (!condifiton) {
    throw new Error(error);
  }
}

function readFile(file) {
  return fs.readFileSync(file, { encoding: 'utf8' });
}

function writeFile(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data, { encoding: 'utf-8' });
}

/*********************************************************************************************************************
 *                                                 Schema generation                                                 *
 *********************************************************************************************************************/
class Schema extends Array {
  static load(file) {
    return JSON.parse(readFile(file)).map(SchemaEntry.from);
  }

  toString() {
    return this.join('');
  }

  sanitize() {
    return Schema.from(
      this
        .map(({ name }) => name)
        .unique()
        .map(entry => this.filter(({ name }) => name == entry).reduce(SchemaEntry.merge, {}))
    );
  }
}

class SchemaEntry {
  constructor({ name, fields = [], enums = [], parent = null }) {
    assert(
      enums.length == 0 || fields.length == 0,
      `Error loading schema entry ${name}: Entry contains both enums and fields`,
    );
    this.name   = name;
    this.fields = fields.map(SchemaEntryField.from);
    this.enums  = enums;
    this.parent = parent;

    // add id field
    if (this.enums.length == 0 && !this.fields.find(({ name, type }) => name === 'id' && type === 'ID!')) {
      this.fields.unshift(new SchemaEntryField());
    }
  }

  toString() {
    return [].concat(
      // entity header
      this.enums.length == 0
      ? this.parent
      ? `type ${this.name} implements ${this.parent} @entity {\n`
      : `type ${this.name} @entity {\n`
      : `enum ${this.name} {\n`,
      // entities
      (
        this.enums.length == 0
        ? this.fields
        : this.enums
      ).map(e => `\t${e}\n`),
      `}\n`,
    ).filter(Boolean).join('')
  }

  static from(obj) {
    return new SchemaEntry(obj);
  }

  static merge(e1, e2) {
    if (Object.isEmpty(e1)) {
      return e2;
    } else if (Object.isEmpty(e2)) {
      return e1;
    } else {
      assert(
        e1.name === e2.name,
        `Error merging schema entries: name do not match (${e1.name} / ${e2.name})`,
      );
      assert(
        e1.implements === e2.implements,
        `Error merging schema entries: inheritance do not match for ${e1.name}`,
      );
      assert(
        !!e1.enums === !!e2.enums,
        `Error merging schema entries: enum/type clash for ${e1.name}`,
      );
      assert(
        e1.fields.every(f1 => e2.fields.every(f2 => !SchemaEntryField.conflict(f1, f2))),
        `Error merging schema entries: incompatible fields found for ${e1.name}`,
      );

      return SchemaEntry.from({
        name:       e1.name,
        implements: e1.implements,
        fields:     [].concat(e1.fields, e2.fields).unique(({ name }) => name),
        enums:      [].concat(e1.enums,  e2.enums).unique(),
      });
    }
  }
}

class SchemaEntryField {
  constructor({ name = 'id', type = 'ID!', derived = null } = {}) {
    this.name    = name;
    this.type    = type;
    this.derived = derived;
  }

  toString() {
    return this.derived
    ? `${this.name}: [${this.type}]! @derivedFrom(field: "${this.derived}")`
    : `${this.name}: ${this.type}`;
  }

  static from(obj) {
    return new SchemaEntryField(obj);
  }

  static conflict(f1, f2) {
    return f1.name === f2.name && (f1.type !== f2.type || f1.derived !== f2.derived);
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
    const datasources = Object.fromEntries(
      this.config.modules().map(module => {
        try {
          return [ module, readFile(path.resolve(__dirname, `../src/datasources/${module}.yaml`)) ]
        } catch {
          return undefined
        }
      })
    );

    const templates = Object.fromEntries(
      this.config.templates().map(template => {
        try {
          return [ template, readFile(path.resolve(__dirname, `../src/templates/${template}.yaml`)) ]
        } catch {
          return undefined
        }
      })
    );

    return [].concat(
      `specVersion: 0.0.2\n`,
      `schema:\n`,
      `  file: ${this.schema}\n`,
      // datasources
      this.config.datasources().length && `dataSources:\n`,
      this.config.datasources()
        .flatMap(datasource => [].concat(datasource.module).map(module => Object.assign({}, datasource, { module })))
        .map((datasource, i, array) => Object.assign(
          {
            id:         array.findIndex(({ module }) => module === datasource.module) === i ? datasource.module : `${datasource.module}-${i}`,
            startBlock: this.config.receipt.startBlock || 0,
            chain:      this.config.receipt.chain      || 'mainnet',
          },
          datasource,
        ))
        .map(datasource => datasources[datasource.module].replace(/\{(\w+)\}/g, (_, varname) => datasource[varname])),
      // templates
      Object.keys(templates).length && `templates:\n`,
      Object.keys(templates)
        .map((id) => Object.assign({
          id,
          chain: this.config.receipt.chain || 'mainnet',
        }))
        .map(template => templates[template.id].replace(/\{(\w+)\}/g, (_, varname) => template[varname])),
    ).filter(Boolean).join('');
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

  datasources() {
    return this.receipt.datasources.filter(({ address, module }) => address && (module || []).length)
  }

  templates() {
    return this.receipt.datasources.flatMap(({ templates }) => templates || []).unique()
  }

  schema() {
    return Schema.from([].concat(
      this.modules().flatMap(module => Schema.load(path.resolve(__dirname, `../src/datasources/${module}.gql.json`))),
      this.templates().flatMap(template => Schema.load(path.resolve(__dirname, `../src/templates/${template}.gql.json`))),
    )).sanitize();
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
