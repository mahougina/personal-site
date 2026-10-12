# Personal Site

A small personal site with routed sections for Home, Personal Work, Blog, Creative Work, and CV. Blog posts can be published with an optional name; posts are shown newest first and saved to `data/posts.json`.

## Run locally

Requires Node.js 18 or newer. No packages to install.

```sh
npm start
```

Open <http://127.0.0.1:3000>. Set the `PORT` environment variable to use a different port.

## Deploy to GitHub Pages

The `main` branch is deployed automatically to GitHub Pages by the workflow in `.github/workflows/pages.yml`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The site will be available at <https://mahougina.github.io/personal-site/>.

Run `npm run build` to generate the static site in `dist/`. The hosted Notes page displays the posts in `data/posts.json`, but publishing new posts requires the Node server and is therefore only available when running locally.
