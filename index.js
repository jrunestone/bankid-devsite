const authButton = document.querySelector("#auth");
const sparButton = document.querySelector("#spar");
const signButton = document.querySelector("#sign");
const qrImg = document.querySelector("#qr");
const initText = document.querySelector("#init");
const statusText = document.querySelector("#status");

// startar en ny session
const startAuth = async (mode) => {
    const res = await fetch(`/auth/${mode}/start`, {
        method: "POST"
    });

    const obj = await res.json();
    
    initText.innerText = JSON.stringify(obj, null, 2);

    // visa upp första qr-koden
    updateQrCode(obj.QRCode);

    // börja hämta status
    pollStatus(mode, obj.sessionId);
};

// hämtar status för en session
const pollStatus = async (mode, sessionId) => {
    // timerfunktionen som körs varannan sekund
    const pollFunc = async () => {
        const res = await fetch(`/auth/${mode}/poll/${sessionId}`);
        const obj = await res.json();

        statusText.innerText = JSON.stringify(obj, null, 2);

        // kolla status
        if (res.status !== 200) {
            // vi har ett fel
            // alert('Misslyckades');
            return;
        }
        
        // ok status, kolla om vi fortfarande är "pending"
        if (!!obj.grandidObject && obj.grandidObject.message.status === "pending") {
            // ja, visa nya qr-koden
            updateQrCode(obj.grandidObject.QRCode);

            // och anropa denna (samma) funktion igen efter 2 sekunder
            setTimeout(pollFunc, 2000);
        } else {
            // nej vi är inte pending och har inga fel
            // alert(`Lyckades: ${obj.userAttributes.name}/${obj.userAttributes.personalNumber}`);
        }
    }

    // trigga igång timerfunktionen första gången här
    await pollFunc();
};

// uppdaterar img med ny qr-kod-svg
const updateQrCode = (qr) => {
    qrImg.src = `data:image/svg+xml;base64,${qr}`;
}

// koppla start till knapptryck
authButton.onclick = () => startAuth("auth");
sparButton.onclick = () => startAuth("spar");
signButton.onclick = () => startAuth("sign");
