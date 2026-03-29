#!/bin/bash
#
# Usage: ./scripts/remove-player.sh <player_id>
#
# Removes a player from template.yaml:
#   1. Deletes the comment line for that player ID
#   2. Removes the ID from the SUBSCRIBED_PLAYERS env var
#
# Example:
#   ./scripts/remove-player.sh 12345678

set -euo pipefail

TEMPLATE="template.yaml"

if [ $# -ne 1 ]; then
    echo "Usage: $0 <player_id>"
    echo "Example: $0 12345678"
    exit 1
fi

PLAYER_ID="$1"

if ! grep -q "# $PLAYER_ID = " "$TEMPLATE"; then
    echo "Player $PLAYER_ID not found in $TEMPLATE"
    exit 1
fi

# Get the player name for confirmation
PLAYER_NAME=$(grep "# $PLAYER_ID = " "$TEMPLATE" | sed "s/.*# $PLAYER_ID = //")

# 1. Remove the comment line
sed -i '' "/# $PLAYER_ID = /d" "$TEMPLATE"

# 2. Remove from SUBSCRIBED_PLAYERS (handle first, middle, and last positions)
sed -i '' "s/,$PLAYER_ID'/'/; s/,$PLAYER_ID,/,/; s/'$PLAYER_ID,/'/" "$TEMPLATE"

echo "Removed player $PLAYER_ID ($PLAYER_NAME) from $TEMPLATE"
echo ""
echo "Next steps:"
echo "  sam build && sam deploy"
