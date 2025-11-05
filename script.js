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
      const composition = prefix && core ? `${prefix} + ${core}` : "";

      return `
        <div class="card">
          <div class="header">
            <h2>${item["単語"]}</h2>
            <div class="etymology">${composition}</div>
          </div>

          <div class="meaning-jp">${item["意味"]}</div>
          <div class="meaning-en">${item["英訳"]}</div>

          <div class="detail-section">
            <div class="detail-item">
              <span class="detail-label">構成 :</span>
              <span class="detail-value">${prefix}（${prefixMeaning}） + ${core}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">語感 :</span>
              <span class="detail-value">${item["語感"] || ""}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">構文 :</span>
              <span class="detail-value"><span class="german-term">${item["構文"] || ""}</span></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">活用 :</span>
              <span class="detail-value"><span class="german-term">${item["活用"] || ""}</span></span>
            </div>
          </div>

          <div class="example-section">
            ${item["例文1"] ? `
              <div class="example-box">
                <div class="vertical-line"></div>
                <div class="example-content">
                  <p class="german-sentence">${item["例文1"]}</p>
                  <p class="japanese-translation">（${item["日本語訳1"]}）</p>
                </div>
              </div>` : ""}

            ${item["例文2"] ? `
              <div class="example-box">
                <div class="vertical-line"></div>
                <div class="example-content">
                  <p class="german-sentence">${item["例文2"]}</p>
                  <p class="japanese-translation">（${item["日本語訳2"]}）</p>
                </div>
              </div>` : ""}
          </div>

          ${item["派生語"] ? `
          <div class="noun-form">
            <span class="abc-icon">🔤</span>
            <span class="german-term">${item["派生語"]}</span>
          </div>` : ""}
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
