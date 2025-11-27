export const api = {
  createCapsule: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = Math.random().toString(36).substring(2, 11);
        const capsule = { 
            ...data, 
            id, 
            createdAt: new Date().toISOString() 
        };
        
        const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
        capsules.push(capsule);
        localStorage.setItem('capsules', JSON.stringify(capsules));
        
        resolve(id);
      }, 800);
    });
  },
  getCapsule: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
        const found = capsules.find(c => c.id === id);
        resolve(found || null);
      }, 500);
    });
  },
  getStats: async () => {
    const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
    const now = new Date();
    let waiting = 0;
    let sent = 0;
    capsules.forEach(c => {
      if (new Date(c.openDate) > now) waiting++;
      else sent++;
    });
    return { waiting, sent };
  }
};
