# Release Notes Skill

This skill helps generate release notes from git commits and issue trackers.

## Description

Automatically generates release notes by:
- Analyzing git commits since last release
- Grouping changes by type (features, fixes, breaking changes)
- Including referenced issues and pull requests
- Formatting output for changelogs or release announcements

## Usage

Invoke this skill when preparing a release to generate comprehensive release notes.

## Parameters

- `version`: The version number for the release
- `since`: Commit/tag to generate notes from (default: last tag)
- `format`: Output format (markdown, json, text)

## Example

```text
/release-notes generate version:1.2.0 format:markdown
```