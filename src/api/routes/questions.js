import firebase from "react-native-firebase";
import axios from "axios";
import { shuffle } from "utils";

// const addNumber = ({ number }) => {
//     const { displayName, photoURL } = firebase.auth().currentUser;
//     const id = firebase.auth().currentUser.uid;
//     firebase.firestore().collection("quiz").get().then()
// }

const getQuestions = () => {
    // return new Promise((resolve, reject) => {
    //     let questions = []
    //     firebase.firestore().collection("questions").get().then((questions) => {
    //         // snapshot.forEach(question => {
    //         //     console.log(question.data())
    //         // })
    //         if (questions.length == 0){
    //             reject("No questions in database")
    //         } else {
    //             // console.log(questions)
    //             // questions.forEach((q) => {
    //             //     console.log(q.id, "=>", q.data())
    //             // })
    //             resolve(questions)
    //         }
    //     });
        
    // });

    // PREV WONG WAS HEREEE
    const id = firebase.auth().currentUser.uid;
    return new Promise((resolve, reject) => {
        axios.get('https://opentdb.com/api.php?amount=5').then(res => {
            const questions = res.data.results;
            const formatted_questions = questions.reduce((results, q) => {
                const { question, correct_answer, incorrect_answers } = q;
                let choices = incorrect_answers;
                const correct_index = Math.floor(Math.random() * 4);
                choices.splice(correct_index, 0, correct_answer);
                choices = choices.reduce((result, choice, i) => {
                    result["c" + (i + 1)] = choice;
                    return result;
                }, {});
                results.push({
                    choices,
                    correct: "c" + (correct_index + 1),
                    title: question,
                    type: "mcq"
                });
                return results;
            }, []);

            let firebase_questions = [];
            firebase.firestore().collection("questions").get().then(querySnapshot => {
                querySnapshot.forEach((doc) => {
                    firebase_questions.push(doc.data())
                });
                firebase_questions = shuffle(firebase_questions);

                const final_question = [...formatted_questions, ...firebase_questions];
                firebase.firestore().collection(`users/${id}/quiz`).add({
                    created_at: new Date(),
                    questions: final_question
                }).then((doc) => {
                    console.log("doc", doc, doc.id)
                    resolve({
                        id: doc.id,
                        questions: final_question
                    });
                }).catch(err => {
                    reject(err);
                })
            });
        });
    });
}
export default {
    getQuestions
}