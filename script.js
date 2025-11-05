const JSON_URL = "verbs.json";

async function fetchData() {
  const res = await fetch(JSON_URL);
  if (!res.ok) throw new Error("JSON読み込み失敗");
  return await res.json();
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchData().catch(err => {
    console.error(err);
    document.body.innerHTML = "<p>データの読み込みに失敗しました。</p>";
    return null;
  });
  if (!data) return;

  // --- index.html ---
  if (document.getElementById("prefixes")) {
    const groups = { 分離: new Set(), 非分離: new Set(), 両方: new Set() };
    data.forEach(d => {
      if (d["接頭辞"] && d["分離性"]) groups[d["分離性"]].add(d["接頭辞"]);
    });

    const labels = {
      分離: { icon: "🟩", text: "分離（trennbar）" },
      非分離: { icon: "🟥", text: "非分離（untrennbar）" },
      両方: { icon: "🟨", text: "両方（teils trennbar）" }
    };

    const prefixHTML = Object.entries(groups).map(([type, set]) => {
      const sorted = [...set].sort((a, b) => a.localeCompare(b, "de"));
      return `
        <div class="prefix-section">
          <h3>${labels[type].icon} ${labels[type].text}</h3>
          <div class="prefix-grid">
            ${sorted.map(p => `<a href="list.html?prefix=${p}">${p}</a>`).join(" / ")}
          </div>
        </div>`;
    }).join("");

    document.getElementById("prefixes").innerHTML = prefixHTML;

    const roots = [...new Set(data.map(d => d["基幹"]))].sort((a, b) => a.localeCompare(b, "de"));
    document.getElementById("roots").innerHTML =
      `<div class="root-grid">${roots.map(r => `<a href="list.html?root=${r}">${r}</a>`).join(" / ")}</div>`;
  }

  // --- list.html ---
  if (document.getElementById("verbs")) {
    const prefix = getQueryParam("prefix");
    const root = getQueryParam("root");
    const filtered = prefix
      ? data.filter(d => d["接頭辞"] === prefix)
      : data.filter(d => d["基幹"] === root);

    document.getElementById("title").textContent = prefix ? `接頭辞: ${prefix}` : `基幹部分: ${root}`;

    const prefixColors = {
      ab: "#e8f5e9", an: "#e3f2fd", auf: "#e8eaf6", aus: "#e0f2f1",
      dar: "#f3e5f5", her: "#fbe9e7", ein: "#fff8e1", fest: "#fce4ec",
      um: "#eceff1", vor: "#e1f5fe", zurück: "#f3e5f5", zusammen: "#e0f2f1",
      nach: "#fce4ec", bei: "#f1f8e9", bereit: "#e0f7fa", be: "#efebe9",
      ent: "#fce4ec", ver: "#f5f5f5", zu: "#efebe9"
    };

    const listHTML = filtered.map(item => {
      const prefix = item["接頭辞"] || "";
      const core = item["基幹"] || "";
      const bg = prefixColors[prefix] || "#fff";

      return `
      <div class="verb-card" style="background:linear-gradient(to right, ${bg}, #fff)">
        <div class="header">
          <h1>${item["単語"]}</h1>
          <div class="etymology">${prefix} + ${core}</div>
        </div>

        <div class="meaning-jp">${item["意味"]}</div>
        <div class="meaning-en">${item["英訳"]}</div>

        <div class="detail-section">
          <div class="detail-item"><span class="detail-label">構成 :</span><span class="detail-value">${prefix} (${item["接頭辞基本意味"] || ""}) + ${core}</span></div>
          <div class="detail-item"><span class="detail-label">語感 :</span><span class="detail-value">${item["語感"] || ""}</span></div>
          <div class="detail-item"><span class="detail-label">構文 :</span><span class="detail-value"><span class="german-term">${item["構文"] || ""}</span></span></div>
          <div class="detail-item"><span class="detail-label">活用 :</span><span class="detail-value"><span class="german-term">${item["活用"] || ""}</span></span></div>
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
          <span class="german-term">${item["派生語"]}</span>（${item["派生語意味"] || ""}）
        </div>` : ""}
      </div>`;
    }).join("");

    document.getElementById("verbs").innerHTML = listHTML || "<p>該当する単語がありません。</p>";
  }
});
