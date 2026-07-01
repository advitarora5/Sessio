"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, Plus, Users, ChevronLeft, ChevronRight, Check, X, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, format, parseISO
} from "date-fns";

export type CalendarEvent = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  visibility?: string;
  location?: string;
  is_busy_mask?: boolean;
  is_pending_invite?: boolean;
  rsvp_id?: string;
  inviter_username?: string;
};

type CalendarClientProps = {
  initialEvents: CalendarEvent[];
  userId: string;
  friends?: { id: string; username: string; full_name: string }[];
  groups?: { id: string; name: string }[];
  spots?: { id: number; name: string; building: string }[];
  pendingInvites?: any[];
};

export function CalendarClient({ 
  initialEvents, 
  userId,
  friends = [],
  groups = [],
  spots = [],
  pendingInvites = []
}: CalendarClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [invites, setInvites] = useState(pendingInvites);
  
  // Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");
  
  // Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualDate, setManualDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [manualTime, setManualTime] = useState(format(new Date(Date.now() + 3600000), "HH:00"));
  const [manualDuration, setManualDuration] = useState("90");
  const [manualVisibility, setManualVisibility] = useState("public");
  
  const [locationQuery, setLocationQuery] = useState("");
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  
  const [inviteQuery, setInviteQuery] = useState("");
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);
  const supabase = createClient();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle outside click for comboboxes
  const locationRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (view === "week" && scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      // Total height 1536px, 64px per hour. Scroll to 1 hour before current time.
      const scrollPos = Math.max(0, (currentHour - 1) * 64);
      scrollContainerRef.current.scrollTop = scrollPos;
    }
  }, [view, currentDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) setShowLocationOptions(false);
      if (inviteRef.current && !inviteRef.current.contains(event.target as Node)) setShowInviteOptions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/schedule/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId,
          title: manualTitle,
          location: locationQuery,
          duration: parseInt(manualDuration, 10),
          visibility: manualVisibility,
          invites: selectedFriends.join(","),
          groupIds: selectedGroups,
          startTime: new Date(`${manualDate}T${manualTime}`).toISOString()
        })
      });
      const data = await res.json();
      
      if (data.event) {
        setEvents(prev => [...prev, data.event].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
        setManualTitle("");
        setLocationQuery("");
        setSelectedFriends([]);
        setSelectedGroups([]);
        setInviteQuery("");
        showToast("Event scheduled and invites sent!");
      } else {
        showToast(data.error || "Could not schedule event.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to create event.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRSVP = async (rsvpId: string, status: "accepted" | "declined") => {
    try {
      const res = await fetch("/api/schedule/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpId, status })
      });
      if (res.ok) {
        // Remove from pending
        const acceptedInvite = invites.find(i => i.id === rsvpId);
        setInvites(prev => prev.filter(i => i.id !== rsvpId));
        
        // If accepted, add to our local events state so it shows up immediately
        if (status === "accepted" && acceptedInvite && acceptedInvite.calendar_events) {
          setEvents(prev => [...prev, acceptedInvite.calendar_events]);
          showToast("Invite accepted!");
        } else if (status === "declined") {
          showToast("Invite declined.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update RSVP.", "error");
    }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from("calendar_events").delete().eq("id", Number(eventId));
      if (error) throw error;
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      showToast("Event deleted.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete event. You can only delete events you created.", "error");
    }
  };

  // Merge regular events with pending invites for the grid
  const pendingGridEvents = invites.map(invite => ({
    ...invite.calendar_events,
    is_pending_invite: true,
    rsvp_id: invite.id,
    inviter_username: invite.calendar_events.profiles?.username
  }));
  const allGridEvents = [...events, ...pendingGridEvents];

  // Views Logic
  const handleNext = () => {
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handlePrev = () => {
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const monthStartDate = startOfWeek(monthStart);
  const monthEndDate = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: monthStartDate, end: monthEndDate });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filters
  const filteredSpots = spots.filter(s => s.name.toLowerCase().includes(locationQuery.toLowerCase()));
  const filteredFriends = friends.filter(f => (f.full_name || f.username).toLowerCase().includes(inviteQuery.toLowerCase()));
  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(inviteQuery.toLowerCase()));

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_350px] relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-[100] text-sm font-medium text-white flex items-center gap-2 transition-all animate-in fade-in slide-in-from-bottom-4 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="grid gap-6">
        
        {/* Inbox Section (Optional fallback list view) */}
        {invites.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-amber-600">
              <CalendarIcon className="h-5 w-5" /> Pending Invites ({invites.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Your pending invites are also mapped out on the grid as dashed blocks. You can click them there to accept, or use the list below.
            </p>
            <div className="grid gap-3">
              {invites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50">
                  <div>
                    <div className="font-medium text-amber-900">{invite.calendar_events.title}</div>
                    <div className="text-sm text-amber-700/80 mt-0.5">
                      Invited by @{invite.calendar_events.profiles?.username} • {format(new Date(invite.calendar_events.start_time), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 border-amber-300 text-amber-700 hover:bg-amber-100" onClick={() => handleRSVP(invite.id, "declined")}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleRSVP(invite.id, "accepted")}>
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Header */}
        <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-borderSubtle shadow-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="h-5 w-5" /></Button>
            <Button variant="outline" size="sm" className="ml-2 font-medium" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <h2 className="text-lg font-semibold ml-4">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${view === "week" ? "bg-white shadow-sm text-[#0F223A]" : "text-muted-foreground hover:text-[#0F223A]"}`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${view === "month" ? "bg-white shadow-sm text-[#0F223A]" : "text-muted-foreground hover:text-[#0F223A]"}`}
              onClick={() => setView("month")}
            >
              Month
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="border border-borderSubtle rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
          {view === "week" ? (
            <>
              {/* Week Header */}
              <div className="flex border-b border-borderSubtle bg-slate-50/50 overflow-y-scroll [scrollbar-width:none]">
                <div className="w-16 shrink-0 border-r border-borderSubtle" /> 
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className={`flex-1 flex flex-col items-center justify-center py-2 border-r border-borderSubtle last:border-r-0 ${isSameDay(day, new Date()) ? "text-blue-600" : "text-[#0F223A]"}`}>
                    <span className="text-xs font-medium uppercase opacity-70">{format(day, "EEE")}</span>
                    <span className={`text-lg font-semibold ${isSameDay(day, new Date()) ? "bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center mt-1" : "mt-1"}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                ))}
              </div>
              {/* Week Body */}
              <div ref={scrollContainerRef} className="flex-1 overflow-y-scroll bg-white relative [scrollbar-width:none]">
                <div className="relative flex h-[1536px]">
                  {/* Time column */}
                  <div className="w-16 shrink-0 border-r border-borderSubtle bg-slate-50 flex flex-col pointer-events-none z-10">
                    {hours.map(hour => (
                      <div key={hour} className="h-16 shrink-0 text-right pr-2 text-xs text-muted-foreground relative border-b border-transparent">
                        <span className="absolute -top-2.5 right-2 font-medium">
                          {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Days columns container */}
                  <div className="flex-1 relative flex">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                      {hours.map(hour => (
                         <div key={hour} className="h-16 shrink-0 border-b border-slate-100 w-full" />
                      ))}
                    </div>
                    {/* Day columns */}
                    {weekDays.map((day) => {
                      const dayEvents = allGridEvents.filter(e => isSameDay(new Date(e.start_time), day));
                      return (
                        <div key={day.toISOString()} className="flex-1 border-r border-slate-100 last:border-r-0 relative h-full">
                          {dayEvents.map(event => {
                             const startDate = new Date(event.start_time);
                             const endDate = new Date(event.end_time);
                             const startHour = startDate.getHours() + startDate.getMinutes() / 60;
                             const endHour = endDate.getHours() + endDate.getMinutes() / 60;
                             const top = `${(startHour / 24) * 100}%`;
                             const height = `${Math.max(1.5, ((endHour - startHour) / 24) * 100)}%`; 
                             
                             const isPrivate = event.visibility === "private" || event.is_busy_mask;
                             
                             let blockColor = isPrivate 
                               ? "bg-slate-200 text-slate-500 border border-slate-300" 
                               : "bg-blue-600/10 text-blue-900 border border-blue-200 hover:bg-blue-600/20";
                             
                             if (event.is_pending_invite) {
                               blockColor = "bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#f59e0b11_8px,#f59e0b11_16px)] bg-amber-50 text-amber-900 border-2 border-dashed border-amber-300 hover:bg-amber-100";
                             }
                             
                             return (
                               <div 
                                 key={event.id + (event.rsvp_id || "")} 
                                 className={`absolute inset-x-1 rounded p-1.5 overflow-hidden text-xs transition flex flex-col shadow-sm ${blockColor} group ${event.is_pending_invite ? "cursor-pointer" : ""}`} 
                                 style={{ top, height }}
                                 onClick={() => {
                                   if (event.is_pending_invite && event.rsvp_id) {
                                     handleRSVP(event.rsvp_id, "accepted");
                                   }
                                 }}
                               >
                                 <div className="flex justify-between items-start">
                                   <div className="font-semibold truncate leading-tight">
                                     {isPrivate ? "Busy" : event.title}
                                     {event.is_pending_invite && " (?)"}
                                   </div>
                                   {!event.is_pending_invite && (
                                     <button 
                                       onClick={(e) => handleDeleteEvent(e, event.id)}
                                       className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition -mt-1 -mr-1"
                                       title="Delete Event"
                                     >
                                       <X className="h-3 w-3" />
                                     </button>
                                   )}
                                 </div>
                                 {!isPrivate && (
                                   <div className="mt-0.5 opacity-80 font-medium text-[10px]">
                                     {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                                   </div>
                                 )}
                                 {event.is_pending_invite && (
                                   <div className="mt-1 font-semibold text-amber-700 text-[10px]">Click to accept</div>
                                 )}
                                 {!isPrivate && event.location && !event.is_pending_invite && (
                                   <div className="truncate opacity-75 mt-auto text-[10px]">{event.location}</div>
                                 )}
                               </div>
                             )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Month Header */}
              <div className="grid grid-cols-7 border-b border-borderSubtle bg-slate-50/50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center py-2 text-xs font-semibold uppercase text-muted-foreground border-r last:border-r-0 border-borderSubtle">
                    {day}
                  </div>
                ))}
              </div>
              {/* Month Grid */}
              <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
                {monthDays.map((day, i) => {
                  const dayEvents = allGridEvents.filter(e => isSameDay(new Date(e.start_time), day));
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  return (
                    <div key={day.toISOString()} className={`border-r border-b border-slate-100 p-1 min-h-[100px] flex flex-col ${!isCurrentMonth ? "bg-slate-50 opacity-50" : "bg-white"}`}>
                      <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isSameDay(day, new Date()) ? "bg-blue-600 text-white" : "text-[#0F223A]"}`}>
                        {format(day, "d")}
                      </div>
                      <div className="flex-1 flex flex-col gap-1 overflow-y-auto [scrollbar-width:none]">
                        {dayEvents.map(event => {
                          const isPrivate = event.visibility === "private" || event.is_busy_mask;
                          return (
                            <div key={event.id + (event.rsvp_id || "")} className={`text-[10px] truncate px-1.5 py-0.5 rounded ${isPrivate ? "bg-slate-200 text-slate-500" : event.is_pending_invite ? "bg-amber-100 text-amber-800 border border-dashed border-amber-300 cursor-pointer hover:bg-amber-200" : "bg-blue-600/10 text-blue-800 font-medium"}`}
                              onClick={() => {
                                if (event.is_pending_invite && event.rsvp_id) {
                                  handleRSVP(event.rsvp_id, "accepted");
                                }
                              }}
                            >
                              {format(new Date(event.start_time), "h:mma").toLowerCase()} {isPrivate ? "Busy" : event.title} {event.is_pending_invite && "(?)"}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 self-start">
        <Card className="border-borderSubtle bg-white shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Manual Scheduling
            </h2>
            <form onSubmit={handleManualSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Topic / Class</label>
                <Input placeholder="e.g. CS 225 Study" value={manualTitle} onChange={e => setManualTitle(e.target.value)} required />
              </div>
              
              {/* Location Combobox */}
              <div className="grid gap-2 relative" ref={locationRef}>
                <label className="text-sm font-medium">Location</label>
                <Input 
                  placeholder="e.g. Grainger Library" 
                  value={locationQuery} 
                  onChange={e => {
                    setLocationQuery(e.target.value);
                    setShowLocationOptions(true);
                  }}
                  onFocus={() => setShowLocationOptions(true)}
                />
                {showLocationOptions && filteredSpots.length > 0 && (
                  <div className="absolute top-[68px] left-0 right-0 z-50 max-h-48 overflow-y-auto rounded-md border border-input bg-white shadow-lg p-1">
                    {filteredSpots.map(spot => (
                      <div 
                        key={spot.id} 
                        className="px-2 py-1.5 text-sm hover:bg-slate-100 cursor-pointer rounded flex items-center gap-2"
                        onClick={() => {
                          setLocationQuery(spot.name);
                          setShowLocationOptions(false);
                        }}
                      >
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{spot.name}</div>
                          <div className="text-[10px] text-muted-foreground">{spot.building}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" value={manualTime} onChange={e => setManualTime(e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Duration (Mins)</label>
                <Input type="number" value={manualDuration} onChange={e => setManualDuration(e.target.value)} required min="15" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Visibility</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-white text-[#0F223A] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={manualVisibility}
                  onChange={e => setManualVisibility(e.target.value)}
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private (Masked)</option>
                </select>
              </div>

              {/* Invites Combobox */}
              <div className="grid gap-2 relative" ref={inviteRef}>
                <label className="text-sm font-medium">Invite Friends & Groups</label>
                <Input 
                  placeholder="Type a name or group..." 
                  value={inviteQuery} 
                  onChange={e => {
                    setInviteQuery(e.target.value);
                    setShowInviteOptions(true);
                  }}
                  onFocus={() => setShowInviteOptions(true)}
                />
                
                {showInviteOptions && (inviteQuery.length > 0 || friends.length > 0 || groups.length > 0) && (
                  <div className="absolute top-[68px] left-0 right-0 z-50 max-h-48 overflow-y-auto rounded-md border border-input bg-white shadow-lg p-1">
                    {filteredGroups.length > 0 && <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 pt-1 pb-1">Groups</div>}
                    {filteredGroups.map(g => {
                      const isSelected = selectedGroups.includes(g.id);
                      return (
                        <div 
                          key={`g-${g.id}`} 
                          className="px-2 py-1.5 text-sm hover:bg-slate-100 cursor-pointer rounded flex items-center justify-between"
                          onClick={() => {
                            if (isSelected) setSelectedGroups(prev => prev.filter(id => id !== g.id));
                            else setSelectedGroups(prev => [...prev, g.id]);
                          }}
                        >
                          <span className="font-medium text-[#0F223A]">{g.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                        </div>
                      )
                    })}

                    {filteredFriends.length > 0 && <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 pt-2 pb-1 border-t mt-1">Friends</div>}
                    {filteredFriends.map(f => {
                      const isSelected = selectedFriends.includes(f.username);
                      return (
                        <div 
                          key={`f-${f.id}`} 
                          className="px-2 py-1.5 text-sm hover:bg-slate-100 cursor-pointer rounded flex items-center justify-between"
                          onClick={() => {
                            if (isSelected) setSelectedFriends(prev => prev.filter(u => u !== f.username));
                            else setSelectedFriends(prev => [...prev, f.username]);
                          }}
                        >
                          <span className="text-[#0F223A]">{f.full_name || f.username}</span>
                          {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                        </div>
                      )
                    })}
                    
                    {filteredFriends.length === 0 && filteredGroups.length === 0 && (
                      <div className="px-2 py-2 text-sm text-muted-foreground text-center">No matches found.</div>
                    )}
                  </div>
                )}
                
                {/* Selected Pills */}
                {(selectedFriends.length > 0 || selectedGroups.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedGroups.map(id => {
                      const g = groups.find(x => x.id === id);
                      return g ? (
                        <div key={`sel-g-${id}`} className="bg-slate-100 text-[#0F223A] text-xs px-2 py-1 rounded-full flex items-center gap-1 border">
                          {g.name}
                          <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedGroups(p => p.filter(x => x !== id))} />
                        </div>
                      ) : null;
                    })}
                    {selectedFriends.map(username => {
                      const f = friends.find(x => x.username === username);
                      return f ? (
                        <div key={`sel-f-${username}`} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-blue-200">
                          {f.full_name || f.username}
                          <X className="h-3 w-3 cursor-pointer hover:text-blue-900" onClick={() => setSelectedFriends(p => p.filter(x => x !== username))} />
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <Button disabled={isProcessing} className="w-full mt-2 bg-[#0F223A] text-white hover:bg-[#0F223A]/90 h-10">
                Create & Invite
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
