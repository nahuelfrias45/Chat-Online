import express from "express";
import logger from 'morgan';

import { Server } from "socket.io";
import { createServer } from "node:http";

import { initializeApp } from "firebase/app";
import { collection, doc, setDoc, getFirestore } from "firebase/firestore";

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io =  new Server(server, {
  connectionStateRecovery: {}
})

//

const firebaseConfig = {
  apiKey: "AIzaSyCX450egkKtplFxgIXTLa_zg4fRbG14wtI",
  authDomain: "chat-fad57.firebaseapp.com",
  projectId: "chat-fad57",
  storageBucket: "chat-fad57.appspot.com",
  messagingSenderId: "57104127608",
  appId: "1:57104127608:web:fc887aa89a4baf814b3f8d"
};

// Initialize Firebase
const dbApp = initializeApp(firebaseConfig);

//config storage
const db = getFirestore(dbApp);




// config websocket
io.on('connection', (socket) => {
  console.log('a user has connected!')

  socket.on('disconnect', () => {
    console.log('a user has disconnect!')
  })

  socket.on('chat message', async (msg) => {
    const store = collection(db, 'chats')
    let result
    try {
      result = await setDoc(doc(store, "1"), {
        menssage: msg })
    } catch (e) {
      console.error(e)
      return
    }
    io.emit('chat message', msg)
  })
})

app.use(logger('dev'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})