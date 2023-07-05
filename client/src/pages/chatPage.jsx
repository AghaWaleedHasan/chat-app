import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/store";
import Chatbox from "../components/chatbox";
import axios from "axios";
import io from "socket.io-client";
import { FiSearch } from "react-icons/fi";
import { GoPencil } from "react-icons/go";
import { BsFillPersonFill } from "react-icons/bs";
import moment from "moment";

let socket;

const ChatPage = () => {
  const navigate = useNavigate();

  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [selectedChat, setSelectedChat] = React.useState(null);
  const [notifications, setNotifications] = React.useState({});
  const [searchBarVisible, setSearchBarVisible] = React.useState(false);
  const [searchChatsQuery, setSearchChatsQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [newChat, setNewChat] = React.useState(null);
  const searchRef = React.useRef(null);

  const [chats, setChats] = React.useState(null);

  React.useEffect(() => {
    console.log("search q: ", searchChatsQuery);
    let results;
    try {
      (async () => {
        results = await axios.get(
          `http://localhost:3000/users?search=${searchChatsQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      })().then(() => setSearchResults(results.data.data));
    } catch (error) {}
  }, [searchChatsQuery]);

  React.useEffect(() => {
    if (token === "") {
      navigate("/");
    }
  }, [token]);

  React.useEffect(() => {
    socket = io("http://localhost:3000");
    socket.emit("connected", user);

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
  }, []);

  React.useEffect(() => {
    socket.on("message received", (newMessageData) => {
      console.log(
        "newmsg chat: ",
        newMessageData.chat._id,
        "selected chat: ",
        selectedChat._id
      );
      if (newMessageData.chat._id !== selectedChat?._id) {
        const notifKey = newMessageData.chat._id;
        let notifObject = {};
        notifObject[notifKey] = newMessageData;
        setNotifications({ ...notifications, ...notifObject });
      }
    });
  });

  const closeOpenSearch = (e) => {
    if (
      searchRef.current &&
      searchBarVisible &&
      !searchRef.current.contains(e.target)
    ) {
      setSearchBarVisible(false);
      setSearchChatsQuery("");
      setSearchResults([]);
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", closeOpenSearch);
  });

  const handleInputChange = (event) => {
    setSearchChatsQuery(event.target.value);
  };

  React.useEffect(() => {
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
  }, [selectedChat]);

  // React.useEffect(() => {
  //   try {
  //     if (notifications[selectedChat?._id]) {
  //       const newNotificationState = delete notifications[selectedChat._id];
  //       setNotifications(newNotificationState);
  //     }
  //   } catch (error) {}
  // });

  // React.useEffect(() => {
  //   console.log("notifications: ", notifications);
  // });

  const handleChatClick = async (user) => {
    for (var chat of chats) {
      if (
        chat["users"][0].email === user.email ||
        chat["users"][1].email === user.email
      ) {
        setSelectedChat(chat);
        setSearchBarVisible(false);
        setSearchChatsQuery("");
        setSearchResults([]);
        return;
      }
    }

    try {
      await axios
        .post(
          "http://localhost:3000/chat",
          { userId: user._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((data) => {
          console.log("data: ", data.data);
          let allChats;
          (async () => {
            allChats = await axios.get("http://localhost:3000/chat/chats", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          })().then(() => {
            setChats(allChats.data.data);
            setNewChat(user);
          });
        });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  React.useEffect(() => {
    if (newChat) {
      for (var chat of chats) {
        if (
          chat["users"][0].email === user.email ||
          chat["users"][1].email === user.email
        ) {
          setSelectedChat(chat);
          setSearchBarVisible(false);
          setSearchChatsQuery("");
          setSearchResults([]);
        }
      }
    }
    setNewChat(null);
  }, [chats]);

  React.useEffect(() => {
    // console.log(
    //   "here: ",
    //   chats?.sort((a, b) => new Date(b["updatedAt"]) - new Date(a["updatedAt"]))
    // );
    setChats(
      chats?.sort((a, b) => new Date(b["updatedAt"]) - new Date(a["updatedAt"]))
    );
  }, [chats]);

  const handleChatLatestMessageDate = (latestMessage) => {
    let givenDay = moment(new Date(latestMessage?.updatedAt)).format(
      "YYYY-MM-DD"
    );
    const today = moment(new Date());

    let difference = today.diff(givenDay, "days");

    if (difference === 0) {
      return moment(latestMessage?.updatedAt).format("h:mm");
    } else if (difference === 1) {
      return "Yesterday";
    } else {
      return moment(latestMessage?.updatedAt).format("YYYY-MM-DD");
    }
  };

  return (
    <div className=" w-screen grid grid-cols-3 h-screen max-h-screen">
      {/* <button onClick={() => setToken("")}>Logout</button> */}

      {/* 1st column, span 1 col */}
      <div className=" bg-white">
        {/* 1st col, 1st row: MESSAGES */}
        <div className=" flex items-center justify-between h-24 px-6 border-r border-b">
          {searchBarVisible ? (
            <div className=" relative flex flex-grow mr-4" ref={searchRef}>
              <input
                // ref={searchRef}
                onChange={handleInputChange}
                type="text"
                className=" focus:outline-0 w-full"
                placeholder="Search Users"
              ></input>
              <div
                className={
                  (searchResults?.length > 0 ? " border-b rounded-b-lg" : "") +
                  " absolute mt-8 w-full border-x"
                }
              >
                {searchResults?.length > 0
                  ? searchResults.map((user, index) => (
                      <div
                        className={
                          (index === searchResults.length - 1
                            ? " rounded-b-lg"
                            : "") +
                          " bg-white cursor-pointer p-4 hover:bg-gray-300"
                        }
                        onClick={() => handleChatClick(user)}
                      >
                        {user?.email}
                      </div>
                    ))
                  : null}
              </div>
            </div>
          ) : (
            <span className=" text-blue-500 font-bold text-2xl">Messages</span>
          )}
          <div className=" flex space-x-4">
            {/* <GoPencil
              color="gray"
              size={42}
              className=" bg-gray-100 rounded-full p-[calc(11px)] cursor-pointer"
            /> */}
            <FiSearch
              color="gray"
              size={42}
              className=" bg-gray-100 rounded-full p-[calc(11px)] cursor-pointer"
              onClick={() => setSearchBarVisible(!searchBarVisible)}
            />
          </div>
        </div>

        {/* 1st col, 2nd row: CHAT LIST */}
        <div className=" bg-white h-full max-h-[calc(100vh-6rem)] flex flex-col justify-between">
          <div>
            {chats
              ? chats.map((chat) => (
                  <li
                    key={chat._id}
                    className={
                      (selectedChat?._id !== chat._id && notifications[chat._id]
                        ? "font-bold"
                        : "") +
                      (selectedChat?._id === chat._id ? " bg-gray-100" : "") +
                      " cursor-pointer px-6 py-2 flex h-20 items-center space-x-4 justify-between"
                    }
                    onClick={() => {
                      setSelectedChat(chat);
                      if (notifications[selectedChat?._id]) {
                        const newNotificationState =
                          delete notifications[selectedChat._id];
                        setNotifications(newNotificationState);
                      }
                    }}
                  >
                    <div className=" flex space-x-4 items-center">
                      <BsFillPersonFill
                        size={46}
                        className=" border rounded-full p-3 bg-gray-200"
                      />
                      <div className=" flex flex-col w-1/2">
                        {chat.users.map((userAccount) =>
                          userAccount._id != user.id ? (
                            <div>{userAccount.name}</div>
                          ) : null
                        )}
                        <div className=" truncate w-72 text-gray-400 text-sm">
                          {notifications[chat._id]
                            ? notifications[chat._id].text
                            : chat.latestMessage?.text}
                        </div>
                      </div>
                    </div>
                    <div className=" flex items-center text-sm text-gray-600">
                      {chat?.latestMessage
                        ? handleChatLatestMessageDate(chat?.latestMessage)
                        : null}
                      {/* {moment(chat.latestMessage?.createdAt).format("h:mm")} */}
                    </div>
                  </li>
                ))
              : null}
          </div>
          <div
            onClick={() => setToken("")}
            className=" bg-red-400 w-full h-12 flex items-center justify-center text-white text-lg font-bold cursor-pointer"
          >
            Logout
          </div>
        </div>
      </div>

      {/* 2nd column, span 2 col */}
      <div className=" bg-white col-span-2">
        {/* 2nd col, 1st row: CHAT NAME */}
        <div className=" h-24 px-6 flex items-center border-b border-gray-100">
          {selectedChat ? (
            <div className=" flex space-x-4">
              <BsFillPersonFill
                size={42}
                className=" border rounded-full p-2 bg-gray-100"
              />
              <div className=" flex flex-col space-y-3 justify-center">
                {selectedChat.users.map((userAccount) =>
                  userAccount._id !== user.id ? (
                    <span>{userAccount.name}</span>
                  ) : null
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* 2nd col, 2nd row: CHAT BOX */}
        <div className="  bg-blue-50 h-full max-h-[calc(100vh-6rem)] overflow-auto">
          {selectedChat && socket ? (
            <Chatbox
              chat={selectedChat}
              socket={socket}
              chats={chats}
              setChats={setChats}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
