// import React, { useEffect, useState, useRef } from "react";
// import { FaSearch } from "react-icons/fa";
// import { jwtDecode } from "jwt-decode";
// import io from "socket.io-client";
// import userImage from "../../assets/images/user.png";
// import chatIcon from "../../assets/images/chat-icon.png";
// import NoChatWithSomeone from "../../assets/images/NoChatWithSomeone.png";
// import api from "../../api/api";

// const SOCKET_ENDPOINT = "https://b-hms.onrender.com";

// const ChatPage = () => {
//   const [selectedChatUser, setSelectedChatUser] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [userList, setUserList] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [selectedChat, setSelectedChat] = useState(null);
//   const messagesEndRef = useRef(null);
//   const socketRef = useRef(null);

//   const token = localStorage.getItem("token");
//   let role, loggedInUserId;

//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       role = decoded.role;
//       loggedInUserId = decoded.id;
//     } catch (error) {
//       console.error("Error decoding token:", error);
//       window.location.href = "/hms/auth";
//     }
//   } else {
//     window.location.href = "/hms/auth";
//   }

//   useEffect(() => {
//     socketRef.current = io(SOCKET_ENDPOINT);
//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const endpoint = role === "doctor" ? "/users/patients" : "/users/doctors";
//       try {
//         const response = await api.get(endpoint, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUserList(response.data);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     if (role && token) fetchUsers();
//   }, [role, token]);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const response = await api.get(`/chats/${selectedChat}/messages`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMessages(response.data.messages || []);
//         scrollToBottom();
//       } catch (error) {
//         console.error("Error fetching messages:", error);
//         setMessages([]);
//       }
//     };

//     if (selectedChat && socketRef.current) {
//       fetchMessages();
//       socketRef.current.emit("joinChat", { chatId: selectedChat });
//     }
//   }, [selectedChat, token]);

//   useEffect(() => {
//     if (!socketRef.current) return;

//     const handleNewMessage = (message) => {
//       setMessages((prevMessages) => [...prevMessages, message]);
//       scrollToBottom();
//     };

//     socketRef.current.on("newMessage", handleNewMessage);

//     return () => {
//       socketRef.current.off("newMessage", handleNewMessage);
//     };
//   }, []);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const startChat = async (user) => {
//     try {
//       const response = await api.post("/chats/start", {
//         doctorId: user._id,
//         sender: loggedInUserId,
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setSelectedChat(response.data.chatId);
//       setSelectedChatUser(user);
//       setMessages([]);
//     } catch (error) {
//       console.error("Error starting chat:", error.response?.data || error.message);
//     }
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedChat) return;

//     try {
//       const response = await api.post(`/chats/${selectedChat}/message`, {
//         content: newMessage,
//       }, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Message is broadcast by server, no need to push manually
//       setNewMessage("");
//       scrollToBottom();
//     } catch (error) {
//       console.error("Error sending message:", error.response?.data || error.message);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   const filteredUserList = userList.filter(user =>
//     `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="flex h-full p-2 bg-[#ffffff] rounded-xl">
//       {/* Sidebar */}
//       <div className="w-1/5 bg-white p-4 rounded-s-xl">
//         <h2 className="text-xl font-semibold">Chat</h2>
//         <div className="relative mt-2">
//           <input
//             type="text"
//             placeholder={`Search ${role === "doctor" ? "Patient" : "Doctor"}`}
//             className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <FaSearch className="absolute top-2 right-4 text-gray-500" />
//         </div>

//         <div className="space-y-2 h-[640px] custom-scroll overflow-y-auto">
//           {filteredUserList.length > 0 ? filteredUserList.map((user) => (
//             <div
//               key={user._id}
//               onClick={() => startChat(user)}
//               className={`flex items-center p-2 cursor-pointer ${selectedChatUser?._id === user._id ? "bg-blue-100" : ""}`}
//             >
//               <img
//                 src={`https://46tb8kl9-8000.inc1.devtunnels.ms/${user.profileImage || userImage}`}
//                 alt="avatar"
//                 className="w-12 h-12 rounded-full mr-4"
//               />
//               <div>
//                 <p className="font-semibold">{user.firstName} {user.lastName}</p>
//                 <p className="text-gray-500">{user.email}</p>
//               </div>
//             </div>
//           )) : (
//             <div className="flex flex-col items-center justify-center text-gray-500 py-4 h-full">
//               <img src={chatIcon} alt="icon" className="h-24 w-24" />
//               <p className="py-4">No users found</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Chat Window */}
//       <div className="w-4/5 bg-gray-50 flex flex-col">
//         {selectedChatUser ? (
//           <>
//             <div className="flex items-center p-4 bg-white">
//               <img src={`https://46tb8kl9-8000.inc1.devtunnels.ms/${selectedChatUser.profileImage || userImage}`} alt="avatar" className="w-12 h-12 rounded-full mr-4" />
//               <div>
//                 <h3 className="font-semibold">{selectedChatUser.firstName} {selectedChatUser.lastName}</h3>
//                 <p className="text-gray-500">Last seen at 9:00 PM</p>
//               </div>
//             </div>

//             <div className="flex-1 space-y-2 custom-scroll overflow-y-auto bg-gray-50 p-4 rounded-xl shadow-inner">
//               {Array.isArray(messages) && messages.map((message, index) => (
//                 <div key={index} className={`flex ${message.sender._id === loggedInUserId ? "justify-end" : "justify-start"}`}>
//                   <div className={`p-2 rounded-xl ${message.sender._id === loggedInUserId ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}>
//                     <p className="font-bold">{message.sender.firstName} {message.sender.lastName}</p>
//                     <p>{message.content}</p>
//                     <span className="text-xs text-gray-500 block mt-1">{new Date(message.createdAt).toLocaleString()}</span>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef}></div>
//             </div>

//             <div className="flex items-center space-x-2 px-2">
//               <input
//                 type="text"
//                 placeholder="Type your message..."
//                 className="w-full px-4 py-4 rounded-xl bg-gray-100 focus:outline-none"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//               />
//               <button onClick={sendMessage} className="bg-customBlue text-white px-6 font-semibold py-4 rounded-xl">
//                 Send
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <img src={NoChatWithSomeone} alt="No chat" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatPage;
