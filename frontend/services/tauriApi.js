// Mock invoke function to replace Tauri dependency
const invoke = async (cmd, args) => {
  console.log(`Mock invoke: ${cmd}`, args);
  return "[]";
};

export const bqlApi = {
  approveVolunteer: async (maTaiKhoan) => {
    return await invoke('approve_volunteer_cmd', { maTaiKhoan });
  },
  createCampaign: async (data) => {
    return await invoke('create_campaign_cmd', { data });
  }
};

export const bdhApi = {
  approveParticipation: async (maThamGia) => {
    return await invoke('approve_participation_cmd', { maThamGia });
  },
  markAttendance: async (data) => {
    return await invoke('mark_attendance_cmd', { data });
  }
};

export const tnvApi = {
  registerCampaign: async (maChienDich) => {
    return await invoke('register_campaign_cmd', { maChienDich });
  },
  getHistory: async (maTaiKhoan) => {
    const res = await invoke('get_history_cmd', { maTaiKhoan });
    return JSON.parse(res);
  }
};

export const campaignApi = {
  getDanhSach: async () => {
    const res = await invoke('get_danh_sach_chien_dich');
    return JSON.parse(res);
  },
  getChiTiet: async (id) => {
    const res = await invoke('get_chi_tiet_chien_dich', { id });
    return JSON.parse(res);
  }
};
