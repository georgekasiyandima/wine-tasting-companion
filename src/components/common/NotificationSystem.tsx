import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useApp } from '@/context/AppContext';

export default function NotificationSystem() {
  const { state, removeNotification } = useApp();

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  return (
    <>
      {state.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type as AlertColor}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
} 