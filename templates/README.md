# Formatter & Linter Config Templates

Canonical formatting configuration for OSBR repositories, layered like the
[Style Guide](https://osbrjp.github.io/handbook/style-guide) itself.

## Layers

- **Language-agnostic base — `.editorconfig`.** Charset, line endings, indent,
  final newline, trailing whitespace, and `max_line_length`. Every editor and
  many formatters read it, so it is the single source for cross-language rules.
- **Language-specific:**
  - TypeScript / JavaScript / Markdown — `.prettierrc.json` (Prettier).
  - Python — `ruff.toml` (Ruff formats and lints).
  - Go — none. `gofmt` is mandatory and takes no configuration; it does not
    enforce a line length.

## Usage

Copy the relevant files to a repository root. These same files are mirrored in
`osbrjp/standard-repository`, so a repo scaffolded from that template already
carries them.
