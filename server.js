const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 8000;

const apiUrl = process.env.APIURL;
const apiKey = process.env.APIKEY;
const authKey = process.env.AUTHKEY;
const sparKey = process.env.SPARKEY;
const signKey = process.env.SIGNKEY;

app.post("/auth/:mode/start", async (req, res) => {
    const params = new URLSearchParams({
        "authenticateServiceKey": req.params.mode === "sign" ? signKey : req.params.mode === "spar" ? sparKey : authKey,
        "apiKey": apiKey,
        "qr": true,
        "gui": false
    });

    if (req.params.mode === "sign") {
        params.append("userVisibleData", btoa("visible text!"));
        params.append("userNonVisibleData", btoa("invisible text!"));
    }

    const authRes = await fetch(`${apiUrl}/FederatedLogin`, {
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
    const url = new URL(`${apiUrl}/GetSession`);
    
    url.searchParams.append("authenticateServiceKey", req.params.mode === "sign" ? signKey : req.params.mode === "spar" ? sparKey : authKey);
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
