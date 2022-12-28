import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Login from './login';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import Loading from '../components/Loading';
import { useEffect } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

function MyApp({ Component, pageProps }: AppProps) {
  const [loggedInUser, loading, _error] = useAuthState(auth);

  useEffect(() => {
    const setUserInDb = async () => {
      try {
        await setDoc(
          // Derectory
          doc(db, "users", loggedInUser?.email as string),
          // data want write
          {
            email: loggedInUser?.email,
            lastSeen: serverTimestamp(),
            photoURL: loggedInUser?.photoURL
          },
          // check user are existed or not? If yes, compare it with another, update only that one
          {merge: true}
        )
      } catch (error) {
        console.log("ERROR WHEN WRITE DATA IN DATABASE", error)
      }
    }
    if(loggedInUser) {
      setUserInDb()
    }
  }, [loggedInUser])
  
  if(loading) return <Loading />

  if(!loggedInUser) return <Login />
  return <Component {...pageProps} />
}

export default MyApp
