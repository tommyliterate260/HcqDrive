#!/usr/bin/env bash
# setup-keystore.sh — generate a release keystore for HcqDrive and push
# the credentials to GitHub Secrets so CI can sign release APKs.
#
# Run this ONCE on a secure machine, then keep the resulting .keystore
# file in a safe place (1Password, encrypted disk, etc.). Losing this
# file means you can never push updates to the same Play Store listing.
#
# Requirements: keytool (JDK), gh CLI, logged in to a GitHub account with
# write access to the repo.
set -euo pipefail

REPO="${REPO:-huangchengqian/HcqDrive}"
KEYSTORE_PATH="${KEYSTORE_PATH:-./app/release.keystore}"
ALIAS="${ALIAS:-hcqdrive}"
DNAME="${DNAME:-CN=HcqDrive,O=HcqDrive,L=,S=,C=CN}"
VALIDITY_DAYS="${VALIDITY_DAYS:-10000}"

echo "==> Generating keystore at $KEYSTORE_PATH (alias=$ALIAS, validity=$VALIDITY_DAYS days)"
echo "==> You will be asked for store password and key password. Use a strong password."
echo "    Save these in your password manager — they are NOT recoverable."
echo

mkdir -p "$(dirname "$KEYSTORE_PATH")"

keytool -genkey -v \
  -keystore "$KEYSTORE_PATH" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 \
  -validity "$VALIDITY_DAYS" \
  -dname "$DNAME"

echo
echo "==> Keystore generated."
echo "==> Verifying..."
keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$ALIAS" | head -20

echo
read -r -s -p "Store password (for GitHub secret RELEASE_STORE_PASSWORD): " STORE_PWD; echo
read -r -s -p "Key password   (for GitHub secret RELEASE_KEY_PASSWORD):  " KEY_PWD;   echo

if [ -z "$STORE_PWD" ] || [ -z "$KEY_PWD" ]; then
  echo "Passwords cannot be empty. Aborting."
  exit 1
fi

echo
echo "==> Pushing secrets to $REPO via gh CLI..."
gh secret set RELEASE_STORE_FILE      --repo "$REPO" --body "$KEYSTORE_PATH"
gh secret set RELEASE_KEY_ALIAS       --repo "$REPO" --body "$ALIAS"
gh secret set RELEASE_STORE_PASSWORD  --repo "$REPO" --body "$STORE_PWD"
gh secret set RELEASE_KEY_PASSWORD    --repo "$REPO" --body "$KEY_PWD"

B64_PATH="${KEYSTORE_PATH}.b64"
base64 -i "$KEYSTORE_PATH" -o "$B64_PATH"

gh secret set KEYSTORE_BASE64 --repo "$REPO" < "$B64_PATH"

rm -f "$B64_PATH"

echo
echo "==> All four secrets uploaded:"
echo "    - RELEASE_STORE_FILE"
echo "    - RELEASE_KEY_ALIAS"
echo "    - RELEASE_STORE_PASSWORD"
echo "    - RELEASE_KEY_PASSWORD"
echo "    - KEYSTORE_BASE64"
echo
echo "==> IMPORTANT: keep $KEYSTORE_PATH safe."
echo "    - Do NOT commit it (it's in .gitignore, but double-check)."
echo "    - Back it up to 1Password / encrypted disk."
echo "    - Losing it means you can never push updates to the same listing."
