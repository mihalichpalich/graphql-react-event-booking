const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');

const app = express();

const events = [];

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
        events: () => { //имя resolve должно совпадать с именем типа
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, //"+" переводит строку в число
                date: args.eventInput.date
            };
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

app.listen(process.env.PORT || 3000, function (err) {
    if (err) {
        return console.log(err)
    }
    console.log('Server run');
});