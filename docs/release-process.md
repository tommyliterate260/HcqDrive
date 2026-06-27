# Release process

This project ships two kinds of artifacts on every tagged release:

1. **`app-debug.apk`** — built from `assembleDebug`, signed with the Android
   debug key. Quick to build, **not for Play Store distribution.**
2. **`app-release.apk`** — built from `assembleRelease`, signed with the
   project's release keystore. Required for Play Store.

The release workflow at `.github/workflows/release.yml` builds **both** on
every `v*` tag, attaches them to the GitHub Release, and prefers the
signed APK in the release notes.

## One-time setup: create the release keystore

The release keystore is **never** committed to this repo. It is stored as
a GitHub Actions secret (`KEYSTORE_BASE64`), and the four passwords
(`RELEASE_STORE_FILE`, `RELEASE_KEY_ALIAS`, `RELEASE_STORE_PASSWORD`,
`RELEASE_KEY_PASSWORD`) are stored as separate secrets.

To set them up locally and push to GitHub:

```bash
./tools/setup-keystore.sh
```

The script will:
1. Generate `app/release.keystore` (alias `hcqdrive`, 10000-day validity)
2. Prompt for the store password and key password
3. Push all five secrets to GitHub via `gh secret set`
4. Wipe the local base64 copy

> **WARNING**: losing `app/release.keystore` means you can never push
> updates to the same Play Store listing. The Google Play Console will
> reject any APK signed with a different key. Back the file up to
> 1Password, an encrypted disk, or another secure location.

## Cutting a release

```bash
# 1. Bump the version in app/build.gradle.kts:
#      versionCode = N
#      versionName = "X.Y.Z"
#
# 2. Update CHANGELOG.md under a new "## [X.Y.Z]" heading.
#
# 3. Commit, tag, push.
git add app/build.gradle.kts CHANGELOG.md
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

The CI workflow will:
1. Build the debug APK
2. Build the signed release APK (if secrets are configured)
3. Create the GitHub Release and attach both APKs

## Manual trigger

If you need to re-build a release without re-tagging (e.g. you fixed the
CI but don't want to bump the version), go to:
**Actions → Build and Release APK → Run workflow → main**
