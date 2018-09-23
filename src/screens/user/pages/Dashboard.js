import React, {Component} from "react";
import { View, FlatList} from "react-native";
import { Button, Text, Content, Body, Container, Card, CardItem, Title, Icon } from "native-base";
import { signOut } from "store/actions/auth";
import {connect} from "react-redux";
import AppHeader from "components/AppHeader";
import QuizItem from "../../../components/QuizItem";
import firebase from "react-native-firebase";
import Winner from "../../../components/Winner";
import HeaderButtons, { HeaderButton, Item as HeaderItem } from 'react-navigation-header-buttons';
import axios from "axios";

class Dashboard extends Component {
    state = {
        quiz: [],
        winner: null
    }
    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params ? navigation.state.params.title : "AskMe",
        headerLeft: null,
        headerStyle: {
            backgroundColor: '#eeer',
        },
        headerLeft: (
            <HeaderButtons HeaderButtonComponent={(props) => <HeaderButton {...props} IconComponent={Icon} />}>
                <HeaderItem title="menu" iconName="menu" onPress={() => navigation.openDrawer()} />
            </HeaderButtons>
        ),
        headerRight: (
            <HeaderButtons HeaderButtonComponent={props => <HeaderButton {...props} IconComponent={Icon} iconSize={23} color="#333" />}>
                {/* use Item or HeaderButtons.Item */}
                <HeaderButtons.Item buttonStyle={{ borderWidth: 1, borderRadius:100, padding: 5, paddingHorizontal: 50, backgroundColor:"#fff"}} title="play " onPress={() => navigation.navigate("Question") } />
            </HeaderButtons>
        )
    })

    winner = firebase.firestore().collection(`winners`).orderBy(`createdAt`, 'desc').limit(1);
    quiz = firebase.firestore().collection(`quiz`).where(`query.participants.${firebase.auth().currentUser.uid}`, '==', true).where('query.type', '==', 'classroom').orderBy("createdAt", "desc").limit(20);
    componentDidMount(){
        this.quizUnsubscribe = this.quiz.onSnapshot(this.quizUpdate.bind(this));
        this.winnerUnsubscribe = this.winner.onSnapshot(this.winnerUpdate.bind(this));
    }
    

    quizUpdate(querySnapshot) {
        const quiz = []
        querySnapshot.forEach(doc => {
            if (doc.exists) {
                quiz.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });
        
        this.setState({
            quiz
        });
    }
    winnerUpdate(querySnapshot) {
        let winner;
        querySnapshot.forEach(doc => {
            if ( doc.exists ) {
                winner = {
                    id: doc.id,
                    ...doc.data()
                }
            }
        });
        this.setState({
            winner
        });
    }
    componentWillUnmount(){
        if ( this.quizUnsubscribe ) this.quizUnsubscribe();
        if (this.winnerUnsubscribe) this.winnerUnsubscribe();
    }

    render() {
        console.log("DASHBOARD-RENDER");
        const { authenticated} = this.props.auth;
        const {quiz, winner} = this.state;
        return (
            <Container>
                <Content style={{backgroundColor:"#eee", padding: 10}}>
                    {
                       winner &&
                        <Winner winner={winner} />
                    }
                    <FlatList
                        data={quiz}
                        keyExtractor={(obj, i) => obj.id}
                        renderItem={({item}) => {
                            const { id, title, classroom, createdAt, results } = item;
                            return <QuizItem id={id} results={results} full={true} title={title} createdAt={createdAt} classroom={classroom} {...this.props}/>
                        }} 
                    />
                </Content>
            </Container>
        )
    }
}


const mapDispatchToProps = {
    dispatchSignOut: () => signOut(),
}

const mapStateToProps = state => ({
    auth: state.auth,
    user: state.user,
    navigation: state.navigation,
})

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
