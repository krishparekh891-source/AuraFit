function Modal() {
  const { modal, hideModal } = useUI();
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    if (modal.isOpen) {
      setInputValue(modal.defaultValue || '');
    }
  }, [modal]);

  if (!modal.isOpen) {
    return null;
  }

  const handleOk = () => {
    if (modal.onOk) {
      modal.onOk(modal.type === 'prompt' ? inputValue : undefined);
    }
    hideModal();
  };

  const handleCancel = () => {
    if (modal.onCancel) {
      modal.onCancel();
    }
    hideModal();
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <div className="text-lg font-bold">{modal.message}</div>
        {modal.type === 'prompt' && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full mt-4 p-3 rounded-lg bg-gray-900 border border-gray-700"
          />
        )}
        <div className="flex justify-end mt-4 space-x-3">
          {modal.type !== 'alert' && (
            <button onClick={handleCancel} className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-full font-semibold">
              Cancel
            </button>
          )}
          <button onClick={handleOk} className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-full font-semibold">
            {modal.type === 'prompt' ? 'Save' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
