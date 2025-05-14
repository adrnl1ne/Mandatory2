# GraphQL API with Subscriptions - Documentation

## Overview

This project implements a GraphQL API server with real-time subscription support. It demonstrates a simple blog system with users, posts, and comments, featuring a complete GraphQL API including queries, mutations, and real-time subscriptions.

---

## Project Structure

- **server.js** – Main server implementation with Apollo Server and subscription setup  
- **schema.graphql** – GraphQL schema definition  
- **subscription-test.html** – Client-side test page for GraphQL subscriptions  
- **package.json** – Project dependencies  

---

## Setup Instructions

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone or download the repository
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the server:
    ```bash
    npm start
    ```
    Or for development with auto-restart:
    ```bash
    npm run dev
    ```
4. Access the GraphQL playground at [http://localhost:4000/graphql](http://localhost:4000/graphql)  
5. Access the subscription test page at [http://localhost:4000](http://localhost:4000)

---

## Data Model

The API manages three main types:

- **Users**: People who create posts and comments
- **Posts**: Blog posts written by users
- **Comments**: Comments on posts written by users

_All data is stored in-memory and is reset when the server restarts._

---

## GraphQL Schema

### Types

#### User

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]
}
```

#### Post

```graphql
type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  comments: [Comment!]
}
```

#### Comment

```graphql
type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}
```

### Query

```graphql
type Query {
  users: [User!]!
  user(id: ID!): User
  posts: [Post!]!
  post(id: ID!): Post
  comments: [Comment!]!
}
```

### Mutation

```graphql
type Mutation {
  createUser(name: String!, email: String!): User!
  updateUser(id: ID!, name: String, email: String): User
  deleteUser(id: ID!): User

  createPost(title: String!, content: String!, published: Boolean!, authorId: ID!): Post!
  updatePost(id: ID!, title: String, content: String, published: Boolean): Post
  deletePost(id: ID!): Post

  createComment(text: String!, authorId: ID!, postId: ID!): Comment!
  updateComment(id: ID!, text: String): Comment
  deleteComment(id: ID!): Comment
}
```

### Subscription

```graphql
type Subscription {
  userCreated: User
  postCreated: Post
  commentCreated: Comment
}
```

---

## Using the API

### Example Queries

#### Get all users

```graphql
query {
  users {
     id
     name
     email
     posts {
        id
        title
     }
  }
}
```

#### Get a specific post with comments

```graphql
query {
  post(id: "1") {
     title
     content
     author {
        name
     }
     comments {
        text
        author {
          name
        }
     }
  }
}
```

### Example Mutations

#### Create a new user

```graphql
mutation {
  createUser(
     name: "Alice Johnson"
     email: "alice@example.com"
  ) {
     id
     name
     email
  }
}
```

#### Create a new post

```graphql
mutation {
  createPost(
     title: "My New Post"
     content: "This is the content of my post"
     published: true
     authorId: "1"
  ) {
     id
     title
     content
  }
}
```

#### Create a comment

```graphql
mutation {
  createComment(
     text: "Great post!"
     authorId: "2"
     postId: "1"
  ) {
     id
     text
     author {
        name
     }
  }
}
```

---

## Testing Subscriptions

The project includes a subscription test HTML page accessible at the server root ([http://localhost:4000](http://localhost:4000)).

### Using the Test Page

1. Open [http://localhost:4000](http://localhost:4000) in your browser.
2. The page automatically connects to the GraphQL WebSocket endpoint.
3. It subscribes to the `userCreated` subscription.
4. Fill in the name and email fields in the form.
5. Click "Create User" to trigger a subscription event.
6. Observe the real-time notification in the log section.

### Subscribing Programmatically

Example using `subscriptions-transport-ws`:

```javascript
const wsClient = new SubscriptionsTransportWs.SubscriptionClient(
  'ws://localhost:4000/graphql',
  { reconnect: true }
);

const subscription = wsClient.request({
  query: `subscription { userCreated { id name email } }`
});

subscription.subscribe({
  next(data) {
     console.log('Received data:', data);
  },
  error(err) {
     console.error('Subscription error:', err);
  },
  complete() {
     console.log('Subscription completed');
  }
});
```

---

## Technical Implementation Details

- The server uses the GraphQL PubSub system to implement subscriptions:
  - `USER_CREATED` event for new user creation
  - `POST_CREATED` event for new post creation
  - `COMMENT_CREATED` event for new comment creation
- The server uses `subscriptions-transport-ws` to handle WebSocket connections for GraphQL subscriptions.
- The server uses JavaScript arrays as an in-memory database to store:
  - Users
  - Posts
  - Comments

---

## Dependencies

- `apollo-server-express`: GraphQL server integrated with Express
- `express`: Web server framework
- `graphql`: GraphQL implementation for JavaScript
- `@graphql-tools/schema`: Tools for building GraphQL schemas
- `subscriptions-transport-ws`: WebSocket transport for GraphQL subscriptions
- `graphql-subscriptions`: PubSub implementation for GraphQL

---

## Development Notes

This project demonstrates a complete GraphQL API with subscriptions but uses an in-memory database that resets on server restart. For production use, consider:

- Implementing pagination for queries with potentially large results
- Adding error handling and logging
- Implementing authentication and authorization
- Adding a persistent database
