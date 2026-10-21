const CACHE_NAME = "fengqin-tuner-v2"; // 名字改成了标准英文减号，版本号升到 v2 会强制刷新旧缓存
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// 安装：缓存基础文件
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 激活：清理旧的缓存（比如之前的 v1）
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求：网络优先（确保改了代码立刻生效）
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).then((res) => {
      // 如果网络请求成功，顺便更新一下缓存
      const resClone = res.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(e.request, resClone);
      });
      return res;
    }).catch(() => {
      // 如果断网了，则从缓存里拿
      return caches.match(e.request);
    })
  );
});