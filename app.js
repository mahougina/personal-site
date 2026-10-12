const form = document.querySelector("#post-form");
const authorInput = document.querySelector("#author");
const contentInput = document.querySelector("#content");
const message = document.querySelector("#form-message");
const postsContainer = document.querySelector("#posts");
const composer = document.querySelector(".composer");
const staticPostsNote = document.querySelector("#static-posts-note");
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

  // Load in data for page
  switch(activeRoute){
    case("home"):
      let home_intro_1 = "I'm a Software Engineer with roughly 4 years of experience. \
        Focused on mostly fullstack development, I love to find modular and iterative ways to tackle software solutions."
      
      // let home_intro_2 = "I gratudated with a B.S. in Computer Science from Arizona State University's Ira A. Fulton School of Engineering."
      
      let home_intro_2 = document.getElementById("home-intro-2");
      let h_link = document.createElement("a");
      h_link.className = "body-link"
      h_link.href = "https://engineering.asu.edu/";
      h_link.target= "_blank";
      h_link.rel= "noopener noreferrer";
      h_link.textContent = "Arizona State University's Ira A. Fulton School of Engineering";

      home_intro_2.replaceChildren(
        document.createTextNode("I gratudated with a B.S. in Computer Science from  "),
        h_link,
        document.createTextNode(".")
      )

      let home_intro_3 = "Currently, I'm looking for opportunities in the Las Vegas metropolitan area. \
        I am open to many kinds of software development or engineering opportunities that offer hybrid or in-office work spaces!"

      document.getElementById("home-intro-1").textContent = home_intro_1;
      document.getElementById("home-intro-3").textContent = home_intro_3;
      break;

    case("personal-work"):
      let work_intro_1 = document.getElementById("personal-work-intro-1");
      let w_link = document.createElement("a");
      w_link.className = "body-link"
      w_link.href = "https://www.github.com/mahougina/";
      w_link.target= "_blank";
      w_link.rel= "noopener noreferrer";
      w_link.textContent = "my personal Github";

      work_intro_1.replaceChildren(
        document.createTextNode("Though you can view most of my personal coding projects at "),
        w_link,
        document.createTextNode(", I think it would be a lot easier to visualize with screenshots and gifs.")
      )

      break;

    case("creative-work"):
      // Intro
      let art_intro_1 = "Outside of coding, I love to engage in various art mediums.";
      
      // Woodworking
      let art_intro_2 = document.getElementById("creative-work-intro-2");
      let link = document.createElement("a");
      link.className = "body-link"
      link.href = "https://www.instagram.com/garneroguitars/";
      link.target= "_blank";
      link.rel= "noopener noreferrer";
      link.textContent = "ASU Professor Ed Garnero";

      art_intro_2.replaceChildren(
        document.createTextNode("Currently, as an apprentice luthier, I assist in the creation of wooden bases with "),
        link,
        document.createTextNode(".")
      )

      // Pottery
      let art_intro_3 = "On the side, I also try my hand at pottery! \
        I'm mostly familiar with hand buildling and slip casting, but I've been practicing wheel throwing! (However, wheelthrowing is proven to be a huge learning curve)";
      
      // Sketching
      let art_intro_4 = "Though, the most accessible and simpliest way I can get my creativity out is by sketching.";
      
      document.getElementById("creative-work-intro-1").textContent = art_intro_1;
      document.getElementById("creative-work-intro-3").textContent = art_intro_3;
      document.getElementById("creative-work-intro-4").textContent = art_intro_4;
      break;
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

  // Shows empty message when no posts are available
  if (posts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "(No posts yet, leave the first one!)";
    postsContainer.append(empty);
    return;
  }

  // Appends all available posts
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
  const apiUrl = new URL("api/posts", document.baseURI);
  const apiResponse = await fetch(apiUrl);

  if (apiResponse.ok) {
    renderPosts(await apiResponse.json());
    return;
  }

  if (apiResponse.status !== 404) {
    throw new Error("(Unable to load posts)");
  }

  const staticResponse = await fetch(new URL("data/posts.json", document.baseURI));
  if (!staticResponse.ok) {
    throw new Error("(Unable to load posts)");
  }

  composer.hidden = true;
  staticPostsNote.hidden = false;
  renderPosts(await staticResponse.json());
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.classList.remove("error");

  const button = form.querySelector("button");
  button.disabled = true;

  try {
    const response = await fetch(new URL("api/posts", document.baseURI), {
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
