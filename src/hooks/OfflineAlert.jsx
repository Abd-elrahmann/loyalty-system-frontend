import React, { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

const OfflineAlert = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineAlert(false);
    };
    
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineAlert(true);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      <Snackbar
        open={isOffline}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          icon={<WarningIcon />}
          severity="error"
          sx={{
            backgroundColor: "#cc0000",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white"
            }
          }}
        >
          You are now in offline mode
        </Alert>
      </Snackbar>

      <Snackbar
        open={showOnlineAlert}
        autoHideDuration={3000}
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          icon={<CheckCircleIcon />}
          severity="success"
          sx={{
            backgroundColor: "#008000",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white"
            }
          }}
        >
          Connection restored
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineAlert;
