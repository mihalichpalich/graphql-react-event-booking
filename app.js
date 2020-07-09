const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    //events: [Event!]! возвращает массив не null из объектов не null
    //input - объект, объединяющий несколько типов, создается для мутаций
    //ID - специальный тип
    //типа Date не существует
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        
        type User {
            _id: ID!
            email: String!
            password: String
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!            
        }
        
        input UserInput {
            email: String!
            password: String!          
        }
    
        type RootQuery {
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
    
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => { //имя resolve ф-ии должно совпадать с именем типа и она всегда должна что-то возвращать
            return Event.find().then(events => {
                return events.map(event => {
                    return {...event._doc};
                })
            }).catch(err => {
                throw err
            });
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, //"+" переводит строку в число
                date: new Date(args.eventInput.date),
                creator: '5f0721d8351c4b37fca99f8e'
            });
            let createdEvent;

            return event
                .save()
                .then(res => {
                    createdEvent = {...res._doc};

                    return User.findById('5f0721d8351c4b37fca99f8e');
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found.')
                    }

                    user.createdEvents.push(event);
                    return user.save()
                })
                .then(result => {
                    return createdEvent
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        },
        createUser: args => {
            return User.findOne({email: args.userInput.email}).then(user => {
                if (user) {
                    throw new Error('User exists already.')
                }

                return bcrypt.hash(args.userInput.password, 12)
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });

                return user.save()
            })
            .then(res => {
                return {...res._doc, password: null}
            })
            .catch(err => {
                throw err
            });
        }
    },
    graphiql: true
}));

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.onpgf.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    app.listen(process.env.PORT || 3000, function (err) {
        if (err) {
            return console.log(err)
        }
        console.log('Server run');
    });
}).catch(err => {
    console.log(err);
});

