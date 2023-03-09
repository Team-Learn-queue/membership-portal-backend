const jwt = require("jsonwebtoken");

let io;
let test;
module.exports = {
  
  init: (server) => {
    io = require("socket.io")(server);
    io.use(function (socket, next) {
      if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(
          socket.handshake.query.token,
          process.env.JWT_KEY,
          function (err, decoded) {
            if (err) return next(new Error("Authentication error"));
            socket.user = decoded;
            test = socket.user;
            //   console.log('test', test)
            next();
          }
        );
      } else {
        next(new Error("Authentication error"));
      }
    }).on("connection", function (socket) {
      console.log(`Welcome ${socket.user.username}`);

      socket.on("disconnect", () => {
        console.log(`${socket.user.username} went off`);
      });
      socket.on("joinRoom", ( groupId ) => {
        socket.join(groupId);
        console.log(`${socket.user.username} join the ${groupId}`);
      });
      socket.on("leaveRoom", ( groupId ) => {
        socket.leave(groupId);
        console.log(`${socket.user.username} left the ${groupId}`);
      });
    });
  },

  socket: () => test,
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }

    return io;
  },
};
