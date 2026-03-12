# Prompty pro generování doprovodné grafiky — V2 design

Všechny obrázky by měly mít konzistentní vizuální styl: **tmavé navy tóny (#0A1628), zlaté akcenty (#D4A843), profesionální a čistý look, moderní corporate finance aesthetic**.

Doporučený formát: PNG nebo WebP, transparentní pozadí kde je to možné.

---

## 1. Hero pozadí — abstraktní finanční motiv
**Rozměr:** 1920×1080
**Prompt:**
> Dark navy abstract background with subtle golden light streaks and soft geometric shapes, elegant financial theme, minimalist, premium feel, very dark base color #0A1628, golden accents #D4A843, bokeh lights, smooth gradient transitions, no text, 4K resolution, suitable as website hero background

**Použití:** Volitelné pozadí hero sekce (overlay přes CSS gradient)

---

## 2. Ikony služeb — sada 3 ikon
**Rozměr:** 512×512 každá

### 2a. Úvěrové poradenství (dům/hypotéka)
> Minimalist golden line icon of a house with a key, dark navy background #0A1628, gold stroke color #D4A843, elegant thin line art style, financial advisory theme, transparent background, vector-like quality

### 2b. Investice (růst/graf)
> Minimalist golden line icon of an upward trending chart with growing bars, dark navy background #0A1628, gold stroke color #D4A843, elegant thin line art style, wealth growth concept, transparent background, vector-like quality

### 2c. Pojištění (deštník/štít)
> Minimalist golden line icon of a protective shield with umbrella, dark navy background #0A1628, gold stroke color #D4A843, elegant thin line art style, insurance protection concept, transparent background, vector-like quality

**Použití:** Bento grid karty služeb (`.bento-icon` background)

---

## 3. Testimonial avatary — 3 portréty
**Rozměr:** 256×256 každý

### 3a. Martin K. (muž, 30-40 let)
> Professional headshot portrait of a Czech man in his 30s, friendly confident smile, wearing smart casual shirt, soft studio lighting, neutral blurred background, corporate style, warm tones, photorealistic

### 3b. Lucie P. (žena, 25-35 let)
> Professional headshot portrait of a Czech woman in her late 20s, warm genuine smile, wearing elegant blouse, soft studio lighting, neutral blurred background, corporate style, warm tones, photorealistic

### 3c. Tomáš H. (muž, 35-45 let)
> Professional headshot portrait of a Czech man in his late 30s, trustworthy appearance, wearing business casual, soft studio lighting, neutral blurred background, corporate style, warm tones, photorealistic

**Použití:** Testimonial karty (`.testimonial-avatar` — nahradí iniciálové kruhy)

---

## 4. Certifikační badge — 4 odznaky
**Rozměr:** 200×200 každý

### 4a. ČNB badge
> Minimalist badge icon with a landmark/bank building symbol, circular gold border on dark navy background, text "ČNB" subtly integrated, premium quality seal design, clean vector style, transparent background

### 4b. edofinance badge
> Minimalist badge icon with connected nodes/network symbol, circular gold border on dark navy background, professional partnership badge design, clean vector style, transparent background

### 4c. IDD certifikace
> Minimalist badge icon with a graduation cap and checkmark, circular gold border on dark navy background, certification seal design, clean vector style, transparent background

### 4d. 8 let praxe
> Minimalist badge icon with a trophy/award ribbon, circular gold border on dark navy background, years of experience badge, text "8+" subtly integrated, clean vector style, transparent background

**Použití:** Certifikace sekce (`.cert-card`)

---

## 5. Kroky spolupráce — 3 ilustrace
**Rozměr:** 400×400 každý

### 5a. Krok 1 — Konzultace
> Minimalist isometric illustration of two people having a friendly meeting at a desk with coffee, dark navy color scheme with gold accents, clean modern corporate style, subtle golden highlights, transparent background

### 5b. Krok 2 — Návrh řešení
> Minimalist isometric illustration of a person presenting a comparison chart on a screen, multiple options shown as cards, dark navy color scheme with gold accents, clean modern corporate style, transparent background

### 5c. Krok 3 — Realizace
> Minimalist isometric illustration of a handshake with documents and a checkmark, success and completion theme, dark navy color scheme with gold accents, clean modern corporate style, transparent background

**Použití:** Sekce "Jak to funguje" (`.step`)

---

## 6. Kalkulačky promo — 3 ilustrace
**Rozměr:** 400×300 každý

### 6a. Hypoteční kalkulačka
> Minimalist flat illustration of a calculator and a house with golden roof, financial math concept, dark navy background #0A1628 with gold #D4A843 and emerald #10B981 accents, modern clean design, transparent background

### 6b. Investiční kalkulačka
> Minimalist flat illustration of a calculator and growing investment chart with coins stack, wealth building concept, dark navy background #0A1628 with gold #D4A843 and emerald #10B981 accents, modern clean design, transparent background

### 6c. Kalkulačka pojištění
> Minimalist flat illustration of a calculator and umbrella protecting a family silhouette, insurance protection concept, dark navy background #0A1628 with gold #D4A843 and emerald #10B981 accents, modern clean design, transparent background

**Použití:** Kalkulačky promo karty (`.calc-promo-card`)

---

## 7. OG / Social share obrázek
**Rozměr:** 1200×630
**Prompt:**
> Professional financial advisor social media banner, dark navy background #0A1628, large elegant gold text "Stanislav Kupilík", subtitle "Finanční poradce" in lighter gold, subtle golden geometric patterns and light streaks in background, premium corporate feel, clean modern typography, suitable for Open Graph social sharing

**Použití:** `<meta property="og:image">` pro sdílení na sociálních sítích

---

## 8. Favicon sada
**Rozměr:** 32×32, 192×192, 512×512
**Prompt:**
> Minimalist monogram logo "SK" initials, elegant serif typography, gold color #D4A843 on dark navy circle #0A1628, premium financial brand mark, clean sharp edges, suitable for favicon, transparent background outside the circle

**Použití:** `<link rel="icon">`, PWA manifest

---

## Poznámky k implementaci

Po vygenerování obrázků:
1. Uložit do `v2/img/` složky
2. Optimalizovat (WebP kde je to možné, max 200KB na obrázek)
3. Přidat `loading="lazy"` na všechny `<img>` tagy
4. Aktualizovat HTML soubory — nahradit Font Awesome ikony obrázky kde je to vhodné
5. Přidat OG meta tagy do `<head>` všech stránek
