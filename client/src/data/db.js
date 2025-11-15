export const initialDB = {
    users: [
      { id: 1, name: "Admin User", email: "admin@example.com", role: "Admin" },
      { id: 2, name: "Jane Doe", email: "jane@example.com", role: "Instructor" }
    ],
    courses: [
      { id: 1, title: "Intro to Programming", year: "2025", sections: [{ id: 1, name: "A" }] },
      { id: 2, title: "Web Development", year: "2025", sections: [] }
    ],
    enrollments: [
      { id: 1, studentName: "John Student", courseId: 1, section: "A" }
    ],
    contents: [
      { id: 1, courseId: 1, title: "Syllabus", body: "Course syllabus goes here." }
    ]
  };
  