import * as functions from 'firebase-functions';
import admin = require('firebase-admin');

import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-graphic-4b1f1.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    response.json({ message: 'Hello from functions of Firebase!' })
});

export const getGOTY = functions.https.onRequest(async (request, response) => {
    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const games = docsSnap.docs.map(doc => doc.data());

    response.json({
        games
    });
});

// Express

const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res, next) => {
    try {
        const gotyRef = db.collection('goty');
        const docsSnap = await gotyRef.get();
        const games = docsSnap.docs.map(doc => doc.data());

        res.json(games);
    }
    catch (error) {
        res.json({
            error
        });
    }
});

app.post('/goty/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const gameRef = db.collection('goty').doc(id);
        const gameSnap = await gameRef.get();

        if (!gameSnap.exists) {
            res.status(404).json({
                ok: false,
                message: 'Game does not exists: ' + id
            })
        } else {
            const before = gameSnap.data() || { votes: 0 };
            await gameRef.update({
                votes: before.votes + 1
            })
            res.json({
                ok: true,
                message: `Thanks for your vote to: '${before.name}'`
            });
        }
    }
    catch (error) {
        res.json({
            error
        });
    }
});

export const api = functions.https.onRequest(app);