#!/bin/bash
#
# Usage: ./scripts/list-players.sh
#
# Lists all subscribed player IDs from template.yaml

set -euo pipefail

TEMPLATE="template.yaml"

PLAYERS=$(grep "SUBSCRIBED_PLAYERS:" "$TEMPLATE" | sed "s/.*'//; s/'//" | tr ',' '\n')
COUNT=$(echo "$PLAYERS" | wc -l | tr -d ' ')

echo "Subscribed players:"
echo ""
echo "$PLAYERS" | while read -r id; do
    echo "  $id"
done
echo ""
echo "Total: $COUNT players"
