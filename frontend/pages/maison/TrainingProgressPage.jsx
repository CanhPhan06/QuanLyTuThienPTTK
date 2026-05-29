import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { loadMaisonData, saveMaisonData } from "./maisonData";
import "./MaisonWorkflow.css";

const TrainingProgressPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [courseId, setCourseId] = useState(data.courses[0]?.id || "");
  const selectedCourse = useMemo(() => data.courses.find((item) => item.id === courseId) || data.courses[0], [courseId, data.courses]);
  const firstLearner = selectedCourse?.learners[0];
  const [memberId, setMemberId] = useState(firstLearner?.memberId || "");
  const [milestone, setMilestone] = useState("Thang 6");
  const [score, setScore] = useState(8);
  const [progress, setProgress] = useState(60);
  const [comment, setComment] = useState("Hoan thanh bai kiem tra dinh ky, can tiep tuc theo doi thuc hanh.");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const members = data.cases.filter((item) => item.status === "ChinhThuc" || item.status === "ChoHoiDong");

  const saveEvaluation = () => {
    const member = members.find((item) => item.id === memberId) || data.cases.find((item) => item.id === memberId);
    if (!member || !selectedCourse) {
      setModal({ isOpen: true, title: "Thiếu dữ liệu", message: "Cần chọn khóa học và thành viên.", type: "error" });
      return;
    }

    const nextCourses = data.courses.map((course) => {
      if (course.id !== selectedCourse.id) return course;
      const exists = course.learners.some((learner) => learner.memberId === member.id);
      const learnerData = { memberId: member.id, memberName: member.name, progress, milestone, score, comment };
      return {
        ...course,
        learners: exists
          ? course.learners.map((learner) => learner.memberId === member.id ? learnerData : learner)
          : [...course.learners, learnerData]
      };
    });
    const nextData = { ...data, courses: nextCourses };
    setData(nextData);
    saveMaisonData(nextData);
    setModal({ isOpen: true, title: "Đã cập nhật đào tạo", message: "Tiến độ học nghề và kết quả kiểm tra đã được lưu.", type: "success" });
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC3 - Giáo viên / Nhân viên xã hội</span>
            <h1>Quản lý khóa học & tiến độ đào tạo</h1>
            <p>Theo dõi học nghề 6-12 tháng, mốc đánh giá, điểm kiểm tra và nhận xét phát triển kỹ năng.</p>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "bdh01"} - Phụ trách đào tạo</strong></div>
        </header>

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Khóa học nghề</h2>
            <div className="mc-form">
              <label className="mc-full">Chọn khóa học<select value={courseId} onChange={(e) => setCourseId(e.target.value)}>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
            </div>
            {selectedCourse && (
              <div className="mc-list" style={{ marginTop: "1rem" }}>
                <div className="mc-list-item"><strong>Giáo viên:</strong> {selectedCourse.teacher}<p>Thời lượng: {selectedCourse.duration}</p></div>
                {selectedCourse.learners.map((learner) => (
                  <div className="mc-list-item" key={learner.memberId}>
                    <strong>{learner.memberName}</strong>
                    <p>{learner.milestone} - Điểm {learner.score}/10</p>
                    <div className="mc-progress"><span style={{ width: `${learner.progress}%` }} /></div>
                    <p>{learner.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mc-card">
            <h2>Ghi nhận đánh giá định kỳ</h2>
            <div className="mc-form">
              <label>Thành viên<select value={memberId} onChange={(e) => setMemberId(e.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
              <label>Mốc đánh giá<select value={milestone} onChange={(e) => setMilestone(e.target.value)}><option>Thang 1</option><option>Thang 3</option><option>Thang 6</option><option>Cuoi khoa</option></select></label>
              <label>Điểm kiểm tra<input type="number" min="0" max="10" step="0.5" value={score} onChange={(e) => setScore(Number(e.target.value))} /></label>
              <label>Tiến độ (%)<input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} /></label>
              <label className="mc-full">Nhận xét<textarea value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            </div>
            <div className="mc-actions">
              <button className="mc-btn" onClick={saveEvaluation}>Lưu đánh giá</button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default TrainingProgressPage;
