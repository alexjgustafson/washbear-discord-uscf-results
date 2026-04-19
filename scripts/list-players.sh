#!/bin/bash
#
# Usage: ./scripts/list-players.sh
#
# Lists all subscribed player IDs from template.yaml with names from the USCF API.

set -euo pipefail

TEMPLATE="template.yaml"

PLAYERS=$(grep "SUBSCRIBED_PLAYERS:" "$TEMPLATE" | sed "s/.*'\(.*\)'/\1/" | tr ',' '\n')
COUNT=$(echo "$PLAYERS" | wc -l | tr -d ' ')

echo "Subscribed players:"
echo ""
while read -r id; do
    response=$(curl -s "https://ratings-api.uschess.org/api/v1/members/$id")
    first=$(echo "$response" | grep -o '"firstName":"[^"]*"' | head -1 | cut -d'"' -f4)
    last=$(echo "$response" | grep -o '"lastName":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$first" ] && [ -n "$last" ]; then
        echo "  $id  # $first $last"
    else
        echo "  $id  # (unknown)"
    fi
done <<< "$PLAYERS"
echo ""
echo "Total: $COUNT players"
