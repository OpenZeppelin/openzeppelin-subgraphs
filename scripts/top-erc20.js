#!/bin/env node
'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');

Array.prototype.unique = function(op = x => x) {
  return this.filter((obj, i) => this.findIndex(entry => op(obj) === op(entry)) === i)
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, function(res){
      var body = [];
      res.on('data', function(chunk){
          body.push(chunk);
      });
      res.on('end', function(){
          resolve(JSON.parse(body.join('')));
      });
    }).on('error', reject);
  });
}

(async () => {
  const tokenLists = [
    'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://erc20.cmc.eth.link',
    'https://stablecoin.cmc.eth.link',
  ]

  const addresses = await Promise.all(tokenLists.map(getJSON)).then(responces =>
    responces
      .flatMap(({ tokens }) => tokens)
      .filter(({ chainId }) => chainId === 1) // only chain id
      .map(({ address }) => address.toLowerCase())
      .unique()
      .sort((a, b) => a.localeCompare(b))
  );

  console.log(JSON.stringify({
    output: "generated/top-erc20.",
    chain: "mainnet",
    datasources: addresses.map(address => ({ address, module: "erc20"}))
  }, null, null))

})().catch(console.error)
