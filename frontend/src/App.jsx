
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarDays, MapPin, Users, Plus, Trash2, Pencil, LayoutDashboard } from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/events";

function Dashboard() {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const res = await axios.get(API);
      setEvents(res.data);
    } catch {
      alert("Cannot connect to backend!");
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await axios.delete(`${API}/${id}`);
    loadEvents();
  };

  return (
    <main className="container">
      <div className="page-heading">
        <div><p className="eyebrow">OVERVIEW</p><h1>Event Dashboard</h1>
          <p className="muted">Manage your events in one place.</p></div>
        <Link className="primary-btn" to="/add"><Plus size={18}/> Add Event</Link>
      </div>
      <div className="stats">
        <div className="stat"><CalendarDays/><span>Total Events</span><h2>{events.length}</h2></div>
        <div className="stat"><Users/><span>Total Registrations</span><h2>{events.reduce((sum,e)=>sum+(e.registrations||0),0)}</h2></div>
      </div>
      <section className="panel">
        <h2>All Events</h2>
        <div className="table-wrap"><table>
          <thead><tr><th>Event ID</th><th>Event Name</th><th>Event Date</th><th>Venue</th><th>Registrations</th><th>Actions</th></tr></thead>
          <tbody>{events.map(e=><tr key={e._id}>
            <td className="id-cell">{e._id.slice(-6)}</td><td><strong>{e.eventName}</strong></td>
            <td>{e.eventDate}</td><td><MapPin size={14} className="inline-icon"/>{e.venue}</td>
            <td><span className="count">{e.registrations||0}</span></td>
            <td><div className="actions"><Link className="edit-btn" to={`/edit/${e._id}`}><Pencil size={15}/> Edit</Link>
              <button className="delete-btn" onClick={()=>remove(e._id)}><Trash2 size={15}/> Delete</button></div></td>
          </tr>)}</tbody>
        </table></div>
        {events.length===0&&<div className="empty"><CalendarDays size={35}/><h3>No events yet</h3><p>Create your first event to see it here.</p><Link className="primary-btn" to="/add">Add your first event</Link></div>}
      </section>
    </main>
  );
}

function EventForm() {
  const editId = window.location.pathname.split("/edit/")[1];
  const [form, setForm] = useState({eventName:"",description:"",eventDate:"",venue:""});
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    if(editId) axios.get(API).then(res=>{
      const event=res.data.find(e=>e._id===editId);
      if(event) setForm({eventName:event.eventName,description:event.description||"",eventDate:event.eventDate||"",venue:event.venue||""});
    });
  },[editId]);

  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async e=>{
    e.preventDefault(); setLoading(true);
    try {
      if(editId) await axios.put(`${API}/${editId}`,form);
      else await axios.post(API,form);
      window.location.href="/";
    } catch { alert("Could not save event. Check the backend."); setLoading(false); }
  };

  return <main className="container form-container">
    <p className="eyebrow">{editId?"EDIT EVENT":"NEW EVENT"}</p>
    <h1>{editId?"Update Event":"Create an Event"}</h1>
    <p className="muted">Fill in the details below.</p>
    <form className="panel event-form" onSubmit={submit}>
      <label>Event Name<input required name="eventName" value={form.eventName} onChange={change} placeholder="e.g. Tech Summit 2026"/></label>
      <label>Event Description<textarea name="description" value={form.description} onChange={change} placeholder="Tell us about the event"/></label>
      <div className="form-row">
        <label>Event Date<input required type="date" name="eventDate" value={form.eventDate} onChange={change}/></label>
        <label>Venue<input required name="venue" value={form.venue} onChange={change} placeholder="Event location"/></label>
      </div>
      <div className="form-actions"><Link className="cancel-btn" to="/">Cancel</Link><button className="primary-btn" disabled={loading}>{loading?"Saving...":editId?"Update Event":"Create Event"}</button></div>
    </form>
  </main>;
}

export default function App() {
  return <BrowserRouter><div className="app-shell">
    <nav className="navbar"><Link to="/" className="brand"><span className="brand-icon"><CalendarDays/></span> Event<span className="brand-light">Admin</span></Link>
      <div className="nav-links"><Link to="/"><LayoutDashboard size={17}/> Dashboard</Link><Link to="/add"><Plus size={17}/> Add Event</Link></div>
    </nav>
    <Routes><Route path="/" element={<Dashboard/>}/><Route path="/add" element={<EventForm/>}/><Route path="/edit/:id" element={<EventForm/>}/></Routes>
    <footer>EventAdmin · Event management made simple</footer>
  </div></BrowserRouter>;
}
