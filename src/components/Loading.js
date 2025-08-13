function Loading() {
  const { loading } = useUI();

  if (!loading.isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay active">
      <div className="flex flex-col items-center">
          <div className="spinner"></div>
          <p className="text-gray-400 mt-4 text-center">{loading.message || 'Loading...'}</p>
      </div>
    </div>
  );
}
