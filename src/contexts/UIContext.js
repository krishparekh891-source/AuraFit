const UIContext = React.createContext();

function UIProvider({ children }) {
  const [modal, setModal] = React.useState({ isOpen: false, type: 'alert', message: '' });
  const [loading, setLoading] = React.useState({ isLoading: false, message: '' });

  const showAlert = (message, onOk) => {
    setModal({ isOpen: true, type: 'alert', message, onOk });
  };

  const showConfirm = (message, onOk, onCancel) => {
    setModal({ isOpen: true, type: 'confirm', message, onOk, onCancel });
  };

  const showPrompt = (message, defaultValue, onOk) => {
    setModal({ isOpen: true, type: 'prompt', message, defaultValue, onOk });
  };

  const hideModal = () => {
    setModal({ isOpen: false });
  };

  const showLoading = (message) => {
    setLoading({ isLoading: true, message });
  };

  const hideLoading = () => {
    setLoading({ isLoading: false });
  };

  const value = {
    modal,
    loading,
    showAlert,
    showConfirm,
    showPrompt,
    hideModal,
    showLoading,
    hideLoading,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

function useUI() {
  return React.useContext(UIContext);
}
