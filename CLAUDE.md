# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Joe Lucky Memorial Golf Tournament website (jlmgt.org), a Jekyll-based static site that provides information about an annual charity golf tournament in North Texas. The tournament provides financial funding for the education of children from young widowed families.

## Technology Stack

- **Static Site Generator**: Jekyll
- **CSS Framework**: Foundation (Zurb)
- **Theme**: Based on "Feeling Responsive" theme by Phlow
- **Image Processing**: mini_magick (for photo galleries)
- **Deployment**: DreamHost shared hosting via `deploy.sh` (rsync of `_site/`)

## Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Run development server with local config
bundle exec jekyll serve --config _config.yml,_config_dev.yml

# Build for production
bundle exec jekyll build

# Build for development/testing
bundle exec jekyll build --config _config.yml,_config_dev.yml
```

**Note**: Always use `bundle exec` to ensure commands run with the correct gem versions from `Gemfile.lock`, preventing version conflicts.

### Configuration Files
- `_config.yml` - Production configuration (url: https://jlmgt.org)
- `_config_dev.yml` - Development overrides (url: http://localhost:4000)

The development config overlays the production config, changing URLs, disabling HTML compression, enabling expanded CSS output with line numbers, and enabling incremental builds for faster development.

## Architecture

### Content Structure

**Pages** (`pages/` directory):
- Main content pages (registration, contact, info, photos, donate)
- Written in Markdown with YAML frontmatter
- Layouts applied via frontmatter (`layout: page`, `layout: page-fullwidth`, etc.)

**Posts** (`_posts/` directory):
- Organized by category subdirectories (e.g., `_posts/tournament-photos/`)
- Post filenames follow Jekyll convention: `YYYY-MM-DD-title.md`
- Used primarily for tournament photo galleries

**Layouts** (`_layouts/` directory):
- `default.html` - Base template with header/footer
- `page.html` - Standard page with sidebar
- `page-fullwidth.html` - Full-width page (used for photo galleries)
- `frontpage.html` - Homepage layout
- `blog.html` - Blog listing page
- `compress.html` - HTML minification wrapper

**Data Files** (`_data/` directory):
- `navigation.yml` - Site navigation menu structure
- `authors.yml` - Author information
- `language.yml` - UI text strings
- `socialmedia.yml`, `services.yml`, `network.yml` - Social/external links

**Includes** (`_includes/` directory):
- Reusable partial templates (header, footer, navigation, etc.)
- `image-gallery.html` - Dynamic photo gallery component using lightGallery.js

### Key Features

**Photo Galleries**:
- Source images go in `images/jl/tournament-photos/{YEAR}-photos/`
- Thumbnails are auto-generated to `thumbnails/images/jl/tournament-photos/{YEAR}-photos/`
- Gallery posts use `{% include image-gallery.html albumname="YEAR-photos" %}` to render
- The include loops through `site.static_files` to find images matching the album path
- Uses lightGallery jQuery plugin for the interactive viewer

**Registration Form** (`pages/registration.md`):
- Custom HTML form with dynamic price calculation
- Submits to Google Apps Script endpoint
- Includes anti-spam honeypot field
- Tracks form completion time
- Handles special pricing (corporate sponsors: first foursome $1250, additional $500 each)

**Board mirror** (`board/`):
- Read-only copy of the registration sheet at `/board/`, behind HTTP Basic
  Auth, for board members whose employers block Google Sheets
- `apps-script/registration/Board.js` pushes a snapshot every 15 minutes to
  `board/ingest.php`, which stores it in `/home/jaspha2/board-private/`
  outside the docroot; `board/index.php` renders it
- No front matter on the PHP files, so Jekyll copies them verbatim and they
  never enter the sitemap or search index. Setup steps are in
  `apps-script/README.md`

**Navigation**:
- Configured via `_data/navigation.yml`
- Supports dropdown menus (e.g., Tournament Photos dropdown)
- Positioned left or right via `side` property

### Styling

- SASS files in `_sass/` directory
- Main stylesheet: `assets/css/styles_feeling_responsive.scss`
- Foundation components in `_sass/foundation-components/`
- Custom settings in `_sass/_01_settings_colors.scss`, `_sass/_02_settings_typography.scss`, etc.
- Compiled to compressed CSS in production

### Static Assets

**Images**:
- `.gitignore` excludes `.jpg`, `.JPG`, and `.png` files
- Images stored in `images/` directory (particularly `images/jl/`)
- Logo: `assets/img/jl_logo_2026_banner_memorial.png` (masthead banner, set via
  `logo:` in `_config.yml`). The homepage widget uses a separate square crest,
  `images/jl_logo_<year>_transparent_smooth_reduced.png`, referenced from
  `pages/pages-root-folder/index.md`.
- **Do not regenerate the logo with an image model.** Every asset is derived
  from `assets/logo-master/emblem_master.png` (1024x1024) by
  `build_logo_assets.py`. Only two things change per year, and the script
  replaces both by masking the original ink and re-typesetting:

  ```bash
  python build_logo_assets.py --year 2026 --ordinal 21st
  ```

  This keeps the emblem byte-identical year to year. Regenerating it instead
  produces a different drawing each time — different typefaces, stroke weights,
  and palette — which is why the 2026 regeneration could not simply be dropped
  into the 2025 slots.
- The master is the one image exempted from the `*.png` gitignore rule, since
  nothing else can reproduce it.

**JavaScript**:
- jQuery and mediaElement.js for media playback
- Modernizr for feature detection
- lightGallery for photo galleries

## Common Workflows

### Adding Tournament Photos for a New Year

1. Create directory: `images/jl/tournament-photos/{YEAR}-photos/`
2. Add photos to the directory
3. Create post in `_posts/tournament-photos/YYYY-MM-DD-photos-{YEAR}.md`:
   ```yaml
   ---
   layout: page-fullwidth
   title: "{YEAR} Tournament Photos"
   subheadline: "{YEAR} Tournament Photos"
   header:
       image_fullwidth: jl/bg_golf.png
   image:
       thumb: jl/tournament-photos/{YEAR}-photos/{thumbnail-image}
       homepage: jl/tournament-photos/{YEAR}-photos/{thumbnail-image}
   categories:
       - tournament-photos
   ---
   <!--more-->
   {% include image-gallery.html albumname="{YEAR}-photos" %}
   ```
4. Update `_data/navigation.yml` to add the new year to the dropdown menu

### Updating Registration Information

Edit `pages/registration.md`:
- Event date/time in the table near top
- Price table quantities and amounts
- JavaScript price calculation logic if prices change
- PayPal button/link if needed

### Adding a New Page

1. Create Markdown file in `pages/` directory
2. Add YAML frontmatter with layout, title, permalink
3. Optionally add to `_data/navigation.yml` for menu inclusion

## Important Notes

- **Main branch is `gh-pages`** - this is the working branch, but it does *not*
  auto-deploy. The live site is published by running `./deploy.sh`, which builds
  and rsyncs `_site/` to DreamHost. Pushing to GitHub only updates the repo.
- **The repo is public.** Never commit committee email addresses or credentials.
  The Apps Script sources in `apps-script/` read their recipient lists from
  Script Properties for this reason — see `apps-script/README.md`.
- The `improve_content` setting in `_config.yml` points to the Phlow/feeling-responsive repo (not this repo)
- Image files are gitignored to keep repo size manageable
- The site uses Jekyll 3.x with plugins: jekyll-asciidoc, jekyll-gist, jekyll-paginate
- Compressed HTML in production via `compress.html` layout
