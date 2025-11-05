const JSON_URL = "verbs.json";

async function fetchData() {
  const res = await fetch(JSON_URL);
  return await res.json();
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// --- ホームページ（index.html） ---
if (document.getElementById("prefixes")) {
  document.getElementById("prefixes").innerHTML = `<h2>接頭辞</h2><p>読み込み中...</p>`;
  document.getElementById("roots").innerHTML = `<h2>基幹部分</h2><p>読み込み中...</p>`;

  fetchData().then(data => {
    // --- 接頭辞を分離性ごとに分類 ---
    const groups = { 分離: new Set(), 非分離: new Set(), 両方: new Set() };

    data.forEach(d => {
      if (d["接頭辞"] && d["分離性"]) {
        const type = d["分離性"];
        if (groups[type]) groups[type].add(d["接頭辞"]);
      }
    });

    // --- ラベルとアイコン設定 ---
    const labels = {
      分離: { icon: "🟩", text: "trennbar" },
      非分離: { icon: "🟥", text: "untrennbar" },
      両方: { icon: "🟨", text: "teils trennbar" }
    };

    // --- HTML生成 ---
    const sectionHTML = Object.entries(groups).map(([key, set]) => {
      const sorted = [...set].sort((a, b) => a.localeCompare(b, "de"));
      if (sorted.length === 0) return "";
      return `
        <h3>${labels[key].icon} ${labels[key].text}</h3>
        <ul>
          ${sorted.map(p => `<li><a href="list.html?prefix=${p}">${p}</a></li>`).join("")}
        </ul>
      `;
    }).join("");

    document.getElementById("prefixes").innerHTML = `<h2>接頭辞</h2>${sectionHTML}`;

    // --- 基幹部分 ---
    const roots = [...new Set(data.map(d => d["基幹"]))].sort((a, b) => a.localeCompare(b, "de"));
    const rootHTML = `
      <h2>基幹部分</h2>
      <ul>
        ${roots.map(r => `<li><a href="list.html?root=${r}">${r}</a></li>`).join("")}
      </ul>
    `;
    document.getElementById("roots").innerHTML = rootHTML;
  }).catch(err => {
    document.getElementById("prefixes").innerHTML = "読み込みに失敗しました。";
    console.error(err);
  });
}

// --- 一覧ページ（list.html） ---
if (document.getElementById("verbs")) {
  document.getElementById("verbs").innerHTML = `<li>読み込み中...</li>`;

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
      title = `基幹部分: ${root}`;
    }

    document.getElementById("title").textContent = title;

    const listHTML = filtered.map(item => `
      <li>
        <strong>${item["単語"]}</strong> — ${item["意味"]}<br>
        <em>${item["英訳"]}</em><br>
        <small>${item["構文"]}</small><br>
        例：${item["例文1"]}（${item["日本語訳1"]}）<br>
        <small>${item["派生語"]}</small>
      </li>
    `).join("");

    document.getElementById("verbs").innerHTML = listHTML || `<li>該当する単語がありません。</li>`;
  }).catch(err => {
    document.getElementById("verbs").innerHTML = `<li>データの読み込みに失敗しました。</li>`;
    console.error(err);
  });
}
