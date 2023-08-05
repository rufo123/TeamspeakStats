using System.Diagnostics;

namespace TeamspeakStatsNew.Backend
{
    public class CountOfClientsRelativeToPeriod
    {
        private SortedDictionary<DateTime, int>? aDictionaryCountHours;
        private SortedDictionary<DateTime, int>? aDictionaryCountDays;
        private SortedDictionary<DateTime, int>? aDictionaryCountMonths;
        private SortedDictionary<DateTime, int>? aDictionaryCountYears;

        public SortedDictionary<DateTime, int>? DictionaryCountHours => aDictionaryCountHours;

        public SortedDictionary<DateTime, int>? DictionaryCountDays => aDictionaryCountDays;

        public SortedDictionary<DateTime, int>? DictionaryCountMonths => aDictionaryCountMonths;

        public SortedDictionary<DateTime, int>? DictionaryCountYears => aDictionaryCountYears;

        private SortedDictionary<DateTime, List<int>> aDictionaryOfAlreadyCountedClientIds;


        public CountOfClientsRelativeToPeriod()
        {
            aDictionaryOfAlreadyCountedClientIds = new SortedDictionary<DateTime, List<int>>();
        }

        public void Initialise(
            Dictionary<int, ClientConnectedData> parDictionaryClientConnectedData,
            Dictionary<int, Client> parDictionaryOfClients
            )
        {
            aDictionaryOfAlreadyCountedClientIds = new SortedDictionary<DateTime, List<int>>();
            aDictionaryCountHours = CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Hour, parDictionaryClientConnectedData, parDictionaryOfClients);
            aDictionaryCountDays = CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Day, parDictionaryClientConnectedData, parDictionaryOfClients);
            aDictionaryCountMonths = CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Month, parDictionaryClientConnectedData, parDictionaryOfClients);
            aDictionaryCountYears = CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Year, parDictionaryClientConnectedData, parDictionaryOfClients);
        }

        private DateTime AddDateTimeHelper(Periods parPeriod, DateTime parDateTime, bool skipAddition)
        {
            if (skipAddition)
            {
                return parDateTime;
            }

            switch (parPeriod)
            {
                case Periods.Hour:
                    return parDateTime.AddHours(1);
                case Periods.Day:
                    return parDateTime.AddDays(1);
                case Periods.Month:
                    return parDateTime.AddMonths(1);
                case Periods.Year:
                    return parDateTime.AddYears(1);
                default:
                    throw new ArgumentOutOfRangeException(nameof(parPeriod), parPeriod, null);
            }
        }

        public SortedDictionary<DateTime, int>? CalculateCountOfPlayerHoursRelativeToPeriod(
            Periods parPeriod,
            Dictionary<int, ClientConnectedData> parDictionaryClientConnectedData,
            Dictionary<int, Client> parDictionaryOfClients)
        {

            SortedDictionary<DateTime, int>? countOfPlayersRelativeToPeriod = new SortedDictionary<DateTime, int>();
            aDictionaryOfAlreadyCountedClientIds = new SortedDictionary<DateTime, List<int>>();


            foreach (var values in parDictionaryClientConnectedData.Values)
            {
                LoopConnectedTimesAndAssignConnectedBetweenPeriod(values, parDictionaryOfClients, parPeriod, ref countOfPlayersRelativeToPeriod);

            }

            return countOfPlayersRelativeToPeriod;
        }

        private void LoopConnectedTimesAndAssignConnectedBetweenPeriod(
            ClientConnectedData parClientConnectedData,
            Dictionary<int, Client> parClientDataDictionary,
            Periods parPeriod,
            ref SortedDictionary<DateTime, int>? parRefSortedDictToSaveTo)
        {

            DateTime lastDisconnectedTime = DateTime.UnixEpoch;

            foreach (var connectedTimes in parClientConnectedData.ConnectionsDataListOfArrays)
            {

                DateTime connected = connectedTimes[1];
                DateTime disconnected = connectedTimes[0];

                IterateEachHourAndAssignConnectedTimes(connected, disconnected, parPeriod, parClientConnectedData.Id, ref parRefSortedDictToSaveTo);

                lastDisconnectedTime = disconnected;

            }

            if (lastDisconnectedTime != DateTime.UnixEpoch && parClientDataDictionary[parClientConnectedData.Id].Online)
            {
                IterateEachHourAndAssignConnectedTimes(lastDisconnectedTime, DateTime.Now, parPeriod, parClientConnectedData.Id, ref parRefSortedDictToSaveTo);
            }

        }

        private void IterateEachHourAndAssignConnectedTimes(DateTime parConnected, DateTime parDisconnected, Periods parPeriod, int parClientId, ref SortedDictionary<DateTime, int>? parRefSortedDictToSaveTo)
        {
            bool isFirstIteration = true;

            // Iterate through each hour between connected and disconnected times
            for (DateTime time = parConnected; time <= parDisconnected; time = AddDateTimeHelper(parPeriod, time, isFirstIteration))
            {

                isFirstIteration = false;
                DateTime roundedTime;

                switch (parPeriod)
                {
                    case Periods.Hour:
                        roundedTime = new DateTime(time.Year, time.Month, time.Day, time.Hour, 0, 0);
                        break;
                    case Periods.Day:
                        roundedTime = new DateTime(time.Year, time.Month, time.Day, 0, 0, 0);
                        break;
                    case Periods.Month:
                        roundedTime = new DateTime(time.Year, time.Month, 1, 0, 0, 0);
                        break;
                    case Periods.Year:
                        roundedTime = new DateTime(time.Year, 1, 1, 0, 0, 0);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(parPeriod), parPeriod, null);
                }

                if (parRefSortedDictToSaveTo is null)
                {
                    throw new ArgumentNullException(nameof(parRefSortedDictToSaveTo), "parRefSortedDictToSaveTo cannot be null.");
                }

                // Update the count of connected players for the rounded hour

                if (aDictionaryOfAlreadyCountedClientIds.ContainsKey(roundedTime))
                {
                    foreach (var clientId in aDictionaryOfAlreadyCountedClientIds[roundedTime])
                    {
                        if (clientId == parClientId)
                        {
                            return;
                        }
                    }

                    aDictionaryOfAlreadyCountedClientIds[roundedTime].Add(parClientId);
                }
                else
                {
                    aDictionaryOfAlreadyCountedClientIds.Add(roundedTime, new List<int>());
                }

                if (parRefSortedDictToSaveTo.ContainsKey(roundedTime))
                    parRefSortedDictToSaveTo[roundedTime]++;
                else
                    parRefSortedDictToSaveTo[roundedTime] = 1;
            }
        }


    }
}
