const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const {buildSchema} = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    //events: [String!]! возвращает массив не null из строк не null
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }
        
        type RootMutation {
            createEvent(name: String): String
        }
    
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => { //имя resolve должно совпадать с именем типа
            return ['Romantic Cooking', 'Sailing', 'All-night Coding'];
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName; //вернет тип mutation и значение параметра args - "createEvent": "Sports"
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