import React from "react";
import axios from "axios";
import { useAuthStore } from "../utils/store";
import { BsFillPersonFill } from "react-icons/bs";
import moment from "moment";

let chatMessages;

const Chatbox = (props) => {
  const { chat, socket, chats, setChats } = props;

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = React.useState([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  console.log("messages: ", messages);

  const refreshChats = () => {
    try {
      let allChats;
      (async () => {
        allChats = await axios.get("http://localhost:3000/chat/chats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })().then(() => {
        setChats(allChats.data.data);
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  React.useEffect(() => {
    socket.on("message received", (newMessageData) => {
      // console.log("message received: ", newMessageData);
      // console.log("messages 1:", messages);
      //   setMessages([...messages, newMessageData]);
      let tmpmsgs;
      if (messages.length > 0) {
        tmpmsgs = [...messages];
        if (messages[messages.length - 1]["messages"][-1] !== newMessageData) {
          if (
            messages[messages.length - 1]["_id"] !==
            moment(new Date()).format("YYYY-MM-DD")
          ) {
            tmpmsgs = [
              ...tmpmsgs,
              {
                _id: moment(new Date()).format("YYYY-MM-DD"),
                messages: [newMessageData],
              },
            ];
            setMessages(tmpmsgs);
          } else {
            tmpmsgs[tmpmsgs.length - 1]["messages"].push(newMessageData);
          }
          setMessages(tmpmsgs);
        }
      } else {
        tmpmsgs = [
          {
            _id: moment(new Date()).format("YYYY-MM-DD"),
            messages: [newMessageData],
          },
        ];
        setMessages(tmpmsgs);
      }
    });
    refreshChats();
    return () => {
      socket.off("message received");
    };
    console.log("messages 2: ", messages);
  });

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  React.useEffect(() => {
    (async () => {
      chatMessages = await axios.get(
        `http://localhost:3000/message/${chat?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    })().then(() => setMessages(chatMessages.data.data));
  }, [chat]);

  React.useEffect(() => {
    socket.emit("join room", chat?._id);
  }, []);

  const sendMessage = async () => {
    const newMessage = document.getElementById("new-message").value;
    const url = "http://localhost:3000/message/send";
    const data = {
      text: newMessage,
      chatId: chat._id,
    };
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const sendNewMessage = await axios
      .post(url, data, config)
      .then((newMessageData) => {
        console.log("new message data: ", newMessageData.data);
        socket.emit("new message", newMessageData?.data);
        // setMessages([...messages, newMessageData.data.data]);
        var tempMessages = [...messages];
        tempMessages.length > 0
          ? tempMessages[messages.length - 1]["_id"] ===
            moment(new Date()).format("YYYY-MM-DD")
            ? tempMessages[messages.length - 1]["messages"].push(
                newMessageData.data.data
              )
            : (tempMessages = [
                ...tempMessages,
                {
                  _id: moment(new Date()).format("YYYY-MM-DD"),
                  messages: [newMessageData.data.data],
                },
              ])
          : (tempMessages = [
              {
                _id: moment(new Date()).format("YYYY-MM-DD"),
                messages: [newMessageData.data.data],
              },
            ]);
        setMessages(tempMessages);
        refreshChats();
      });
  };

  const renderMessage = (message) => {
    if (message.sender._id === user.id) {
      return (
        <>
          <div className=" text-xs text-gray-400 w-fit flex-none">
            {moment(message.createdAt).format("h:mm")}
          </div>
          <span
            className={
              (message.sender._id === user.id ? " bg-blue-300" : " bg-white") +
              " rounded-lg px-4 py-2"
            }
          >
            {message?.text}
          </span>
        </>
      );
    } else {
      return (
        <>
          <span className=" bg-white rounded-lg px-4 py-2">
            {message?.text}
          </span>
          <span className=" text-xs text-gray-400 block">
            {moment(message.createdAt).format("h:mm")}
          </span>
        </>
      );
    }
  };

  const renderDate = (day) => {
    let givenDay = moment(new Date(day));
    const today = moment(new Date());

    let difference = today.diff(givenDay, "days");

    if (difference === 0) {
      return "Today";
    } else if (difference === 1) {
      return "Yesterday";
    } else {
      return day;
    }
  };

  const typingHandler = (e) => {};

  if (messages) {
    return (
      <div key="messages" className=" ">
        {messages.length > 0 ? (
          <div className=" min-h-[calc(100vh-6rem)]">
            {messages?.map((messagesOfThatDay, dayIndex) => (
              <div className=" ">
                <div className=" text-center text-gray-400 my-4">
                  {renderDate(messagesOfThatDay._id)}
                </div>
                {messagesOfThatDay["messages"]?.map((message, index) => (
                  <div
                    key={message._id}
                    className={
                      (message.sender._id === user.id
                        ? " justify-end"
                        : " justify-start") + " flex items-center p-2 px-6"
                    }
                    // ref={
                    //   dayIndex === messages.length - 1 &&
                    //   index === messagesOfThatDay["messages"].length - 1
                    //     ? messagesEndRef
                    //     : null
                    // }
                  >
                    <div
                      className={
                        (message.sender._id === user.id
                          ? " justify-end"
                          : " justify-start") +
                        " break-all w-3/4 flex space-x-2 items-center"
                      }
                    >
                      {renderMessage(message)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className=" min-h-[calc(100vh-6rem)]"></div>
        )}
        <div ref={messagesEndRef}></div>
        <div className=" flex justify-between space-x-2 sticky bottom-0 bg-white p-6 w-100">
          <input
            type="text"
            id="new-message"
            className=" w-full border border-gray-300 rounded-2xl px-4"
            placeholder="Type a message"
            onChange={typingHandler}
          />
          <button type="submit" onClick={() => sendMessage()}>
            Send Message
          </button>
        </div>
      </div>
    );
  } else {
    return <div key="no-messages"></div>;
  }
};

export default Chatbox;
