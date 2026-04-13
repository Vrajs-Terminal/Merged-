import { useEffect, useState } from "react";
import { 
  Image, 
  Youtube, 
  ExternalLink, 
  Phone, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  Eye, 
  BarChart3, 
  GripVertical,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Upload,
  Layers,
  Users,
  Flag
} from "lucide-react";
import "./AppBanner.css";
import PageTitle from "../../components/PageTitle";
import { appBannerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

interface BannerRecord {
  id: number;
  image: string;
  title: string;
  type: "Image" | "Video" | "URL" | "Call";
  active: boolean;
  clicks: number;
  views: number;
  schedule: string;
}

const AppBanner = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Scheduled">("All");
  const [banners, setBanners] = useState<BannerRecord[]>([]);

  const fetchBanners = async () => {
    try {
      const res = await appBannerAPI.getAll();
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setBanners(rows.map((row: any) => ({
        id: Number(row.id),
        image: row.image || "https://via.placeholder.com/1024x434?text=Banner",
        title: row.title || "Untitled Banner",
        type: row.type || "Image",
        active: Boolean(row.active),
        clicks: Number(row.clicks || 0),
        views: Number(row.views || 0),
        schedule: row.schedule || "Permanent",
      })));
    } catch {
      toast.error("Failed to load app banners");
      setBanners([]);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const toggleBannerStatus = async (id: number) => {
    try {
      await appBannerAPI.toggle(id);
      await fetchBanners();
    } catch {
      toast.error("Failed to update banner status");
    }
  };

  const deleteBanner = async (id: number) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await appBannerAPI.delete(id);
      await fetchBanners();
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const displayedBanners = banners.filter((banner) => {
    const q = searchQuery.trim().toLowerCase();
    const titleMatch = !q || banner.title.toLowerCase().includes(q);
    const tabMatch = activeTab === "All"
      || (activeTab === "Active" && banner.active)
      || (activeTab === "Scheduled" && !banner.active);
    return titleMatch && tabMatch;
  });

  const totalViews = banners.reduce((sum, row) => sum + row.views, 0);
  const totalClicks = banners.reduce((sum, row) => sum + row.clicks, 0);
  const activeCount = banners.filter((row) => row.active).length;

  return (
    <div className="app-banner-container">
      <div className="banner-header">
        <div className="header-text">
          <PageTitle title="App Banner Management" subtitle="Define promotional sliders and announcements for the mobile app dashboard" />
        </div>
        <button className="add-banner-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Analytics Summary Bar */}
      <div className="analytics-summary mt-4">
        <div className="stat-card">
          <div className="icon active"><Eye size={20} /></div>
          <div className="stat-info">
            <span className="sc-label">Total Impressions</span>
            <span className="sc-value">{totalViews.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon clicks"><BarChart3 size={20} /></div>
          <div className="stat-info">
            <span className="sc-label">Total Clicks</span>
            <span className="sc-value">{totalClicks.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
           <div className="icon conversion"><Layers size={20} /></div>
           <div className="stat-info">
             <span className="sc-label">Active Banners</span>
             <span className="sc-value">{activeCount} / {banners.length}</span>
           </div>
        </div>
      </div>

      <div className="banner-card-main mt-4">
        <div className="card-toolbar">
          <div className="tab-switcher">
            {(["All", "Active", "Scheduled"] as const).map(tab => (
              <button 
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="search-box-premium">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search banners by title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="banner-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Order</th>
                <th>Banner Preview</th>
                <th>Info & Schedule</th>
                <th>Type</th>
                <th>Performance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedBanners.map((banner, index) => (
                <tr key={banner.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="drag-handle"><GripVertical size={16} /></div>
                  </td>
                  <td>
                    <div className="banner-preview-box">
                      <img src={banner.image} alt={banner.title} />
                      <div className="overlay-badge">{banner.type}</div>
                    </div>
                  </td>
                  <td>
                    <div className="banner-title-schedule">
                      <span className="b-title">{banner.title}</span>
                      <span className="b-schedule">
                        <Calendar size={12} /> {banner.schedule}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="type-icon-box">
                      {banner.type === "Video" && <Youtube size={16} className="video" />}
                      {banner.type === "URL" && <ExternalLink size={16} className="link" />}
                      {banner.type === "Call" && <Phone size={16} className="call" />}
                      {banner.type === "Image" && <Image size={16} className="image" />}
                      <span>{banner.type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="perf-box">
                      <div className="perf-item"><Eye size={12} /> {banner.views}</div>
                      <div className="perf-item"><BarChart3 size={12} /> {banner.clicks}</div>
                    </div>
                  </td>
                  <td>
                    <label className="compact-toggle">
                      <input 
                        type="checkbox" 
                        checked={banner.active} 
                        onChange={() => toggleBannerStatus(banner.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="act-btn edit"><Edit3 size={16} /></button>
                      <button className="act-btn delete" onClick={() => deleteBanner(banner.id)}><Trash2 size={16} /></button>
                      <button className="act-btn more"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="banner-modal-overlay">
          <div className="banner-modal-content">
            <div className="modal-header">
              <h2>Add New Mobile App Banner</h2>
              <button className="close-x" onClick={() => setShowModal(false)}><XCircle /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-layout">
                {/* Image Upload Area */}
                <div className="upload-section">
                  <label>Banner Image* (Recommended 1024x434 PX)</label>
                  <div className="dropzone-area">
                    <Upload size={32} />
                    <p>Click to upload or drag & drop</p>
                    <span>JPEG, PNG supported (Max 2MB)</span>
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="form-fields-main">
                  <div className="field-group">
                    <label>Banner Title / Description</label>
                    <input type="text" placeholder="Short text about this banner" />
                  </div>
                  
                  <div className="field-row-2">
                    <div className="field-group">
                      <label>Background Color (Optional)</label>
                      <div className="color-input-wrapper">
                        <input type="color" defaultValue="#6366f1" />
                        <input type="text" placeholder="#6366f1" />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>Action Type</label>
                      <select>
                        <option>Direct Image (No Link)</option>
                        <option>Visit Website / URL</option>
                        <option>YouTube Video</option>
                        <option>Phone Number Call</option>
                        <option>Open App Module</option>
                      </select>
                    </div>
                  </div>

                  {/* Contextual Fields based on Action Type */}
                  <div className="field-group">
                    <label>Action Destination (URL / Video ID / Phone)</label>
                    <div className="input-with-icon">
                      <ExternalLink size={16} />
                      <input type="text" placeholder="Enter URL or ID here..." />
                    </div>
                  </div>

                  {/* Advanced Features Row */}
                  <div className="advanced-options-grid mt-4">
                     <div className="field-group">
                       <label><Calendar size={14} /> Schedule (Start - End)</label>
                       <div className="date-range-box">
                         <input type="date" />
                         <span>to</span>
                         <input type="date" />
                       </div>
                     </div>
                     <div className="field-group">
                       <label><Users size={14} /> Target Audience</label>
                       <select>
                         <option>All Employees</option>
                         <option>Branch-wise</option>
                         <option>Department-wise</option>
                         <option>Individual-wise</option>
                       </select>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-banner-btn">
                 <CheckCircle2 size={18} />
                 <span>Publish Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppBanner;

