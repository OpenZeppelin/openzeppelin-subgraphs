#!/usr/bin/env bash

set -xo errexit

for config in configs/live/**/*.json;
do
    ${0%/*}/deploy.sh $config
done