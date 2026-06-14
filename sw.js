// 4投式 抽出ガイド — オフライン用 Service Worker（ネットワーク優先版）
// ※ ダウンロード後に「.txt」を外して「sw.js」にしてください。
//    index.html と同じ階層に置いて、https で配信すると有効になります。
//
// 【方式】ネットワーク優先（network-first）
//   - オンライン時：毎回サーバーから最新を取得 → 表示＆キャッシュ更新
//     （＝アプリを修正してGitHubに上げれば、次に開いたとき自動で最新になる）
//   - オフライン時：最後にキャッシュした内容で起動
//   この方式なら、更新のたびに下の CACHE 番号を変える必要はありません。

const CACHE = 'pour-guide-v1';
const ASSETS = ['./', './index.html'];

// インストール時に一度キャッシュ（初回オフライン保険）
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// 古いキャッシュを掃除して即適用
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先：取れたら最新を返してキャッシュ更新、ダメならキャッシュ
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
