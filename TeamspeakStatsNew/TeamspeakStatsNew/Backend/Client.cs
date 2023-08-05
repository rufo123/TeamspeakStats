namespace TeamspeakStatsNew.Backend
{
    public class Client
    {
        private int aId;
        private string aLatestName;
        private List<string> aNamesList;
        private DateTime aLastConnected;
        private double aHoursTotal;
        private bool aBot;
        private bool aOnline;
        //private List<DateTime[]> aConnectedDates;

        public Client(int parId)
        {
            aId = parId;
            aLatestName = "";
            aNamesList = new List<string>(10);
            aHoursTotal = 0;
            aBot = false;
            aOnline = false;
            //aConnectedDates = new List<DateTime[]>();
        }


        public void AddName(string parName)
        {
            aLatestName = parName;
            if (!aNamesList.Contains(parName))
            {
                aNamesList.Add(parName);
            }
        }

        public void AddTotalTime(DateTime parDisconnectedTime)
        {
            if (parDisconnectedTime >= LastConnected)
            {
                aHoursTotal += (parDisconnectedTime - LastConnected).TotalHours;
                //aConnectedDates.Add(new DateTime[] { parDisconnectedTime, LastConnected });
            }
        }


        public int Id
        {
            get => aId;
            set => aId = value;
        }

        public string LatestName
        {
            get => aLatestName;
            set => aLatestName = value ?? throw new ArgumentNullException(nameof(value));
        }

        public List<string> NamesList
        {
            get => aNamesList;
            set => aNamesList = value ?? throw new ArgumentNullException(nameof(value));
        }

        public DateTime LastConnected
        {
            get => aLastConnected;
            set => aLastConnected = value;
        }

        public double HoursTotal
        {
            get => aHoursTotal;
            set => aHoursTotal = value;
        }

        public bool Bot
        {
            get => aBot;
            set => aBot = value;
        }

        public bool Online
        {
            get => aOnline;
            set => aOnline = value;
        }

        // public List<DateTime[]> ConnectedDates => aConnectedDates;
    }
}
