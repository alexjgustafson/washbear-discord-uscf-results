#!/bin/bash
#
# Usage: ./scripts/add-player.sh <player_id>
#
# Adds a new player ID to the SUBSCRIBED_PLAYERS env var in template.yaml.
#
# Example:
#   ./scripts/add-player.sh 12345678

set -euo pipefail

TEMPLATE="template.yaml"

if [ $# -ne 1 ]; then
    echo "Usage: $0 <player_id>"
    echo "Example: $0 12345678"
    exit 1
fi

PLAYER_ID="$1"

# Validate player ID is numeric
if ! [[ "$PLAYER_ID" =~ ^[0-9]+$ ]]; then
    echo "Error: Player ID must be numeric, got '$PLAYER_ID'"
    exit 1
fi

# Check if player already exists in SUBSCRIBED_PLAYERS
if grep -q "SUBSCRIBED_PLAYERS:.*$PLAYER_ID" "$TEMPLATE"; then
    echo "Player $PLAYER_ID is already in $TEMPLATE"
    exit 0
fi

# Append the player ID to the SUBSCRIBED_PLAYERS value
sed -i '' "s/\(SUBSCRIBED_PLAYERS: '.*\)'/\1,$PLAYER_ID'/" "$TEMPLATE"

echo "Added player $PLAYER_ID to $TEMPLATE"
echo ""
echo "Next steps:"
echo "  sam build && sam deploy"
