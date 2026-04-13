import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon, Trash2, Grid, List, Eye,
  Download, Heart, ZoomIn, X, ChevronLeft, Folder,
  Search, Video, Youtube, Star, Loader2, Camera
} from "lucide-react";
import { galleryAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";

const ManageGallery: React.FC = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [lightbox, setLightbox] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await galleryAPI.getAlbums();
      setAlbums(res.data);
    } catch {
      toast.error("Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlbums(); }, []);

  const openAlbum = async (album: any) => {
    setSelectedAlbum(album);
    setMediaLoading(true);
    try {
      const res = await galleryAPI.getMediaByAlbum(album.id);
      setMedia(res.data);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setMediaLoading(false);
    }
  };

  const deleteAlbum = async (id: number) => {
    if (!window.confirm("Delete this entire album and all its media?")) return;
    try {
      await galleryAPI.deleteAlbum(id);
      toast.success("Album deleted");
      fetchAlbums();
      if (selectedAlbum?.id === id) setSelectedAlbum(null);
    } catch { toast.error("Failed to delete album"); }
  };

  const deleteMedia = async (id: number) => {
    if (!window.confirm("Delete this media item?")) return;
    try {
      await galleryAPI.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      toast.success("Media deleted");
    } catch { toast.error("Failed to delete media"); }
  };

  const likeMedia = async (id: number) => {
    try {
      const res = await galleryAPI.likeMedia(id);
      setMedia(prev => prev.map(m => m.id === id ? { ...m, likes: res.data.likes } : m));
    } catch { toast.error("Failed to like"); }
  };

  const setAsCover = async (albumId: number, url: string) => {
    try {
      await galleryAPI.setAlbumCover(albumId, { coverImage: url });
      setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, coverImage: url } : a));
      toast.success("Cover image updated!");
    } catch { toast.error("Failed to set cover"); }
  };

  const getMediaIcon = (type: string) => {
    if (type === "Video") return <Video size={14} />;
    if (type === "YouTube") return <Youtube size={14} />;
    return <ImageIcon size={14} />;
  };

  const filteredAlbums = albums.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- ALBUM VIEW (main) ---
  if (!selectedAlbum) {
    return (
      <div className="main-content animate-fade-in">
        {/* Header */}
        <div className="page-header" style={{ marginBottom: "28px" }}>
          <div>
            <PageTitle title="Company Gallery" subtitle="Browse and manage all albums and media collections" />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "Total Albums", value: albums.length, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
            { label: "Public Albums", value: albums.filter(a => a.visibility === "Public").length, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
            { label: "Total Media", value: albums.reduce((acc, a) => acc + (a._count?.media || 0), 0), color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "Restricted", value: albums.filter(a => a.visibility === "Restricted").length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
          ].map(stat => (
            <div key={stat.label} className="glass-card animate-slide-in" style={{ padding: "20px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input className="form-control" style={{ paddingLeft: "38px" }}
              placeholder="Search albums..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "6px", background: "white", padding: "4px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            {(["grid", "list"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={{ padding: "7px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: viewMode === v ? "#6366f1" : "transparent", color: viewMode === v ? "white" : "#64748b" }}>
                {v === "grid" ? <Grid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <Loader2 size={48} className="animate-spin" style={{ margin: "0 auto", color: "#6366f1" }} />
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "80px", opacity: 0.6 }}>
            <Folder size={64} style={{ margin: "0 auto 16px", color: "#94a3b8" }} />
            <h3 style={{ margin: "0 0 8px" }}>No albums yet</h3>
            <p style={{ margin: 0, color: "#64748b" }}>Upload media from "Add Gallery Media" to create albums</p>
          </div>
        ) : viewMode === "grid" ? (
          /* CARD GRID */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {filteredAlbums.map(album => (
              <div key={album.id} className="glass-card animate-scale-up"
                style={{ padding: "0", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                {/* Cover */}
                <div style={{ height: "180px", position: "relative", overflow: "hidden" }}
                  onClick={() => openAlbum(album)}>
                  {album.coverImage ? (
                    <img src={album.coverImage} alt={album.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={48} color="rgba(255,255,255,0.6)" />
                    </div>
                  )}
                  {/* overlay */}
                  <div style={{ position: "absolute", inset: "0", background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: "12px", left: "12px", color: "white" }}>
                    <div style={{ fontSize: "11px", opacity: 0.8 }}>{album._count?.media || 0} items</div>
                  </div>
                  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", background: album.visibility === "Public" ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)", color: "white" }}>
                      {album.visibility}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "16px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "700" }}>{album.name}</h3>
                  {album.event && <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: "600", marginBottom: "4px" }}>ðŸ“… {album.event.eventName}</div>}
                  {album.description && <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.description}</p>}
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "12px" }}>
                    Updated {new Date(album.updatedAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => openAlbum(album)}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#6366f1", color: "white", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <Eye size={14} /> View Album
                    </button>
                    <button onClick={() => deleteAlbum(album.id)}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #fecaca", background: "white", color: "#ef4444", cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Album</th>
                  <th>Event</th>
                  <th>Media</th>
                  <th>Visibility</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlbums.map((album, i) => (
                  <tr key={album.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: "600" }}>{album.name}</td>
                    <td>{album.event?.eventName || "â€”"}</td>
                    <td>{album._count?.media || 0} items</td>
                    <td><span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", background: album.visibility === "Public" ? "#dcfce7" : "#fee2e2", color: album.visibility === "Public" ? "#16a34a" : "#dc2626" }}>{album.visibility}</span></td>
                    <td>{new Date(album.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btn-group">
                        <button className="action-btn action-btn-view" onClick={() => openAlbum(album)}><Eye size={14} /></button>
                        <button className="action-btn action-btn-delete" onClick={() => deleteAlbum(album.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // --- ALBUM DETAIL VIEW ---
  return (
    <div className="main-content animate-fade-in">
      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
            <X size={20} />
          </button>
          {lightbox.type === "Photo" && (
            <img src={lightbox.url} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px" }}
              onClick={e => e.stopPropagation()} />
          )}
          {lightbox.type === "YouTube" && (
            <iframe src={`https://www.youtube.com/embed/${lightbox.url.split("v=")[1]}`}
              style={{ width: "80vw", height: "60vh", border: "none", borderRadius: "8px" }}
              onClick={(e: any) => e.stopPropagation()} />
          )}
          <div style={{ position: "absolute", bottom: "20px", color: "white", textAlign: "center" }}>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={e => { e.stopPropagation(); likeMedia(lightbox.id); }}
                style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <Heart size={14} /> {lightbox.likes}
              </button>
              {lightbox.allowDownload && (
                <a href={lightbox.url} download onClick={e => e.stopPropagation()}
                  style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Download size={14} /> Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Album Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <button onClick={() => setSelectedAlbum(null)}
          style={{ padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "#64748b" }}>
          <ChevronLeft size={18} /> All Albums
        </button>
        <div>
          <h1 className="page-title" style={{ marginBottom: "2px" }}>{selectedAlbum.name}</h1>
          <p className="page-subtitle">{selectedAlbum.description || `${media.length} items Â· ${selectedAlbum.visibility}`}</p>
        </div>
      </div>

      {/* Media Grid */}
      {mediaLoading ? (
        <div style={{ textAlign: "center", padding: "80px" }}>
          <Loader2 size={48} className="animate-spin" style={{ margin: "0 auto", color: "#6366f1" }} />
        </div>
      ) : media.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "80px", opacity: 0.6 }}>
          <Camera size={64} style={{ margin: "0 auto 16px", color: "#94a3b8" }} />
          <h3>No media in this album yet</h3>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px", padding: "14px 20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", flexWrap: "wrap" }}>
            {[
              { label: "Photos", value: media.filter(m => m.type === "Photo").length, icon: <ImageIcon size={14} />, color: "#6366f1" },
              { label: "Videos", value: media.filter(m => m.type === "Video").length, icon: <Video size={14} />, color: "#8b5cf6" },
              { label: "YouTube", value: media.filter(m => m.type === "YouTube").length, icon: <Youtube size={14} />, color: "#ef4444" },
              { label: "Total Likes", value: media.reduce((s, m) => s + m.likes, 0), icon: <Heart size={14} />, color: "#f43f5e" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px", color: s.color }}>
                {s.icon} <strong>{s.value}</strong> <span style={{ color: "#64748b", fontSize: "13px" }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {media.map((item, i) => (
              <div key={item.id} className="animate-scale-up"
                style={{ borderRadius: "14px", overflow: "hidden", background: "white", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animationDelay: `${i * 0.03}s` }}>
                {/* Preview */}
                <div style={{ height: "160px", position: "relative", overflow: "hidden", cursor: "pointer", background: "#f1f5f9" }}
                  onClick={() => setLightbox(item)}>
                  {item.type === "Photo" ? (
                    <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : item.type === "YouTube" ? (
                    <div style={{ width: "100%", height: "100%", background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Youtube size={40} color="white" />
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Video size={40} color="white" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="media-overlay" style={{ position: "absolute", inset: "0", background: "rgba(0,0,0,0)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ZoomIn size={32} color="white" style={{ opacity: 0 }} />
                  </div>
                  {/* Type badge */}
                  <div style={{ position: "absolute", top: "8px", left: "8px", padding: "3px 8px", borderRadius: "10px", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    {getMediaIcon(item.type)} {item.type}
                  </div>
                </div>
                {/* Footer */}
                <div style={{ padding: "10px 12px" }}>
                  {item.tags && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {item.tags.split(",").filter(Boolean).map((tag: string) => (
                        <span key={tag} style={{ padding: "2px 6px", borderRadius: "8px", background: "#ede9fe", color: "#7c3aed", fontSize: "10px", fontWeight: "600" }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => likeMedia(item.id)}
                        style={{ padding: "4px 8px", borderRadius: "8px", border: "1px solid #fce7f3", background: "white", color: "#f43f5e", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Heart size={11} /> {item.likes}
                      </button>
                      <button onClick={() => setAsCover(selectedAlbum.id, item.url)}
                        style={{ padding: "4px", borderRadius: "8px", border: "1px solid #fef3c7", background: "white", color: "#d97706", cursor: "pointer" }} title="Set as cover">
                        <Star size={11} />
                      </button>
                      <button onClick={() => deleteMedia(item.id)}
                        style={{ padding: "4px", borderRadius: "8px", border: "1px solid #fee2e2", background: "white", color: "#ef4444", cursor: "pointer" }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageGallery;

