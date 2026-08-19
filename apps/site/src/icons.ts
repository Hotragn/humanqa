export type EvidenceIconName =
  | "aperture"
  | "arrow"
  | "capture"
  | "check"
  | "code"
  | "contract"
  | "focus"
  | "github"
  | "menu"
  | "pack"
  | "report"
  | "shield"
  | "trace";

const paths: Record<EvidenceIconName, string> = {
  aperture:
    '<path d="M3 4h8l4 4v12H7l-4-4V4Z"/><path class="icon-fill" d="m15 8 5-4v12l-5 4V8Z"/><path d="M7 9h4M7 14h4"/>',
  arrow: '<path d="M5 12h13M13 7l5 5-5 5"/>',
  capture:
    '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><rect x="8" y="8" width="8" height="8"/><path class="icon-fill" d="M11 11h2v2h-2z"/>',
  check: '<path d="m5 12 4 4L19 6"/><path d="M4 4h10l6 6v10H10l-6-6V4Z"/>',
  code: '<path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 4l-2 16"/>',
  contract:
    '<path d="M5 3h10l4 4v14H5V3Z"/><path d="M15 3v5h4M9 12h6M9 16h4"/><path class="icon-fill" d="M3 7h4v4H3z"/>',
  focus: '<path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6"/><path d="m8 12 3 3 6-7"/>',
  github:
    '<path d="M12 3a9 9 0 0 0-3 17.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.3-.3-4.6-1.1-4.6-5A3.9 3.9 0 0 1 8 7.8c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.9 1.1a10 10 0 0 1 5.2 0c2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 1.9V20c0 .3.2.6.7.5A9 9 0 0 0 12 3Z"/>',
  menu: '<path d="M4 7h16M4 12h11M4 17h16"/>',
  pack: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  report:
    '<path d="M4 4h10l6 6v10H10l-6-6V4Z"/><path d="M14 4v6h6M8 14h3M8 17h7"/><path class="icon-fill" d="M4 4h4v4H4z"/>',
  shield: '<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  trace:
    '<path d="M3 6h6l3 6h9M3 18h6l3-6M17 8l4 4-4 4"/><path class="icon-fill" d="M3 4h4v4H3zM3 16h4v4H3z"/>'
};

export function evidenceIcon(name: EvidenceIconName, size = 24): string {
  return `<svg class="evidence-icon" width="${String(size)}" height="${String(size)}" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
