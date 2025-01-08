import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  username: string;
  message: string;
  time: string;
  isUserActivity: boolean;
}

const socket: Socket = io("http://localhost:3000", {
  transports: ["websocket"],
  reconnectionAttempts: 3,
});

const App: React.FC = () => {
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  useEffect(() => {
    const handleReceiveMessage = (data: Message) => {
      console.log("Received message: ", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  const joinGroup = (): void => {
    if (username.trim() === "") {
      alert("Please enter a username to join.");
      return;
    }
    setIsJoined(true);
    socket.emit("join_group", { username });
  };

  const sendMessage = (): void => {
    if (message.trim() === "") return;
    const messageData: Message = {
      username,
      message,
      time: new Date().toLocaleTimeString(),
      isUserActivity: false,
    };
    socket.emit("send_message", messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setMessage("");
  };

  return (
    <div style={styles.container}>
      {!isJoined ? (
        <div style={styles.joinContainer}>
          <h1 style={styles.title}>Join Group Chat</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <button onClick={joinGroup} style={styles.joinButton}>Join</button>
        </div>
      ) : (
        <div style={styles.chatContainer}>
          <h1 style={styles.title}>Group Chat</h1>
          <div style={styles.messageContainer}>
            {messages.map((msg, index) =>
              msg.isUserActivity == true ? (
                <div key={index} style={styles.userActivityMessage}>
                  {msg.username} {msg.message}
                </div>
              ) : (
                <div
                  key={index}
                  style={{
                    ...styles.chatBubble,
                    alignSelf:
                      msg.username === username ? "flex-end" : "flex-start",
                    backgroundColor:
                      msg.username === username ? "#007bff" : "#f1f1f1",
                    color: msg.username === username ? "#fff" : "#000",
                  }}
                >
                  <div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
                    <span style={styles.chatUsername}>{msg.username}</span>
                    <span style={styles.chatTime}>{formatTime(msg.time)}</span>
                  </div>
                  <p style={styles.chatMessage}>{msg.message}</p>
                </div>
              )
            )}
          </div>
          <div style={styles.inputContainer}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.button}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
  },
  joinContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    width: "70%",
  },
  title: {
    fontSize: "1.5rem",
    color: "#333",
    marginBottom: "20px",
  },
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
    maxWidth: "60%",
    padding: "0px 50px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  messageContainer: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  chatBubble: {
    padding: "10px 15px",
    borderRadius: "15px",
    maxWidth: "70%",
    minWidth: "10%",
    wordBreak: "break-word",
  },
  chatUsername: {
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  chatMessage: {
    fontSize: "1rem",
    margin: 0,
  },
  chatTime: {
    fontSize: "0.8rem",
    color: "white",
    textAlign: "right",
  },
  userActivityMessage: {
    alignSelf: "center",
    padding: "5px 10px",
    fontSize: "0.85rem",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    borderRadius: "10px",
    maxWidth: "50%",
    textAlign: "center",
  },
  inputContainer: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "20px",
    marginRight: "10px",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "20px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  joinButton: {
    padding: "10px 20px",
    marginTop: "10px",
    border: "none",
    borderRadius: "20px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default App;
