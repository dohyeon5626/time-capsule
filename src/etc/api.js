import axios from 'axios';

const baseAxios = () => axios.create({
    baseURL: 'https://api.dohyeon5626.com'
});

export const createCapsuleRequest = async (formData) => {
  return new Promise((resolve, reject) => {
    baseAxios().post(`/time-capsule/subscription`, formData)
      .then(it => it.data)
      .then(it => resolve(it.id))
      .catch(reject);
  });
};

export const getCapsuleRequest = async (id) => {
  return new Promise((resolve, reject) => {
    baseAxios().get(`/time-capsule/subscription/${id}`)
      .then(it => it.data)
      .then(it => resolve(it))
      .catch(reject);
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