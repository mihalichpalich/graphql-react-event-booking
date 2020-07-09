const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    //events: [Event!]! возвращает массив не null из объектов не null
    //input - объект, объединяющий несколько типов
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
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!            
        }
    
        type RootQuery {
            events: [Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
                date: new Date(args.eventInput.date)
            });
            return event.save().then(res => {
                console.log(res);
                return {...res._doc}
            }).catch(err => {
                console.log(err);
                throw err;
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

