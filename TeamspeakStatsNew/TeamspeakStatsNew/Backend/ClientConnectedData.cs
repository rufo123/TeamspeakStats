namespace TeamspeakStatsNew.Backend
{
    public class ClientConnectedData
    {
        private int aId;

        // The accessing of data will be more frequent, than adding Data - ArrayList
        private List<DateTime[]> aConnectionsDataListOfArrays;

        public ClientConnectedData(int id)
        {
            aId = id;
            aConnectionsDataListOfArrays = new List<DateTime[]>();
        }

        public int Id
        {
            get => aId;
        }

        public List<DateTime[]> ConnectionsDataListOfArrays
        {
            get => aConnectionsDataListOfArrays;
        }
    }
}
