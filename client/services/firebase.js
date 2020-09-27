import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'

const config = {
  apiKey: process.env.FIREBASE_CONFIG_API_KEY,
  authDomain: 'datahorror-b9cd4.firebaseapp.com',
  databaseURL: 'https://datahorror-b9cd4.firebaseio.com',
  projectId: 'datahorror',
  storageBucket: 'datahorror.appspot.com',
  messagingSenderId: '397665529422',
  appId: '1:397665529422:web:6513fea38be3162f5ddd1f',
  measurementId: 'G-HZTY5VT7M0',
}

if (!firebase.apps.length) {
  firebase.initializeApp(config)
}

const auth = firebase.auth()

const storage = firebase.storage()
/**
 * Get the storage ref for the thread
 *
 * @param {String} id of the thread
 */
const getThreadStorageRef = (id) => {
  return storage.ref(`threads/${id}.mp3`)
}

const db = firebase.firestore()
const threadsRef = db.collection(process.env.DB_THREADS_COLLECTION)
const mentionsRef = db.collection(process.env.DB_MENTIONS_COLLECTION)
const cacheRef = db.collection(process.env.DB_CACHE_COLLECTION)

const toTimeStamp = (date) => {
  return new firebase.firestore.Timestamp(date)
}

export {
  threadsRef,
  mentionsRef,
  cacheRef,
  auth,
  getThreadStorageRef,
  toTimeStamp,
}

export default firebase
