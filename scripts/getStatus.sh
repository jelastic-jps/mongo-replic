#!/bin/bash

mongo << EOF
    rs.status()
EOF
