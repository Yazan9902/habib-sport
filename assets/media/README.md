# Hero media

The hero has a media slot behind the headline. It is currently empty — the hero
falls back to its CSS atmosphere (aurora, floodlight beams, crest), so the page
looks finished with nothing here.

## To enable

In `index.html` and `he.html`, uncomment the `<div class="hero-media">` block
just inside `<section id="hero">`. Both files must be edited — they are separate
pages, not templates.

`main.js` adds `.has-media` to the hero once the file actually decodes. That
raises the scrim, steps the drawn atmosphere back and shrinks the crest to a
badge. A missing or blocked file simply never sets the class, so nothing breaks.

## Video specs

| | |
|---|---|
| Files | `hero.mp4` (H.264) **and** `hero.webm` (VP9) — Safari needs the mp4 |
| Resolution | 1920×1080, or 1280×720 to save weight |
| Length | 8–15s, cut to loop cleanly |
| Budget | **under 2 MB each.** This is the whole point — it blocks the first screen |
| Audio | none; strip the track entirely (the tag is muted, but the bytes still ship) |
| Framing | action in the right two-thirds — the left is covered by the headline (mirrored in Hebrew) |

Encode with ffmpeg:

    ffmpeg -i source.mov -t 12 -an -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart hero.mp4
    ffmpeg -i source.mov -t 12 -an -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 36 -b:v 0 hero.webm

## Poster frame

`assets/images/hero-poster.jpg` — first frame of the video, 1920×1080, under
250 KB. It is what mobile data-saver users, reduced-motion users and everyone
on a slow connection actually see, so pick a frame that stands on its own.

## Photo instead of video

Replace the `<video>` with:

    <img src="assets/images/hero.jpg" alt="" width="1920" height="1080" fetchpriority="high" decoding="async">

Landscape, 2000px+ wide, under 400 KB as WebP or JPEG.
