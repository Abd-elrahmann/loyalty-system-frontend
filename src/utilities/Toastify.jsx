
import { toast } from 'react-toastify';

const notifySuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 1500,
    pauseOnHover: true,
    draggable: true,
  });
};

const notifyError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 1500,
    pauseOnHover: true,
    draggable: true,
  });
};

const notifyInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 1500,
    pauseOnHover: true,
    draggable: true,
  });
};

export { notifySuccess, notifyError, notifyInfo };
