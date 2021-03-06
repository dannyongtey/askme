import {
    LOG_IN,
    LOG_IN_SUCCESS,
    LOG_IN_FAILURE,
    LOG_IN_FILL_INFO,
    LOG_IN_NO_PHONE,
    SOCIAL_LOG_IN_EMAIL_EXISTS,
    LOG_IN_CANCEL,
    LOG_OUT,
    SIGN_UP,
    SIGN_UP_SUCCESS,
    SIGN_UP_FAILURE
} from 'store/reducers/auth';
import firebase from "react-native-firebase";
import { GoogleSignin } from 'react-native-google-signin';
import { setUser } from './user';
import { setLoading } from './loader';

function signUp() {
    return {
        type: SIGN_UP
    }
}

function signUpSuccess(user) {
    return {
        type: SIGN_UP_SUCCESS,
    }
}

function signUpFailure(err) {
    return {
        type: SIGN_UP_FAILURE,
        error: err
    }
}

function logIn() {
    return {
        type: LOG_IN
    }
}

export function logInSuccess(user) {
    return {
        type: LOG_IN_SUCCESS,
    }
}


export function logInCancel() {
    return {
        type: LOG_IN_CANCEL
    }
}

function socialLogInEmailExists(email, credential) {
    return {
        type: SOCIAL_LOG_IN_EMAIL_EXISTS,
        email,
        credential
    }
}

function logInFailure(err) {
    return {
        type: LOG_IN_FAILURE,
        error: err
    }
}
function logOut() {
    return {
        type: LOG_OUT
    }
}
export function unvalidateUser() {
    return (dispatch) => {
        dispatch(setLoading(false));
        dispatch(logOut());
        dispatch(setUser(null));
    }
}
export function validateUser() {
    return (dispatch) => {
        dispatch(setLoading(false));
        dispatch(logInSuccess());
        dispatch(setUser());
    }
}

export function createUser(email, password) {
    console.log("create user")
    return (dispatch) => {
        dispatch(signUp());
        api("users/createUserWithEmail", { email, password }).then(user => {
            console.log("success cresting user")
            dispatch(signUpSuccess());
            dispatch(validateUser());
        }).catch(err => {
            console.log("error creting user");
            dispatch(signUpFailure(err));
        })
    }
}

export function authenticate(email, password) {
    return (dispatch) => {
        dispatch(setLoading(true));
        dispatch(logIn());
        firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, password).then(data => {
            dispatch(validateUser());
        }).catch(error => {
            console.log("error logging in", error);
            dispatch(logInFailure(error));
        })
        dispatch(setLoading(false));
    }
}

export function socialAuthenticate() {
    return async (dispatch) => {
        dispatch(setLoading(true));
        try {
            // Add any configuration settings here:
            await GoogleSignin.configure({
                forceConsentPrompt: true
            });

            const data = await GoogleSignin.signIn();

            // create a new firebase credential with the token
            const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
            await firebase.auth().signInAndRetrieveDataWithCredential(credential);
            const id = firebase.auth().currentUser.uid;
            await firebase.firestore().doc(`users/${id}`).set({
                createdAt: new Date()
            });
            dispatch(validateUser());

        } catch (e) {
            dispatch(setLoading(false));
            throw new Error(e);
        }
        
    }
}


export function userNoPhone() {
    return (dispatch) => {
        dispatch(userNoPhone());
    }
}

export function signOut() {
    
    return (dispatch) => {
        dispatch(setLoading(true));
        console.log("signing out...")
        new Promise((resolve, reject) => {
            firebase.auth().signOut().then(async () => {
                try {
                    await GoogleSignin.revokeAccess();
                    await GoogleSignin.signOut();
                } catch (err) { }
                console.log("signing out");
                dispatch(unvalidateUser());
                resolve();
                
            }).catch(err => {
                console.log("sign out error", err);
                dispatch(unvalidateUser());
                resolve();
            })
        });
        
    }
}