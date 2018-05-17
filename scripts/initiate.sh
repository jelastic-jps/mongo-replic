#!/bin/bash

MASTER_IP_ADDRESS=${1}
FIRST_NODE_ADDRESS=${2}
SECOND_NODE_ADDRESS=${3}
ARBITER_NODE_ADDRESS=${4}
EXEC_FUNCTION=${5}
PORT=27017

if [ "$MASTER_IP_ADDRESS" != "$FIRST_NODE_ADDRESS" ]; then
    MASTER_IP_ADDRESS=$SECOND_NODE_ADDRESS;
    SECOND_NODE_ADDRESS=$FIRST_NODE_ADDRESS;
fi

function initiate(){
mongo << EOF
rs.initiate({
  _id: "rs0",
  members:[{
    _id : 0,
    host : "${MASTER_IP_ADDRESS}:${PORT}"
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
    rs.add("${SECOND_NODE_ADDRESS}");
EOF
}

function addArbiter(){
mongo << EOF
    rs.addArb("${ARBITER_NODE_ADDRESS}");
EOF
}

initiate
addSlave
addArbiter
