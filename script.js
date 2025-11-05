const JSON_URL = "verbs.json";

// JSONを取得
async function fetchData() {
  const res = await fetch(JSON_URL);
  if (!res.ok) throw new Error("verbs.json の読み込みに失敗しました。");
  return await res.json();
}

// URLパラメータ取得
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ホームページ用（接頭辞・基幹リスト）
if (document.getElementById("prefixes")) {
  document.getElementById("prefixes").innerHTML = "<h2>接頭辞</h2><p>読み込み中...</p>";
  document.getElementById("roots").innerHTML = "<h2>基幹部分</h2><p>読み込み中...</p>";

  fetchData().then(data => {
    const prefixes = [...new Set(data.map(d => d["接頭辞"]))].sort();
    const roots = [...new Set(data.map(d => d["基幹"]))].sort();

    const prefixHTML =
      "<h2>接頭辞</h2><ul>" +
      prefixes.map(p => `<li><a href="list.html?prefix=${p}">${p}</a></li>`).join("") +
      "</ul>";

    const rootHTML =
      "<h2>基幹部分</h2><ul>" +
      roots.map(r => `<li><a href="list.html?root=${r}">${r}</a></li>`).join("") +
      "</ul>";

    document.getElementById("prefixes").innerHTML = prefixHTML;
    document.getElementById("roots").innerHTML = rootHTML;
  }).catch(err => {
    document.getElementById("prefixes").innerHTML = "データの読み込みに失敗しました。";
    console.error(err);
  });
}

// 一覧ページ用（list.html）
if (document.getElementById("verbs")) {
  document.getElementById("verbs").innerHTML = "<li>読み込み中...</li>";

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

    document.getElementById("verbs").innerHTML = listHTML || "<li>該当する単語がありません。</li>";
  }).catch(err => {
    document.getElementById("verbs").innerHTML = "<li>データの読み込みに失敗しました。</li>";
    console.error(err);
  });
}
