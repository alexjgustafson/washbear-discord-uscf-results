#!/bin/bash
#
# Usage: ./scripts/list-players.sh
#
# Lists all subscribed players from template.yaml

set -euo pipefail

TEMPLATE="template.yaml"

echo "Subscribed players:"
echo ""
grep "# [0-9]* = " "$TEMPLATE" | sed 's/.*# /  /' | sort -t= -k2
echo ""
COUNT=$(grep -c "# [0-9]* = " "$TEMPLATE")
echo "Total: $COUNT players"
