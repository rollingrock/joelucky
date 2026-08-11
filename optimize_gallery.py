#!/usr/bin/env python3
"""Convert a gallery's stills to web-sized JPEGs and rebuild its thumbnails.

The 2025 gallery was published as 4032x3024 PNGs — photographs stored
losslessly, around 15MB each. image-gallery.html links the original as the
full-size view, so opening a photo downloaded the whole thing.

This moves the originals out of the site tree (it never deletes them) and
writes web-sized JPEGs in their place, then regenerates the matching
thumbnails. Videos and their poster frames are left alone; they are already
h264 and re-encoding would only lose quality.

Usage:
    python optimize_gallery.py 2025-photos --originals ../joelucky-media-originals
    python optimize_gallery.py 2025-photos --dry-run

After running, update the post's `image.thumb` / `image.homepage` frontmatter
if it referenced a converted file, then rebuild and deploy.
"""

import argparse
import os
import shutil

from PIL import Image, ImageOps

REPO = os.path.dirname(os.path.abspath(__file__))
GALLERY_ROOT = os.path.join(REPO, "images", "jl", "tournament-photos")
THUMB_ROOT = os.path.join(REPO, "thumbnails", "images", "jl",
                          "tournament-photos")

STILL_EXT = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".avi"}
JUNK = {"desktop.ini", ".ds_store", "thumbs.db"}

# 2560px still exceeds most laptop screens, so the gallery loses nothing
# visible while shedding roughly 12x the bytes.
MAX_EDGE = 2560
QUALITY = 88
THUMB_SIZE = (320, 240)


def human(n):
    return f"{n / 1024 / 1024:.1f} MB" if n >= 1024 * 1024 else f"{n // 1024} KB"


def write_web_jpeg(src, dest):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)


def write_thumbnail(src, dest):
    """320x240, letterboxed on black — matches the existing thumbnails."""
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail(THUMB_SIZE, Image.LANCZOS)
        canvas = Image.new("RGB", THUMB_SIZE, (0, 0, 0))
        canvas.paste(im, ((THUMB_SIZE[0] - im.width) // 2,
                          (THUMB_SIZE[1] - im.height) // 2))
        canvas.save(dest, "JPEG", quality=85, optimize=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("album", help='e.g. "2025-photos"')
    ap.add_argument("--originals", default="../joelucky-media-originals",
                    help="where to move the untouched originals")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    gallery = os.path.join(GALLERY_ROOT, args.album)
    thumbs = os.path.join(THUMB_ROOT, args.album)
    staging = os.path.abspath(os.path.join(REPO, args.originals, args.album))
    if not os.path.isdir(gallery):
        raise SystemExit(f"No such album: {gallery}")

    entries = sorted(os.listdir(gallery))
    stills, videos, junk = [], [], []
    for name in entries:
        ext = os.path.splitext(name)[1].lower()
        if name.lower() in JUNK:
            junk.append(name)
        elif ext in STILL_EXT:
            stills.append(name)
        elif ext in VIDEO_EXT:
            videos.append(name)

    before = sum(os.path.getsize(os.path.join(gallery, n)) for n in stills)
    print(f"{args.album}: {len(stills)} stills ({human(before)}), "
          f"{len(videos)} videos left alone, {len(junk)} junk files")
    print(f"originals -> {staging}")
    if args.dry_run:
        print("dry run; nothing written")
        return

    os.makedirs(staging, exist_ok=True)
    os.makedirs(thumbs, exist_ok=True)

    # Move first, then convert out of staging. Doing it in this order avoids
    # a case-only collision when IMG_1234.JPG becomes IMG_1234.jpg on a
    # case-insensitive filesystem.
    moved = []
    for name in stills:
        dest = os.path.join(staging, name)
        if os.path.exists(dest):
            raise SystemExit(f"Refusing to overwrite an original: {dest}")
        shutil.move(os.path.join(gallery, name), dest)
        moved.append(name)

    after = 0
    for i, name in enumerate(moved, 1):
        stem = os.path.splitext(name)[0]
        src = os.path.join(staging, name)
        out = os.path.join(gallery, stem + ".jpg")

        # Clear any thumbnail for this stem before writing. A case-only
        # difference (IMG_1.JPG vs IMG_1.jpg) is the same file to Windows but
        # two different URLs to the Linux host, so writing over it would leave
        # the old casing on disk and 404 once the gallery asks for ".jpg".
        for existing in os.listdir(thumbs):
            if os.path.splitext(existing)[0] == stem:
                os.remove(os.path.join(thumbs, existing))

        write_web_jpeg(src, out)
        write_thumbnail(src, os.path.join(thumbs, stem + ".jpg"))
        after += os.path.getsize(out)
        if i % 20 == 0 or i == len(moved):
            print(f"  converted {i}/{len(moved)}")

    for name in junk:
        os.remove(os.path.join(gallery, name))

    saved = before - after
    print(f"\nstills: {human(before)} -> {human(after)}  "
          f"({saved / before * 100:.0f}% smaller, {human(saved)} saved)")
    print(f"originals preserved in {staging}")


if __name__ == "__main__":
    main()
