# HumanQA visual system

## Design premise

HumanQA looks like an evidence lab, not an AI assistant. The system uses a warm technical paper surface, charcoal structure, and one signal-orange accent. Geometry is sharp because each artifact should feel inspectable and versionable.

Design dials:

- Design variance: 7. Asymmetric compositions remain ordered and readable.
- Motion intensity: 5. Entry movement communicates hierarchy; interaction movement confirms state.
- Visual density: 5. Marketing pages breathe, while documentation stays compact enough for working sessions.

## Tokens

| Role    | Light     | Dark      | Purpose                              |
| ------- | --------- | --------- | ------------------------------------ |
| Paper   | `#f2f0e8` | `#171915` | Page field                           |
| Surface | `#faf9f5` | `#20231e` | Evidence panels                      |
| Ink     | `#191b18` | `#eeece4` | Primary content                      |
| Muted   | `#5a5f58` | `#b7bbb3` | Supporting text                      |
| Signal  | `#b63b13` | `#ff7b4c` | Focus, action, and evidence emphasis |

The accent is semantic. It identifies action, focus, and evidence junctions. It is not used as decoration across every surface.

## Typography

The website uses system-installed wide technical sans faces first, then accessible operating-system fallbacks. Code and measured evidence use Cascadia Code or the platform monospace fallback. No remote font request is required.

## Evidence glyphs

The original icon family is constructed on a 24-unit grid with square line caps, 1.55-unit strokes, hard corners, and one optional signal fill. The core aperture combines three ideas:

1. A document corner for recorded evidence.
2. A cut edge for a decision boundary.
3. A shifted plane for the raw artifact behind the conclusion.

The family includes aperture, capture, trace, report, focus, contract, shield, pack, code, check, arrow, menu, and GitHub integration glyphs. Product glyphs are original. The GitHub glyph represents an external integration and remains visually normalized to the family.

## Motion

Section reveals use only opacity and transform. They show reading order rather than adding spectacle. All automated movement is removed under `prefers-reduced-motion: reduce`.

## Accessibility contract

- Focus uses a three-pixel signal outline with four-pixel separation.
- Controls maintain at least 44 by 44 CSS pixels where practical.
- Navigation collapses before it can wrap.
- The page honors system dark mode without changing theme mid-page.
- The marketing and docs routes are tested with axe and keyboard interaction.
- Report screenshots include descriptive alternative text and are not required to understand the product promise.

## Asset provenance

The report images are captured from a real HumanQA broken-fixture run. The Open Graph card was generated specifically for this repository and checked for exact text. No customer logos, fabricated testimonials, adoption counts, or invented performance claims appear in the site.
