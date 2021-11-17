var ytl = {};
if (ytl.titleObserver) ytl.titleObserver.disconnect();
ytl.titleObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        var isYouTube_target = ((mutation.target.baseURI).match("youtube.com") != null);
        if (mutation && mutation.target && isYouTube_target) {
            if ((mutation.target.baseURI).match("watch\\?") != null) {
                if (document.querySelector('ytd-app')) {
                    if (ytl.timer) {
                        clearInterval(ytl.timer);
                    }
                    setTimeout(function() {
                        ytl.initiate();
                    }, 1000)
                }
            }
        }
    });
});
ytl.titleObserver.observe(document.querySelector('head > title') || document.querySelector('title'), {
    subtree: true,
    characterData: true,
    childList: true
});
ytl.retryCount = 0;
ytl.initiate = function() {
    var panels = document.getElementById("panels");
    var panel = panels.querySelectorAll("ytd-engagement-panel-section-list-renderer")[1];
    if (!panel)
        panel = panels.querySelectorAll("ytd-engagement-panel-section-list-renderer")[0];
    if (panel) {
        var title = panel.querySelector("ytd-engagement-panel-title-header-renderer");
        var body = panel.querySelector("ytd-macro-markers-list-renderer");
        var menu = title.querySelector("#menu");
        if (menu && body) {
            menu.innerHTML = `<button id="shuffle-chapter-btn" style="line-height: 40px;" class="yt-icon-button"><div class="yt-icon-container yt-icon"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" class="style-scope yt-icon"></path> </g></svg></div></button>`;
            var btn = menu.querySelector("#shuffle-chapter-btn");
            btn.onclick = function() {
                ytl.on = !ytl.on;
                if (ytl.on)
                    btn.classList.add("on");
                else
                    btn.classList.remove("on");
            }
            var css = '#shuffle-chapter-btn.on { color: red; }',
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            head.appendChild(style);

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            var list = body.querySelectorAll("ytd-macro-markers-list-item-renderer");
            ytl.chapters = [];
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var endpoint = item.querySelector("#endpoint");
                var href = endpoint.href;
                href = href.substring(href.indexOf("?") + 1);
                var params = href.split("&");
                for (var j in params) {
                    var temp = params[j].split("=");
                    if (temp[0] == "t") {
                        second = parseInt(temp[1].replace("s", ""));
                    }
                }
                var title = item.querySelector("#details h4").innerText.trim();
                ytl.chapters.push({
                    title,
                    second
                });
            }
            var video = document.querySelector(".html5-video-container video");
            var prevSecond = 0;
            ytl.timer = setInterval(function() {
                if (video.paused || !ytl.on) {
                    ytl.second = -1;
                    return;
                }
                prevSecond = ytl.second;
                var currentSecond = parseInt(video.currentTime);
                ytl.second = currentSecond;
                if (prevSecond != -1) {
                    for (var i in ytl.chapters) {
                        var chapterSecond = ytl.chapters[i].second;
                        if (currentSecond == parseInt(video.duration) - 1 || (prevSecond < chapterSecond && currentSecond >= chapterSecond && prevSecond < currentSecond && currentSecond - prevSecond <= 2)) {
                            var j = parseInt(ytl.chapters.length * Math.random());
                            prevSecond = ytl.chapters[j].second;
                            ytl.second = prevSecond;
                            video.currentTime = prevSecond;
                            break;
                        }
                    }
                }
            }, 1000);
        } else if (ytl.timer) {
            clearInterval(ytl.timer);
        }
    } else {
        ytl.retryCount++;
        if (ytl.retryCount < 100) {
            setTimeout(function() {
                ytl.initiate();
            }, 100);
        }
    }
}
setTimeout(function() {
    ytl.initiate();
}, 1000)