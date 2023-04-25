namespace TeamspeakStatsNew.Backend
{
    public class LogsEntry
    {
        private DateTime aParDate;
        private string aParMessageType;
        private string aParLocation;
        private int aParType;
        private string aParEntryString;


        public LogsEntry(DateTime parDate, string parMessageType, string parLocation, int parType, string parEntryString)
        {
            aParDate = parDate;
            aParMessageType = parMessageType;
            aParLocation = parLocation;
            aParType = parType;
            aParEntryString = parEntryString;
        }

        public DateTime ParDate => aParDate;

        public string ParMessageType => aParMessageType;

        public string ParLocation => aParLocation;

        public int ParType => aParType;

        public string ParEntryString => aParEntryString;
    }
}
