import User from '../models/user.model';

const userHelper = {
  setUserOnline(id: string, callback: (user: unknown, err?: unknown) => void) {
    User.findByIdAndUpdate(id, { status: 'online' }, { new: true })
      .then((userDoc) => {
        callback(userDoc);
      })
      .catch((err) => {
        console.error(err);
        callback(null, err);
      });
  },

  setUserOffline(id: string, callback: (user: unknown, err?: unknown) => void) {
    User.findByIdAndUpdate(id, { status: 'offline' }, { new: true })
      .then((userDoc) => {
        callback(userDoc);
      })
      .catch((err) => {
        console.error(err);
        callback(null, err);
      });
  },
};

export default userHelper;
