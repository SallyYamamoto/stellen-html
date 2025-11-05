const JSON_URL = "verbs.json";

async function fetchData() {
  const res = await fetch(JSON_URL);
  return await res.json();
}


function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ホームページ（index.html）
if (document.getElementById("prefixes")) {
  fetchData().then(data => {
    const prefixes = [...new Set(data.map(d => d["接頭辞"]))].sort();
    const roots = [...new Set(data.map(d => d["基幹"]))].sort();

    const prefixList = document.querySelector("#prefixes ul");
    const rootList = document.querySelector("#roots ul");

    prefixes.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="list.html?prefix=${p}">${p}</a>`;
      prefixList.appendChild(li);
    });

    roots.forEach(r => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="list.html?root=${r}">${r}</a>`;
      rootList.appendChild(li);
    });
  });
}

// 一覧ページ（list.html）
if (document.getElementById("verbs")) {
  fetchData().then(data => {
    const prefix = getQueryParam("prefix");
    const root = getQueryParam("root");

    let filtered = [];
    let title = "";

    if (prefix) {
      filtered = data.filter(d => d["接頭辞"] === prefix);
      title = `接頭辞: ${prefix}`;
    } else if (root) {
      filtered = data.filter(d => d["基幹"] === root);
      title = `基幹: ${root}`;
    }

    document.getElementById("title").textContent = title;

    const list = document.getElementById("verbs");
    filtered.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${item["単語"]}</strong> — ${item["意味"]} <br>
        <em>${item["英訳"]}</em><br>
        <small>${item["構文"]}</small><br>
        例：${item["例文1"]}（${item["日本語訳1"]}）
      `;
      list.appendChild(li);
    });
  });
}
