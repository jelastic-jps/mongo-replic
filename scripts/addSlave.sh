#!/bin/bash
mongo << EOF
    rs.add("${1}")
EOF
