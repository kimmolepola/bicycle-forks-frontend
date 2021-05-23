import React from 'react';
import ReactDOM from 'react-dom';
import {
  ApolloProvider, ApolloClient, InMemoryCache,
} from '@apollo/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

const client = new ApolloClient({
  uri: process.env.REACT_APP_BACKEND,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          allFeatures: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
