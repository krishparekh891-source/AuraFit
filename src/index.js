const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <AuthProvider>
    <UIProvider>
      <App />
    </UIProvider>
  </AuthProvider>
);
