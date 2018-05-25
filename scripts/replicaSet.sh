#!/bin/bash

EXEC_FUNCTION=${1}
MASTER_IP_ADDRESS=${2}
FIRST_NODE_ADDRESS=${3}
SECOND_NODE_ADDRESS=${4}
ARBITER_NODE_ADDRESS=${5}
ADD_SLAVE_HOST=${6}
PRIORITY=${7}
PORT=27017

if [ "$MASTER_IP_ADDRESS" != "$FIRST_NODE_ADDRESS" ]; then
    MASTER_IP_ADDRESS=$SECOND_NODE_ADDRESS;
    SECOND_NODE_ADDRESS=$FIRST_NODE_ADDRESS;
fi

if [ -z "${PRIORITY}" ]; then
    PRIORITY=0;
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

addSlave
addArbiter
}

function addSlave(){
mongo << EOF
    rs.add({
        host: "${SECOND_NODE_ADDRESS}",
        priority: ${PRIORITY},
        votes:${PRIORITY}
    })
EOF
}

function getStatus() {
mongo << EOF
    rs.status()
EOF
}

function removeSlave() {
mongo << EOF
    rs.remove("${2}")
EOF
}

function isMaster() {
mongo << EOF
    db.isMaster()
EOF
}

function addArbiter(){
mongo << EOF
    rs.addArb("${ARBITER_NODE_ADDRESS}");
EOF
}

${EXEC_FUNCTION}
