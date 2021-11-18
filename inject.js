var ytl = {};
if (ytl.titleObserver) ytl.titleObserver.disconnect();
ytl.titleObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        var isYouTube_target = ((mutation.target.baseURI).match("youtube.com") != null);
        if (mutation && mutation.target && isYouTube_target) {
            if ((mutation.target.baseURI).match("watch\\?") != null) {
                if (document.querySelector('ytd-app')) {
                    if (ytl.timer) {
                        ytl.on = false;
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
            menu.innerHTML = `<button id="shuffle-chapter-btn" style="line-height: 40px;" class="yt-icon-button"><div class="yt-icon-container yt-icon" style="width: 32px;"><svg viewBox="10 10 80 80" preserveAspectRatio="xMidYMid meet" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M19.401,62.222H8.022c-0.169-0.036-0.344-0.056-0.525-0.056c-1.236,0-2.262,0.885-2.488,2.056H4.962v11h0.076
        c0.238,0.992,1.056,1.75,2.078,1.906v0.094h17v-0.061c1.739-0.021,3.23-1.008,4.002-2.443L38.63,64.206L28.024,53.599
        L19.401,62.222z"/>    <path d="M94.651,30.776l-18.614-13.26c-0.393-0.28-0.891-0.315-1.319-0.094c-0.428,0.219-0.688,0.662-0.688,1.146l0.002,5.599
        H59.116v0.026c-1.066,0.06-2.029,0.476-2.781,1.138l-0.021-0.021L45.722,35.9l10.607,10.607l7.341-7.341h10.368l0.002,6.005 c0,0.481,0.271,0.924,0.7,1.146c0.429,0.222,0.946,0.183,1.34-0.099l18.576-13.346c0.338-0.241,0.461-0.631,0.461-1.046 c0-0.003,0-0.003,0-0.003C95.116,31.406,94.991,31.017,94.651,30.776z"/>    <path d="M94.578,67.126L76.002,53.781c-0.394-0.282-0.911-0.319-1.339-0.099c-0.429,0.223-0.7,0.665-0.7,1.146l-0.002,6.005H63.592
        L28.04,25.281c-0.772-1.435-2.263-2.421-4.001-2.442v-0.061h-17v0.094c-1.022,0.156-1.84,0.914-2.078,1.906H4.884v11h0.049
        c0.225,1.171,1.252,2.056,2.488,2.056c0.18,0,0.355-0.02,0.525-0.056h11.378l36.913,36.913l0.021-0.021
        c0.753,0.662,1.716,1.078,2.782,1.138v0.026h14.916l-0.002,5.599c0,0.484,0.26,0.928,0.688,1.146
        c0.429,0.223,0.926,0.187,1.319-0.093l18.614-13.26c0.34-0.242,0.465-0.631,0.465-1.049c0,0,0,0,0-0.004
        C95.039,67.758,94.916,67.367,94.578,67.126z"/> </g></svg></div></button>`;
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