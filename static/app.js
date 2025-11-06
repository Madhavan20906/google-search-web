// static/app.js
(() => {
  const input = document.getElementById("searchInput");
  const ul = document.getElementById("suggestions");
  let debounceTimer = null;
  let suggestions = [];
  let selectedIndex = -1;

  function setSuggestions(list) {
    suggestions = list || [];
    selectedIndex = -1;
    renderSuggestions();
  }

  function renderSuggestions() {
    ul.innerHTML = "";
    if (!suggestions || suggestions.length === 0) {
      ul.style.display = "none";
      return;
    }
    suggestions.forEach((s, idx) => {
      const li = document.createElement("li");
      li.textContent = s;
      li.setAttribute("data-idx", idx);
      li.addEventListener("click", () => {
        handleChoose(s);
      });
      ul.appendChild(li);
    });
    ul.style.display = "block";
    updateActive();
  }

  function updateActive() {
    const items = ul.querySelectorAll("li");
    items.forEach((el) => el.classList.remove("active"));
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].classList.add("active");
      // ensure visible
      items[selectedIndex].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function fetchSuggestions(q) {
    if (!q) {
      setSuggestions([]);
      return;
    }
    fetch(`/suggest?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        // optionally incorporate a local auto completions file by prefixing with '--example.com'
        // For parity with original code, user could add "--https://example.com" style suggestions.
        setSuggestions(Array.isArray(data) ? data : []);
      })
      .catch((_) => setSuggestions([]));
  }

  function handleChoose(text) {
    // mimic original behavior: if starts with "--", open as URL (without --), else google search
    const trimmed = (text || "").trim();
    const url = trimmed.startsWith("--") ? trimmed.slice(2) : `http://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    window.open(url, "_blank");
  }

  input.addEventListener("input", (e) => {
    const v = e.target.value.trim();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchSuggestions(v);
    }, 250);
  });

  input.addEventListener("keydown", (e) => {
    if (ul.style.display === "none") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (selectedIndex < suggestions.length - 1) selectedIndex++;
      updateActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (selectedIndex > 0) selectedIndex--;
      updateActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleChoose(suggestions[selectedIndex]);
      } else {
        handleChoose(input.value);
      }
    } else if (e.key === "Escape") {
      ul.style.display = "none";
    }
  });

  // click outside to close
  document.addEventListener("click", (ev) => {
    if (!ev.target.closest(".search-box")) {
      ul.style.display = "none";
    }
  });

  // focus behavior to change icon (mirror original: icon focused/unfocused)
  input.addEventListener("focus", () => {
    try {
      document.querySelector("link[rel='icon']").href = "/static/Google_logo_focused.png";
    } catch (e) { /* ignore */ }
  });
  input.addEventListener("blur", () => {
    try {
      document.querySelector("link[rel='icon']").href = "/static/Google_logo.png";
    } catch (e) { /* ignore */ }
  });

  // initial placeholder
  input.placeholder = "Google";
})();
