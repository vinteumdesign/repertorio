"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowUp, BookOpen, Check, ChevronRight, Clock3,
  Copy, Edit3, Home, ListMusic, Menu, Mic2, MoreHorizontal, Music2,
  Pause, Play, Plus, Search, Settings, Trash2, X
} from "lucide-react";

type Song = {
  id: number;
  title: string;
  artist: string;
  duration: number;
  key?: string;
  bpm?: number;
  lyrics?: string;
  notes?: string;
};

type Setlist = {
  id: number;
  name: string;
  project: string;
  songIds: number[];
  updatedAt: string;
};

type View = "home" | "songs" | "setlist" | "show";

const initialSongs: Song[] = [
  { id: 1, title: "Vou Deixar", artist: "Skank", duration: 220, key: "G", bpm: 104, lyrics: "[Intro]\nG  D  Em  C\n\n[Verso]\nVou deixar a vida me levar...", notes: "Abrir com guitarra limpa." },
  { id: 2, title: "Quando o Sol Se For", artist: "Detonautas", duration: 205, key: "D", bpm: 96, lyrics: "[Verso]\nQuando o sol se for..." },
  { id: 3, title: "Não Sei Viver Sem Ter Você", artist: "CPM 22", duration: 235, key: "E", bpm: 155, lyrics: "[Intro]\nE  B  C#m  A" },
  { id: 4, title: "Será", artist: "Legião Urbana", duration: 160, key: "A", bpm: 132 },
  { id: 5, title: "Só Por Uma Noite", artist: "Charlie Brown Jr.", duration: 205, key: "Em", bpm: 93 },
  { id: 6, title: "Natasha", artist: "Capital Inicial", duration: 195, key: "A", bpm: 128 },
  { id: 7, title: "Meu Erro", artist: "Os Paralamas do Sucesso", duration: 198, key: "C", bpm: 148 },
  { id: 8, title: "Mulher de Fases", artist: "Raimundos", duration: 212, key: "D", bpm: 158 }
];

const initialSetlists: Setlist[] = [
  { id: 1, name: "Responsa — Show Completo", project: "Banda Responsa", songIds: [1,2,3,4,5,6,7,8], updatedAt: "Hoje" },
  { id: 2, name: "Responsa — Set Acústico", project: "Banda Responsa", songIds: [1,2,4,7], updatedAt: "Ontem" },
  { id: 3, name: "Cletão Voz e Violão", project: "Cletão", songIds: [4,1,7], updatedAt: "3 dias atrás" }
];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m.toString().padStart(2, "0")}min`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function Page() {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [setlists, setSetlists] = useState<Setlist[]>(initialSetlists);
  const [view, setView] = useState<View>("home");
  const [activeSetlistId, setActiveSetlistId] = useState(1);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"song" | "setlist" | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showIndex, setShowIndex] = useState(0);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("21-setlist-demo");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.songs && data.setlists) {
          setSongs(data.songs);
          setSetlists(data.setlists);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("21-setlist-demo", JSON.stringify({ songs, setlists }));
  }, [songs, setlists]);

  const activeSetlist = setlists.find(s => s.id === activeSetlistId) ?? setlists[0];
  const activeSongs = activeSetlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[];
  const activeDuration = activeSongs.reduce((sum, song) => sum + song.duration, 0);

  const filteredSongs = useMemo(() => songs.filter(song =>
    `${song.title} ${song.artist}`.toLowerCase().includes(query.toLowerCase())
  ), [songs, query]);

  const openSetlist = (id: number) => {
    setActiveSetlistId(id);
    setView("setlist");
  };

  const moveSong = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= activeSetlist.songIds.length) return;
    const reordered = [...activeSetlist.songIds];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSaved(false);
    setSetlists(current => current.map(item => item.id === activeSetlist.id ? { ...item, songIds: reordered, updatedAt: "Agora" } : item));
    window.setTimeout(() => setSaved(true), 500);
  };

  const removeFromSetlist = (songId: number) => {
    setSetlists(current => current.map(item => item.id === activeSetlist.id
      ? { ...item, songIds: item.songIds.filter(id => id !== songId), updatedAt: "Agora" }
      : item));
  };

  const addSongToSetlist = (songId: number) => {
    if (activeSetlist.songIds.includes(songId)) return;
    setSetlists(current => current.map(item => item.id === activeSetlist.id
      ? { ...item, songIds: [...item.songIds, songId], updatedAt: "Agora" }
      : item));
  };

  const navItems = [
    { label: "Início", icon: Home, action: () => setView("home"), active: view === "home" },
    { label: "Repertórios", icon: ListMusic, action: () => setView("home"), active: view === "setlist" },
    { label: "Músicas", icon: Music2, action: () => setView("songs"), active: view === "songs" },
    { label: "Configurações", icon: Settings, action: () => {}, active: false }
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">21</div><div><strong>SETLIST</strong><span>para músicos</span></div></div>
        <nav>{navItems.map(item => <button key={item.label} className={item.active ? "active" : ""} onClick={item.action}><item.icon size={19}/>{item.label}</button>)}</nav>
        <div className="user-card"><div className="avatar">CS</div><div><strong>Cleto Stopa</strong><span>Banda Responsa</span></div><MoreHorizontal size={18}/></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark">21</div><strong>SETLIST</strong></div>
          <div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar músicas ou repertórios..."/></div>
          <button className="icon-button"><Menu size={20}/></button>
        </header>

        {view === "home" && <HomeView setlists={setlists} songs={songs} openSetlist={openSetlist} onNew={() => setModal("setlist")}/>} 
        {view === "songs" && <SongsView songs={filteredSongs} onNew={() => {setEditingSong(null); setModal("song")}} onEdit={song => {setEditingSong(song); setModal("song")}} onDelete={id => setSongs(s => s.filter(song => song.id !== id))}/>} 
        {view === "setlist" && <SetlistView setlist={activeSetlist} songs={activeSongs} duration={activeDuration} saved={saved} allSongs={songs} moveSong={moveSong} removeSong={removeFromSetlist} addSong={addSongToSetlist} onShow={() => {setShowIndex(0); setView("show")}} onBack={() => setView("home")}/>} 
        {view === "show" && <ShowView songs={activeSongs} index={showIndex} setIndex={setShowIndex} onExit={() => setView("setlist")}/>} 
      </section>

      <div className="mobile-nav">
        {navItems.slice(0,3).map(item => <button key={item.label} className={item.active ? "active" : ""} onClick={item.action}><item.icon size={20}/><span>{item.label}</span></button>)}
        <button onClick={() => setModal(view === "songs" ? "song" : "setlist")}><Plus size={22}/><span>Criar</span></button>
      </div>

      {modal === "song" && <SongModal song={editingSong} onClose={() => setModal(null)} onSave={song => {
        if (editingSong) setSongs(current => current.map(item => item.id === song.id ? song : item));
        else setSongs(current => [...current, {...song, id: Date.now()}]);
        setModal(null);
      }}/>} 
      {modal === "setlist" && <SetlistModal onClose={() => setModal(null)} onSave={(name, project) => {
        const id = Date.now();
        setSetlists(current => [{ id, name, project, songIds: [], updatedAt: "Agora" }, ...current]);
        setActiveSetlistId(id); setModal(null); setView("setlist");
      }}/>} 
    </main>
  );
}

function HomeView({ setlists, songs, openSetlist, onNew }: { setlists:Setlist[]; songs:Song[]; openSetlist:(id:number)=>void; onNew:()=>void }) {
  return <div className="page">
    <div className="hero-row"><div><span className="eyebrow">PAINEL PRINCIPAL</span><h1>Boa noite, Cleto.</h1><p>Seus repertórios estão organizados e prontos para o próximo show.</p></div><button className="primary" onClick={onNew}><Plus size={18}/> Criar repertório</button></div>
    <div className="stats-grid"><Stat label="Repertórios" value={setlists.length.toString()} icon={ListMusic}/><Stat label="Músicas salvas" value={songs.length.toString()} icon={Music2}/><Stat label="Próximo show" value="13 JUN" icon={Mic2}/></div>
    <section><div className="section-title"><div><h2>Seus repertórios</h2><p>Continue de onde parou.</p></div><button className="text-button">Ver todos <ChevronRight size={16}/></button></div>
      <div className="cards-grid">{setlists.map((setlist, index) => {
        const duration = setlist.songIds.reduce((sum,id) => sum + (songs.find(s=>s.id===id)?.duration ?? 0),0);
        return <button className="setlist-card" key={setlist.id} onClick={() => openSetlist(setlist.id)}><div className={`cover cover-${index%3}`}><ListMusic size={34}/><span>{setlist.songIds.length} músicas</span></div><div className="card-body"><span className="card-project">{setlist.project}</span><h3>{setlist.name}</h3><div className="card-meta"><span><Clock3 size={15}/>{formatTime(duration)}</span><span>Editado {setlist.updatedAt.toLowerCase()}</span></div></div></button>
      })}</div>
    </section>
  </div>
}

function Stat({label,value,icon:Icon}:{label:string;value:string;icon:any}) { return <div className="stat"><div className="stat-icon"><Icon size={21}/></div><div><strong>{value}</strong><span>{label}</span></div></div> }

function SongsView({songs,onNew,onEdit,onDelete}:{songs:Song[];onNew:()=>void;onEdit:(s:Song)=>void;onDelete:(id:number)=>void}) {
  return <div className="page"><div className="hero-row"><div><span className="eyebrow">BIBLIOTECA</span><h1>Suas músicas</h1><p>Cadastre uma vez e use em quantos repertórios quiser.</p></div><button className="primary" onClick={onNew}><Plus size={18}/> Nova música</button></div>
    <div className="table-card"><div className="table-head"><span>Música</span><span>Tom</span><span>BPM</span><span>Duração</span><span></span></div>{songs.map(song => <div className="table-row" key={song.id}><div className="song-title"><div className="mini-cover"><Music2 size={17}/></div><div><strong>{song.title}</strong><span>{song.artist}</span></div></div><span>{song.key || "—"}</span><span>{song.bpm || "—"}</span><span>{formatTime(song.duration)}</span><div className="row-actions"><button onClick={()=>onEdit(song)}><Edit3 size={17}/></button><button onClick={()=>onDelete(song.id)}><Trash2 size={17}/></button></div></div>)}</div>
  </div>
}

function SetlistView({setlist,songs,duration,saved,allSongs,moveSong,removeSong,addSong,onShow,onBack}:{setlist:Setlist;songs:Song[];duration:number;saved:boolean;allSongs:Song[];moveSong:(i:number,d:-1|1)=>void;removeSong:(id:number)=>void;addSong:(id:number)=>void;onShow:()=>void;onBack:()=>void}) {
  const [picker,setPicker]=useState(false);
  return <div className="page"><button className="back" onClick={onBack}><ArrowLeft size={17}/> Repertórios</button><div className="setlist-header"><div><span className="eyebrow">{setlist.project.toUpperCase()}</span><h1>{setlist.name}</h1><div className="setlist-meta"><span>{songs.length} músicas</span><span>•</span><span>{formatTime(duration)}</span><span className="save-state"><Check size={15}/>{saved ? "Alterações salvas" : "Salvando..."}</span></div></div><div className="header-actions"><button className="secondary" onClick={()=>setPicker(!picker)}><Plus size={17}/> Adicionar música</button><button className="primary" onClick={onShow}><Play size={17}/> Modo show</button></div></div>
    {picker && <div className="picker"><div><strong>Adicionar da biblioteca</strong><button onClick={()=>setPicker(false)}><X size={18}/></button></div>{allSongs.filter(s=>!setlist.songIds.includes(s.id)).map(song=><button key={song.id} onClick={()=>addSong(song.id)}><span><strong>{song.title}</strong><small>{song.artist}</small></span><Plus size={17}/></button>)}</div>}
    <div className="setlist-table"><div className="setlist-row setlist-row-head"><span>#</span><span>Música</span><span>Tom</span><span>Duração</span><span>Ordem</span><span></span></div>{songs.map((song,index)=><div className="setlist-row" key={song.id}><span className="position">{String(index+1).padStart(2,"0")}</span><div className="song-title"><div className="mini-cover"><Music2 size={17}/></div><div><strong>{song.title}</strong><span>{song.artist}</span></div></div><span>{song.key || "—"}</span><span>{formatTime(song.duration)}</span><div className="order-buttons"><button disabled={index===0} onClick={()=>moveSong(index,-1)}><ArrowUp size={16}/></button><button disabled={index===songs.length-1} onClick={()=>moveSong(index,1)}><ArrowDown size={16}/></button></div><button className="danger-icon" onClick={()=>removeSong(song.id)}><X size={17}/></button></div>)}</div>
  </div>
}

function ShowView({songs,index,setIndex,onExit}:{songs:Song[];index:number;setIndex:(n:number)=>void;onExit:()=>void}) {
  const current=songs[index]; const next=songs[index+1];
  if(!current) return <div className="show-mode"><button className="show-exit" onClick={onExit}><X/></button><h1>Este repertório ainda está vazio.</h1></div>;
  return <div className="show-mode"><div className="show-top"><button className="show-exit" onClick={onExit}><X size={22}/></button><div><span>{index+1} de {songs.length}</span><strong>Modo show</strong></div><div className="live-dot"><i/> AO VIVO</div></div><div className="show-content"><div className="show-song"><span>TOCANDO AGORA</span><h1>{current.title}</h1><h2>{current.artist}</h2><div className="show-chips"><b>Tom {current.key||"—"}</b><b>{current.bpm||"—"} BPM</b><b>{formatTime(current.duration)}</b></div><pre>{current.lyrics || "Letra ainda não cadastrada para esta música."}</pre></div><aside className="next-card"><span>PRÓXIMA</span><strong>{next?.title || "Fim do repertório"}</strong><small>{next?.artist || ""}</small>{current.notes && <div className="note"><BookOpen size={16}/><p>{current.notes}</p></div>}</aside></div><div className="show-controls"><button disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}><ArrowLeft/> Anterior</button><button className="play-center"><Pause/></button><button disabled={index===songs.length-1} onClick={()=>setIndex(Math.min(songs.length-1,index+1))}>Próxima <ChevronRight/></button></div></div>
}

function SongModal({song,onClose,onSave}:{song:Song|null;onClose:()=>void;onSave:(s:Song)=>void}) {
  const [form,setForm]=useState<Song>(song || {id:0,title:"",artist:"",duration:180,key:"",bpm:100,lyrics:"",notes:""});
  return <div className="modal-backdrop"><form className="modal" onSubmit={e=>{e.preventDefault();onSave(form)}}><div className="modal-head"><div><span className="eyebrow">BIBLIOTECA</span><h2>{song?"Editar música":"Nova música"}</h2></div><button type="button" onClick={onClose}><X/></button></div><div className="form-grid"><label className="wide">Nome da música<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label className="wide">Artista<input required value={form.artist} onChange={e=>setForm({...form,artist:e.target.value})}/></label><label>Duração em segundos<input type="number" value={form.duration} onChange={e=>setForm({...form,duration:Number(e.target.value)})}/></label><label>Tom<input value={form.key} onChange={e=>setForm({...form,key:e.target.value})}/></label><label>BPM<input type="number" value={form.bpm} onChange={e=>setForm({...form,bpm:Number(e.target.value)})}/></label><label className="wide">Letra e cifra<textarea rows={9} value={form.lyrics} onChange={e=>setForm({...form,lyrics:e.target.value})} placeholder="[Intro]\nG  D  Em  C..."/></label><label className="wide">Observações<textarea rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Salvar música</button></div></form></div>
}

function SetlistModal({onClose,onSave}:{onClose:()=>void;onSave:(name:string,project:string)=>void}) {
  const [name,setName]=useState(""); const [project,setProject]=useState("Banda Responsa");
  return <div className="modal-backdrop"><form className="modal small" onSubmit={e=>{e.preventDefault();onSave(name,project)}}><div className="modal-head"><div><span className="eyebrow">NOVO</span><h2>Criar repertório</h2></div><button type="button" onClick={onClose}><X/></button></div><div className="form-grid"><label className="wide">Nome do repertório<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Show Sapopemba — 13/06"/></label><label className="wide">Projeto ou banda<input required value={project} onChange={e=>setProject(e.target.value)}/></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Criar repertório</button></div></form></div>
}
