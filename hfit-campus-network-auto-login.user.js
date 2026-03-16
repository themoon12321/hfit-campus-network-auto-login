// ==UserScript==
// @name         合肥理工校园网自动登录v1.6
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  合肥理工校园网自动填充登录脚本（无弹窗+超时关闭+可视化提示）
// @author       月亮早睡困不醒
// @copyright    © 2026 月亮早睡困不醒 保留所有权利
// @match        http://10.10.2.15/*
// @grant        none
// ==/UserScript==

/*
 * 【版权声明】
 * 本脚本为合肥理工校园网自动登录工具，完整著作权归作者「月亮早睡困不醒」所有
 * 【使用许可规则】
 * 1. 仅限合肥理工学院校内师生个人非商业用途免费使用
 * 2. 禁止未经作者授权，对本脚本进行修改、二次分发、售卖、盗用署名
 * 3. 分享本脚本必须保留完整的版权声明、作者信息与许可规则，不得删除篡改
 * 4. 使用者自行填写个人账号密码，因账号泄露造成的任何损失，作者不承担责任
 */

(function() {
    'use strict';

    // ====================== 请使用者自行填写以下配置 ======================
    const YOUR_STUDENT_ID = "你的学号"; // 请在这里删除提示文字（密码、运营商同理），填写你的学号/工号
    const YOUR_PASSWORD = "你的密码"; // 密码为明文本地存储，为保护你的账号隐私，严禁将填写了个人密码的脚本分享给他人！！！
    const TARGET_OPERATOR = "运营商"; // 请填写你的运营商：校园网/中国移动/中国电信/中国联通
    const AUTO_CLICK_LOGIN = true; // true=自动点击登录，false=仅填充不登录
    const SCRIPT_TIMEOUT = 10000; // 超时时间（毫秒）
    // ======================================================================

    function showPageTip(text, isSuccess = true) {
        const tip = document.createElement('div');
        tip.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 9999;
            opacity: 0.9;
            transition: opacity 0.5s;
        `;
        tip.style.backgroundColor = isSuccess ? '#4CAF50' : '#F44336';
        tip.innerText = text;
        document.body.appendChild(tip);
        setTimeout(() => {
            tip.style.opacity = 0;
            setTimeout(() => {
                if (document.body.contains(tip)) {
                    document.body.removeChild(tip);
                }
            }, 500);
        }, 3000);
    }

    function simulateKeyInput(element, text) {
        element.focus();
        element.value = '';
        for (let char of text) {
            element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
            document.execCommand('insertText', false, char);
            element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
        }
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.blur();
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
        if (Date.now() - startTime > SCRIPT_TIMEOUT) {
            clearInterval(checkInterval);
            const tipText = `脚本超时（${SCRIPT_TIMEOUT/1000}秒）：未找到登录输入框`;
            console.log(`⏰ ${tipText}`);
            showPageTip(tipText, false);
            return;
        }

        const usernameInput = document.querySelector('input[name="DDDDD"][placeholder*="学号"]');
        const passwordInput = document.querySelector('input[name="upass"][type="password"]');
        const operatorSelect = document.querySelector('select[name="ISP_select"]');
        const loginBtn = document.querySelector('input[name="BMBKey"][value="登录"]');

        if (usernameInput && passwordInput && !usernameInput.disabled && !passwordInput.disabled) {
            clearInterval(checkInterval);

            simulateKeyInput(usernameInput, YOUR_STUDENT_ID);
            simulateKeyInput(passwordInput, YOUR_PASSWORD);

            if (operatorSelect) {
                for (let option of operatorSelect.options) {
                    if (option.text.includes(TARGET_OPERATOR)) {
                        option.selected = true;
                        operatorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }

            if (AUTO_CLICK_LOGIN) {
                setTimeout(() => {
                    if (window.ee) {
                        window.ee(1);
                    } else if (loginBtn) {
                        loginBtn.click();
                    }

                    const successText = "合理工校园网自动登录脚本执行成功 | 作者：月亮早睡困不醒";
                    console.log(`✅ ${successText}`);
                    showPageTip(successText, true);
                }, 1500);
            }
        }
    }, 300);
})();