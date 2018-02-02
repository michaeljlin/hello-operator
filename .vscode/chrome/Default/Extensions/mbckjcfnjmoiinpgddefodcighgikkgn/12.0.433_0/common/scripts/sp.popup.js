(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true, currentWindow: true
        }, function (tabs) {
            resolve(tabs[0]);
        });
    });
}

function sendMessage(data) {
    chrome.runtime.sendMessage(data);
}

function onMessage(message, sender, sendResponse) {
    if (config.actions[message.message]) config.actions[message.message](message);
}

function sendIconClickedMessage() {
    getCurrentTab().then((tab) => {
        sendMessage({
            tab: tab,
            message: config.messages.iconClicked
        })
    });
}

function renderPopup(data) {
    $(config.selector).after(Mustache.render(AvastWRC.Templates.defaultPopup, data.data.template));
}

function closePopup() {
    window.close();
}

function init() {
    sendIconClickedMessage();
    chrome.runtime.onMessage.addListener(onMessage);
}

let config = {
    messages: {
        iconClicked: "control.onClicked"
    },
    actions: {
        renderPopup: renderPopup,
        closePopup: closePopup
    },
    selector: ".avast-sas-default-popup-container-img"
};

init();
},{}]},{},[1])