console.log(`Content script loaded`)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('GETTING IMAGE')
    const image = document.querySelector('[data-a-image-name]')
    if (message.type === 'REQUEST_OUTFIT_URL') {
        sendResponse({ url: image.src, description: image.alt });
    }
});
