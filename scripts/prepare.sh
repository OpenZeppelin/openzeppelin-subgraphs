#!/usr/bin/env bash

node ./scripts/generator.js --path ./configs/all.json           --export-schema
node ./scripts/generator.js --path ./configs/accesscontrol.json --export-schema
node ./scripts/generator.js --path ./configs/erc721.json        --export-schema
node ./scripts/generator.js --path ./configs/erc20.json         --export-schema
