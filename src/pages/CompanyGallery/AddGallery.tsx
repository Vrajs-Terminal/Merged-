import React, { useState, useEffect, useRef } from "react";
import {
  Upload, Plus, Image as ImageIcon, Video, Link, X, Save,
  FolderPlus, Tag, Loader2, CheckCircle
} from "lucide-react";
import { galleryAPI, eventAPI, branchAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Gallery.css";

const AddGallery: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState({
    albumSource: "existing",  // existing | new
    eventId: "",
    newAlbumName: "",
    branches: [] as string[],
    departments: [] as string[],
    youtubeUrl: "",
    description: "",
    tags: [] as string[],
    visibility: "Public",
    files: [] as { name: string; url: string; type: "Photo" | "Video" | "YouTube" }[],
    allowDownload: true,
  });

  useEffect(() => {
    (async () => {
      const [evRes, brRes, deptRes, albumRes] = await Promise.all([
        eventAPI.getAll().catch(() => ({ data: [] })),
        branchAPI.getAll().catch(() => ({ data: [] })),
        departmentAPI.getAll().catch(() => ({ data: [] })),
        galleryAPI.getAlbums().catch(() => ({ data: [] }))
      ]);

      setEvents(Array.isArray(evRes?.data) ? evRes.data : Array.isArray(evRes?.data?.data) ? evRes.data.data : []);
      setBranches(Array.isArray(brRes?.data) ? brRes.data : Array.isArray(brRes?.data?.data) ? brRes.data.data : []);
      setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : Array.isArray(deptRes?.data?.data) ? deptRes.data.data : []);

      const albums = Array.isArray(albumRes?.data) ? albumRes.data : Array.isArray(albumRes?.data?.data) ? albumRes.data.data : [];
      const collectedTags = await Promise.all(
        albums.map(async (album: any) => {
          const mediaRes = await galleryAPI.getMediaByAlbum(album.id).catch(() => ({ data: [] }));
          const mediaItems = Array.isArray(mediaRes?.data) ? mediaRes.data : Array.isArray(mediaRes?.data?.data) ? mediaRes.data.data : [];
          return mediaItems.flatMap((media: any) => String(media.tags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean));
        })
      );

      const liveTags = Array.from(new Set(collectedTags.flat())).filter(Boolean);
      setTagOptions(liveTags.length > 0 ? liveTags : ["Event", "Festival", "Training", "Team", "Celebration", "Achievement", "CSR"]);
    })();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const items = Array.from(e.dataTransfer.files).map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: (f.type.startsWith("video") ? "Video" : "Photo") as "Photo" | "Video" | "YouTube",
    }));
    setForm(prev => ({ ...prev, files: [...prev.files, ...items] }));
    toast.info(`${items.length} file(s) added for upload`);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const items = Array.from(e.target.files).map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: (f.type.startsWith("video") ? "Video" : "Photo") as "Photo" | "Video" | "YouTube",
    }));
    setForm(prev => ({ ...prev, files: [...prev.files, ...items] }));
  };

  const removeFile = (i: number) => {
    setForm(prev => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }));
  };

  const toggleBranch = (val: string) => {
    setForm(prev => ({
      ...prev,
      branches: prev.branches.includes(val)
        ? prev.branches.filter(b => b !== val)
        : [...prev.branches, val]
    }));
  };

  const toggleDept = (val: string) => {
    setForm(prev => ({
      ...prev,
      departments: prev.departments.includes(val)
        ? prev.departments.filter(d => d !== val)
        : [...prev.departments, val]
    }));
  };

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSave = async (addMore = false) => {
    if (form.albumSource === "existing" && !form.eventId) {
      toast.error("Please select an event / album");
      return;
    }
    if (form.albumSource === "new" && !form.newAlbumName.trim()) {
      toast.error("Please enter a new album name");
      return;
    }
    if (form.files.length === 0 && !form.youtubeUrl) {
      toast.error("Please upload at least one media file or add a YouTube URL");
      return;
    }
    setSaving(true);
    try {
      // Step 1: find or create album
      let albumId: number;
      if (form.albumSource === "new") {
        const albumData = {
          name: form.newAlbumName,
          description: form.description,
          branches: form.branches,
          departments: form.departments,
          visibility: form.visibility,
        };
        const alRes = await galleryAPI.createAlbum(albumData);
        albumId = alRes.data.id;
      } else {
        // Find album for this event or create one
        const allAlbums = await galleryAPI.getAlbums();
        const existing = allAlbums.data.find((a: any) => a.eventId === parseInt(form.eventId));
        if (existing) {
          albumId = existing.id;
        } else {
          const evt = events.find(e => e.id === parseInt(form.eventId));
          const res = await galleryAPI.createAlbum({
            name: evt?.eventName || "Event Album",
            eventId: parseInt(form.eventId),
            visibility: form.visibility,
            branches: form.branches,
            departments: form.departments,
          });
          albumId = res.data.id;
        }
      }

      // Step 2: bulk add media
      const mediaList = form.files.map(f => ({
        url: f.url,
        type: f.type,
        tags: form.tags.join(","),
        description: form.description,
        allowDownload: form.allowDownload,
      }));
      if (form.youtubeUrl) {
        mediaList.push({
          url: form.youtubeUrl,
          type: "YouTube" as any,
          tags: form.tags.join(","),
          description: form.description,
          allowDownload: false,
        });
      }
      if (mediaList.length > 0) {
        await galleryAPI.addBulkMedia({ albumId, mediaList });
      }

      setSaved(true);
      toast.success("Gallery saved successfully!");
      setTimeout(() => setSaved(false), 2500);

      if (addMore) {
        setForm(prev => ({ ...prev, files: [], youtubeUrl: "", description: "" }));
      }
    } catch (err: any) {
      toast.error("Failed to save: " + (err?.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content animate-fade-in gallery-shell">
      <div className="gallery-page-header">
        <div>
          <h1 className="gallery-page-title"><ImageIcon size={24} /> Add Gallery Media</h1>
          <p className="gallery-page-subtitle">Upload photos, videos and memories to company albums</p>
        </div>
      </div>

      <div className="gallery-layout-grid">
        <div className="gallery-left-stack">

          <div className="gallery-panel">
            <h3 className="gallery-panel-title">
              <FolderPlus size={18} /> Album / Event
            </h3>
            <div className="gallery-segment">
              {["existing", "new"].map(s => (
                <button key={s}
                  onClick={() => setForm(prev => ({ ...prev, albumSource: s }))}
                  className={`gallery-segment-btn ${form.albumSource === s ? "active" : ""}`}>
                  {s === "existing" ? "🔗 Existing Event" : "✨ Create New Album"}
                </button>
              ))}
            </div>

            {form.albumSource === "existing" ? (
              <div className="gallery-field">
                <label className="gallery-label">Select Event *</label>
                <select className="gallery-control" value={form.eventId} onChange={e => setForm(prev => ({ ...prev, eventId: e.target.value }))}>
                  <option value="">-- Select Event --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.eventName} ({new Date(ev.startDate).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="gallery-field">
                <label className="gallery-label">New Album Name *</label>
                <input className="gallery-control" placeholder="e.g. Diwali Celebration 2025"
                  value={form.newAlbumName} onChange={e => setForm(prev => ({ ...prev, newAlbumName: e.target.value }))} />
              </div>
            )}
          </div>

          <div className="gallery-panel">
            <h3 className="gallery-panel-title">
              <Upload size={18} /> Media Upload
            </h3>

            <div ref={dropRef}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => document.getElementById("gallery-file-input")?.click()}
              style={{
                border: `2px dashed ${dragging ? "#6366f1" : "#cbd5e1"}`,
                borderRadius: "16px", padding: "48px 24px",
                textAlign: "center", cursor: "pointer",
                background: dragging ? "rgba(99,102,241,0.05)" : "#f8fafc",
                transition: "all 0.2s", marginBottom: "20px"
              }}>
              <Upload size={40} color={dragging ? "#6366f1" : "#94a3b8"} style={{ margin: "0 auto 12px" }} />
              <p style={{ margin: 0, fontWeight: "600", color: dragging ? "#6366f1" : "#475569" }}>
                {dragging ? "Drop to upload!" : "Drag & Drop photos / videos here"}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8" }}>or click to browse • Multiple files supported</p>
              <input id="gallery-file-input" type="file" multiple accept="image/*,video/*"
                style={{ display: "none" }} onChange={handleFileInput} />
            </div>

            {/* Preview Grid */}
            {form.files.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                {form.files.map((f, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", background: "#f1f5f9", aspectRatio: "1" }}>
                    {f.type === "Photo" ? (
                      <img src={f.url} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b" }}>
                        <Video size={28} color="white" />
                      </div>
                    )}
                    <button onClick={() => removeFile(i)} style={{
                      position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)",
                      border: "none", borderRadius: "50%", width: "22px", height: "22px",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                    }}>
                      <X size={12} color="white" />
                    </button>
                    <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", background: "rgba(0,0,0,0.5)", padding: "2px 4px", fontSize: "9px", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {f.name}
                    </div>
                  </div>
                ))}
                <div onClick={() => document.getElementById("gallery-file-input")?.click()}
                  style={{ borderRadius: "10px", border: "2px dashed #cbd5e1", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8fafc" }}>
                  <Plus size={24} color="#94a3b8" />
                </div>
              </div>
            )}

            <div className="gallery-field">
              <label className="gallery-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link size={14} /> YouTube URL (Optional)
              </label>
              <input className="gallery-control" placeholder="https://youtube.com/watch?v=..."
                value={form.youtubeUrl} onChange={e => setForm(prev => ({ ...prev, youtubeUrl: e.target.value }))} />
            </div>
          </div>

          <div className="gallery-panel">
            <h3 className="gallery-panel-title">Additional Details</h3>
            <label className="gallery-label">Description (Optional)</label>
            <textarea className="gallery-control" rows={3} placeholder="Write a caption or note for this media..."
              value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />

            <div style={{ marginTop: "20px" }}>
              <label className="gallery-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <Tag size={14} /> Tags
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tagOptions.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`gallery-chip ${form.tags.includes(tag) ? "active" : ""}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="gallery-right-stack">

          <div className="gallery-panel">
            <h3 className="gallery-panel-title">Visibility</h3>
            {[
              { val: "Public", label: "🌐 Public", desc: "All Employees" },
              { val: "Restricted", label: "🔒 Restricted", desc: "Branch / Department" },
            ].map(opt => (
              <div key={opt.val} onClick={() => setForm(prev => ({ ...prev, visibility: opt.val }))}
                className={`gallery-visibility-item ${form.visibility === opt.val ? "active" : ""}`}>
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </div>
            ))}
          </div>

          <div className="gallery-panel">
            <h3 className="gallery-panel-title">Branch Filter</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button onClick={() => setForm(prev => ({ ...prev, branches: [] }))}
                className={`gallery-chip ${form.branches.length === 0 ? "active" : ""}`}>
                All Branches
              </button>
              {branches.map(b => (
                <button key={b.id} onClick={() => toggleBranch(b.branchName)}
                  className={`gallery-chip ${form.branches.includes(b.branchName) ? "active" : ""}`}>
                  {b.branchName}
                </button>
              ))}
            </div>
          </div>

          <div className="gallery-panel">
            <h3 className="gallery-panel-title">Department Filter</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button onClick={() => setForm(prev => ({ ...prev, departments: [] }))}
                className={`gallery-chip ${form.departments.length === 0 ? "active" : ""}`}>
                All Departments
              </button>
              {departments.slice(0, 8).map(d => (
                <button key={d.id} onClick={() => toggleDept(d.departmentName)}
                  className={`gallery-chip ${form.departments.includes(d.departmentName) ? "active" : ""}`}>
                  {d.departmentName}
                </button>
              ))}
            </div>
          </div>

          <div className="gallery-panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>Allow Downloads</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Employees can download media</div>
              </div>
              <button onClick={() => setForm(prev => ({ ...prev, allowDownload: !prev.allowDownload }))}
                className={`gallery-toggle ${form.allowDownload ? "enabled" : ""}`}>
                <div className="gallery-toggle-thumb" />
              </button>
            </div>
          </div>

          <button onClick={() => handleSave(false)} disabled={saving}
            className="gallery-save-primary">
            {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Gallery"}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="gallery-save-secondary">
            <Plus size={16} /> Save & Add More
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGallery;
