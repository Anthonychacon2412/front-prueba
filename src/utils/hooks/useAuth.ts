import { db } from '@/configs/firebaseAssets.config'
import {
    collection,
    getDocs,
    where,
    query,
    getDoc,
    doc,
    setDoc,
} from 'firebase/firestore'
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import { apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'

type Status = 'success' | 'failed'
// import DB and function

// import { doc, setDoc, getDoc, query, collection, where, getDocs, updateDoc } from 'firebase/firestore'
// import {
//     getAuth,
//     createUserWithEmailAndPassword,
//     signInWithEmailAndPassword,
// } from 'firebase/auth'
// import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const queryRedirect = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential,
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        const query1 = query(
            collection(db, 'usuarios'),
            where('email', '==', values.userName),
        )
        const querySnapshot = await getDocs(query1)
        let infoFinal: any = []
        querySnapshot.forEach((doc) => {
            let dataTempo: any = doc.data()
            dataTempo.key = doc.id
            dataTempo.total = 0
            infoFinal.push(dataTempo)
        })

        console.log(infoFinal)
        if (infoFinal.length == 0) {
            return {
                status: 'failed',
                message: 'El usuario no se encuentra registrado',
            }
        } else {
            try {
                const auth = getAuth()
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    values.userName,
                    values.password,
                )

                // .then(resp=>{
                if (userCredential?.user?.uid) {
                    const token = userCredential?.user?.uid
                    dispatch(signInSuccess(token))
                    if (userCredential?.user) {
                        console.log(userCredential?.user?.uid)
                        getDoc(
                            doc(db, 'usuarios', userCredential?.user?.uid),
                        ).then((resp) => {
                            const info = resp.data()
                            localStorage.setItem('userName', info?.name)
                            dispatch(
                                setUser({
                                    avatar: '',
                                    userName: info?.name,
                                    email: info?.email,
                                    key: resp.id,
                                    status: info?.status,
                                    authority: ['admin', 'user'], // ['user']
                                }),
                            )
                            const redirectUrl =
                                queryRedirect.get(REDIRECT_URL_KEY)
                            navigate(
                                redirectUrl
                                    ? redirectUrl
                                    : appConfig.authenticatedEntryPath,
                            )
                            return {
                                status: 'success',
                                message: '',
                            }
                        })
                    }
                } else {
                    console.log(userCredential)
                    return {
                        status: 'failed',
                        message: 'fallo',
                    }
                }
            } catch (errors: any) {
                // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                // }
                return {
                    status: 'failed',
                    message:
                        errors?.response?.data?.message || errors.toString(),
                }
            }
        }
    }

    const signUp = async (values: any) => {
        return new Promise((resolve, reject) => {
            console.log(values)
            const auth = getAuth()
            createUserWithEmailAndPassword(auth, values.email, values.password)
                .then((userCredential) => {
                    const user = userCredential.user
                    console.log('aqui')
                    console.log(user)
                    if (user?.uid) {
                        const token = user?.uid
                        console.log(token)
                        console.log(values)
                        setDoc(doc(db, 'usuarios', user?.uid), values).then(
                            (resp) => {
                                dispatch(signInSuccess(token))
                                if (user?.uid) {
                                    localStorage.setItem(
                                        'userName',
                                        values.name,
                                    )
                                    dispatch(
                                        setUser({
                                            avatar: '',
                                            userName: values?.name,
                                            email: values?.email,
                                            key: token,
                                            status: values?.status,
                                            authority: ['admin', 'user'], // ['user']
                                        }),
                                    )
                                }
                                const redirectUrl =
                                    queryRedirect.get(REDIRECT_URL_KEY)
                                navigate(
                                    redirectUrl
                                        ? redirectUrl
                                        : appConfig.authenticatedEntryPath,
                                )

                                return {
                                    status: 'success',
                                    message: 'Usuario creado exitosamente',
                                }
                            },
                            (err) => {},
                        )
                    } else {
                        console.log('Error en Guardado en BD')
                        return {
                            status: 'failed',
                            message: 'Error',
                        }
                    }
                })
                .catch((error) => {
                    console.log(error)
                    const errorMessage = error.message
                    reject(errorMessage)
                    // return {
                    //     status: 'failed',
                    //     message: errorMessage.toString(),
                    // }
                })
        })
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                userName: '',
                email: '',
                key: '',
                status: false,
                authority: [],
            }),
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        await apiSignOut()
        handleSignOut()
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
