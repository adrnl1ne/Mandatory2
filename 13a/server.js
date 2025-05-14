const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const express = require('express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { PubSub } = require('graphql-subscriptions');
const fs = require('fs');
const path = require('path');

// Create PubSub instance for publishing events
const pubsub = new PubSub();

// Event triggers
const USER_CREATED = 'USER_CREATED';
const POST_CREATED = 'POST_CREATED';
const COMMENT_CREATED = 'COMMENT_CREATED';

// Read schema from file
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);

// In-memory database
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
  },
];

let posts = [
  {
    id: '1',
    title: 'Introduction to GraphQL',
    content: 'GraphQL is a query language for your API',
    published: true,
    authorId: '1',
  },
  {
    id: '2',
    title: 'Getting Started with Apollo Server',
    content: 'Apollo Server is the best way to build a GraphQL API',
    published: true,
    authorId: '1',
  },
  {
    id: '3',
    title: 'My Thoughts on REST',
    content: 'REST is still relevant in many cases',
    published: false,
    authorId: '2',
  },
];

let comments = [
  {
    id: '1',
    text: 'Great article!',
    authorId: '2',
    postId: '1',
  },
  {
    id: '2',
    text: 'I learned a lot from this',
    authorId: '1',
    postId: '1',
  },
  {
    id: '3',
    text: 'Looking forward to more content',
    authorId: '2',
    postId: '2',
  },
];

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(user => user.id === id),
    posts: () => posts,
    post: (_, { id }) => posts.find(post => post.id === id),
    comments: () => comments,
  },
  
  User: {
    posts: (parent) => posts.filter(post => post.authorId === parent.id),
  },
  
  Post: {
    author: (parent) => users.find(user => user.id === parent.authorId),
    comments: (parent) => comments.filter(comment => comment.postId === parent.id),
  },
  
  Comment: {
    author: (parent) => users.find(user => user.id === parent.authorId),
    post: (parent) => posts.find(post => post.id === parent.postId),
  },
  
  Mutation: {
    createUser: (_, { name, email }) => {
      const id = String(users.length + 1);
      const user = { id, name, email };
      users.push(user);
      
      // Publish event for subscription
      pubsub.publish(USER_CREATED, { userCreated: user });
      
      return user;
    },
    
    updateUser: (_, { id, name, email }) => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const updatedUser = {
        ...users[userIndex],
        ...(name && { name }),
        ...(email && { email }),
      };
      
      users[userIndex] = updatedUser;
      return updatedUser;
    },
    
    deleteUser: (_, { id }) => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const [deletedUser] = users.splice(userIndex, 1);
      posts = posts.filter(post => post.authorId !== id);
      comments = comments.filter(comment => comment.authorId !== id);
      
      return deletedUser;
    },
    
    createPost: (_, { title, content, published, authorId }) => {
      const userExists = users.some(user => user.id === authorId);
      if (!userExists) {
        throw new Error('User not found');
      }
      
      const id = String(posts.length + 1);
      const post = { id, title, content, published, authorId };
      posts.push(post);
      
      // Publish event for subscription
      pubsub.publish(POST_CREATED, { postCreated: post });
      
      return post;
    },
    
    updatePost: (_, { id, title, content, published }) => {
      const postIndex = posts.findIndex(post => post.id === id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }
      
      const updatedPost = {
        ...posts[postIndex],
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published }),
      };
      
      posts[postIndex] = updatedPost;
      return updatedPost;
    },
    
    deletePost: (_, { id }) => {
      const postIndex = posts.findIndex(post => post.id === id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }
      
      const [deletedPost] = posts.splice(postIndex, 1);
      comments = comments.filter(comment => comment.postId !== id);
      
      return deletedPost;
    },
    
    createComment: (_, { text, authorId, postId }) => {
      const userExists = users.some(user => user.id === authorId);
      if (!userExists) {
        throw new Error('User not found');
      }
      
      const post = posts.find(post => post.id === postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      if (!post.published) {
        throw new Error('Cannot comment on unpublished post');
      }
      
      const id = String(comments.length + 1);
      const comment = { id, text, authorId, postId };
      comments.push(comment);
      
      // Publish event for subscription
      pubsub.publish(COMMENT_CREATED, { commentCreated: comment });
      
      return comment;
    },
    
    updateComment: (_, { id, text }) => {
      const commentIndex = comments.findIndex(comment => comment.id === id);
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }
      
      const updatedComment = {
        ...comments[commentIndex],
        ...(text !== undefined && { text }),
      };
      
      comments[commentIndex] = updatedComment;
      return updatedComment;
    },
    
    deleteComment: (_, { id }) => {
      const commentIndex = comments.findIndex(comment => comment.id === id);
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }
      
      const [deletedComment] = comments.splice(commentIndex, 1);
      return deletedComment;
    },
  },
  
  // Subscription resolvers
  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator([USER_CREATED])
    },
    postCreated: {
      subscribe: () => pubsub.asyncIterator(POST_CREATED)
    },
    commentCreated: {
      subscribe: () => pubsub.asyncIterator(COMMENT_CREATED)
    }
  },
};

// Set up Express
const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve the HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'subscription-test.html'));
});

// Update your startServer function (assuming you have one):
async function startServer() {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });
  
  const server = new ApolloServer({
    schema
  });
  
  await server.start();
  
  server.applyMiddleware({ app });
  
  const httpServer = createServer(app);
  
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute: (schema, document, rootValue, contextValue, variableValues, operationName) => {
        return execute({
          schema,
          document,
          rootValue,
          contextValue,
          variableValues,
          operationName
        });
      },
      subscribe: (schema, document, rootValue, contextValue, variableValues, operationName) => {
        return subscribe({
          schema,
          document,
          rootValue,
          contextValue,
          variableValues,
          operationName
        });
      },
      onConnect: () => {
        console.log('Client connected to WebSocket');
        return { pubsub };
      }
    },
    {
      server: httpServer,
      path: '/graphql'
    }
  );
  
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
    
    // Add clickable link to the test page
    console.log(`📱 Subscription Test Page: http://localhost:${PORT}/`);
  });
}

startServer().catch(err => console.error('Error starting server:', err));