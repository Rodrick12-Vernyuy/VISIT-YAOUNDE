# Local attraction media

Each gallery is deliberately checked into this directory rather than served
from a third-party host.  Do not add a file unless its licence permits this
project's intended use and the image has been visually verified as the exact
listed location.

For a location whose slug is `example-location`, retain downloaded source
originals in `services/attractions-service/media-sources/example-location/`.
Add the optimized delivery files and their companions in
`example-location/`:

```
example-location-1.webp
example-location-1-thumb.webp
example-location-2.webp
example-location-2-thumb.webp
example-location-3.webp
example-location-3-thumb.webp
```

Use meaningful image content and filename numbering consistently with
`local-attraction-media.ts`.  Keep originals appropriate for a detail view
(normally no wider than 1600px) and thumbnails around 360px. WebP or AVIF is
preferred.  The first image is the cover; hotel, museum, market, and religious
site galleries should follow the location-specific view requirements in the
media brief.

Add one record per original to `ATTRIBUTION.json`, including `file`,
`thumbnail`, `source`, `creator`, `licence`, `licenceUrl`, `attributionRequired`, `role`, and a concise
`verification` statement that says how the exact location was confirmed. Do
not reuse an original between locations or create a gallery by duplicating one
file.

Run this from `services/attractions-service` before committing:

```
npm.cmd run validate:local-media
```

It makes no network requests and fails if a catalogue gallery lacks three
different original files, a companion thumbnail, or complete provenance.
