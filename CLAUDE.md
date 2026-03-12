# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Statický web finančního poradce Stanislava Kupilíka. Žádný build systém, bundler, ani framework — čisté HTML + CSS + vanilla JS. Jazyk webu je čeština.

## Architecture

- **index.html** — hlavní stránka (hero, služby, reference, FAQ, timeline, blog, kontaktní formulář)
- **hypoteka.html / investice.html / zivotni-pojisteni.html** — podstránky s kalkulačkami (hypoteční splátka, investiční zhodnocení, pojistná částka). Každá kalkulačka má lead-gate formulář (Formspree) — výsledek se zobrazí až po vyplnění kontaktu.
- **rezervace.html** — iframe embed pro rezervační systém
- **GDPR.html / cookies.html / povinne-informace.html / informace-pro-investory.html** — právní/regulatorní stránky
- **style.css** — jediný stylesheet pro celý web, obsahuje CSS variables, dark mode (`body.dark`), responsive breakpoint 768px, kalkulačkové styly (`.calc-*`), fade-in animace
- **script.js** — sdílený JS pro všechny stránky: hamburger menu, dark mode toggle (localStorage), smooth scroll, IntersectionObserver fade-in, counter animace

## Key patterns

- **CSS theming**: Barvy přes CSS custom properties (`:root` / `body.dark`). Při přidávání komponent používej existující proměnné (`--primary`, `--bg`, `--surface`, `--text`, `--muted`).
- **Lead-gate pattern**: Kalkulačky počítají výsledek na klientu, ale výsledek (`.calc-result`) je defaultně `display:none`. Zobrazí se po odeslání lead formuláře (`.calc-gate`). Hidden inputy posílají výpočet spolu s kontaktem do Formspree.
- **Nav duplikace**: Navigace je copy-paste v každém HTML souboru (není sdílená). Při změně v nav je nutné upravit všechny HTML soubory.
- **Formspree**: Formuláře odesílají data přes Formspree. Placeholder `tvuj-kod` je potřeba nahradit skutečným Formspree endpoint ID.
- **Responsivita**: Jediný breakpoint `@media (max-width:768px)`.

## Development

Žádný build step. Otevři HTML soubory přímo v prohlížeči nebo použij libovolný lokální server (např. `npx serve .` nebo Live Server ve VS Code).

## External dependencies

- Font Awesome 6.5.1 (CDN) — ikony
- Formspree — zpracování formulářů (vyžaduje vlastní endpoint ID)
- Hero obrázek: `stanislav-kupilik.jpg` (pozadí hero sekce)
