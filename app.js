const form = document.querySelector("#post-form");
const authorInput = document.querySelector("#author");
const contentInput = document.querySelector("#content");
const message = document.querySelector("#form-message");
const postsContainer = document.querySelector("#posts");
const routeLinks = document.querySelectorAll("[data-route]");
const pages = document.querySelectorAll(".page");
const validRoutes = new Set(Array.from(routeLinks, (link) => link.dataset.route));

function renderRoute() {
  const route = window.location.hash.slice(1) || "home";
  const activeRoute = validRoutes.has(route) ? route : "home";

  for (const page of pages) {
    page.hidden = page.id !== activeRoute;
  }

  for (const link of routeLinks) {
    if (link.dataset.route === activeRoute) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

window.addEventListener("hashchange", renderRoute);
renderRoute();

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderPosts(posts) {
  postsContainer.replaceChildren();

  if (posts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "(No posts yet, leave the first one!)";
    postsContainer.append(empty);
    return;
  }

  for (const post of posts) {
    const article = document.createElement("article");
    article.className = "post";

    const meta = document.createElement("div");
    meta.className = "post-meta";

    const author = document.createElement("span");
    author.className = "post-author";
    author.textContent = post.author;

    const date = document.createElement("time");
    date.dateTime = post.createdAt;
    date.textContent = formatDate(post.createdAt);

    const content = document.createElement("p");
    content.className = "post-content";
    content.textContent = post.content;

    meta.append(author, date);
    article.append(meta, content);
    postsContainer.append(article);
  }
}

async function loadPosts() {
  const response = await fetch("/api/posts");
  if (!response.ok) {
    throw new Error("(Unable to load posts)");
  }
  renderPosts(await response.json());
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.classList.remove("error");

  const button = form.querySelector("button");
  button.disabled = true;

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: authorInput.value,
        content: contentInput.value,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "(Unable to publish your post)");
    }

    form.reset();
    message.textContent = "(Your post is live)";
    await loadPosts();
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("error");
  } finally {
    button.disabled = false;
  }
});

loadPosts().catch(() => {
  postsContainer.replaceChildren();
  const error = document.createElement("p");
  error.className = "empty-state";
  error.textContent = "(Couldn't load posts, please refresh to try again)";
  postsContainer.append(error);
});
