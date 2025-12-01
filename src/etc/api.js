export const createCapsuleRequest = async (data) => {
  return new Promise((resolve) => {
    // TODO
    resolve('test-id');
  });
};

export const getCapsuleRequest = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
      const found = capsules.find((c) => c.id === id);
      resolve(found || null);
    }, 500);
  });
};

export const getStatsRequest = async () => {
  const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
  const now = new Date();
  let waiting = 0;
  let sent = 0;
  capsules.forEach((c) => {
    if (new Date(c.openDate) > now) {
      waiting++;
    } else {
      sent++;
    }
  });
  return { waiting, sent };
};