import { useState, useRef, useEffect } from 'react';
import { useCommunicationStore } from '@/stores/communicationStore';
import { useTeamStore } from '@/stores/teamStore';
import { useAuthStore } from '@/stores/authStore';
import { mockResponders } from '@/data/responders';
import { getInitials } from '@/lib/utils';
import { Send, Smile, Paperclip, Mic, Phone, Users, Search } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function CommunicationPage() {
  const messages = useCommunicationStore((s) => s.messages);
  const sendMessage = useCommunicationStore((s) => s.sendMessage);
  const teams = useTeamStore((s) => s.teams);
  const currentUser = useAuthStore((s) => s.currentUser);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const teamMessages = messages.filter((m) => m.teamId === selectedTeamId);
  const teamMembers = mockResponders.filter((r) => selectedTeam?.memberIds.includes(r.id));

  const filteredMembers = teamMembers.filter((m) => 
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.role.toLowerCase().includes(searchMember.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teamMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !currentUser || !selectedTeamId) return;
    sendMessage(
      inputText,
      currentUser.id,
      currentUser.name,
      currentUser.role,
      selectedTeamId
    );
    setInputText('');
  };

  const handleCall = () => {
    toast(`Initiating voice call with ${selectedTeam?.name}...`, 'info');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative bg-background overflow-hidden">
      {/* Left panel - Teams & Members */}
      <div className="w-[320px] bg-white border-r border-border flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border space-y-3">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Response Unit</label>
          <select 
            value={selectedTeamId} 
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Search unit members..."
              className="w-full pl-9 pr-4 py-2 bg-gray-55 border border-border rounded-lg text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-[10px] font-semibold text-text-secondary uppercase px-3 py-1.5">Unit Members ({filteredMembers.length})</p>
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                  {getInitials(member.name)}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${member.status === 'available' ? 'bg-success' : 'bg-warning'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                <p className="text-xs text-text-secondary truncate">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Chat Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 h-full">
        {/* Top header */}
        <div className="h-14 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text-primary">{selectedTeam?.name} Channel</h3>
              <p className="text-[10px] text-text-secondary">{teamMembers.length} operators active</p>
            </div>
          </div>
          <button 
            onClick={handleCall}
            className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/15 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> Voice Call
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {teamMessages.map((msg) => {
            const isOwn = msg.senderId === currentUser?.id || msg.isOwn;
            return (
              <div key={msg.id} className={`flex gap-3 max-w-[70%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
                {!isOwn && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                    {getInitials(msg.senderName)}
                  </div>
                )}
                <div>
                  <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                    <span className="text-xs font-medium text-text-primary">{msg.senderName}</span>
                    <span className="text-[10px] text-text-secondary capitalize">({msg.senderRole.replace('-', ' ')})</span>
                  </div>
                  <div className={`rounded-xl px-4 py-2.5 text-sm shadow-sm ${isOwn ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-text-primary rounded-tl-none'}`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input composer */}
        <div className="p-4 bg-white border-t border-border flex items-center gap-3 flex-shrink-0">
          <button className="p-2 hover:bg-gray-50 rounded-lg text-text-secondary transition-colors"><Paperclip className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-50 rounded-lg text-text-secondary transition-colors"><Smile className="w-5 h-5" /></button>
          
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Type a message to ${selectedTeam?.name}...`}
            className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <button className="p-2 hover:bg-gray-50 rounded-lg text-text-secondary transition-colors"><Mic className="w-5 h-5" /></button>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
