import { useState, useEffect } from "react";
import api from "../../services/api";

export default function ContentsPage() {
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('announcements'); // announcements, modules, lessons

  // Announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annCourseId, setAnnCourseId] = useState("");
  const [annPriority, setAnnPriority] = useState("medium");
  const [annTargetAudience, setAnnTargetAudience] = useState("all");
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Module form
  const [modTitle, setModTitle] = useState("");
  const [modDescription, setModDescription] = useState("");
  const [modCourseId, setModCourseId] = useState("");
  const [modOrder, setModOrder] = useState("");
  const [editingModule, setEditingModule] = useState(null);

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonContentType, setLessonContentType] = useState("text");
  const [lessonOrder, setLessonOrder] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        api.getCourses(),
        api.getAnnouncements()
      ]);

      const [coursesRes, announcementsRes] = results;

      const coursesData = (coursesRes.status === 'fulfilled' && coursesRes.value?.data) || [];
      setCourses(coursesData);
      setAnnouncements((announcementsRes.status === 'fulfilled' && announcementsRes.value?.data) || []);

      // Fetch modules for each course
      const allModules = [];
      const lessonsData = {};
      
      for (const course of coursesData) {
        try {
          const modulesRes = await api.getCourseModules(course._id);
          const courseModules = modulesRes.data || [];
          allModules.push(...courseModules);

          // Fetch lessons for each module
          for (const module of courseModules) {
            try {
              const lessonsRes = await api.getModuleLessons(module._id);
              lessonsData[module._id] = lessonsRes.data || [];
            } catch (err) {
              console.warn(`Failed to load lessons for module ${module._id}:`, err);
              lessonsData[module._id] = [];
            }
          }
        } catch (err) {
          console.warn(`Failed to load modules for course ${course._id}:`, err);
        }
      }

      setModules(allModules);
      setLessons(lessonsData);

      // Check if any main requests failed
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some content data failed to load:', failures);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load content data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========== ANNOUNCEMENTS ==========
  const addAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) {
      return alert("Please fill in title and content.");
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Handle both 'id' and 'userId' for compatibility
      const authorId = user.id || user.userId;
      
      if (!authorId || !user.role) {
        console.error('User data:', user);
        return alert("User information not found. Please log in again.");
      }

      const announcementData = {
        title: annTitle,
        content: annContent,
        authorId: authorId,
        authorRole: user.role,
        targetAudience: annTargetAudience,
        courseId: annCourseId || null,
        priority: annPriority,
        isActive: true
      };

      const response = await api.createAnnouncement(announcementData);
      if (response.success) {
        alert('Announcement created successfully!');
        resetAnnouncementForm();
        fetchAllData();
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      alert(err.message || 'Failed to create announcement');
    }
  };

  const updateAnnouncement = async () => {
    if (!editingAnnouncement || !annTitle.trim() || !annContent.trim()) {
      return alert("Please fill in required fields.");
    }

    try {
      const announcementData = {
        title: annTitle,
        content: annContent,
        targetAudience: annTargetAudience,
        courseId: annCourseId || null,
        priority: annPriority
      };

      const response = await api.updateAnnouncement(editingAnnouncement._id, announcementData);
      if (response.success) {
        alert('Announcement updated successfully!');
        resetAnnouncementForm();
        fetchAllData();
      }
    } catch (err) {
      console.error('Error updating announcement:', err);
      alert(err.message || 'Failed to update announcement');
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      const response = await api.deleteAnnouncement(id);
      if (response.success) {
        alert('Announcement deleted successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const startEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnTitle(announcement.title);
    setAnnContent(announcement.content);
    setAnnCourseId(announcement.courseId || "");
    setAnnPriority(announcement.priority);
    setAnnTargetAudience(announcement.targetAudience);
  };

  const resetAnnouncementForm = () => {
    setEditingAnnouncement(null);
    setAnnTitle("");
    setAnnContent("");
    setAnnCourseId("");
    setAnnPriority("medium");
    setAnnTargetAudience("all");
  };

  // ========== MODULES ==========
  const addModule = async () => {
    if (!modTitle.trim() || !modCourseId) {
      return alert("Please fill in title and select a course.");
    }

    try {
      const moduleData = {
        courseId: modCourseId,
        title: modTitle,
        description: modDescription,
        order: Number(modOrder) || 0,
        isPublished: true
      };

      const response = await api.createModule(moduleData);
      if (response.success) {
        alert('Module created successfully!');
        resetModuleForm();
        fetchAllData();
      }
    } catch (err) {
      console.error('Error creating module:', err);
      alert(err.message || 'Failed to create module');
    }
  };

  const updateModule = async () => {
    if (!editingModule || !modTitle.trim() || !modCourseId) {
      return alert("Please fill in required fields.");
    }

    try {
      const moduleData = {
        courseId: modCourseId,
        title: modTitle,
        description: modDescription,
        order: Number(modOrder) || 0
      };

      const response = await api.updateModule(editingModule._id, moduleData);
      if (response.success) {
        alert('Module updated successfully!');
        resetModuleForm();
        fetchAllData();
      }
    } catch (err) {
      console.error('Error updating module:', err);
      alert(err.message || 'Failed to update module');
    }
  };

  const deleteModule = async (id) => {
    if (!confirm("Delete this module?")) return;

    try {
      const response = await api.deleteModule(id);
      if (response.success) {
        alert('Module deleted successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting module:', err);
      alert(err.message || 'Failed to delete module');
    }
  };

  const startEditModule = (module) => {
    setEditingModule(module);
    setModTitle(module.title);
    setModDescription(module.description || "");
    setModCourseId(module.courseId);
    setModOrder(module.order || "");
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModTitle("");
    setModDescription("");
    setModCourseId("");
    setModOrder("");
  };

  // ========== LESSONS ==========
  const openLessonForm = (module) => {
    setSelectedModuleForLesson(module);
    setShowLessonForm(true);
    setLessonTitle("");
    setLessonDescription("");
    setLessonContent("");
    setLessonContentType("text");
    setLessonOrder("");
  };

  const addLesson = async () => {
    if (!lessonTitle.trim() || !selectedModuleForLesson) {
      return alert("Please fill in lesson title.");
    }

    try {
      const lessonData = {
        moduleId: selectedModuleForLesson._id,
        title: lessonTitle,
        description: lessonDescription,
        contentType: lessonContentType,
        content: lessonContent,
        order: Number(lessonOrder) || 0,
        isPublished: true
      };

      const response = await api.createLesson(lessonData);
      if (response.success) {
        alert('Lesson created successfully!');
        setShowLessonForm(false);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error creating lesson:', err);
      alert(err.message || 'Failed to create lesson');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;

    try {
      const response = await api.deleteLesson(lessonId);
      if (response.success) {
        alert('Lesson deleted successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      alert(err.message || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Course Contents</h2>
        <p className="muted small">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Course Contents</h2>

      {error && (
        <div style={{ padding: '10px', background: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
          <button className="btn ghost small" style={{ marginLeft: '10px' }} onClick={fetchAllData}>
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #ddd' }}>
        <button 
          className={activeTab === 'announcements' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements ({announcements.length})
        </button>
        <button 
          className={activeTab === 'modules' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('modules')}
        >
          Modules ({modules.length})
        </button>
      </div>

      {/* ========== ANNOUNCEMENTS TAB ========== */}
      {activeTab === 'announcements' && (
        <>
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
              {editingAnnouncement ? '✏️ Edit Announcement' : '📢 Add New Announcement'}
            </h3>
            
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="Announcement Title *"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <select 
                value={annCourseId} 
                onChange={(e) => {
                  const value = e.target.value;
                  setAnnCourseId(value);
                  // Automatically set targetAudience to specific_course when a course is selected
                  if (value && annTargetAudience === 'all') {
                    setAnnTargetAudience('specific_course');
                  } else if (!value && annTargetAudience === 'specific_course') {
                    setAnnTargetAudience('all');
                  }
                }}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">📚 All Courses</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>
                ))}
              </select>

              <select 
                value={annPriority} 
                onChange={(e) => setAnnPriority(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🟠 High Priority</option>
                <option value="urgent">🔴 Urgent</option>
              </select>

              <select 
                value={annTargetAudience} 
                onChange={(e) => setAnnTargetAudience(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="all">👥 All Users (Students & Instructors)</option>
                <option value="students">👨‍🎓 Students Only</option>
                <option value="instructors">👨‍🏫 Instructors Only</option>
                <option value="specific_course">📚 Specific Course</option>
              </select>

              <textarea
                placeholder="Announcement Content *"
                rows="3"
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '42px', gridColumn: '1 / -1' }}
              />
            </div>

            {/* Info box */}
            <div style={{ 
              marginTop: '12px', 
              padding: '10px 12px', 
              background: '#eff6ff', 
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#1e40af'
            }}>
              <strong>💡 Tip:</strong> Select a course to target specific course students, or choose "All Courses" to broadcast to everyone based on target audience.
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {editingAnnouncement ? (
                <>
                  <button className="btn-primary" onClick={updateAnnouncement}>✓ Update Announcement</button>
                  <button className="btn ghost" onClick={resetAnnouncementForm}>✖ Cancel</button>
                </>
              ) : (
                <button className="btn-primary" onClick={addAnnouncement}>➕ Add Announcement</button>
              )}
            </div>
          </div>

          <hr />

          <div style={{ marginTop: "12px" }}>
            {announcements.length === 0 ? (
              <p className="muted small">No announcements yet.</p>
            ) : (
              announcements.map(ann => {
                const course = courses.find(c => c._id === ann.courseId);
                return (
                  <div className="card small" style={{ marginTop: "8px" }} key={ann._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{ann.title}</strong>
                        <span className="muted small" style={{ marginLeft: '8px' }}>
                          ({course ? course.courseName : "All Courses"})
                        </span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem',
                            background: ann.priority === 'urgent' ? '#fee' : ann.priority === 'high' ? '#fef3c7' : ann.priority === 'medium' ? '#dbeafe' : '#f0fdf4',
                            color: ann.priority === 'urgent' ? '#dc2626' : ann.priority === 'high' ? '#ca8a04' : ann.priority === 'medium' ? '#0284c7' : '#16a34a'
                          }}>
                            {ann.priority === 'urgent' ? '🔴' : ann.priority === 'high' ? '🟠' : ann.priority === 'medium' ? '🟡' : '🟢'} {ann.priority.toUpperCase()}
                          </span>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem',
                            background: '#f3f4f6',
                            color: '#374151'
                          }}>
                            {ann.targetAudience === 'all' ? '👥 All Users' : 
                             ann.targetAudience === 'students' ? '👨‍🎓 Students' : 
                             ann.targetAudience === 'instructors' ? '👨‍🏫 Instructors' : 
                             '📚 Specific Course'}
                          </span>
                        </div>
                        <p className="muted small" style={{ marginTop: "6px" }}>{ann.content}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn ghost small" onClick={() => startEditAnnouncement(ann)}>
                          ✏️
                        </button>
                        <button className="btn-danger small" onClick={() => deleteAnnouncement(ann._id)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ========== MODULES TAB ========== */}
      {activeTab === 'modules' && (
        <>
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
              {editingModule ? '✏️ Edit Module' : '📖 Add New Module'}
            </h3>
            
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="Module Title *"
                value={modTitle}
                onChange={(e) => setModTitle(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <select 
                value={modCourseId} 
                onChange={(e) => setModCourseId(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">📚 Select Course *</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Order (e.g., 1, 2, 3...)"
                value={modOrder}
                onChange={(e) => setModOrder(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <textarea
                placeholder="Module Description"
                rows="3"
                value={modDescription}
                onChange={(e) => setModDescription(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '42px', gridColumn: '1 / -1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {editingModule ? (
                <>
                  <button className="btn-primary" onClick={updateModule}>✓ Update Module</button>
                  <button className="btn ghost" onClick={resetModuleForm}>✖ Cancel</button>
                </>
              ) : (
                <button className="btn-primary" onClick={addModule}>➕ Add Module</button>
              )}
            </div>
          </div>

          <hr />

          <div style={{ marginTop: "12px" }}>
            {modules.length === 0 ? (
              <p className="muted small">No modules yet.</p>
            ) : (
              modules.map(mod => {
                const course = courses.find(c => c._id === mod.courseId);
                const moduleLessons = lessons[mod._id] || [];

                return (
                  <div className="card small" style={{ marginTop: "8px" }} key={mod._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{mod.title}</strong>
                        <span className="muted small" style={{ marginLeft: '8px' }}>
                          ({course ? course.courseName : "Unknown"})
                        </span>
                        <p className="muted small" style={{ marginTop: "6px" }}>
                          {mod.description || 'No description'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn ghost small" onClick={() => startEditModule(mod)}>
                          ✏️
                        </button>
                        <button className="btn-danger small" onClick={() => deleteModule(mod._id)}>
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong className="muted small">Lessons ({moduleLessons.length}):</strong>
                        <button className="btn ghost small" onClick={() => openLessonForm(mod)}>
                          + Add Lesson
                        </button>
                      </div>

                      {moduleLessons.length === 0 ? (
                        <p className="muted small">No lessons yet</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {moduleLessons.map(lesson => (
                            <div key={lesson._id} style={{ 
                              padding: '8px', 
                              background: '#f9fafb', 
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <span style={{ fontSize: '0.9rem' }}>{lesson.title}</span>
                                <span className="muted small" style={{ marginLeft: '8px' }}>
                                  [{lesson.contentType}]
                                </span>
                              </div>
                              <button 
                                className="btn-danger" 
                                style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                                onClick={() => deleteLesson(lesson._id)}
                              >
                                ✖
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Lesson Form Modal */}
          {showLessonForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card" style={{ minWidth: '500px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto', background: '#fff' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>
                  ➕ Add Lesson to <span style={{ color: '#646cff' }}>{selectedModuleForLesson?.title}</span>
                </h3>
                
                <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                  <input
                    type="text"
                    placeholder="Lesson Title *"
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  />

                  <select
                    value={lessonContentType}
                    onChange={e => setLessonContentType(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  >
                    <option value="text">📝 Text</option>
                    <option value="video">🎥 Video</option>
                    <option value="document">📄 Document</option>
                    <option value="quiz">❓ Quiz</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Order (e.g., 1, 2, 3...)"
                    value={lessonOrder}
                    onChange={e => setLessonOrder(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  />

                  <textarea
                    placeholder="Description"
                    rows="2"
                    value={lessonDescription}
                    onChange={e => setLessonDescription(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px' }}
                  />

                  <textarea
                    placeholder="Content"
                    rows="4"
                    value={lessonContent}
                    onChange={e => setLessonContent(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="btn-primary" onClick={addLesson}>✓ Add Lesson</button>
                  <button className="btn ghost" onClick={() => setShowLessonForm(false)}>✖ Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
