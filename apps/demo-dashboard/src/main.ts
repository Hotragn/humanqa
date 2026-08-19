import "./styles.css";

declare const __FIXTURE_MODE__: "broken" | "fixed";

const broken = __FIXTURE_MODE__ === "broken";
const appCandidate = document.querySelector<HTMLDivElement>("#app");

if (!appCandidate) throw new Error("Fixture root #app was not found.");
const app: HTMLDivElement = appCandidate;

const navItems = [
  ["/", "Overview"],
  ["/signup", "Sign up"],
  ["/login", "Login"],
  ["/onboarding", "Onboarding"],
  ["/projects/new", "New project"],
  ["/dashboard", "Dashboard"],
  ["/settings", "Settings"],
  ["/accessible", "Accessible reference"]
] as const;

function layout(content: string): string {
  return `<div class="app-shell">
    <aside class="rail">
      <a class="brand" href="/" aria-label="Northstar fixture home"><span>NS</span><strong>Northstar</strong></a>
      <nav aria-label="Fixture routes">
        ${navItems
          .map(
            ([href, label]) =>
              `<a href="${href}" ${location.pathname === href ? 'aria-current="page"' : ""}>${label}</a>`
          )
          .join("")}
      </nav>
      <div class="mode ${broken ? "mode-broken" : "mode-fixed"}">
        <span>${broken ? "Broken" : "Fixed"}</span>
        <small>deterministic fixture</small>
      </div>
    </aside>
    <main id="main-content" class="content">${content}</main>
  </div>`;
}

function overview(): string {
  return `<header class="page-header">
      <p class="eyebrow">HumanQA reference application</p>
      <h1>Northstar quality lab</h1>
      <p class="lede">A local, reproducible SaaS fixture with paired broken and fixed states.</p>
    </header>
    <section class="route-grid" aria-labelledby="routes-title">
      <h2 id="routes-title">Exercise a journey</h2>
      <div class="cards">
        ${navItems
          .slice(1)
          .map(
            ([href, label], index) => `<a class="route-card" href="${href}">
              <span class="route-number">0${String(index + 1)}</span>
              <strong>${label}</strong>
              <span>Open route →</span>
            </a>`
          )
          .join("")}
      </div>
    </section>`;
}

function signup(): string {
  return `<header class="page-header"><p class="eyebrow">Account fixture</p><h1>Create your account</h1><p class="lede">No data leaves this browser.</p></header>
    <form class="form-card" id="signup-form">
      <label for="signup-name">Name</label><input id="signup-name" autocomplete="name" required>
      <label for="signup-email">Work email</label><input id="signup-email" type="email" autocomplete="email" required>
      <label for="signup-password">Password</label><input id="signup-password" type="password" autocomplete="new-password" required>
      <button type="button" id="signup-submit">Create local account</button>
      <p id="signup-status" class="status" role="status" hidden>Local account created. Continue to onboarding.</p>
    </form>`;
}

function login(): string {
  return `<header class="page-header"><p class="eyebrow">Simulated auth</p><h1>Welcome back</h1><p class="lede">Use any fixture values; authentication remains local.</p></header>
    <form class="form-card">
      <label for="login-email">Email</label><input id="login-email" type="email" value="developer@example.test">
      <label for="login-password">Password</label><input id="login-password" type="password" value="fixture-password">
      <button type="button" id="login-submit">Sign in locally</button>
      <p id="login-status" class="status" role="status" hidden>Signed in to the local fixture.</p>
    </form>`;
}

function onboarding(): string {
  return `<header class="page-header"><p class="eyebrow">Step 2 of 3</p><h1>Shape your workspace</h1><p class="lede">Choose a goal for this disposable fixture.</p></header>
    <section class="form-card" aria-labelledby="goal-title"><h2 id="goal-title">Primary goal</h2>
      <fieldset><legend class="sr-only">Select a primary goal</legend>
        <label class="choice"><input type="radio" name="goal" value="ship" checked> Ship product updates</label>
        <label class="choice"><input type="radio" name="goal" value="research"> Organize research</label>
        <label class="choice"><input type="radio" name="goal" value="quality"> Improve product quality</label>
      </fieldset>
      <a class="button-link" href="/projects/new">Continue to project setup</a>
    </section>`;
}

function projectCreation(): string {
  const slugField = broken
    ? `<input id="project-slug" name="slug" placeholder="project-slug">`
    : `<label for="project-slug">Project slug</label><input id="project-slug" name="slug" placeholder="project-slug">`;
  const confusing = broken
    ? `<div class="secondary-actions"><a href="/accessible">Learn more</a><a href="/broken-link">Learn more</a></div>`
    : `<div class="secondary-actions"><a href="/accessible">Review accessibility reference</a><a href="/broken-link">Read project documentation</a></div>`;
  return `<header class="page-header"><p class="eyebrow">Critical journey</p><h1>Create a project</h1><p class="lede">Seed a disposable project and inspect the resulting feedback.</p></header>
    <section class="workspace-grid">
      <form class="form-card project-form" id="project-form">
        <label for="project-name">Project name</label><input id="project-name" name="name" value="Evidence Lab">
        ${slugField}
        <label for="project-region">Region</label><select id="project-region"><option>US East</option><option>EU West</option></select>
        <div id="trap-start" class="trap-control" tabindex="0">Keyboard checkpoint</div>
        <button type="button" id="create-project" data-testid="create-project" data-action="create-project" data-humanqa-success-target="#project-success">Create project</button>
        <p id="project-success" class="status" role="status" ${broken ? "hidden" : "hidden"}>Project created. Open Evidence Lab.</p>
        ${confusing}
      </form>
      <section class="preview-panel" aria-label="Project surface preview"><p class="eyebrow">Responsive preview</p><h2>Project surface</h2>
        <div class="overflow-probe ${broken ? "is-broken" : ""}">This panel is deliberately wide only in broken mode.</div>
        <a href="/broken-link">Project documentation</a>
      </section>
    </section>`;
}

function dashboard(): string {
  return `<header class="page-header"><p class="eyebrow">Dashboard fixture</p><h1>Projects</h1><p class="lede">Empty-state behavior is declared for deterministic inspection.</p></header>
    <section class="data-panel" data-humanqa-empty="true">${
      broken
        ? ""
        : '<div data-empty-state role="status"><h2>No projects yet</h2><p>Create a project to begin collecting evidence.</p><a class="button-link" href="/projects/new">Create project</a></div>'
    }</section>
    <section class="data-panel loading-panel" data-humanqa-loading="true" ${broken ? "" : 'aria-busy="true"'}>
      ${broken ? '<span class="spinner"></span>' : '<span class="spinner" role="status" aria-label="Loading activity"></span>'}
    </section>`;
}

function settings(): string {
  return `<header class="page-header"><p class="eyebrow">Recovery fixture</p><h1>Workspace settings</h1><p class="lede">A validation state and a protected high-impact action.</p></header>
    <form class="form-card" data-humanqa-error-expected="true">
      <label for="workspace-name">Workspace name</label><input id="workspace-name" aria-invalid="true" value="">
      ${broken ? "" : '<p id="workspace-name-error" data-error-message role="alert">Workspace name is required.</p>'}
      <button type="button" data-action="save-settings">Save settings</button>
    </form>
    <section class="danger-zone"><h2>Danger zone</h2><p>HumanQA safe mode must never activate this control.</p>
      <button type="button" data-high-impact="true" ${broken ? "" : 'data-confirmation="true" aria-describedby="delete-warning"'}>Delete workspace</button>
      <p id="delete-warning">Deletion requires a separate reviewed confirmation.</p>
    </section>`;
}

function accessible(): string {
  return `<header class="page-header"><p class="eyebrow">Reference state</p><h1>Accessible component reference</h1><p class="lede">A small known-good surface for pack and keyboard checks.</p></header>
    <section class="form-card" aria-labelledby="reference-form-title"><h2 id="reference-form-title">Notification preferences</h2>
      <label for="digest-frequency">Digest frequency</label><select id="digest-frequency"><option>Weekly</option><option>Daily</option></select>
      <label class="choice"><input type="checkbox" checked> Product updates</label>
      <button type="button" id="save-reference">Save preferences</button><p id="reference-status" role="status" hidden>Preferences saved.</p>
    </section>`;
}

function render(): void {
  const routes: Record<string, () => string> = {
    "/": overview,
    "/signup": signup,
    "/login": login,
    "/onboarding": onboarding,
    "/projects/new": projectCreation,
    "/dashboard": dashboard,
    "/settings": settings,
    "/accessible": accessible
  };
  const page =
    routes[location.pathname] ??
    (() => `<h1>Route not found</h1><p>The fixture has no route at this path.</p>`);
  app.innerHTML = layout(page());
  bindInteractions();
}

function showStatus(id: string): void {
  const status = document.querySelector<HTMLElement>(id);
  if (status) status.hidden = false;
}

function bindInteractions(): void {
  document
    .querySelector("#signup-submit")
    ?.addEventListener("click", () => showStatus("#signup-status"));
  document
    .querySelector("#login-submit")
    ?.addEventListener("click", () => showStatus("#login-status"));
  document
    .querySelector("#save-reference")
    ?.addEventListener("click", () => showStatus("#reference-status"));
  document.querySelector("#create-project")?.addEventListener("click", () => {
    void fetch("/api/fail").then((response) => {
      if (!response.ok)
        console.error(`Fixture project request failed with ${String(response.status)}`);
    });
    if (!broken) showStatus("#project-success");
  });
  if (broken) {
    document.querySelector("#trap-start")?.addEventListener("keydown", (event) => {
      if (event instanceof KeyboardEvent && event.key === "Tab") {
        event.preventDefault();
        (event.currentTarget as HTMLElement).focus();
      }
    });
  }
}

render();
