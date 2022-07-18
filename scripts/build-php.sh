#!/usr/bin/env bash

set -o nounset
set -o pipefail

main() {
    [[ "$1" ]] || return 1

    check_base || return 1

    local -r URL="$1"
    local -r version="$2"
    local -r cwd=$(pwd)

    install_system_deps || return 1

    build $version $URL || return 1

    test_unit

    cd "${cwd}"
    return 0
}

check_base() {
    programs=(
        mktemp
        basename
        apt-get
        pwd
    )

    for p in ${programs}; do
        which "${p}" &>/dev/null || return 1
    done

    return 0
}

install_system_deps() {
    prereq=(
        git
        build-essential
        pkg-config
        libxml2-dev
        libsqlite3-dev
        libpcre2-dev
        libssl-dev
    )

    sudo apt-get update || return 1
    sudo apt-get -y install ${prereq} || return 1

    # setup swap
    sudo mkdir -p /var/cache/swap/
    sudo dd if=/dev/zero of=/var/cache/swap/swap0 bs=64M count=64
    sudo chmod 0600 /var/cache/swap/swap0
    sudo mkswap /var/cache/swap/swap0
    sudo swapon /var/cache/swap/swap0
    sudo swapon -s

    return 0
}

cleanup() {
    local -r dir="$1"

    echo "cleaning up directory ${dir}"
    rm -rf "${dir}"
}

download_php() {
    local -r URL="$1"
    local -r outdir="$2"
    local -r outname="$3"

    local -r output="${outdir}/${outname}"

    echo "Downloading PHP to ${output}"

    wget -c -O "${output}" "$URL" || return 1
    return 0
}

build() {
    [[ "$2" ]] || return 1

    local -r version="$1"
    local -r URL="$2"

    echo "Build environment:"
    gcc --version
    echo

    tmpdir="$(mktemp -d /tmp/build-phpXXX)"
    filename="$(basename $URL)"

    cd "${tmpdir}"

    download_php "${URL}" "${tmpdir}" "${filename}" || cleanup "${tmpdir}"

    local -r flags=(
        --enable-embed
    )
    
    mkdir -p php
    tar xvf "${filename}" || return 1

    cd "php-${version}"

    ./configure ${flags} || return 1
    make -j4 || return 1
    sudo make install || return 1

    echo "Built successfully"

    cleanup "${tmpdir}"
    return 0
}

test_unit() {
    local -r tmpdir="$(mktemp -d /tmp/build-unitXXX)"
    cd "${tmpdir}"
    git clone https://github.com/nginx/unit.git
    cd unit
    ./configure --prefix=/usr
    ./configure php
    make
}

main $@ || exit 1
