namespace TeamspeakStatsNew.Backend
{
    public class FolderMonitor
    {
        private readonly string _folderPath;
        private readonly FileSystemWatcher _watcher;
        private readonly Action _onFolderChanged;

        public FolderMonitor(string folderPath, Action onFolderChanged)
        {
            _folderPath = folderPath;
            _onFolderChanged = onFolderChanged;

            // Create a new FileSystemWatcher and configure it
            _watcher = new FileSystemWatcher(_folderPath);
            _watcher.NotifyFilter = NotifyFilters.FileName | NotifyFilters.Size;
            _watcher.Filter = "*.*";
            _watcher.IncludeSubdirectories = false;

            // Subscribe to the events
            _watcher.Created += OnFileChanged;
            _watcher.Changed += OnFileChanged;

            // Start monitoring the directory
            _watcher.EnableRaisingEvents = true;
        }

        private void OnFileChanged(object sender, FileSystemEventArgs e)
        {
            // Call the function when a change is detected
            _onFolderChanged?.Invoke();
        }
    }
}