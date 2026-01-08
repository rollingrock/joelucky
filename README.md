# Joe Lucky Memorial Golf Tournament Website

Official website for the Joe Lucky Memorial Golf Tournament (jlmgt.org), an annual charity golf tournament in North Texas that provides financial funding for the education of children from young widowed families.

## About

The Joe Lucky Memorial Golf Tournament, Inc. is a charitable organization dedicated to supporting educational opportunities for children in need. This website serves as the central hub for tournament information, registration, photo galleries, and donation processing.

## Technology Stack

- **Jekyll** - Static site generator
- **Foundation** - Responsive CSS framework (Zurb)
- **Theme** - Based on [Feeling Responsive](http://phlow.github.io/feeling-responsive/) by Phlow
- **lightGallery** - Photo and video gallery plugin
- **GitHub Pages** - Hosting and deployment

## Prerequisites

- Ruby (version specified in `.ruby-version`)
- Bundler gem
- Git
- FFmpeg (for video processing)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/joelucky.git
   cd joelucky
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Run the development server**
   ```bash
   bundle exec jekyll serve --config _config.yml,_config_dev.yml
   ```

4. **View the site**
   Open your browser to `http://localhost:4000`

## Development

### Configuration Files

- `_config.yml` - Production configuration (jlmgt.org)
- `_config_dev.yml` - Development overrides (localhost:4000)

The development config automatically:
- Changes URLs to localhost
- Disables HTML compression for easier debugging
- Enables expanded CSS with line numbers
- Enables incremental builds for faster rebuilds

### Project Structure

```
.
├── _config.yml              # Main configuration
├── _data/                   # Data files (navigation, authors, etc.)
├── _includes/               # Reusable HTML partials
│   └── image-gallery.html   # Photo/video gallery component
├── _layouts/                # Page templates
├── _posts/                  # Blog posts and photo galleries
│   └── tournament-photos/   # Tournament photo gallery posts
├── _sass/                   # Sass stylesheets
├── assets/                  # JavaScript, CSS, fonts
├── images/                  # Image files (gitignored)
│   └── jl/                  # Joe Lucky specific images
│       └── tournament-photos/
├── pages/                   # Main website pages
└── thumbnails/              # Auto-generated thumbnails (gitignored)
```

### Common Tasks

#### Adding Tournament Photos

1. **Create the photos directory**
   ```bash
   mkdir -p images/jl/tournament-photos/{YEAR}-photos
   ```

2. **Add your photos** to the directory

3. **Convert videos to MP4** (if applicable)
   ```bash
   # Videos should be .mp4 format for browser compatibility
   ffmpeg -i input.MOV -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart output.mp4
   ```

4. **Generate thumbnails**
   ```bash
   # For images
   ffmpeg -i input.png -vf "scale=320:240:force_original_aspect_ratio=decrease,pad=320:240:(ow-iw)/2:(oh-ih)/2" thumbnails/images/jl/tournament-photos/{YEAR}-photos/input.png

   # For videos (creates .jpg thumbnail)
   ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 -vf "scale=320:240:force_original_aspect_ratio=decrease,pad=320:240:(ow-iw)/2:(oh-ih)/2" thumbnails/images/jl/tournament-photos/{YEAR}-photos/input.jpg
   ```

5. **Create the gallery post**
   Create `_posts/tournament-photos/YYYY-MM-DD-photos-{YEAR}.md`:
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

6. **Update navigation**
   Add the new year to `_data/navigation.yml` under the Tournament Photos dropdown

#### Updating Registration Information

Edit `pages/registration.md`:
- Event date, time, and location
- Pricing table
- JavaScript price calculation logic (if prices change)

#### Adding a New Page

1. Create a new Markdown file in `pages/`
2. Add YAML frontmatter with layout, title, and permalink
3. Add to `_data/navigation.yml` if it should appear in the menu

### Building for Production

```bash
bundle exec jekyll build
```

This generates the production site in the `_site/` directory with:
- Compressed HTML
- Minified CSS
- Production URLs

## Deployment

The site is deployed via **GitHub Pages** from the `gh-pages` branch. Any push to this branch automatically triggers a deployment.

### Deployment Steps

1. Ensure all changes are committed
2. Push to the `gh-pages` branch
3. GitHub Pages will automatically build and deploy

## Photo Gallery Features

The photo gallery supports:
- **Images**: JPG, PNG, GIF, BMP, WebP
- **Videos**: MP4, MOV (converted to MP4), WebM, AVI
- **Automatic thumbnails**: 320x240 thumbnails for all media
- **lightGallery**: Interactive lightbox viewer with thumbnails
- **Video playback**: HTML5 video player with play button overlay

## Contact Information

Joe Lucky Memorial Golf Tournament
P.O. Box 831212
Richardson, TX 75083
EIN: 20-3552688

## License

Copyright © Joe Lucky Memorial Golf Tournament, Inc.

---

Website theme based on [Feeling Responsive](http://phlow.github.io/feeling-responsive/) by [Phlow](http://phlow.de/)
