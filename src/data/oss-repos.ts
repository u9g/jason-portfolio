export interface RepoInfo {
  name: string;
  lang: string;
  color: string;
  prs: { id: string; description: string }[];
}

export const repos: RepoInfo[] = [
  {
    name: "oxc-project/oxc",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "oxc#445", description: "Explain use of base 54/64 in mangler" },
      { id: "oxc#446", description: "Fix confusing and/or incorrect condition in linter" },
      { id: "oxc#447", description: "Reimplement more of the closure var rename step" },
      { id: "oxc#467", description: "Add IR view to playground" },
      { id: "oxc#524", description: "Visit jsx_element in AST visitor and add to ASTKind" },
      { id: "oxc#625", description: "Add oxc_query crate" },
      { id: "oxc#698", description: "Add query playground to website" },
      { id: "oxc#798", description: "Add linter plugin crate" },
      { id: "oxc#813", description: "Add linter plugin to VS Code extension" },
    ],
  },
  {
    name: "obi1kenobi/trustfall",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "trustfall#280", description: "Fix url property on all webpage objects" },
      { id: "trustfall#300", description: "Refactor materializeWebsite in browser_based_querying" },
      { id: "trustfall#339", description: "Add optimization to VertexType entrypoint in schema adapter" },
      { id: "trustfall#373", description: "Add InvalidSchemaError::DuplicateFieldDefinition" },
      { id: "trustfall#423", description: "Add min_fold_count_limit optimization" },
      { id: "trustfall#432", description: "Throw error for tag directive on edge" },
      { id: "trustfall#435", description: "Move to own Type type for everything exposed in trustfall_core" },
      { id: "trustfall#445", description: "Fix false assumption of vertex_type being singleton" },
      { id: "trustfall#463", description: 'Add error for filter where value argument is just ["$"] or ["%"]' },
    ],
  },
  {
    name: "obi1kenobi/cargo-semver-checks",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "cargo-semver-checks#500", description: "Add trait removed associated type lint" },
      { id: "cargo-semver-checks#501", description: "Make CI hash Rust files not toml files" },
      { id: "cargo-semver-checks#587", description: "Implement struct_now_doc_hidden lint" },
      { id: "cargo-semver-checks#593", description: "Implement enum_now_doc_hidden lint" },
      { id: "cargo-semver-checks#594", description: "Implement function_now_doc_hidden lint" },
      { id: "cargo-semver-checks#595", description: "Implement trait_now_doc_hidden lint" },
    ],
  },
  {
    name: "obi1kenobi/trustfall-rustdoc-adapter",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "trustfall-rustdoc-adapter#211", description: "Add AssociatedType to schema" },
    ],
  },
  {
    name: "async-graphql/async-graphql",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "async-graphql#1336", description: 'Parse "repeatable" in directive definitions' },
    ],
  },
  {
    name: "oven-sh/bun",
    lang: "TypeScript",
    color: "#58a6ff",
    prs: [
      { id: "bun#1714", description: "Fix Bun.serve typings" },
      { id: "bun#1923", description: "fix(bench): Fix if condition always being true" },
      { id: "bun#2227", description: "Remake typings for FFI dlopen/linkSymbols + introduce Pointer type" },
    ],
  },
  {
    name: "SerenityOS/serenity",
    lang: "C++",
    color: "#f34b7d",
    prs: [
      { id: "serenity#12502", description: "Base: Add Spreadsheet alias to shellrc" },
      { id: "serenity#12508", description: "Spreadsheet: Make ranges vertically end-inclusive" },
      { id: "serenity#12539", description: "Spreadsheets: Add range functions to Position class" },
      { id: "serenity#12767", description: "Spreadsheet: Add Range.first(), minIf/maxIf/sumProductIf functions" },
      { id: "serenity#12799", description: "Spreadsheet: Make Range.forEach() return Position objects, add Range.at()" },
      { id: "serenity#12853", description: "Spreadsheet: Make Range support all examples, add toArray()" },
      { id: "serenity#12869", description: "Spreadsheet: Add CommonRange class + integer() improvements" },
      { id: "serenity#12882", description: "Spreadsheet: Add SplitRange class and CommonRange#filter" },
      { id: "discord-bot#374", description: "GithubCommand: Add url option" },
      { id: "discord-bot#381", description: "User: Add User command" },
    ],
  },
  {
    name: "SerenityOS/jakt",
    lang: "C++",
    color: "#f34b7d",
    prs: [
      { id: "jakt#376", description: "codegen+lexer+typechecker+parser: Add NoneCoalescingAssign" },
      { id: "jakt#473", description: "Add generic parsing to selfhost" },
      { id: "jakt#487", description: "vscode: Separate function and field autocompletions" },
      { id: "jakt#627", description: "samples: Greatly improve json sample and read_all sample app" },
    ],
  },
  {
    name: "PaperMC/Paper",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "Paper#7278", description: "Add new overload to PersistentDataContainer#has" },
      { id: "Paper#7787", description: "Add PlayerReleaseItemEvent" },
      { id: "Paper#7880", description: "Add ARMOR tag to MaterialTags (1.18.2)" },
      { id: "Paper#7987", description: "Add ARMOR tag to MaterialTags (1.19)" },
      { id: "Paper#7988", description: "Add Player#getFishHook" },
    ],
  },
  {
    name: "Col-E/Recaf",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "Recaf#458", description: "Move to GitHub Actions" },
      { id: "Recaf#470", description: "Fixes mappings throwing error" },
      { id: "Recaf#471", description: "Fix test results not being shown on PRs from forks" },
    ],
  },
  {
    name: "boxbeam/RedLib",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "RedLib#30", description: "Add SQLHelper#executeUpdate" },
      { id: "RedLib#32", description: "Add SQLHelper.Results#getBytes and querySingleResultBytes" },
      { id: "RedLib#36", description: "Allow forcing Double on a list" },
    ],
  },
  {
    name: "NotEnoughUpdates/NotEnoughUpdates",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "NEU#374", description: "[Calculator] Add exponent operator and % postfix" },
    ],
  },
  {
    name: "Legacy-Fabric/yarn",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "yarn#190", description: "Minecraft 1.8.9 mappings" },
      { id: "yarn#191", description: "Mappings Part 2" },
      { id: "yarn#198", description: "First mapping done with the new tool" },
      { id: "yarn#213", description: "A few fixes for 1.8.9" },
    ],
  },
  {
    name: "discordjs/discord.js",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "discord.js#5566", description: "feat(Util): allow array for StringOptions' char" },
    ],
  },
  {
    name: "nodejs/node",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "node#51454", description: "doc: fix spelling mistake" },
    ],
  },
  {
    name: "TanStack/query",
    lang: "TypeScript",
    color: "#58a6ff",
    prs: [
      { id: "query#9269", description: "docs: Fix syntax of batshit in batching-requests article" },
    ],
  },
  {
    name: "scratchfoundation/scratch-vm",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "scratch-vm#2833", description: "Added colon" },
    ],
  },
  {
    name: "andywer/typed-emitter",
    lang: "TypeScript",
    color: "#58a6ff",
    prs: [
      { id: "typed-emitter#16", description: 'Fix: stop exporting TS file as "main" in package.json' },
    ],
  },
  {
    name: "TkTech/Burger",
    lang: "JavaScript",
    color: "#f7df1e",
    prs: [
      { id: "Burger#24", description: "Update entity tracker for newer MC versions" },
    ],
  },
  {
    name: "linusg/serenity_exporter",
    lang: "Rust",
    color: "#ff6b4a",
    prs: [
      { id: "serenity_exporter#2", description: "Fix kmalloc_available writing to wrong metric" },
    ],
  },
  {
    name: "HangarMC/Hangar",
    lang: "Java",
    color: "#f89820",
    prs: [
      { id: "Hangar#676", description: "Link to new forums instead of old" },
    ],
  },
  {
    name: "lmorg/murex",
    lang: "Go",
    color: "#00add8",
    prs: [
      { id: "murex#802", description: "Fix mistake in rosetta stone" },
    ],
  },
];

export function prUrl(repoName: string, prId: string): string {
  const num = prId.split("#")[1];
  return `https://github.com/${repoName}/pull/${num}`;
}
