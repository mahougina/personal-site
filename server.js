const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const root = __dirname;
const postsFile = path.join(root, "data", "posts.json");
const maxBodySize = 16 * 1024;
let writeQueue = Promise.resolve();

const pages = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/imgs/PGLNi0H-.jpeg": ["imgs/PGLNi0H-.jpeg", "image/jpeg"],
  "/svgs/email.svg": ["svgs/email.svg", "image/svg+xml; charset=utf-8"],
  "/svgs/github.svg": ["svgs/github.svg", "image/svg+xml; charset=utf-8"],
  "/svgs/linkedin.svg": ["svgs/linkedin.svg", "image/svg+xml; charset=utf-8"],
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

async function readPosts() {
  const contents = await fs.readFile(postsFile, "utf8");
  return JSON.parse(contents);
}

async function readRequestBody(request) {
  let size = 0;
  const chunks = [];

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodySize) {
      const error = new Error("Request body is too large.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.status = 400;
    throw error;
  }
}

async function handleApi(request, response, pathname) {
  if (pathname !== "/api/posts") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  if (request.method === "GET") {
    await writeQueue;
    sendJson(response, 200, await readPosts());
    return;
  }

  if (request.method !== "POST") {
    response.writeHead(405, { Allow: "GET, POST" });
    response.end();
    return;
  }

  const body = await readRequestBody(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    sendJson(response, 400, { error: "A post object is required." });
    return;
  }
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";

  if (!content || content.length > 5000) {
    sendJson(response, 400, { error: "Posts must contain 1–5000 characters." });
    return;
  }
  if (author.length > 40) {
    sendJson(response, 400, { error: "Names must be 40 characters or fewer." });
    return;
  }

  const post = {
    id: randomUUID(),
    author: author || "Anonymous",
    content,
    createdAt: new Date().toISOString(),
  };

  const save = writeQueue.then(async () => {
    const posts = await readPosts();
    posts.unshift(post);
    const temporaryFile = `${postsFile}.tmp`;
    await fs.writeFile(temporaryFile, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
    await fs.rename(temporaryFile, postsFile);
  });
  writeQueue = save.catch(() => {});
  await save;
  sendJson(response, 201, post);
}

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;

  try {
    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    const page = pages[pathname];
    if (!page || request.method !== "GET") {
      response.writeHead(404);
      response.end("Not found.");
      return;
    }

    const contents = await fs.readFile(path.join(root, page[0]));
    response.writeHead(200, {
      "Content-Type": page[1],
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    });
    response.end(contents);
  } catch (error) {
    if (error.status) {
      sendJson(response, error.status, { error: error.message });
      return;
    }
    console.error(error);
    sendJson(response, 500, { error: "Something went wrong." });
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, "127.0.0.1", () => {
  console.log(`Site is live running at http://127.0.0.1:${port}`);
});
