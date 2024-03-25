const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 8000;

const apiKey = process.env.APIKEY;
const signKey = process.env.SIGNKEY;
const authKey = process.env.AUTHKEY;

app.post("/auth/:mode/start", async (req, res) => {
    const params = new URLSearchParams({
        "authenticateServiceKey": req.params.mode === "sign" ? signKey : authKey,
        "apiKey": apiKey,
        "qr": true,
        "gui": false
    });

    if (req.params.mode === "sign") {
        params.userVisibleData = btoa("visible text!");
        params.userNonVisibleData = btoa("invisible text!");
    }

    const authRes = await fetch("https://client-test.grandid.com/json1.1/FederatedLogin", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });

    const authObj = await authRes.json();
    res.status(200).json(authObj);
});

app.get("/auth/:mode/poll/:id", async (req, res) => {
    const url = new URL("https://client-test.grandid.com/json1.1/GetSession");
    
    url.searchParams.append("authenticateServiceKey", req.params.mode === "sign" ? signKey : authKey);
    url.searchParams.append("apiKey", apiKey);
    url.searchParams.append("sessionId", req.params.id);

    const authRes = await fetch(url, {
        method: "GET"
    });

    const authObj = await authRes.json();
    
    if (authObj.grandidObject && authObj.grandidObject.message && authObj.grandidObject.message.status === "failed") {
        res.status(401).json(authObj);
    }
    else {
        res.status(200).json(authObj);
    }    
});

app.use(express.static("."));

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});