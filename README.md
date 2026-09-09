# Murphy's Productions

Marketing site for Murphy's Productions. Plain HTML, CSS, and JavaScript — no build step, no dependencies.

```
index.html    all page content
styles.css    all styling
script.js     hero drag reveal + contact form
favicon.svg   browser tab icon
og.svg        preview image for links shared on social
robots.txt    search engine permissions
```

## Run it locally

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Put it on GitHub

```bash
cd murphys-productions
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/murphys-productions.git
git push -u origin main
```

## Deploy on Vercel

1. Go to vercel.com and sign in with GitHub.
2. **Add New → Project**, then import the `murphys-productions` repo.
3. Leave every build setting empty. Framework preset: **Other**. Root directory: `./`.
4. **Deploy**.

You'll get a `.vercel.app` URL immediately. Every push to `main` redeploys automatically.

### Connect your domain

In the Vercel project: **Settings → Domains → Add**, enter `murphysproductions.com`, and follow the DNS records it gives you. Vercel issues the HTTPS certificate on its own.

## Before you go live — change these

**1. The contact form.** It currently points at a placeholder. Create a free form at [formspree.io](https://formspree.io), copy your form ID, and replace it in `index.html`:

```html
<form ... action="https://formspree.io/f/YOUR-ID-HERE" method="POST">
```

Until you do, the form still works — it just opens Formspree's page instead of submitting in place.

**2. The email address.** Search `index.html` for `hello@murphysproductions.com` and replace all three occurrences with your real address.

**3. Add a phone number** if you want calls. Good spot is next to the email in the "Tell us about the project" section:

```html
<p class="start-alt">Prefer to call? <a href="tel:+15550001234">(555) 000-1234</a></p>
```

**4. The domain in `og.svg`** and the `og:image` path in `index.html` if you rename anything.

## Editing content

Everything is in `index.html` in the order it appears on the page. To change a service, edit the text inside its `<article class="svc">`. To add one, copy an existing `<article>` block and paste it inside `<div class="grid">`.

Colours live at the top of `styles.css` as CSS variables — change `--violet` in one place and it updates everywhere.

## Notes

- No cookies, no third-party trackers, no consent banner needed.
- Type is Bricolage Grotesque and Newsreader, loaded from Google Fonts.
- Respects `prefers-reduced-motion` and passes keyboard navigation.
