const JSON_URL = "verbs.json";

async function fetchData() {
  const res = await fetch(JSON_URL);
  return await res.json();
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

if (document.getElementById("verbs")) {
  document.getElementById("verbs").innerHTML = `<p>読み込み中...</p>`;

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

    const listHTML = filtered.map(item => {
      const prefix = item["接頭辞"] || "";
      const prefixMeaning = item["接頭辞基本意味"] || "";
      const core = item["基幹"] || "";
      const comp = prefix && core ? `${prefix} + ${core}` : "";

      return `
        <div class="card">
          <div class="card-header">
            <h2>${item["単語"]}</h2>
            <small>${comp}</small>
          </div>
          <div class="card-body">
            <div class="meaning">${item["意味"]}</div>
            <div class="english">${item["英訳"]}</div>

            <div class="section"><span class="label">構成：</span>${prefix}（${prefixMeaning}） + ${core}</div>
            <div class="section"><span class="label">語感：</span>${item["語感"]}</div>
            <div class="section"><span class="label">構文：</span><i>${item["構文"]}</i></div>
            <div class="section"><span class="label">活用：</span>${item["活用"]}</div>

            <div class="example">
              ${item["例文1"]}<br>
              （${item["日本語訳1"]}）<br><br>
              ${item["例文2"] || ""}<br>
              ${item["日本語訳2"] ? `（${item["日本語訳2"]}）` : ""}
            </div>

            <div class="derived">${item["派生語"]}</div>
          </div>
        </div>
      `;
    }).join("");

    document.getElementById("verbs").innerHTML =
      listHTML || `<p>該当する単語がありません。</p>`;
  }).catch(err => {
    document.getElementById("verbs").innerHTML = `<p>データの読み込みに失敗しました。</p>`;
    console.error(err);
  });
}
