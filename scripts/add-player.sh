#!/bin/bash
#
# Usage: ./scripts/add-player.sh <player_id> "<player_name>"
#
# Adds a new player to template.yaml:
#   1. Appends a comment line with the ID and name
#   2. Appends the ID to the SUBSCRIBED_PLAYERS env var
#
# Example:
#   ./scripts/add-player.sh 12345678 "Jane Doe"

set -euo pipefail

TEMPLATE="template.yaml"

if [ $# -ne 2 ]; then
    echo "Usage: $0 <player_id> \"<player_name>\""
    echo "Example: $0 12345678 \"Jane Doe\""
    exit 1
fi

PLAYER_ID="$1"
PLAYER_NAME="$2"

# Validate player ID is numeric
if ! [[ "$PLAYER_ID" =~ ^[0-9]+$ ]]; then
    echo "Error: Player ID must be numeric, got '$PLAYER_ID'"
    exit 1
fi

# Check if player already exists
if grep -q "# $PLAYER_ID = " "$TEMPLATE"; then
    echo "Player $PLAYER_ID ($PLAYER_NAME) is already in $TEMPLATE"
    exit 0
fi

# 1. Add the comment line before SUBSCRIBED_PLAYERS
sed -i '' "/^          SUBSCRIBED_PLAYERS:/i\\
          # $PLAYER_ID = $PLAYER_NAME" "$TEMPLATE"

# 2. Append the player ID to the SUBSCRIBED_PLAYERS value
sed -i '' "s/\(SUBSCRIBED_PLAYERS: '.*\)'/\1,$PLAYER_ID'/" "$TEMPLATE"

echo "Added player $PLAYER_ID ($PLAYER_NAME) to $TEMPLATE"
echo ""
echo "Next steps:"
echo "  sam build && sam deploy"
