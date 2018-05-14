#!/bin/bash

PRIMARY=${1}
SLAVE=${2}
ARBITER=${3}
EXEC_FUNCTION=${4}
PORT=27017

function initiate(){
mongo << EOF
    rs.initiate({
      _id: "rs0",
      members:[{
        _id : 0,
        host : "${PRIMARY}:${PORT}"
      }]}
    );
EOF
}

function addSlave(){
mongo << EOF
    rs.add("${SLAVE}");
EOF
}

function addArbiter(){
    mongo << EOF
        rs.addArb("${ARBITER}");
EOF
}

initiate
addSlave
addArbiter
