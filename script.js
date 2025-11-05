console.log("✅ script.js loaded");


const JSON_URL = "verbs.json";

// データ読み込み（JSONを取得）
async function fetchData() {
  const res = await fetch(JSON_URL);
  if (!res.ok) throw new Error("JSON読み込み失敗");
  return await res.json();
}

// クエリパラメータ取得（prefix=root?）
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}


// --- メイン処理 ---
document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchData().catch(err => {
    document.body.innerHTML = "<p>データ読み込み失敗。</p>";
    console.error(err);
    return null;
  });
  if (!data) return;

  // list.htmlページで実行
  if (document.getElementById("verbs")) {
    const prefix = getQueryParam("prefix");
    const root = getQueryParam("root");

    const filtered = prefix
      ? data.filter(d => d["接頭辞"] === prefix)
      : data.filter(d => d["基幹"] === root);

    document.getElementById("title").textContent = prefix
      ? `接頭辞: ${prefix}`
      : `基幹部分: ${root}`;

    // 各接頭辞の背景カラー（うっすらした帯色）
    const prefixColors = {
      ab: "#f3f8f3", an: "#f4f8fc", auf: "#f5f5fb", aus: "#f2f8f7",
      dar: "#faf3fc", her: "#fdf5f3", ein: "#fff9e9", fest: "#fdf4f7",
      vor: "#f2f8fe", ver: "#f6f6f6", be: "#f7f6f5", ent: "#fcf4f7"
    };

    const listHTML = filtered.map(item => {
      const prefix = item["接頭辞"] || "";
      const root = item["基幹"] || "";
      const bg = prefixColors[prefix] || "#fff";

      return `
        <!-- === 単語カード（紙面風1枚構成） === -->
        <div class="verb-card" style="background:linear-gradient(to right, ${bg}, #fff)">
          <!-- ✅ タイトル部：中央寄せ、大きい文字＋下線 -->
          <div class="card-header">
            <h2>${item["単語"]}</h2>
            <div class="etymology">${prefix} + ${root}</div>
          </div>

          <!-- ✅ 意味部分：日本語太字＋英語斜体 -->
          <div class="meaning-jp">${item["意味"]}</div>
          <div class="meaning-en">${item["英訳"]}</div>

          <!-- ✅ 詳細情報：構成・語感・構文・活用 -->
          <div class="detail-section">
            <div class="detail-item"><span class="detail-label">構成 :</span><span class="detail-value">${prefix} (${item["接頭辞基本意味"] || ""}) + ${root}</span></div>
            <div class="detail-item"><span class="detail-label">語感 :</span><span class="detail-value">${item["語感"] || ""}</span></div>
            <div class="detail-item"><span class="detail-label">構文 :</span><span class="detail-value"><span class="german-term">${item["構文"] || ""}</span></span></div>
            <div class="detail-item"><span class="detail-label">活用 :</span><span class="detail-value"><span class="german-term">${item["活用"] || ""}</span></span></div>
          </div>

          <!-- ✅ 例文セクション：縦線＋右本文 -->
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

          <!-- ✅ 派生語セクション：🔤アイコン＋横並び -->
          ${item["派生語"] ? `
            <div class="noun-form">
              <span class="abc-icon">🔤</span>
              <span class="german-term">${item["派生語"]}</span>
              ${item["派生語意味"] ? `（${item["派生語意味"]}）` : ""}
            </div>` : ""}
        </div>
      `;
    }).join("");

    document.getElementById("verbs").innerHTML = listHTML || "<p>該当する単語がありません。</p>";
  }
});
