#!/usr/bin/env bash

set -e

export FLASK_APP=server
export FLASK_ENV=development

flask run
