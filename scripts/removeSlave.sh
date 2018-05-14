#!/bin/bash
mongo << EOF
    rs.remove("${1}")
EOF
