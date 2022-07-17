all:
	echo "run: make gha or make vagrant"

.PHONY: vagrant
vagrant: 
	vagrant up ubuntu-20.04 --provision

