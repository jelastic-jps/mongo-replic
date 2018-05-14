#!/bin/bash
mongo << EOF
    db.isMaster()
EOF
