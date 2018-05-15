#!/bin/bash

MASTER=${1}
FIRST=${2}
SECOND=${3}
ARBITER=${4}
EXEC_FUNCTION=${5}
PORT=27017

if [ "$MASTER" != "$FIRST" ]; then
    SECOND=$FIRST;
    MASTER=$SECOND;
fi

function initiate(){
mongo << EOF
    rs.initiate({
      _id: "rs0",
      members:[{
        _id : 0,
        host : "${MASTER}:${PORT}"
      }]}
    );
EOF
sleep 3;
mongo << EOF
    cfg = rs.conf();
    cfg.members[0].priority = 2;
    rs.reconfig(cfg);
EOF
}

function addSlave(){
mongo << EOF
    rs.add("${SECOND}");
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
