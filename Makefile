# Set default shell to bash
SHELL := /bin/bash -o pipefail -o errexit -o nounset

RUN_ADD_LICENSE=go run github.com/google/addlicense@v1.0.0 \
	-ignore **/*.yml	\
	-ignore '.vagrant/**' \
	-ignore 'node_modules/**'

all:
	echo "run: make gha or make vagrant"

.PHONY: vagrant
vagrant: 
	vagrant up ubuntu-20.04 --provision

## add license to code
.PHONY: license
license:
	$(RUN_ADD_LICENSE) -c "i4k (Tiago de Bem Natel de Moura)" .

## check if code is licensed properly
.PHONY: license/check
license/check:
	$(RUN_ADD_LICENSE) --check .