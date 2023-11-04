import express from "express";
import logger from 'morgan';

import { Server } from "socket.io";
import { createServer } from "node:http";

import { initializeApp } from "firebase/app";
import { collection, doc, setDoc, getDocs, getFirestore } from "firebase/firestore";

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io =  new Server(server, {
  connectionStateRecovery: {}
})

//

const firebaseConfig = {
  apiKey: process.env.API_TOKEN,
  authDomain: process.env.API_URL,
  projectId: "chat-fad57",
  storageBucket: "chat-fad57.appspot.com",
  messagingSenderId: "57104127608",
  appId: "1:57104127608:web:fc887aa89a4baf814b3f8d"
};

// Initialize Firebase
const dbApp = initializeApp(firebaseConfig);

//config storage
const db = getFirestore(dbApp);

// consigo los IDs y los guardo en un array

const ids = await getDocs(collection(db,'chats'))
const valueIds = []
ids.forEach((doc) => {
  valueIds.push(doc.id)
})

let randomNumber = 1
export const randomId = function () {
  let newRandomNumber = Math.floor(Math.random() * 1000)
  let stringRandomNumber = newRandomNumber.toString()
  if (valueIds.includes(stringRandomNumber)) {
    return randomId()
  } else {
    randomNumber = newRandomNumber
  }
}

randomId()


const getIds = await getDocs(collection(db, "chats"));
getIds.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});

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
      result = await setDoc(doc(store, `${randomNumber}`), {
        menssage: msg })
      } catch (e) {
        console.error(e)
        return
      }
      io.emit('chat message', msg, randomNumber)
      randomId()
  })
})

app.use(logger('dev'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})