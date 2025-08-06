
import { toast } from 'react-toastify';

const notifySuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

const notifyError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

const notifyInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

export { notifySuccess, notifyError, notifyInfo };
