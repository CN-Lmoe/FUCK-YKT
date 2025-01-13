// ==UserScript==
// @name         FUCK-qn.yuketang
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Check if a specific div exists every second, find unique image links, and provide options to copy or download
// @author       Lmoe
// @match        https://www.yuketang.cn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        navigator.clipboard.writeText
// @grant        unsafeWindow
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// ==/UserScript==

(function () {
    'use strict';
    const checkInterval = setInterval(() => {
        const targetDiv = document.querySelector('.studentPPT__component');
        const pptNameDiv = document.querySelector('.ppt_info_box.ppt_info.ppt_name');
        let zipFileName = 'images.zip';
        if (pptNameDiv) {
            zipFileName = pptNameDiv.textContent.trim() + '.zip';
        }
        if (targetDiv) {
            const imgContainers = targetDiv.querySelectorAll('.thumbImg-container img');
            const uniqueImages = [];
            imgContainers.forEach((img) => {
                const src = img.src;
                if (!uniqueImages.includes(src)) {
                    uniqueImages.push(src);
                }
            });
            const imgCount = uniqueImages.length;
            if (imgCount === 0) {
                return;
            }
            const linkText = uniqueImages.join('\n');

            const div = document.createElement('div');
            div.id = 'popupDiv';
            div.style.position = 'fixed';
            div.style.top = '10px';
            div.style.left = '10px';
            div.style.backgroundColor = 'white';
            div.style.padding = '10px';
            div.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
            div.style.zIndex = '10000';
            div.innerHTML = `
                <button style="position: absolute; top: 5px; left: 5px;" onclick="togglePopup()">折叠/展开</button>
                查找到 ${imgCount} 个图片链接：<br>${linkText}<br>
                <button onclick="copyToClipboard()">复制到剪切板</button>
                <button onclick="downloadImages()">下载</button>
                <button onclick="closePopup()">关闭弹窗</button>
            `;
            document.body.appendChild(div);

            window.copyToClipboard = function () {
                navigator.clipboard.writeText(linkText).then(() => {
                    alert('已成功复制到剪贴板');
                }).catch((error) => {
                    alert('复制到剪贴板失败：' + error);
                });
            };

            window.downloadImages = async function () {
                const zip = new JSZip();
                for (let i = 0; i < uniqueImages.length; i++) {
                    const response = await fetch(uniqueImages[i]);
                    const blob = await response.blob();
                    zip.file(`image_${i + 1}.${blob.type.split('/')[1]}`, blob);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = zipFileName;
                a.click();
                URL.revokeObjectURL(url);
            };

            window.closePopup = function () {
                const popup = document.querySelector('#popupDiv');
                if (popup) {
                    popup.remove();
                }
            };

            window.togglePopup = function () {
                const popup = document.querySelector('#popupDiv');
                if (popup) {
                    if (popup.style.height === 'auto' || popup.style.height === '') {
                        popup.style.height = popup.offsetHeight + 'px';
                        popup.style.overflow = 'hidden';
                        popup.style.height = '30px';
                    } else {
                        popup.style.height = 'auto';
                        popup.style.overflow = 'visible';
                    }
                }
            };

            clearInterval(checkInterval);
        }
    }, 1000);
})();

