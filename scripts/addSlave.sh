#!/bin/bash
mongo << EOF
    rs.add({
        host: "${1}",
        priority: ${2},
        votes:${2}
    })
EOF
