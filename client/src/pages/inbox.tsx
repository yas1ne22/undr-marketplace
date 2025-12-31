import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MoreVertical, Phone, Search, Send, Video, AlertTriangle, CheckCheck, Clock, Paperclip, Smile } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { draftSellerReply } from "@/services/ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  sender: 'me' | 'them' | 'ai';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const MOCK_CHATS = [
  {
    id: "1",
    name: "Ahmed K.",
    avatarSeed: "Ahmed",
    lastMsg: "Is the price negotiable?",
    time: "10:42 AM",
    unread: 2,
    hasAiIntervention: true,
    messages: [
      { id: "1", sender: "them", text: "Hi, I saw your iPhone listing.", time: "10:30 AM", status: "read" },
      { id: "2", sender: "me", text: "Hello! Yes, it's still available.", time: "10:32 AM", status: "read" },
      { id: "3", sender: "them", text: "Great. Is there any warranty left?", time: "10:35 AM", status: "read" },
      { id: "4", sender: "ai", text: "Yes, it has AppleCare+ valid until Dec 2025.", time: "10:36 AM", status: "read" },
      { id: "5", sender: "them", text: "Perfect. Would you take 2800?", time: "10:40 AM", status: "read" },
      { id: "6", sender: "them", text: "I can come pick it up today.", time: "10:42 AM", status: "read" }
    ]
  },
  {
    id: "2",
    name: "Sarah J.",
    avatarSeed: "Sarah",
    lastMsg: "When can I see it?",
    time: "Yesterday",
    unread: 0,
    hasAiIntervention: false,
    messages: [
      { id: "1", sender: "them", text: "Is this still available?", time: "Yesterday", status: "read" },
      { id: "2", sender: "me", text: "Yes it is.", time: "Yesterday", status: "read" },
      { id: "3", sender: "them", text: "When can I see it?", time: "Yesterday", status: "read" }
    ]
  },
  {
    id: "3",
    name: "Tech Buyer Pro",
    avatarSeed: "Tech",
    lastMsg: "Offer accepted.",
    time: "Mon",
    unread: 0,
    hasAiIntervention: false,
    messages: []
  }
];

export default function Inbox() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>("1");
  const [reply, setReply] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chats, setChats] = useState(MOCK_CHATS);
  const [location] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);

  // Handle pre-filled message from query params (mock)
  useEffect(() => {
    if (location.includes("msg=")) {
        const msg = decodeURIComponent(location.split("msg=")[1]);
        setReply(msg);
        setSelectedChatId("1"); 
    }
  }, [location]);

  const handleAiDraft = async () => {
    if (!selectedChat) return;
    setIsAiTyping(true);
    // Use the last message from them as context
    const lastMsg = [...selectedChat.messages].reverse().find(m => m.sender === 'them')?.text || "";
    const draft = await draftSellerReply(lastMsg);
    setReply(draft);
    setIsAiTyping(false);
  };

  const handleSend = () => {
    if (!reply.trim() || !selectedChatId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChats(prev => prev.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          messages: [...c.messages, newMessage as any], // casting for mock simplicity
          lastMsg: reply,
          time: "Just now"
        };
      }
      return c;
    }));
    
    setReply("");
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] rounded-2xl border bg-card overflow-hidden flex shadow-2xl">
        {/* Chat List */}
        <div className={`w-full md:w-80 border-r bg-secondary/5 flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b space-y-4 bg-background/50 backdrop-blur-sm">
            <h2 className="font-display font-bold text-2xl tracking-tight">Messages</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-9 h-10 bg-secondary/50 border-transparent focus:bg-background focus:border-input transition-all rounded-xl" />
            </div>
          </div>
          <ScrollArea className="flex-1">
             <div className="flex flex-col gap-1 p-2">
                {chats.map((chat) => (
                   <button 
                     key={chat.id}
                     onClick={() => setSelectedChatId(chat.id)}
                     className={`text-left p-3 rounded-xl transition-all duration-200 flex gap-3 group relative overflow-hidden ${selectedChatId === chat.id ? "bg-background shadow-sm ring-1 ring-border" : "hover:bg-background/50"}`}
                   >
                     {/* Active Indicator Bar */}
                     {selectedChatId === chat.id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />}

                     <div className="relative">
                       <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                         <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.avatarSeed}`} />
                         <AvatarFallback>{chat.name.substring(0,2)}</AvatarFallback>
                       </Avatar>
                       {chat.hasAiIntervention && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow-sm z-10">
                            <Bot className="h-3 w-3 text-primary-foreground" />
                          </div>
                       )}
                     </div>
                     
                     <div className="overflow-hidden flex-1 py-0.5">
                       <div className="flex justify-between items-baseline mb-0.5">
                         <span className={`font-semibold text-sm ${chat.unread > 0 ? "text-foreground" : "text-foreground/80"}`}>{chat.name}</span>
                         <span className="text-[10px] text-muted-foreground font-medium">{chat.time}</span>
                       </div>
                       <p className={`text-xs truncate leading-relaxed ${chat.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                         {chat.hasAiIntervention ? <span className="text-primary font-medium">AI Agent: </span> : null}
                         {chat.lastMsg}
                       </p>
                     </div>
                     {chat.unread > 0 && (
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-sm shadow-primary/20">
                         {chat.unread}
                       </div>
                     )}
                   </button>
                ))}
             </div>
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div className={`flex-1 flex flex-col bg-background relative ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
           {selectedChat ? (
             <>
               {/* Chat Header */}
               <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-md z-10">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setSelectedChatId(null)}>
                      <CheckCheck className="h-5 w-5 rotate-180" /> {/* Back Icon placeholder */}
                    </Button>
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.avatarSeed}`} />
                      <AvatarFallback>{selectedChat.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        {selectedChat.name}
                        {selectedChat.hasAiIntervention && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[9px] gap-1 font-normal border-primary/20 bg-primary/5 text-primary">
                            <Bot className="h-3 w-3" /> Agent Active
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online now
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex"><Phone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex"><Video className="h-4 w-4" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
               </div>
               
               {/* Messages */}
               <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
                 {selectedChat.hasAiIntervention && (
                    <div className="p-3 mx-auto max-w-md rounded-xl bg-orange-50/80 backdrop-blur-sm border border-orange-100 flex items-start gap-3 shadow-sm">
                       <div className="p-2 bg-white rounded-full border shadow-sm shrink-0">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-xs text-orange-900 uppercase tracking-wide mb-0.5">Intervention Needed</h4>
                          <p className="text-xs text-orange-800 leading-relaxed">
                             Buyer offered <span className="font-bold">2800 QAR</span>. This is 10% below your minimum auto-accept price.
                          </p>
                       </div>
                       <Button size="sm" variant="outline" className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700 h-8 text-xs font-semibold shadow-sm">
                          Review
                       </Button>
                    </div>
                 )}

                 <div className="flex flex-col gap-1 text-xs text-center text-muted-foreground py-4">
                    <span>Today</span>
                 </div>

                 {selectedChat.messages.map((msg, idx) => (
                   <div key={msg.id} className={`flex w-full ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`
                            px-4 py-2.5 rounded-2xl shadow-sm text-sm relative group
                            ${msg.sender === 'me' 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : msg.sender === 'ai'
                                ? 'bg-background border border-primary/20 text-foreground rounded-tl-none ring-2 ring-primary/5'
                                : 'bg-white border text-foreground rounded-tl-none'
                            }
                          `}
                        >
                          {msg.sender === 'ai' && (
                             <div className="absolute -top-3 -left-2 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full border-2 border-background font-bold flex items-center gap-1 shadow-sm z-10">
                                <Bot className="h-2.5 w-2.5" /> AI Agent
                             </div>
                          )}
                          {msg.text}
                          
                          <span className={`text-[9px] block text-right mt-1 opacity-70 ${msg.sender === 'me' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {msg.time}
                            {msg.sender === 'me' && (
                               <CheckCheck className="h-3 w-3 inline ml-1 opacity-100" />
                            )}
                          </span>
                        </div>
                     </div>
                   </div>
                 ))}
                 
                 <div ref={messagesEndRef} />
               </div>

               {/* Input Area */}
               <div className="p-4 bg-background border-t space-y-3">
                 {/* AI Suggestion Chip */}
                 <div className="flex justify-start overflow-x-auto pb-2 gap-2 no-scrollbar">
                    <button 
                      onClick={handleAiDraft}
                      disabled={isAiTyping}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors shrink-0"
                    >
                      <Bot className={`h-3.5 w-3.5 text-primary ${isAiTyping ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-medium text-primary">
                        {isAiTyping ? "DeepSeek Drafting..." : "Draft AI Reply"}
                      </span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-transparent hover:bg-secondary transition-colors shrink-0">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Schedule Meetup</span>
                    </button>
                 </div>

                 <div className="flex gap-2 items-end bg-secondary/30 p-1.5 rounded-3xl border focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all">
                   <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground">
                     <Paperclip className="h-5 w-5" />
                   </Button>
                   <Input 
                     value={reply} 
                     onChange={(e) => setReply(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Type a message..." 
                     className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-10 py-2.5"
                   />
                   <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground">
                     <Smile className="h-5 w-5" />
                   </Button>
                   <Button 
                     onClick={handleSend}
                     disabled={!reply.trim()}
                     size="icon" 
                     className="rounded-full h-10 w-10 shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95"
                   >
                     <Send className="h-4 w-4 ml-0.5" />
                   </Button>
                 </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
               <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                 <Bot className="h-10 w-10 text-muted-foreground/50" />
               </div>
               <h3 className="text-xl font-display font-bold text-foreground">No chat selected</h3>
               <p className="max-w-xs text-sm">Select a conversation from the left to start messaging or let your AI Agent handle it.</p>
             </div>
           )}
        </div>
      </div>
    </Layout>
  );
}
